import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

/**
 * Supabase 무료 플랜 자동 정지(장기 미사용 시 INACTIVE) 방지용 Keep-alive.
 * Vercel Cron이 주기적으로 호출해 DB에 가벼운 쿼리를 보내 "사용 중" 상태를 유지한다.
 */
export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("naming_briefs").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
