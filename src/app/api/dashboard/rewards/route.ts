import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const rewardPurchaseSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
  cost: z.number().int().positive("cost must be a positive integer"),
});

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

    const body = await req.json();
    const parsed = rewardPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const { itemId, cost } = parsed.data;

    // Deduct points and log redemption transaction atomically using interactive transaction & row lock
    try {
      await prisma.$transaction(async (tx) => {
        // Row lock on the user's RewardPoints wallet to serialize concurrent requests for this user
        await tx.$executeRaw`SELECT * FROM reward_points WHERE "userId" = ${userId} FOR UPDATE`;

        // Check if already unlocked inside the locked context
        const alreadyUnlocked = await tx.pointsTransaction.findFirst({
          where: {
            userId,
            reason: "REDEMPTION",
            description: itemId,
          },
        });

        if (alreadyUnlocked) {
          throw new Error("ALREADY_UNLOCKED");
        }

        // Fetch wallet inside the locked context
        const wallet = await tx.rewardPoints.findUnique({
          where: { userId },
        });

        if (!wallet || wallet.totalPoints < cost) {
          throw new Error("INSUFFICIENT_POINTS");
        }

        // Deduct points
        await tx.rewardPoints.update({
          where: { userId },
          data: {
            totalPoints: { decrement: cost },
          },
        });

        // Log transaction
        await tx.pointsTransaction.create({
          data: {
            userId,
            points: -cost,
            reason: "REDEMPTION",
            description: itemId,
          },
        });
      });
    } catch (txError: unknown) {
      const message = txError instanceof Error ? txError.message : "";
      if (message === "ALREADY_UNLOCKED") {
        return NextResponse.json({ error: "Item is already unlocked" }, { status: 400 });
      }
      if (message === "INSUFFICIENT_POINTS") {
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
      }
      throw txError;
    }

    // Fetch final points balance for accurate response
    const finalWallet = await prisma.rewardPoints.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      remainingPoints: finalWallet?.totalPoints || 0,
    });
  } catch (error) {
    console.error("POST rewards API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
