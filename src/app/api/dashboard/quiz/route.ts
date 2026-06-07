import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/securityLogger";

const quizSubmissionSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
  selectedAnswers: z.array(z.number().int().nullable().optional()),
});

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    // Helper to format questions based on user's preferred language
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatQuestions = (questions: any[], language: string) => {
      return questions.map((q) => {
        const correctIndex =
          q.correctOption === "A" ? 0 : q.correctOption === "B" ? 1 : q.correctOption === "C" ? 2 : 3;

        // Dynamic options translation based on user settings
        const isHi = language === "HINDI";
        const options = [
          isHi && q.optionAHi ? q.optionAHi : q.optionA,
          isHi && q.optionBHi ? q.optionBHi : q.optionB,
          isHi && q.optionCHi ? q.optionCHi : q.optionC,
          isHi && q.optionDHi ? q.optionDHi : q.optionD,
        ];

        return {
          id: q.id,
          q: q.text,
          qHi: q.textHi || q.text,
          options,
          correct: correctIndex,
          explanation: isHi && q.explanationHi ? q.explanationHi : q.explanation || "",
          explanationHi: q.explanationHi || q.explanation || "",
        };
      });
    };

    // 1. If a specific topicId is requested, return that quiz directly
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          questions: {
            orderBy: { createdAt: "asc" },
          },
          subject: true,
        },
      });

      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: topic.id,
        titleEn: topic.title,
        titleHi: topic.titleHi,
        descEn: `Practice test on ${topic.title}`,
        descHi: `${topic.titleHi} पर अभ्यास परीक्षण`,
        questionsCount: topic.questions.length,
        timeMinutes: Math.max(5, Math.round(topic.questions.length * 1.5)),
        points: topic.questions.length * 10,
        category: topic.subject.name,
        questions: formatQuestions(topic.questions, user.language),
      });
    }

    // 2. Otherwise return the list of available quizzes (grouped by Daily + Subject-wise)
    // Get today's assigned Daily Task
    const now = new Date();
    const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcOffset + 3600000 * 5.5);
    const assignedDate = new Date(Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate()));

    let dailyTask = await prisma.dailyTask.findFirst({
      where: {
        userId,
        assignedDate,
      },
      include: {
        topic: {
          include: {
            questions: {
              orderBy: { createdAt: "asc" },
            },
            subject: true,
          },
        },
      },
    });

    // If no daily task exists yet, fetch or assign one
    if (!dailyTask) {
      const allTopics = await prisma.topic.findMany({
        where: { subject: { exam: { name: user.examType } } },
        orderBy: [
          { subject: { orderIndex: "asc" } },
          { orderIndex: "asc" },
        ],
        include: {
          questions: {
            orderBy: { createdAt: "asc" },
          },
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
                questions: {
                  orderBy: { createdAt: "asc" },
                },
                subject: true,
              },
            },
          },
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizzesList: any[] = [];

    // Add Daily Challenge Quiz if the topic has questions
    if (dailyTask && dailyTask.topic.questions.length > 0) {
      quizzesList.push({
        id: "daily",
        topicId: dailyTask.topic.id,
        titleEn: "Daily General Studies Challenge",
        titleHi: "दैनिक सामान्य अध्ययन चुनौती",
        descEn: `Today's Target: ${dailyTask.topic.title}`,
        descHi: `आज का लक्ष्य: ${dailyTask.topic.titleHi}`,
        questionsCount: dailyTask.topic.questions.length,
        timeMinutes: Math.max(5, Math.round(dailyTask.topic.questions.length * 1.5)),
        points: dailyTask.topic.questions.length * 10 + 20, // +20 points daily bonus
        category: "Daily",
        questions: formatQuestions(dailyTask.topic.questions, user.language),
      });
    }

    // Fetch other topic-wise quizzes
    const otherTopics = await prisma.topic.findMany({
      where: {
        subject: { exam: { name: user.examType } },
        questions: { some: {} }, // only topics with questions
      },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
        },
        subject: true,
      },
      orderBy: { orderIndex: "asc" },
    });

    otherTopics.forEach((t) => {
      // Exclude today's daily task topic from general subject list to avoid duplication
      if (dailyTask && t.id === dailyTask.topicId) {
        return;
      }

      quizzesList.push({
        id: t.id,
        topicId: t.id,
        titleEn: t.title,
        titleHi: t.titleHi,
        descEn: `Practice test on ${t.subject.name}`,
        descHi: `${t.subject.nameHi} पर अभ्यास परीक्षण`,
        questionsCount: t.questions.length,
        timeMinutes: Math.max(5, Math.round(t.questions.length * 1.5)),
        points: t.questions.length * 10,
        category: t.subject.name,
        questions: formatQuestions(t.questions, user.language),
      });
    });

    return NextResponse.json(quizzesList);
  } catch (error) {
    console.error("GET quiz API error:", error);
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
    const parsed = quizSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const { topicId, selectedAnswers } = parsed.data;

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: { topicId },
      orderBy: { createdAt: "asc" },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions found for this topic" }, { status: 404 });
    }

    let correctCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answerRecords: any[] = [];

    // Calculate score
    questions.forEach((q, index) => {
      const selectedIndex = selectedAnswers[index]; // 0-3
      const correctIndex =
        q.correctOption === "A" ? 0 : q.correctOption === "B" ? 1 : q.correctOption === "C" ? 2 : 3;

      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) {
        correctCount++;
      }

      const selectedOptionLetter =
        selectedIndex === 0 ? "A" : selectedIndex === 1 ? "B" : selectedIndex === 2 ? "C" : selectedIndex === 3 ? "D" : null;

      answerRecords.push({
        questionId: q.id,
        selectedOption: selectedOptionLetter,
        isCorrect,
      });
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    // Save QuizAttempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        topicId,
        score: scorePercent,
        totalQuestions: questions.length,
        correctCount,
        answers: {
          create: answerRecords,
        },
      },
    });

    // Check if this was today's daily task
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

    const passed = scorePercent >= 60;
    let earnedPoints = 0;
    let pointsAwardedReason: "QUIZ_COMPLETE" | "QUIZ_BONUS" | null = null;
    const todayStr = assignedDate.toISOString().split("T")[0];

    // Fetch previous progress to aggregate
    const prevProgress = await prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });

    const totalAttempts = (prevProgress?.attemptCount || 0) + 1;
    const newAverageScore = prevProgress
      ? Math.round(((prevProgress.averageScore * prevProgress.attemptCount + scorePercent) / totalAttempts) * 10) / 10
      : scorePercent;

    // Set topic completion status if passed
    let finalStatus = prevProgress?.status || "NOT_STARTED";
    if (passed) {
      finalStatus = "COMPLETED";
    } else if (finalStatus === "NOT_STARTED") {
      finalStatus = "IN_PROGRESS";
    }

    await prisma.topicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        status: finalStatus,
        averageScore: newAverageScore,
        attemptCount: totalAttempts,
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        topicId,
        status: finalStatus,
        averageScore: scorePercent,
        attemptCount: 1,
        lastAttemptAt: new Date(),
      },
    });

    // 1. Check Standard Quiz completion points
    if (passed) {
      // Transition quizPointsAwarded atomically
      const atomicQuizPoints = await prisma.topicProgress.updateMany({
        where: {
          userId,
          topicId,
          quizPointsAwarded: false,
        },
        data: {
          quizPointsAwarded: true,
        },
      });

      if (atomicQuizPoints.count === 1) {
        earnedPoints += correctCount * 10;
      } else {
        await logSecurityEvent({
          userId,
          eventType: "DUPLICATE_POINT_CLAIM",
          severity: "HIGH",
          route: "/api/dashboard/quiz",
          metadata: { topicId, reason: "Topic progress quiz points already awarded" }
        });
      }
    }

    // 2. Check Daily Challenge bonus points
    let dailyBonusPointsAwarded = false;
    if (dailyTask && passed) {
      // Transition bonusPointsAwarded atomically
      const atomicDailyBonus = await prisma.dailyTask.updateMany({
        where: {
          id: dailyTask.id,
          bonusPointsAwarded: false,
        },
        data: {
          bonusPointsAwarded: true,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      if (atomicDailyBonus.count === 1) {
        earnedPoints += 20; // +20 points Daily Challenge Bonus
        dailyBonusPointsAwarded = true;
      } else {
        await logSecurityEvent({
          userId,
          eventType: "DUPLICATE_POINT_CLAIM",
          severity: "HIGH",
          route: "/api/dashboard/quiz",
          metadata: { dailyTaskId: dailyTask.id, date: todayStr, reason: "Daily challenge bonus points already awarded" }
        });
      }
    } else if (dailyTask && passed) {
      // Mark DailyTask completed even if bonus points were already claimed
      await prisma.dailyTask.update({
        where: { id: dailyTask.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // Award points
    if (earnedPoints > 0) {
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

      pointsAwardedReason = dailyBonusPointsAwarded ? "QUIZ_BONUS" : "QUIZ_COMPLETE";
      await prisma.pointsTransaction.create({
        data: {
          userId,
          points: earnedPoints,
          reason: pointsAwardedReason,
          description: dailyBonusPointsAwarded 
            ? `daily:${dailyTask?.id || ""}` 
            : `quiz:${topicId}`,
        },
      });
    }

    // Update streak active date
    const streak = await prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
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

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: scorePercent,
      correctCount,
      totalQuestions: questions.length,
      earnedPoints,
      passed,
    });
  } catch (error) {
    console.error("POST quiz API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
