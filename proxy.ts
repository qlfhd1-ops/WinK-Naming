import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy — 보안 + 관리자 인증
 *
 * 보호 레이어:
 * 1. Admin 페이지/API 인증
 * 2. 빈 User-Agent 봇 차단
 * 3. POST 전용 엔드포인트 메서드 제한
 * 4. POST Content-Type 검사
 * 5. 보안 헤더 (CSP, X-Frame-Options, HSTS 등)
 * 6. 외부 Origin API 직접 호출 차단
 *
 * Rate Limiting은 각 API 라우트 내부(api/naming, api/free-usage 등)에서 처리
 * (Edge Runtime에서 @upstash/redis 사용 불가 — Node.js 전용 패키지)
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_BASE_URL ?? "https://yoonseul-naming.vercel.app";

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
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("X-Powered-By", "");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developers.kakao.com https://t1.daumcdn.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.upstash.io",
    "frame-src https://postcode.map.daum.net",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-ancestors 'none'",
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

  // ── 7. 보안 헤더 적용 후 통과 ─────────────────────────────
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
