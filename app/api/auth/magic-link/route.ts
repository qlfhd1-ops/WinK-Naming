import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/magic-link
 * signInWithOtp으로 매직링크 요청 — service_role 키 불필요
 * 이메일 링크는 /auth/confirm(서버, token_hash 검증)으로 도착함
 *
 * 로그인 세션 쿠키는 하나의 도메인에만 저장되므로(다른 최상위 도메인끼리는
 * 쿠키 공유 불가), 이름 생성/로그인 등 계정이 필요한 흐름은 항상
 * CANONICAL_BASE_URL(wink-naming.com) 하나로 통일한다. 다른 도메인
 * (wink-naming.co.kr, wink-naming.shop 등)에서 로그인을 시작해도
 * 매직링크의 목적지는 항상 wink-naming.com으로 강제한다.
 */

// anon 키는 공개 키 (비밀 아님) — 환경변수로 관리.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const CANONICAL_BASE_URL = "https://wink-naming.com";

/** 절대 URL이든 상대 경로든, 도메인을 버리고 path+search+hash만 남긴다. */
function toCanonicalPath(input: string): string {
  try {
    const u = new URL(input, CANONICAL_BASE_URL);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return input.startsWith("/") ? input : `/${input}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo, lang = "ko" } = await req.json() as {
      email?: string;
      redirectTo?: string;
      lang?: string;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[magic-link] Supabase env vars missing");
      return NextResponse.json({ ok: false, error: "server misconfigured" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const rawDestination = redirectTo ?? `/?lang=${lang}`;
    const emailRedirectTo = `${CANONICAL_BASE_URL}${toCanonicalPath(rawDestination)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("[magic-link] signInWithOtp error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log("[magic-link] otp sent to", email.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link] error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
