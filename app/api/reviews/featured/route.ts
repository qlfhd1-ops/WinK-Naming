import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/reviews/featured
 * 공개 노출용 후기. is_approved=true AND is_featured=true 인 후기만.
 *
 * - 파라미터 없음: 최대 6개 (SocialProof 섹션용, 기존 동작 유지)
 * - ?category=xxx: 해당 카테고리(CatId)만 최대 20개
 * - ?grouped=1: 카테고리별로 묶어서 { reviewsByCategory } 반환 (홈페이지 리뷰 탭용)
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const grouped = url.searchParams.get("grouped") === "1";
    const supabase = getAdminClient();

    if (grouped) {
      const { data, error } = await supabase
        .from("naming_reviews")
        .select("id, name_used, rating, content, display_name, country, lang, category, created_at")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      const reviewsByCategory: Record<string, typeof data> = {};
      for (const row of data ?? []) {
        const key = row.category ?? "uncategorized";
        if (!reviewsByCategory[key]) reviewsByCategory[key] = [];
        reviewsByCategory[key].push(row);
      }

      return NextResponse.json({ ok: true, reviewsByCategory });
    }

    let query = supabase
      .from("naming_reviews")
      .select("id, name_used, rating, content, display_name, country, lang, category, created_at")
      .eq("is_approved", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(category ? 20 : 6);

    if (category) query = query.eq("category", category);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reviews: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
