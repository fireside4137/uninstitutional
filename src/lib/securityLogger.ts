import { prisma } from "@/lib/prisma";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityEventType =
  | "UNAUTHORIZED_ADMIN_ACCESS"
  | "UNAUTHORIZED_PREMIUM_DOWNLOAD"
  | "RATE_LIMIT_HIT"
  | "DUPLICATE_POINT_CLAIM"
  | "INVALID_ADMIN_PAYLOAD"
  | "AUTH_FAILURE"
  | "DATA_EXPORT_REQUESTED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_DELETED"
  | "ACCOUNT_DELETION_FAILED";

interface LogParams {
  userId?: string | null;
  email?: string | null;
  eventType: SecurityEventType;
  severity: Severity;
  route?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

// Sensitive keys to automatically redact
const SENSITIVE_KEYS = [/pass/i, /token/i, /secret/i, /key/i, /cookie/i, /auth/i];

// Recursive helper to sanitize metadata object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeMetadata(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMetadata);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clean: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((regex) => regex.test(k));
    if (isSensitive) {
      clean[k] = "[REDACTED]";
    } else {
      clean[k] = sanitizeMetadata(obj[k]);
    }
  }
  return clean;
}

/**
 * Persist security events atomically inside the DB, sanitizing sensitive keys.
 */
export async function logSecurityEvent(params: LogParams) {
  const { userId, email, eventType, severity, route, ipAddress, userAgent, metadata } = params;

  // 1. Sanitize metadata payload
  const cleanMetadata = metadata ? sanitizeMetadata(metadata) : null;

  // 2. Perform console logging for instant visibility
  console.warn(
    `[SECURITY WARN] [${severity}] Event: ${eventType}, User: ${userId || email || "Unknown"}, Route: ${route || "N/A"}, IP: ${ipAddress || "N/A"}`
  );

  // 3. Persist to database in a safe catch-all block to prevent interrupting request flows
  try {
    await prisma.securityLog.create({
      data: {
        userId: userId || null,
        email: email || null,
        eventType,
        severity,
        route: route || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: cleanMetadata,
      },
    });
  } catch (error) {
    console.error("Failed to write to SecurityLog:", error);
  }
}
