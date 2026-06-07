import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, examPortal } = await req.json();
    if (!email || !examPortal) {
      return NextResponse.json({ valid: true });
    }

    // Find the user registered under this email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { examType: true },
    });

    if (user && user.examType !== examPortal) {
      return NextResponse.json({ valid: false, userExam: user.examType });
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("check-portal route error:", err);
    return NextResponse.json({ valid: true }); // Fallback on error to prevent blocking
  }
}
