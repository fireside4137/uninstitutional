import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Sliding window rate limiting helper
 * @param key Unique key identifier (e.g. rate-limit:IP:route or rate-limit:userId:route)
 * @param limit Max requests allowed
 * @param windowSeconds Window size in seconds
 * @returns { success: boolean, limit: number, remaining: number }
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  // If Upstash Redis configuration is missing, fail open to prevent breaking production
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("[SECURITY WARN] Upstash Redis credentials missing. Rate limiter is disabled (failing open).");
    return {
      success: true,
      limit,
      remaining: 1,
    };
  }

  const now = Date.now();
  const clearBefore = now - windowSeconds * 1000;

  try {
    const pipeline = redis.pipeline();
    // 1. Remove entries older than sliding window
    pipeline.zremrangebyscore(key, 0, clearBefore);
    // 2. Add current request timestamp to sorted set
    pipeline.zadd(key, { score: now, member: String(now + Math.random()) });
    // 3. Get count of requests in window
    pipeline.zcard(key);
    // 4. Set expire time on the set to keep database clean
    pipeline.expire(key, windowSeconds + 10);

    const results = await pipeline.exec();
    const count = results[2] as number;

    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    return {
      success,
      limit,
      remaining,
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // Fail open in case Upstash is down or token is misconfigured
    return {
      success: true,
      limit,
      remaining: 1,
    };
  }
}
