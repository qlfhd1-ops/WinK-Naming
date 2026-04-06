import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/naver
 * 네이버 OAuth 인증 시작 — 네이버 로그인 페이지로 리다이렉트
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://yoonseul-naming.vercel.app";

  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "NAVER_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const callbackUrl = `${baseUrl}/api/auth/naver/callback`;

  const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  naverAuthUrl.searchParams.set("response_type", "code");
  naverAuthUrl.searchParams.set("client_id", clientId);
  naverAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  naverAuthUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(naverAuthUrl.toString());

  // CSRF 방어용 state를 httpOnly 쿠키에 저장 (10분)
  res.cookies.set("naver_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
    sameSite: "lax",
  });

  return res;
}
