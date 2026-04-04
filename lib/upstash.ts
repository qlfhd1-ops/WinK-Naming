import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
let _freeLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) _redis = new Redis({ url, token });
  return _redis;
}

/** 무료 사용자용 레이트 리미터: 시간당 5회 슬라이딩 윈도우 */
export function getFreeLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_freeLimiter) {
    _freeLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "naming:free",
    });
  }
  return _freeLimiter;
}
