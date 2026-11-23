import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
let _freeLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // 재시도를 끈다: 기본 재시도(5회, 지수 백오프)는 Redis 주소가 죽었을 때 요청마다 약 4.4초를 낭비한다.
  // 실패하면 호출부가 곧바로 in-memory 폴백으로 넘어간다.
  if (!_redis) _redis = new Redis({ url, token, retry: false });
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
      // 응답이 없을 때 오래 붙잡지 않는다(기본 5초)
      timeout: 1000,
    });
  }
  return _freeLimiter;
}
