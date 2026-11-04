import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/merge-session
 * 매직링크 로그인 완료 직후(app/auth/confirm) 호출된다.
 * 로그인 전 게스트 상태에서 session_token과 함께 저장된
 * naming_briefs / naming_results / naming_orders 행(user_id=NULL)을
 * 지금 로그인한 사용자의 user_id로 연결(merge)한다.
 *
 * accessToken은 클라이언트의 verifyOtp() 성공 직후 세션에서 가져온 값이며,
 * 이 토큰을 Supabase Auth 서버에 검증해 신뢰할 수 있는 user.id를 얻는다
 * (요청 본문의 userId를 그대로 믿지 않는다).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin env is missing.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionToken = typeof body?.sessionToken === "string" ? body.sessionToken.trim() : "";
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";

    if (!sessionToken || !accessToken) {
      return NextResponse.json({ ok: false, error: "sessionToken and accessToken are required" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[merge-session] Supabase env vars missing");
      return NextResponse.json({ ok: false, error: "server misconfigured" }, { status: 500 });
    }

    // accessToken을 Supabase Auth 서버에 검증해 신뢰 가능한 user.id를 얻는다.
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);

    if (userError || !userData?.user?.id) {
      console.error("[merge-session] invalid accessToken:", userError?.message);
      return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });
    }

    const userId = userData.user.id;
    const admin = getAdminClient();

    const [briefsResult, resultsResult, ordersResult] = await Promise.all([
      admin
        .from("naming_briefs")
        .update({ user_id: userId })
        .eq("session_token", sessionToken)
        .is("user_id", null)
        .select("id"),
      admin
        .from("naming_results")
        .update({ user_id: userId })
        .eq("session_token", sessionToken)
        .is("user_id", null)
        .select("id"),
      admin
        .from("naming_orders")
        .update({ user_id: userId })
        .eq("session_token", sessionToken)
        .is("user_id", null)
        .select("id"),
    ]);

    if (briefsResult.error) console.error("[merge-session] naming_briefs update error:", briefsResult.error);
    if (resultsResult.error) console.error("[merge-session] naming_results update error:", resultsResult.error);
    if (ordersResult.error) console.error("[merge-session] naming_orders update error:", ordersResult.error);

    return NextResponse.json({
      ok: true,
      merged: {
        briefs: briefsResult.data?.length ?? 0,
        results: resultsResult.data?.length ?? 0,
        orders: ordersResult.data?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("[merge-session] fatal error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
