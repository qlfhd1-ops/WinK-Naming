import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BriefPayload = {
  category: string;
  targetName: string;
  familyName: string;
  purpose: string;
  styleKeywords: string;
  avoidKeywords: string;
  targetCountry: string;
  preferredScript: string;
  memo: string;
  needsGlobalPronunciation: boolean;
  needsStampPackage: boolean;
  needsDoorplatePackage: boolean;
  needsGiftCardPackage: boolean;
  lang: "ko" | "en" | "ja" | "zh" | "es";
  guestEmail?: string;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin env is missing.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * POST /api/brief/start
 * 폼 제출 즉시(이름 생성 전) 리드를 status='started'로 저장한다.
 * 이후 생성이 완료되면 /api/brief 가 이 row를 status='completed'로 업데이트한다.
 * 이름이 끝까지 생성되지 않고 이탈하면 이 row가 'started'로 남아 이탈 추적에 쓰인다.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brief = body?.brief as BriefPayload | undefined;
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const sessionToken = typeof body?.sessionToken === "string" ? body.sessionToken : null;

    if (!brief || !brief.purpose || !brief.styleKeywords) {
      return NextResponse.json(
        { ok: false, error: "Invalid brief payload." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const briefInsertRow = {
      user_id: userId,
      lang: brief.lang,
      category: brief.category,
      target_name: brief.targetName || null,
      family_name: brief.familyName || null,
      purpose: brief.purpose,
      style_keywords: brief.styleKeywords,
      avoid_keywords: brief.avoidKeywords || null,
      target_country: brief.targetCountry || null,
      preferred_script: brief.preferredScript || null,
      memo: brief.memo || null,
      needs_global_pronunciation: brief.needsGlobalPronunciation,
      needs_stamp_package: brief.needsStampPackage,
      needs_doorplate_package: brief.needsDoorplatePackage,
      needs_giftcard_package: brief.needsGiftCardPackage,
      guest_email: brief.guestEmail || null,
      status: "started",
      session_token: sessionToken,
    };

    const { data: briefRow, error: briefError } = await (supabase as any)
      .from("naming_briefs")
      .insert([briefInsertRow])
      .select("id")
      .single();

    if (briefError || !briefRow?.id) {
      console.error("[brief start insert error]", briefError);
      return NextResponse.json(
        {
          ok: false,
          error: briefError?.message || "Failed to save lead.",
          detail: briefError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, briefId: briefRow.id });
  } catch (error) {
    console.error("[brief start route fatal error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
