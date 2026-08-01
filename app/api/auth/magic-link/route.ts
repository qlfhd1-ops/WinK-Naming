import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/magic-link
 * signInWithOtp으로 매직링크 요청 — service_role 키 불필요
 * 이메일 링크는 /auth/confirm(서버, token_hash 검증)으로 도착함
 */

// Vercel Production 환경변수 불일치로 "Invalid API key" 발생 — 확인될 때까지 직접 고정.
const SUPABASE_URL = "https://cyntpbjhpklgzkiwbmph.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnRwYmpocGtsZ3praXdibXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzAzOTYsImV4cCI6MjA4NzUwNjM5Nn0.-821zOmHC7v3y8NzC1FJ1yc92Q5l1E77K3jDzp6P9fE";

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const baseUrl = "https://wink-naming.com";
    const destination = redirectTo ?? `${baseUrl}/?lang=${lang}`;
    const emailRedirectTo = destination.startsWith("http")
      ? destination
      : `${baseUrl}${destination}`;

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
