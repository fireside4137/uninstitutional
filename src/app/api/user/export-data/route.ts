import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLogger";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Log the export request
    await logSecurityEvent({
      userId,
      email: session.user.email,
      eventType: "DATA_EXPORT_REQUESTED",
      severity: "LOW",
      route: "/api/user/export-data",
      ipAddress: req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      metadata: { action: "data_export" },
    });

    // Fetch user profile (excluding sensitive fields)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        examType: true,
        language: true,
        role: true,
        isVerified: true,
        isPremium: true,
        image: false, // Exclude full base64 image (too large)
        createdAt: true,
        updatedAt: true,
        // Exclude: passwordHash, verifyToken, resetToken, resetTokenExp, isDeleted, deletedAt
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all user-owned data
    const [dailyTasks, topicProgress, quizAttempts, streak, rewardPoints, pointsHistory, bookmarks] =
      await Promise.all([
        prisma.dailyTask.findMany({
          where: { userId },
          select: {
            id: true,
            assignedDate: true,
            isCompleted: true,
            completedAt: true,
            createdAt: true,
            topic: { select: { title: true, titleHi: true } },
          },
          orderBy: { assignedDate: "desc" },
        }),
        prisma.topicProgress.findMany({
          where: { userId },
          select: {
            id: true,
            status: true,
            averageScore: true,
            attemptCount: true,
            lastAttemptAt: true,
            updatedAt: true,
            topic: { select: { title: true, titleHi: true } },
          },
        }),
        prisma.quizAttempt.findMany({
          where: { userId },
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            correctCount: true,
            timeTakenSeconds: true,
            completedAt: true,
            topic: { select: { title: true, titleHi: true } },
            answers: {
              select: {
                isCorrect: true,
                selectedOption: true,
                timeTakenSeconds: true,
                question: { select: { text: true } },
              },
            },
          },
          orderBy: { completedAt: "desc" },
        }),
        prisma.streak.findUnique({
          where: { userId },
          select: {
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
            streakFreezes: true,
            updatedAt: true,
          },
        }),
        prisma.rewardPoints.findUnique({
          where: { userId },
          select: {
            totalPoints: true,
            lifetimePoints: true,
            updatedAt: true,
          },
        }),
        prisma.pointsTransaction.findMany({
          where: { userId },
          select: {
            id: true,
            points: true,
            reason: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bookmark.findMany({
          where: { userId },
          select: {
            id: true,
            itemType: true,
            itemId: true,
            createdAt: true,
          },
        }),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      platform: "UnInstitutional",
      profile: {
        ...user,
        hasProfileImage: !!(await prisma.user.findUnique({ where: { id: userId }, select: { image: true } }))?.image,
      },
      learningProgress: {
        dailyTasks,
        topicProgress,
        quizAttempts,
      },
      rewards: {
        rewardPoints,
        pointsHistory,
      },
      streak,
      bookmarks,
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `uninstitutional-my-data-${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
