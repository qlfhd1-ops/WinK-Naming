import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/magic-link
 * signInWithOtp으로 매직링크 요청 — service_role 키 불필요
 * Supabase가 직접 이메일 발송 (무료 플랜: 시간당 3건)
 */
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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: false, error: "auth service not configured" }, { status: 503 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const baseUrl = "https://wink-naming.com";
    const destination = redirectTo ?? `${baseUrl}/${lang}/category`;
    const emailRedirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(
      destination.replace(baseUrl, "") || `/${lang}/category`
    )}`;

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
