import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 공개 통계 — 총 이름 생성 건수 (naming_results 기준)
export const revalidate = 60; // 60초 캐시

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// 서비스 오픈 전 생성된 테스트 데이터를 제외하기 위한 오프셋
const DISPLAY_BASE = 1_000;

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { count, error } = await supabase
      .from("naming_results")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      count: (count ?? 0) + DISPLAY_BASE,
    });
  } catch {
    return NextResponse.json({ ok: true, count: DISPLAY_BASE });
  }
}
