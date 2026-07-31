import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * GET /auth/confirm
 * signInWithOtp 매직링크 클릭 시 Supabase가 리다이렉트하는 엔드포인트
 * token_hash를 세션으로 교환 후 redirect_to로 이동
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "magiclink";
  const redirectTo = searchParams.get("redirect_to") ?? `${origin}/ko/category`;

  if (token_hash) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      "https://cyntpbjhpklgzkiwbmph.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnRwYmpocGtsZ3praXdibXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzAzOTYsImV4cCI6MjA4NzUwNjM5Nn0.-821zOmHC7v3y8NzC1FJ1yc92Q5l1E77K3jDzp6P9fE",
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });

    if (!error) {
      const dest = redirectTo.startsWith("http")
        ? redirectTo
        : `${origin}${redirectTo}`;
      return NextResponse.redirect(dest);
    }
    console.error("[auth/confirm] verifyOtp error:", error.message);
  }

  return NextResponse.redirect(`${origin}/ko/login?error=confirm_failed`);
}
