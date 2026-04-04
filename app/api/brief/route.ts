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
};

type ResultRow = {
  rank_order: number;
  name: string;
  english: string;
  chinese: string;
  chinese_pinyin: string;
  japanese_kana: string;
  japanese_reading: string;
  meaning: string;
  story: string;
  fit_reason: string;
  teasing_risk: string;
  similarity_risk: string;
  pronunciation_risk: string;
  brand_risk: string | null;
  caution: string;
  score: number;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("[env debug]", {
      hasUrl: Boolean(url),
      hasSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    throw new Error("Supabase admin env is missing.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brief = body?.brief as BriefPayload | undefined;
    const results = body?.results as ResultRow[] | undefined;
    const userId = typeof body?.userId === "string" ? body.userId : null;

    if (!brief || !brief.purpose || !brief.styleKeywords) {
      return NextResponse.json(
        { ok: false, error: "Invalid brief payload." },
        { status: 400 }
      );
    }

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Results are required." },
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
    };

    const { data: briefRow, error: briefError } = await (supabase as any)
      .from("naming_briefs")
      .insert([briefInsertRow])
      .select("id")
      .single();

    if (briefError || !briefRow?.id) {
      console.error("[brief insert error]", briefError);
      return NextResponse.json(
        {
          ok: false,
          error: briefError?.message || "Failed to save brief.",
          step: "naming_briefs",
          detail: briefError,
        },
        { status: 500 }
      );
    }

    const resultRows = results.map((item) => ({
      brief_id: briefRow.id,
      user_id: userId,
      rank_order: Number(item.rank_order) || 1,
      name: item.name,
      english: item.english || null,
      chinese: item.chinese || null,
      chinese_pinyin: item.chinese_pinyin || null,
      japanese_kana: item.japanese_kana || null,
      japanese_reading: item.japanese_reading || null,
      meaning: item.meaning || null,
      story: item.story || null,
      fit_reason: item.fit_reason || null,
      teasing_risk: item.teasing_risk || null,
      similarity_risk: item.similarity_risk || null,
      pronunciation_risk: item.pronunciation_risk || null,
      brand_risk: item.brand_risk || null,
      caution: item.caution || null,
      score: Math.round(Number(item.score) || 0),
    }));

    const { error: resultsError } = await (supabase as any)
      .from("naming_results")
      .insert(resultRows);

    if (resultsError) {
      console.error("[results insert error]", resultsError);
      console.error("[results payload]", resultRows);
      return NextResponse.json(
        {
          ok: false,
          error: resultsError.message,
          step: "naming_results",
          detail: resultsError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      briefId: briefRow.id,
    });
  } catch (error) {
    console.error("[brief route fatal error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        step: "catch",
      },
      { status: 500 }
    );
  }
}