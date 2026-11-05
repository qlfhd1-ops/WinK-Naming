import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/reviews/featured
 * 공개 노출용 후기.
 *
 * - 파라미터 없음: is_approved=true AND is_featured=true 중 최대 6개 (SocialProof 섹션용, 기존 동작 유지)
 * - ?category=xxx: 해당 카테고리(CatId)만 최대 20개 (featured만)
 * - ?grouped=1: 카테고리별로 묶어서 { reviewsByCategory } 반환 (featured만)
 * - ?best=1: is_featured=true인 후기 최대 2개 + 운영자 답변 포함 (베스트 영역용)
 * - ?all=1&page=1&pageSize=6: is_approved=true 전체(featured 여부 무관) 페이지네이션 + 답변 포함 (일반 영역용)
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const REVIEW_SELECT = "id, name_used, rating, content, display_name, country, lang, category, created_at";

async function attachReplies(
  supabase: ReturnType<typeof getAdminClient>,
  rows: { id: string }[]
) {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return {};
  const { data } = await supabase
    .from("review_replies")
    .select("review_id, content, created_at")
    .in("review_id", ids);
  return Object.fromEntries((data ?? []).map((r) => [r.review_id, { content: r.content, created_at: r.created_at }]));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const grouped = url.searchParams.get("grouped") === "1";
    const best = url.searchParams.get("best") === "1";
    const all = url.searchParams.get("all") === "1";
    const supabase = getAdminClient();

    if (best) {
      const { data, error } = await supabase
        .from("naming_reviews")
        .select(REVIEW_SELECT)
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(2);

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

      const replies = await attachReplies(supabase, data ?? []);
      const reviews = (data ?? []).map((r) => ({ ...r, reply: replies[r.id] ?? null }));
      return NextResponse.json({ ok: true, reviews });
    }

    if (all) {
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 6));
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("naming_reviews")
        .select(REVIEW_SELECT, { count: "exact" })
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

      const replies = await attachReplies(supabase, data ?? []);
      const reviews = (data ?? []).map((r) => ({ ...r, reply: replies[r.id] ?? null }));
      return NextResponse.json({ ok: true, reviews, total: count ?? 0, page, pageSize });
    }

    if (grouped) {
      const { data, error } = await supabase
        .from("naming_reviews")
        .select(REVIEW_SELECT)
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
      .select(REVIEW_SELECT)
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
