/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLogger";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const promoteDemoteSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  examType: z.enum(["UKPSC", "UKSSC"]),
});

const adminActionSchema = z.object({
  action: z.enum(["PROMOTE", "DEMOTE", "CREATE_ADMIN"]),
  payload: z.any(),
});

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user?.id || userRole !== "ADMIN") {
      await logSecurityEvent({
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        eventType: "UNAUTHORIZED_ADMIN_ACCESS",
        severity: "HIGH",
        route: "/api/admin/users",
        metadata: { action: "GET_USERS_LIST" },
      });
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // Return name, email, role, examType, isPremium, createdAt
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        examType: true,
        isPremium: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET Admin Users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const currentUserEmail = session?.user?.email;

    if (!session?.user?.id || userRole !== "ADMIN") {
      await logSecurityEvent({
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        eventType: "UNAUTHORIZED_ADMIN_ACCESS",
        severity: "HIGH",
        route: "/api/admin/users",
        metadata: { action: "MUTATE_USER" },
      });
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const parsedAction = adminActionSchema.safeParse(body);
    if (!parsedAction.success) {
      return NextResponse.json({ error: "Invalid action parameters." }, { status: 400 });
    }

    const { action, payload } = parsedAction.data;

    if (action === "PROMOTE") {
      const parsed = promoteDemoteSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const { email } = parsed.data;

      // Find user
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { email },
        data: { role: UserRole.ADMIN },
        select: { id: true, name: true, email: true, role: true },
      });

      await logSecurityEvent({
        userId: session.user.id,
        email: session.user.email,
        eventType: "ADMIN_USER_PROMOTED",
        severity: "MEDIUM",
        route: "/api/admin/users",
        metadata: { promotedUserEmail: email, promotedUserId: targetUser.id },
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "DEMOTE") {
      const parsed = promoteDemoteSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const { email } = parsed.data;

      // Prevent self-demotion
      if (email === currentUserEmail) {
        return NextResponse.json({ error: "You cannot demote yourself." }, { status: 400 });
      }

      // Find user
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { email },
        data: { role: UserRole.STUDENT },
        select: { id: true, name: true, email: true, role: true },
      });

      await logSecurityEvent({
        userId: session.user.id,
        email: session.user.email,
        eventType: "ADMIN_USER_DEMOTED",
        severity: "MEDIUM",
        route: "/api/admin/users",
        metadata: { demotedUserEmail: email, demotedUserId: targetUser.id },
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "CREATE_ADMIN") {
      const parsed = createAdminSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const { name, email, phone, password, examType } = parsed.data;

      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create new Admin user
      const newAdmin = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          examType,
          role: UserRole.ADMIN,
          isPremium: true,
          isVerified: true,
          streak: {
            create: {
              currentStreak: 0,
              longestStreak: 0,
              streakFreezes: 1,
            },
          },
          rewardPoints: {
            create: {
              totalPoints: 0,
              lifetimePoints: 0,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await logSecurityEvent({
        userId: session.user.id,
        email: session.user.email,
        eventType: "ADMIN_USER_CREATED",
        severity: "MEDIUM",
        route: "/api/admin/users",
        metadata: { newAdminEmail: email, newAdminId: newAdmin.id },
      });

      return NextResponse.json({ success: true, user: newAdmin });
    }

    return NextResponse.json({ error: "Invalid action type." }, { status: 400 });
  } catch (error) {
    console.error("POST Admin Users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
