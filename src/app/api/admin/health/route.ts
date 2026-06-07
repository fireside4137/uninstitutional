import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { logSecurityEvent } from "@/lib/securityLogger";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;

    if (!session?.user?.id || userRole !== "ADMIN") {
      // Log unauthorized admin panel access attempt
      await logSecurityEvent({
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        eventType: "UNAUTHORIZED_ADMIN_ACCESS",
        severity: "HIGH",
        route: "/api/admin/health",
        metadata: { reason: "Unauthorized attempt to access system health API" },
      });
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // Test Postgres database connection
    let dbStatus = "HEALTHY";
    let dbError: string | null = null;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = "UNHEALTHY";
      dbError = err instanceof Error ? err.message : String(err);
    }

    // Test Upstash Redis connection
    let redisStatus = "HEALTHY";
    let redisError: string | null = null;
    const redisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

    if (!redisConfigured) {
      redisStatus = "MOCKED / UNCONFIGURED";
    } else {
      try {
        const pingRes = await redis.ping();
        if (pingRes !== "PONG") {
          redisStatus = "UNEXPECTED_RESPONSE";
          redisError = `Ping returned: ${pingRes}`;
        }
      } catch (err) {
        redisStatus = "UNHEALTHY";
        redisError = err instanceof Error ? err.message : String(err);
        
        // Log warning event for Redis connection failure
        console.warn(`[SECURITY WARN] Health check failed for Redis connection: ${redisError}`);
      }
    }

    return NextResponse.json({
      status: dbStatus === "HEALTHY" && (redisStatus === "HEALTHY" || redisStatus === "MOCKED / UNCONFIGURED") ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          error: dbError,
        },
        redis: {
          status: redisStatus,
          configured: redisConfigured,
          error: redisError,
        },
      },
    });
  } catch (error) {
    console.error("Health check route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
