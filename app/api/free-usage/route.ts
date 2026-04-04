import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FREE_MONTHLY_QUOTA } from "@/lib/pricing";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

/** GET /api/free-usage?userId=xxx — 이번 달 무료 사용 여부 확인 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ ok: true, hasFreeTier: false, used: false });
  }

  try {
    const supabase = getAdminClient();
    const month = currentMonth();

    const { data, error } = await supabase
      .from("naming_free_usage")
      .select("id")
      .eq("user_id", userId)
      .eq("month", month)
      .limit(FREE_MONTHLY_QUOTA);

    if (error) {
      // 테이블 미존재 → 무료 가능으로 처리
      return NextResponse.json({ ok: true, hasFreeTier: true, used: false, month });
    }

    return NextResponse.json({
      ok: true,
      hasFreeTier: true,
      used: (data?.length ?? 0) >= FREE_MONTHLY_QUOTA,
      usedCount: data?.length ?? 0,
      quota: FREE_MONTHLY_QUOTA,
      month,
    });
  } catch {
    return NextResponse.json({ ok: true, hasFreeTier: false, used: false });
  }
}

/** POST /api/free-usage — 무료 생성 1회 기록 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    const briefId = typeof body?.briefId === "string" ? body.briefId : null;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const month = currentMonth();

    const { error } = await supabase.from("naming_free_usage").insert({
      user_id: userId,
      month,
      brief_id: briefId,
    });

    if (error) {
      // 테이블 미존재 → 무시하고 성공 반환
      return NextResponse.json({ ok: true, skipped: true });
    }

    return NextResponse.json({ ok: true, month });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
