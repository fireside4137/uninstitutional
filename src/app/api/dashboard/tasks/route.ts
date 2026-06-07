import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/securityLogger";

const taskActionSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
  action: z.enum(["start_reading", "complete_reading", "toggle_completion"]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Calculate IST assigned date
    const now = new Date();
    const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcOffset + 3600000 * 5.5);
    const assignedDate = new Date(Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate()));

    // 2. Fetch or assign today's daily task (exactly like summary route)
    let dailyTask = await prisma.dailyTask.findFirst({
      where: {
        userId,
        assignedDate,
      },
      include: {
        topic: {
          include: {
            questions: true,
            subject: true,
          },
        },
      },
    });

    if (!dailyTask) {
      const allTopics = await prisma.topic.findMany({
        where: { subject: { exam: { name: user.examType } } },
        orderBy: [
          { subject: { orderIndex: "asc" } },
          { orderIndex: "asc" },
        ],
        include: {
          questions: true,
          subject: true,
        },
      });

      const assignedTaskTopics = await prisma.dailyTask.findMany({
        where: { userId },
        select: { topicId: true },
      });
      const assignedTopicIds = new Set(assignedTaskTopics.map((t) => t.topicId));

      const completedTopicProgresses = await prisma.topicProgress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { topicId: true },
      });
      const completedTopicIds = new Set(completedTopicProgresses.map((tp) => tp.topicId));

      let targetTopic = allTopics.find((t) => !completedTopicIds.has(t.id) && !assignedTopicIds.has(t.id));

      if (!targetTopic) {
        targetTopic = allTopics.find((t) => !completedTopicIds.has(t.id));
      }

      if (!targetTopic && allTopics.length > 0) {
        targetTopic = allTopics[0];
      }

      if (targetTopic) {
        dailyTask = await prisma.dailyTask.create({
          data: {
            userId,
            topicId: targetTopic.id,
            assignedDate,
          },
          include: {
            topic: {
              include: {
                questions: true,
                subject: true,
              },
            },
          },
        });
      }
    }

    // 3. Get all topics in the user's exam type to display as checklist
    const subjects = await prisma.subject.findMany({
      where: { exam: { name: user.examType } },
      include: {
        topics: {
          include: {
            questions: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    // Get user progress for these topics
    const progresses = await prisma.topicProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(progresses.map((p) => [p.topicId, p]));

    const formattedTopics = subjects.flatMap((subject) =>
      subject.topics.map((topic) => {
        const prog = progressMap.get(topic.id);
        const isDaily = dailyTask?.topicId === topic.id;
        return {
          id: topic.id,
          title: topic.title,
          titleHi: topic.titleHi,
          content: topic.content,
          contentHi: topic.contentHi,
          subjectEn: subject.name,
          subjectHi: subject.nameHi,
          estimatedMinutes: topic.estimatedMinutes,
          questionsCount: topic.questions.length,
          status: prog?.status || "NOT_STARTED",
          completed: prog?.status === "COMPLETED" || (isDaily ? dailyTask?.isCompleted : false),
          isDaily,
        };
      })
    );

    return NextResponse.json({
      dailyTask: dailyTask
        ? {
            id: dailyTask.id,
            isCompleted: dailyTask.isCompleted,
            topic: {
              id: dailyTask.topic.id,
              title: dailyTask.topic.title,
              titleHi: dailyTask.topic.titleHi,
              content: dailyTask.topic.content,
              contentHi: dailyTask.topic.contentHi,
              estimatedMinutes: dailyTask.topic.estimatedMinutes,
              subject: {
                name: dailyTask.topic.subject.name,
                nameHi: dailyTask.topic.subject.nameHi,
              },
              questionsCount: dailyTask.topic.questions.length,
            },
          }
        : null,
      topicsList: formattedTopics,
    });
  } catch (error) {
    console.error("GET tasks API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = taskActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const { topicId, action } = parsed.data;

    // Check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { subject: { include: { exam: true } } },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Get current progress
    const currentProgress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: { userId, topicId },
      },
    });

    let newStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";
    let earnedPoints = 0;

    if (action === "start_reading") {
      newStatus = currentProgress?.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
    } else if (action === "complete_reading") {
      newStatus = "COMPLETED";
    } else if (action === "toggle_completion") {
      // Toggle logic
      if (currentProgress?.status === "COMPLETED") {
        newStatus = "IN_PROGRESS";
      } else {
        newStatus = "COMPLETED";
      }
    }

    // Ensure TopicProgress record exists (upsert)
    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: { userId, topicId },
      },
      update: {
        status: newStatus,
      },
      create: {
        userId,
        topicId,
        status: newStatus,
      },
    });

    const isCompletedNow = newStatus === "COMPLETED";

    // Update daily tasks for today if it matches this topic
    const now = new Date();
    const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcOffset + 3600000 * 5.5);
    const assignedDate = new Date(Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate()));

    const dailyTask = await prisma.dailyTask.findFirst({
      where: {
        userId,
        topicId,
        assignedDate,
      },
    });

    if (dailyTask) {
      await prisma.dailyTask.update({
        where: { id: dailyTask.id },
        data: {
          isCompleted: isCompletedNow,
          completedAt: isCompletedNow ? new Date() : null,
        },
      });
    }

    // Atomic Point-Awarding Logic
    if (isCompletedNow) {
      // Transition readingPointsAwarded from false to true atomically
      const atomicUpdate = await prisma.topicProgress.updateMany({
        where: {
          userId,
          topicId,
          readingPointsAwarded: false,
        },
        data: {
          readingPointsAwarded: true,
          status: "COMPLETED",
        },
      });

      if (atomicUpdate.count === 1) {
        earnedPoints = 15; // +15 Points for task completion

        // Upsert RewardPoints wallet
        await prisma.rewardPoints.upsert({
          where: { userId },
          update: {
            totalPoints: { increment: earnedPoints },
            lifetimePoints: { increment: earnedPoints },
          },
          create: {
            userId,
            totalPoints: earnedPoints,
            lifetimePoints: earnedPoints,
          },
        });

        // Log transaction
        await prisma.pointsTransaction.create({
          data: {
            userId,
            points: earnedPoints,
            reason: "TASK_COMPLETE",
            description: `topic:${topicId}`,
          },
        });

        // Also trigger/update streak active date
        const streak = await prisma.streak.findUnique({ where: { userId } });
        const todayStr = assignedDate.toISOString().split("T")[0];

        if (!streak) {
          // Create new streak
          await prisma.streak.create({
            data: {
              userId,
              currentStreak: 1,
              longestStreak: 1,
              lastActiveDate: assignedDate,
            },
          });
        } else {
          const lastActiveStr = streak.lastActiveDate
            ? streak.lastActiveDate.toISOString().split("T")[0]
            : null;

          if (lastActiveStr !== todayStr) {
            let newStreak = streak.currentStreak;
            const yesterday = new Date(assignedDate);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastActiveStr === yesterdayStr) {
              newStreak += 1;
            } else {
              // Streak broken, reset to 1
              newStreak = 1;
            }

            await prisma.streak.update({
              where: { userId },
              data: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, streak.longestStreak),
                lastActiveDate: assignedDate,
              },
            });
          }
        }
      } else {
        const wasCompletedBefore = currentProgress?.status === "COMPLETED";
        if (!wasCompletedBefore) {
          await logSecurityEvent({
            userId,
            eventType: "DUPLICATE_POINT_CLAIM",
            severity: "HIGH",
            route: "/api/dashboard/tasks",
            metadata: { topicId, reason: "Topic progress reading points already awarded" }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: progress.status,
      earnedPoints,
    });
  } catch (error) {
    console.error("POST tasks API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
