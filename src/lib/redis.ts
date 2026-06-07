import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Local in-memory cache for sliding-window rate limiting (used in development, offline testing, or when Upstash is missing)
const memoryStore = new Map<string, number[]>();

/**
 * Sliding window rate limiting helper
 * @param key Unique key identifier (e.g. rate-limit:IP:route or rate-limit:userId:route)
 * @param limit Max requests allowed
 * @param windowSeconds Window size in seconds
 * @returns { success: boolean, limit: number, remaining: number }
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const isMock = process.env.MOCK_REDIS === "true" || process.env.NODE_ENV === "development";
  const redisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

  // Fallback to local in-memory rate limiting in development/offline testing mode to ensure 429 testing works E2E
  if (!redisConfigured || isMock) {
    const now = Date.now();
    const clearBefore = now - windowSeconds * 1000;

    let timestamps = memoryStore.get(key) || [];
    timestamps = timestamps.filter((t) => t > clearBefore);
    timestamps.push(now);
    memoryStore.set(key, timestamps);

    const count = timestamps.length;
    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    if (!redisConfigured) {
      console.warn(`[SECURITY WARN] Upstash Redis missing. Rate limiter running on local in-memory fallback for key: ${key}`);
    }

    return {
      success,
      limit,
      remaining,
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
    // Hybrid approach: Fall back to local in-memory rate limiter if Upstash goes offline or is misconfigured, preventing complete bypass of rate limits.
    console.warn(
      `[SECURITY WARN] Redis connection failed. Falling back to local in-memory rate limiting for key: ${key}. Error: ${error instanceof Error ? error.message : String(error)}`
    );

    const clearBefore = now - windowSeconds * 1000;
    let timestamps = memoryStore.get(key) || [];
    timestamps = timestamps.filter((t) => t > clearBefore);
    timestamps.push(now);
    memoryStore.set(key, timestamps);

    const count = timestamps.length;
    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    return {
      success,
      limit,
      remaining,
    };
  }
}
