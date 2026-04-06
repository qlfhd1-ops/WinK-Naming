import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (formerly middleware.ts) — 보안 헤더 + 기초 가드
 *
 * Next.js 16에서 middleware.ts → proxy.ts 로 마이그레이션.
 * 레이트 리미팅은 Node.js API 라우트 내부(lib/rate-limiter.ts)에서 처리.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { method } = req;

  // ── /admin 라우트: Supabase 세션 쿠키 없으면 홈으로 redirect ──
  if (pathname.startsWith("/admin")) {
    const hasSession = req.cookies.getAll().some(
      (c) => c.name.includes("auth-token") && c.value.length > 10
    );
    if (!hasSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── 빈 User-Agent 차단 (봇/스크래퍼)
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua && pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ ok: false, error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── POST 전용 mutation 엔드포인트에 GET 차단
  const postOnlyPaths = [
    "/api/naming",
    "/api/direct-order",
    "/api/ars",
    "/api/gift-card",
  ];
  if (
    postOnlyPaths.some((p) => pathname.startsWith(p)) &&
    method !== "POST"
  ) {
    return new NextResponse(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── POST body의 Content-Type 검사
  if (method === "POST" && pathname.startsWith("/api/")) {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "Content-Type must be application/json" }),
        { status: 415, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const res = NextResponse.next();

  // ── 보안 응답 헤더
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developers.kakao.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
