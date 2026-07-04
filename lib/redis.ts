import "server-only";

/**
 * Redis client (used for rate limiting).
 *
 * Two backends, chosen by env at import time:
 *   - Upstash REST client when `UPSTASH_REDIS_REST_URL` is set. Used on
 *     Vercel — persistent TCP connections don't survive serverless
 *     cold-starts, so an HTTPS-per-command client is the right shape.
 *   - `ioredis` against `REDIS_URL` otherwise. Used for local Docker
 *     Redis and on the org server (long-lived Node process, TCP is fine).
 *
 * Both backends expose the subset of the Redis API used by the rate
 * limiter (`incr`, `expire`, `ttl`, `del`) with matching signatures.
 */

interface RateLimitRedis {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<number>;
}

const globalForRedis = globalThis as unknown as {
  redis: RateLimitRedis | undefined;
};

function createRedisClient(): RateLimitRedis {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    // Upstash REST client — used on Vercel / any serverless env.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
    const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
    return {
      incr: (key) => client.incr(key),
      expire: (key, seconds) => client.expire(key, seconds),
      ttl: (key) => client.ttl(key),
      del: (key) => client.del(key),
    };
  }

  // ioredis — used locally and on the org server.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const IORedis = require("ioredis").default as typeof import("ioredis").default;
  const client = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
  });
  return {
    incr: (key) => client.incr(key),
    expire: (key, seconds) => client.expire(key, seconds).then((r) => Number(r)),
    ttl: (key) => client.ttl(key),
    del: (key) => client.del(key),
  };
}

export const redis: RateLimitRedis =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
