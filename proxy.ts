import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Node.js Runtime 명시 — Edge Runtime의 모듈 호환성 이슈 방지
export const runtime = "nodejs";

/**
 * Next.js 16 Proxy — 보안 + Rate Limit + 관리자 인증
 *
 * 보호 레이어:
 * 1. Admin 페이지/API 인증
 * 2. 빈 User-Agent 봇 차단
 * 3. POST 전용 엔드포인트 메서드 제한
 * 4. API Rate Limiting (Upstash Redis)
 * 5. 보안 헤더 (CSP, X-Frame-Options, HSTS 등)
 * 6. 외부 Origin API 직접 호출 차단
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_BASE_URL ?? "https://yoonseul-naming.vercel.app";

// ─── Rate limiter ────────────────────────────────────────
function makeRateLimiter(requests: number, window: `${number} s` | `${number} m`) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// Rate limiter는 요청 시점에 지연 생성 (top-level 초기화 시 Edge 크래시 방지)
let heavyLimiter: ReturnType<typeof makeRateLimiter> = null;
let lightLimiter: ReturnType<typeof makeRateLimiter> = null;
let authLimiter:  ReturnType<typeof makeRateLimiter> = null;
function ensureLimiters() {
  if (heavyLimiter === null) heavyLimiter = makeRateLimiter(10, "1 m");
  if (lightLimiter === null) lightLimiter = makeRateLimiter(30, "1 m");
  if (authLimiter  === null) authLimiter  = makeRateLimiter(5,  "1 m");
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Admin 인증 ─────────────────────────────────────────
function hasAdminCredential(req: NextRequest): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (adminPw) {
    const pw = req.headers.get("x-admin-password") ?? "";
    if (pw === adminPw) return true;
  }
  const auth = req.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") && auth.length > 10;
}

// ─── 보안 응답 헤더 ──────────────────────────────────────
function applySecurityHeaders(res: NextResponse): NextResponse {
  // 클릭재킹 방지
  res.headers.set("X-Frame-Options", "DENY");
  // MIME 스니핑 방지
  res.headers.set("X-Content-Type-Options", "nosniff");
  // XSS 필터
  res.headers.set("X-XSS-Protection", "1; mode=block");
  // Referrer 제한
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // 기능 정책
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // 소스 숨김 — DevTools에서 코드 쉽게 볼 수 없게
  res.headers.set("X-Powered-By", "");
  // HSTS (HTTPS 강제)
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // ── Content Security Policy ──────────────────────────
  const csp = [
    "default-src 'self'",
    // JS: 자사 + Kakao SDK + Daum 우편번호 SDK
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developers.kakao.com https://t1.daumcdn.net",
    // CSS
    "style-src 'self' 'unsafe-inline'",
    // 이미지: 자사 + data URI + blob + 외부 HTTPS
    "img-src 'self' data: blob: https:",
    // API 연결: Supabase (HTTP + WebSocket) + OpenAI + Upstash
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.upstash.io",
    // iframe: Daum 우편번호 팝업
    "frame-src https://postcode.map.daum.net",
    // 폰트
    "font-src 'self' https://fonts.gstatic.com",
    // iframe으로 이 앱 삽입 완전 차단
    "frame-ancestors 'none'",
    // 폼 액션 자사만
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { method }   = req;

  // ── 1. Admin 페이지 — 세션 없으면 로그인으로 ──────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const hasSession = req.cookies.getAll().some(
      (c) => (c.name.includes("auth-token") || c.name === "wink_admin") && c.value.length > 3
    );
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ── 2. Admin API 보호 ──────────────────────────────────
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth")) {
    if (!hasAdminCredential(req)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── 3. 빈 User-Agent 차단 (스크래퍼/자동화 봇) ───────────
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua && pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ ok: false, error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 4. 외부 Origin에서 직접 API 호출 차단 ─────────────────
  // 브라우저 요청엔 Origin 헤더가 있음 — 앱 도메인과 다르면 차단
  if (pathname.startsWith("/api/") && method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && origin !== ALLOWED_ORIGIN && !origin.endsWith(".vercel.app")) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  // ── 5. POST 전용 엔드포인트 메서드 제한 ───────────────────
  const postOnlyPaths = ["/api/naming", "/api/direct-order", "/api/ars", "/api/gift-card"];
  if (postOnlyPaths.some((p) => pathname.startsWith(p)) && method !== "POST") {
    return new NextResponse(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 6. POST Content-Type 검사 ─────────────────────────
  if (method === "POST" && pathname.startsWith("/api/")) {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "Content-Type must be application/json" }),
        { status: 415, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── 7. Rate Limiting ───────────────────────────────────
  // 로그인/OTP — 가장 엄격 (5회/분)
  const isAuthPath =
    pathname.startsWith("/api/auth/") ||
    pathname === "/auth/callback";

  const isHeavy =
    pathname === "/api/generate" ||
    pathname === "/api/naming" ||
    pathname === "/api/global-naming" ||
    pathname === "/api/ars";

  const isLightApi =
    pathname === "/api/brief" ||
    pathname === "/api/brand-validate" ||
    pathname === "/api/free-usage";

  const ip = getIp(req);

  // Rate limiter 지연 초기화 (top-level 초기화 제거로 인한 변경)
  ensureLimiters();

  if (isAuthPath && authLimiter) {
    const { success } = await authLimiter.limit(`auth:${ip}`);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "너무 많은 요청입니다. 1분 후 다시 시도해 주세요." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (isHeavy && heavyLimiter) {
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

  if (isLightApi && lightLimiter) {
    const { success } = await lightLimiter.limit(`light:${ip}`);
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }
  }

  // ── 8. 보안 헤더 적용 후 통과 ─────────────────────────────
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
