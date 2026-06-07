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

    // 1. Fetch user reward points wallet and streak info
    const wallet = await prisma.rewardPoints.findUnique({
      where: { userId },
    });

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    // 2. Fetch redemptions to see which items are unlocked
    const redemptions = await prisma.pointsTransaction.findMany({
      where: {
        userId,
        reason: "REDEMPTION",
      },
      select: {
        description: true,
      },
    });

    const unlockedItemIds = new Set(
      redemptions
        .map((r) => r.description)
        .filter((desc): desc is string => typeof desc === "string" && desc !== "")
    );

    // 3. Render the shop items catalog with dynamically checked unlocked state
    const shopItems = [
      {
        id: "pdf1",
        nameEn: "Uttarakhand Budget 2026 Analysis PDF",
        nameHi: "उत्तराखंड बजट 2026 विश्लेषण पीडीएफ",
        cost: 50,
        type: "Document",
        unlocked: unlockedItemIds.has("pdf1"),
      },
      {
        id: "test1",
        nameEn: "UKPSC Executive Officer Full Mock Test",
        nameHi: "यूकेपीएससी कार्यकारी अधिकारी पूर्ण मॉक टेस्ट",
        cost: 100,
        type: "Mock Test",
        unlocked: unlockedItemIds.has("test1"),
      },
      {
        id: "note1",
        nameEn: "Handwritten Polity Mindmaps (All Articles)",
        nameHi: "हस्तलिखित राजव्यवस्था माइंडमैप्स (सभी अनुच्छेद)",
        cost: 150,
        type: "Visual Notes",
        unlocked: unlockedItemIds.has("note1"),
      },
    ];

    // 4. Generate active calendar grid days (past 28 days) based on actual activity logs
    const today = new Date();
    
    // Get IST Date string helper
    const getISTDateString = (date: Date) => {
      const uOffset = date.getTime() + date.getTimezoneOffset() * 60000;
      const ist = new Date(uOffset + 3600000 * 5.5);
      const yyyy = ist.getFullYear();
      const mm = String(ist.getMonth() + 1).padStart(2, '0');
      const dd = String(ist.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // Calculate dates of the last 28 days in IST ending at today
    const dates: { dateStr: string; label: string }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = getISTDateString(d);
      
      const uOffset = d.getTime() + d.getTimezoneOffset() * 60000;
      const shifted = new Date(uOffset + 3600000 * 5.5);
      const label = String(shifted.getDate());
      dates.push({ dateStr, label });
    }

    // Query active points transactions for the user from 28 days ago to today
    const twentyEightDaysAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
    const transactions = await prisma.pointsTransaction.findMany({
      where: {
        userId,
        points: { gt: 0 },
        createdAt: { gte: twentyEightDaysAgo }
      },
      select: {
        createdAt: true
      }
    });

    const activeDateStrings = new Set<string>();
    transactions.forEach(tx => {
      activeDateStrings.add(getISTDateString(tx.createdAt));
    });

    const currentStreak = streak?.currentStreak || 0;
    const streakGrid = dates.map((d, index) => {
      return {
        day: index + 1,
        dateStr: d.dateStr,
        label: d.label,
        active: activeDateStrings.has(d.dateStr)
      };
    });

    return NextResponse.json({
      points: wallet?.totalPoints || 0,
      currentStreak,
      longestStreak: streak?.longestStreak || 0,
      streakGrid,
      shopItems,
    });
  } catch (error) {
    console.error("GET rewards API error:", error);
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

    const { itemId, cost } = await req.json();

    if (!itemId || typeof cost !== "number" || cost <= 0) {
      return NextResponse.json({ error: "Invalid itemId or cost" }, { status: 400 });
    }

    // 1. Fetch user reward points wallet
    const wallet = await prisma.rewardPoints.findUnique({
      where: { userId },
    });

    const currentPoints = wallet?.totalPoints || 0;

    if (currentPoints < cost) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // 2. Check if already unlocked
    const alreadyUnlocked = await prisma.pointsTransaction.findFirst({
      where: {
        userId,
        reason: "REDEMPTION",
        description: itemId,
      },
    });

    if (alreadyUnlocked) {
      return NextResponse.json({ error: "Item is already unlocked" }, { status: 400 });
    }

    // 3. Deduct points and log redemption transaction
    await prisma.$transaction([
      // Deduct from wallet (totalPoints decreases, lifetimePoints remains the same)
      prisma.rewardPoints.update({
        where: { userId },
        data: {
          totalPoints: { decrement: cost },
        },
      }),
      // Log transaction
      prisma.pointsTransaction.create({
        data: {
          userId,
          points: -cost,
          reason: "REDEMPTION",
          description: itemId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      remainingPoints: currentPoints - cost,
    });
  } catch (error) {
    console.error("POST rewards API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
