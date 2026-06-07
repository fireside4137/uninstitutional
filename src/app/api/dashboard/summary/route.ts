import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch user and relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        streak: true,
        rewardPoints: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Calculate syllabus coverage & statistics
    const subjects = await prisma.subject.findMany({
      where: { exam: { name: user.examType } },
      include: { topics: true },
    });

    const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);

    const completedProgressList = await prisma.topicProgress.findMany({
      where: {
        userId,
        status: "COMPLETED",
        topic: { subject: { exam: { name: user.examType } } },
      },
    });
    const topicsDone = completedProgressList.length;
    const syllabusPercent = totalTopics > 0 ? Math.round((topicsDone / totalTopics) * 100) : 0;

    const quizzesDone = await prisma.quizAttempt.count({
      where: { userId },
    });

    // 2. Fetch strong & weak topics
    const topicProgresses = await prisma.topicProgress.findMany({
      where: { userId },
      include: { topic: true },
    });

    const strongTopics: string[] = [];
    const weakTopics: { name: string; reason: string }[] = [];

    for (const tp of topicProgresses) {
      const topicName = user.language === "HINDI" && tp.topic.titleHi ? tp.topic.titleHi : tp.topic.title;
      if (tp.averageScore >= 80 && tp.status === "COMPLETED") {
        strongTopics.push(topicName);
      } else if (tp.averageScore < 60 && tp.attemptCount > 0) {
        weakTopics.push({
          name: topicName,
          reason: user.language === "HINDI" 
            ? `अंतिम सटीकता: ${Math.round(tp.averageScore)}%` 
            : `Last accuracy: ${Math.round(tp.averageScore)}%`,
        });
      }
    }

    // 3. IST Daily Task Assignment Engine
    const now = new Date();
    // Offset for India Standard Time (UTC +5.5 hours)
    const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcOffset + 3600000 * 5.5);
    const assignedDate = new Date(Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate()));

    // Check if task exists for today
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

    // Assign next incomplete topic if not present
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

      // 1. Pick first not completed and not assigned
      let targetTopic = allTopics.find((t) => !completedTopicIds.has(t.id) && !assignedTopicIds.has(t.id));

      // 2. Fallback: Pick first not completed (even if assigned in past)
      if (!targetTopic) {
        targetTopic = allTopics.find((t) => !completedTopicIds.has(t.id));
      }

      // 3. Cycle fallback: Pick first overall topic
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

    // 4. Retrieve subject-wise coverage percentage list
    const subjectProgressList = await Promise.all(
      subjects.map(async (subj) => {
        const totalSubjTopics = subj.topics.length;
        const completedSubjTopics = await prisma.topicProgress.count({
          where: {
            userId,
            status: "COMPLETED",
            topic: { subjectId: subj.id },
          },
        });
        return {
          nameEn: subj.name,
          nameHi: subj.nameHi,
          percent: totalSubjTopics > 0 ? Math.round((completedSubjTopics / totalSubjTopics) * 100) : 0,
        };
      })
    );

    // Retrieve stats
    // Let's mock study hours from quiz attempts or progress count for realistic presentation
    const questionsSolved = await prisma.attemptAnswer.count({
      where: { attempt: { userId } },
    });
    const avgAccuracyList = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true },
    });
    const avgAccuracy = avgAccuracyList.length > 0 
      ? Math.round(avgAccuracyList.reduce((sum, qa) => sum + qa.score, 0) / avgAccuracyList.length * 10) // convert e.g. 7.6/10 to 76%
      : 0;

    // Fetch upcoming exams, forms closing soon, and latest announcements
    const currentDate = new Date();

    const upcomingExams = await prisma.examEvent.findMany({
      where: {
        examDate: { gte: currentDate },
      },
      orderBy: { examDate: "asc" },
      take: 3,
    });

    const formsClosingSoon = await prisma.examEvent.findMany({
      where: {
        formCloseDate: { gte: currentDate },
        status: { not: "Closed" },
      },
      orderBy: { formCloseDate: "asc" },
      take: 3,
    });

    const latestAnnouncements = await prisma.notification.findMany({
      orderBy: { publishDate: "desc" },
      take: 4,
    });

    return NextResponse.json({
      user: {
        name: user.name,
        examType: user.examType,
        streak: user.streak?.currentStreak || 0,
        points: user.rewardPoints?.totalPoints || 0,
        image: user.image,
        role: user.role,
        isPremium: user.isPremium,
        topicsDone,
        quizzesDone,
        syllabusPercent,
        questionsSolved,
        avgAccuracy,
        studyHours: Math.round((topicsDone * 15 + quizzesDone * 10) / 60 * 10) / 10, // Dynamic study hours calculation
      },
      strongTopics,
      weakTopics,
      subjectProgress: subjectProgressList,
      dailyTask: dailyTask
        ? {
            id: dailyTask.id,
            isCompleted: dailyTask.isCompleted,
            topic: {
              id: dailyTask.topic.id,
              title: dailyTask.topic.title,
              titleHi: dailyTask.topic.titleHi,
              estimatedMinutes: dailyTask.topic.estimatedMinutes,
              subject: {
                name: dailyTask.topic.subject.name,
                nameHi: dailyTask.topic.subject.nameHi,
              },
              questionsCount: dailyTask.topic.questions.length,
            },
          }
        : null,
      upcomingExams,
      formsClosingSoon,
      latestAnnouncements,
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
