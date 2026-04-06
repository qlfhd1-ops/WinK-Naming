import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createCookieClient } from "@/utils/supabase/server";

/**
 * GET /api/auth/naver/callback
 * 네이버가 code + state 를 쿼리파라미터로 전달 → 토큰 교환 → 사용자 생성/로그인 → "/" 리다이렉트
 */
const BASE_URL     = "https://yoonseul-naming.vercel.app";
const CALLBACK_URL = `${BASE_URL}/api/auth/naver/callback`;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, BASE_URL));

  // ── 1. code 존재 확인 ─────────────────────────────────────────
  if (!code) {
    console.error("[naver/callback] missing code", { hasState: !!state });
    return redirect("/login?error=missing_code");
  }

  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const callbackUrl  = CALLBACK_URL;

  if (!clientId || !clientSecret) {
    console.error("[naver/callback] NAVER_CLIENT_ID or NAVER_CLIENT_SECRET missing");
    return redirect("/login?error=server_config");
  }

  // ── 2. 액세스 토큰 요청 ───────────────────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  callbackUrl,
        code,
        state:         state ?? "",
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      console.error("[naver/callback] token exchange failed", tokenData);
      return redirect("/login?error=token_failed");
    }
    accessToken = tokenData.access_token;
  } catch (err) {
    console.error("[naver/callback] token fetch threw", err);
    return redirect("/login?error=token_failed");
  }

  // ── 3. 사용자 정보 요청 ───────────────────────────────────────
  let email: string;
  let naverId: string;
  let nickname: string | undefined;
  let profileImage: string | undefined;
  try {
    const userRes  = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json() as {
      resultcode: string;
      response?: { id: string; email?: string; nickname?: string; profile_image?: string };
    };
    if (userData.resultcode !== "00" || !userData.response) {
      console.error("[naver/callback] user info failed", userData);
      return redirect("/login?error=user_info_failed");
    }
    const r = userData.response;
    if (!r.email) {
      console.error("[naver/callback] naver did not return email — check scope settings");
      return redirect("/login?error=no_email");
    }
    email        = r.email;
    naverId      = r.id;
    nickname     = r.nickname;
    profileImage = r.profile_image;
  } catch (err) {
    console.error("[naver/callback] user info fetch threw", err);
    return redirect("/login?error=user_info_failed");
  }

  // ── 4. Supabase 계정 생성 (없을 때만) ────────────────────────
  // 비밀번호: 네이버 고유 ID + secret (사용자가 직접 사용하지 않는 서버 전용 값)
  const password   = `naver:${naverId}:${clientSecret}`;
  const adminClient = createAdminClient();

  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name:   nickname ?? email.split("@")[0],
      avatar_url:  profileImage,
      provider:    "naver",
    },
  });

  if (createError && !createError.message.toLowerCase().includes("already")) {
    console.error("[naver/callback] createUser failed", createError.message);
    return redirect("/login?error=user_create_failed");
  }

  // ── 5. 세션 발급 → 응답 쿠키에 저장 ─────────────────────────
  const response = NextResponse.redirect(new URL("/", BASE_URL));
  const supabase = createCookieClient(response);

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error("[naver/callback] signInWithPassword failed", signInError.message);
    return redirect("/login?error=signin_failed");
  }

  console.log("[naver/callback] success", { email });
  return response;
}
