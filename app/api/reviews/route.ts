import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/reviews
 * 로그인한 사용자가 자신이 생성한 이름(brief)에 대한 후기를 제출한다.
 * accessToken은 클라이언트의 Supabase 세션에서 가져온 값이며,
 * 이 토큰을 Supabase Auth 서버에 검증해 신뢰할 수 있는 user.id를 얻는다
 * (요청 본문의 userId를 그대로 믿지 않는다).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** naming_briefs.category 값 → 홈페이지 리뷰 섹션의 CatId로 매핑 */
const CATEGORY_TO_CAT_ID: Record<string, string> = {
  foreign_to_korean: "korean-name",
  child: "child",
  baby: "child",
  self: "self",
  me: "self",
  stage: "stage",
  activity: "stage",
  pet: "pet",
  korean_to_foreign: "foreign",
};
function mapCategoryToCatId(category: string | null | undefined): string | null {
  if (!category) return null;
  return CATEGORY_TO_CAT_ID[category] ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";
    const briefId = typeof body?.briefId === "string" ? body.briefId.trim() : "";
    const nameUsed = typeof body?.nameUsed === "string" ? body.nameUsed.trim() : "";
    const rating = Number(body?.rating);
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
    const country = typeof body?.country === "string" ? body.country.trim() : "";
    const lang = typeof body?.lang === "string" ? body.lang.trim() : "ko";

    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (!briefId) {
      return NextResponse.json({ ok: false, error: "briefId가 필요합니다." }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: "별점은 1~5 사이여야 합니다." }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ ok: false, error: "후기 내용을 입력해 주세요." }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[reviews] Supabase env vars missing");
      return NextResponse.json({ ok: false, error: "server misconfigured" }, { status: 500 });
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);

    if (userError || !userData?.user?.id) {
      return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });
    }

    const userId = userData.user.id;
    const admin = getAdminClient();

    // 본인 brief에 대해서만 후기를 쓸 수 있도록 검증
    const { data: brief, error: briefError } = await admin
      .from("naming_briefs")
      .select("id, user_id, category")
      .eq("id", briefId)
      .single();

    if (briefError || !brief || brief.user_id !== userId) {
      return NextResponse.json({ ok: false, error: "본인의 이름 생성 기록만 후기를 남길 수 있습니다." }, { status: 403 });
    }

    const category = mapCategoryToCatId(brief.category);

    const { data: review, error: insertError } = await admin
      .from("naming_reviews")
      .insert({
        user_id: userId,
        brief_id: briefId,
        name_used: nameUsed || null,
        rating,
        content,
        display_name: displayName || null,
        country: country || null,
        lang,
        category,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ ok: false, error: "이미 이 이름에 대한 후기를 작성하셨습니다." }, { status: 409 });
      }
      console.error("[reviews] insert error:", insertError);
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reviewId: review?.id });
  } catch (error) {
    console.error("[reviews] fatal error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
