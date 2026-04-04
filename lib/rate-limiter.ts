/**
 * 서버사이드 인메모리 레이트 리미터 (Node.js module-level, not Edge)
 * 콜드 스타트 시 초기화됨 — 분산 환경에서는 Redis 교체 권장
 */

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

// 5분마다 만료된 항목 정리
const timer = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}, 5 * 60_000);

if (typeof (timer as NodeJS.Timeout).unref === "function") {
  (timer as NodeJS.Timeout).unref();
}

/**
 * @param key      Rate limit 키 (예: `naming:${ip}`)
 * @param limit    허용 최대 요청 수
 * @param windowSec 윈도우 크기 (초)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
