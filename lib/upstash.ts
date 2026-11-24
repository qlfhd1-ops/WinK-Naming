import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
let _freeLimiter: Ratelimit | null = null;

/** 환경변수 값 앞뒤의 공백·줄바꿈·감싼 따옴표를 제거한다(복사·붙여넣기로 흔히 섞여 들어가 WRONGPASS 등의 원인이 됨). */
function cleanEnv(v: string | undefined): string {
  let s = (v ?? "").trim();
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Upstash REST 접속 정보. 둘 중 하나라도 없으면 null. */
export function readUpstashEnv(): { url: string; token: string } | null {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  return url && token ? { url, token } : null;
}

function getRedis(): Redis | null {
  const env = readUpstashEnv();
  if (!env) return null;
  const { url, token } = env;
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
