import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Rate limiter (Upstash Redis) ────────────────────────
// /api/generate, /api/naming, /api/global-naming → IP당 10회/분
// /api/brief → IP당 20회/분 (가벼운 요청)
// 환경변수 미설정 시 rate limit 미적용 (로컬 개발 환경)
function makeRateLimiter(requests: number, window: `${number} s` | `${number} m`) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

const heavyLimiter = makeRateLimiter(10, "1 m");  // AI 생성 API
const lightLimiter = makeRateLimiter(30, "1 m");  // 조회/검증 API

// ─── IP 추출 ──────────────────────────────────────────────
function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Admin 인증 (미들웨어 레벨 빠른 차단) ─────────────────
// X-Admin-Password 헤더 또는 Authorization: Bearer <token> 필요
// Bearer 토큰의 role 검증은 각 route에서 수행 (DB 조회 필요)
// 미들웨어에서는 헤더 존재 여부만 1차 필터링
function hasAdminCredential(req: NextRequest): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (adminPw) {
    const pw = req.headers.get("x-admin-password") ?? "";
    if (pw === adminPw) return true;
  }
  // Bearer 토큰 존재 여부만 확인 (실제 role 검증은 route handler에서)
  const auth = req.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") && auth.length > 10;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. Admin API 보호 ────────────────────────────────────
  if (pathname.startsWith("/api/admin/")) {
    // /api/admin/auth 는 로그인 엔드포인트이므로 통과
    if (!pathname.startsWith("/api/admin/auth")) {
      if (!hasAdminCredential(req)) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
  }

  // ── 2. AI 생성 API Rate Limit ────────────────────────────
  const isHeavy =
    pathname === "/api/generate" ||
    pathname === "/api/naming" ||
    pathname === "/api/global-naming" ||
    pathname === "/api/ars";

  const isLight =
    pathname === "/api/brief" ||
    pathname === "/api/brand-validate" ||
    pathname === "/api/free-usage";

  if (isHeavy && heavyLimiter) {
    const ip = getIp(req);
    const { success, limit, remaining, reset } = await heavyLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  if (isLight && lightLimiter) {
    const ip = getIp(req);
    const { success } = await lightLimiter.limit(`light:${ip}`);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin API 전체
    "/api/admin/:path*",
    // AI 생성 + 조회 API
    "/api/generate",
    "/api/naming",
    "/api/global-naming",
    "/api/ars",
    "/api/brief",
    "/api/brand-validate",
    "/api/free-usage",
  ],
};
