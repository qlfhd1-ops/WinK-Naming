import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/ars?userId=&briefId=
 * A/S 재설계 가능 여부 확인
 * 조건: 해당 brief에 유료 패키지 주문 존재 + A/S 미사용
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const briefId = url.searchParams.get("briefId");

  if (!userId || !briefId) {
    return NextResponse.json({ ok: true, eligible: false, reason: "missing params" });
  }

  try {
    const supabase = getAdminClient();

    // 유료 주문 존재 여부
    const { data: orders, error: ordErr } = await supabase
      .from("naming_order_items")
      .select("id")
      .eq("brief_id", briefId)
      .limit(1);

    if (ordErr) {
      return NextResponse.json({ ok: true, eligible: false, reason: "db error" });
    }

    const hasPaid = (orders?.length ?? 0) > 0;
    if (!hasPaid) {
      return NextResponse.json({ ok: true, eligible: false, hasPaid: false });
    }

    // A/S 이미 사용했는지 확인
    const { data: arsRows, error: arsErr } = await supabase
      .from("naming_ars")
      .select("id")
      .eq("user_id", userId)
      .eq("original_brief_id", briefId)
      .limit(1);

    if (arsErr) {
      // 테이블 미존재 → A/S 가능으로 처리
      return NextResponse.json({ ok: true, eligible: true, hasPaid: true, arsUsed: false });
    }

    const arsUsed = (arsRows?.length ?? 0) > 0;
    return NextResponse.json({
      ok: true,
      eligible: hasPaid && !arsUsed,
      hasPaid,
      arsUsed,
    });
  } catch {
    return NextResponse.json({ ok: true, eligible: false });
  }
}

/**
 * POST /api/ars — A/S 사용 기록
 * body: { userId, originalBriefId, arsBriefId? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    const originalBriefId =
      typeof body?.originalBriefId === "string" ? body.originalBriefId.trim() : "";
    const arsBriefId =
      typeof body?.arsBriefId === "string" ? body.arsBriefId : null;

    if (!userId || !originalBriefId) {
      return NextResponse.json(
        { ok: false, error: "userId and originalBriefId required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { error } = await supabase.from("naming_ars").insert({
      user_id: userId,
      original_brief_id: originalBriefId,
      ars_brief_id: arsBriefId,
    });

    if (error) {
      // 테이블 미존재 → 무시하고 성공 반환
      return NextResponse.json({ ok: true, skipped: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
