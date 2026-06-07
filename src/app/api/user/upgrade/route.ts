import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Update user to premium
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
      select: {
        id: true,
        name: true,
        isPremium: true,
      },
    });

    return NextResponse.json({
      success: true,
      isPremium: updatedUser.isPremium,
    });
  } catch (error) {
    console.error("POST User Upgrade error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
