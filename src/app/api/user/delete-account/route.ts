import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLogger";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const deleteSchema = z.object({
  confirmation: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userEmail = session.user.email || "";

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { confirmation } = parsed.data;

    // Require typing "DELETE" to confirm
    if (confirmation !== "DELETE") {
      return NextResponse.json({ error: "Confirmation text does not match. Type DELETE to confirm." }, { status: 400 });
    }

    // Log the deletion request
    await logSecurityEvent({
      userId,
      email: userEmail,
      eventType: "ACCOUNT_DELETION_REQUESTED",
      severity: "HIGH",
      route: "/api/user/delete-account",
      ipAddress: req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      metadata: { action: "account_deletion_initiated" },
    });

    // Verify user still exists and is not already deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true, email: true },
    });

    if (!user || user.isDeleted) {
      await logSecurityEvent({
        userId,
        email: userEmail,
        eventType: "ACCOUNT_DELETION_FAILED",
        severity: "MEDIUM",
        route: "/api/user/delete-account",
        metadata: { reason: "User not found or already deleted" },
      });
      return NextResponse.json({ error: "Account not found or already deleted" }, { status: 404 });
    }

    try {
      // Anonymize user account — soft-delete strategy
      // Generate an unusable password hash so login becomes impossible
      const unusableHash = `$2a$10$DELETED_${crypto.randomBytes(16).toString("hex")}`;
      const deletedEmail = `deleted_${userId}@deleted.local`;

      await prisma.user.update({
        where: { id: userId },
        data: {
          name: "Deleted User",
          email: deletedEmail,
          phone: null,
          image: null,
          passwordHash: unusableHash,
          isVerified: false,
          verifyToken: null,
          resetToken: null,
          resetTokenExp: null,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Log successful deletion
      await logSecurityEvent({
        userId,
        email: userEmail, // Log original email for audit trail
        eventType: "ACCOUNT_DELETED",
        severity: "HIGH",
        route: "/api/user/delete-account",
        ipAddress: req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || null,
        userAgent: req.headers.get("user-agent") || null,
        metadata: { 
          action: "account_anonymized",
          originalEmail: "[REDACTED]", // Don't store the actual email in metadata
          anonymizedEmail: deletedEmail,
        },
      });

      return NextResponse.json({ success: true, message: "Account has been deleted and anonymized." });
    } catch (updateError) {
      console.error("Account deletion failed:", updateError);

      await logSecurityEvent({
        userId,
        email: userEmail,
        eventType: "ACCOUNT_DELETION_FAILED",
        severity: "CRITICAL",
        route: "/api/user/delete-account",
        metadata: { reason: "Database update failed" },
      });

      return NextResponse.json({ error: "Failed to delete account. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
