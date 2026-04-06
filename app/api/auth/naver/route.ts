import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/naver
 * 네이버 OAuth 인증 시작 — 네이버 로그인 페이지로 리다이렉트
 */
const CALLBACK_URL = "https://yoonseul-naming.vercel.app/api/auth/naver/callback";

export async function GET(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "NAVER_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  naverAuthUrl.searchParams.set("response_type", "code");
  naverAuthUrl.searchParams.set("client_id", clientId);
  naverAuthUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  naverAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(naverAuthUrl.toString());
}
