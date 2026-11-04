import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** leads/stats route와 동일한 이중 인증: x-admin-password OR Supabase Bearer 토큰 + admin role */
async function checkAuth(req: Request): Promise<boolean> {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (adminPw) {
    const pw = req.headers.get("x-admin-password") ?? "";
    if (pw === adminPw) return true;
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return false;

  try {
    const client = getAdminClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return false;

    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/reviews?status=all|pending|approved|featured&page=1&pageSize=20
 * 관리자 전용 — 전체 후기 목록(승인 대기 포함).
 */
export async function GET(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let supabase: ReturnType<typeof getAdminClient>;
  try {
    supabase = getAdminClient();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Supabase 환경변수 미설정" },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") ?? "all"; // all | pending | approved | featured
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("naming_reviews")
    .select(
      "id, user_id, brief_id, name_used, rating, content, display_name, country, lang, is_approved, is_featured, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter === "pending") query = query.eq("is_approved", false);
  else if (statusFilter === "approved") query = query.eq("is_approved", true);
  else if (statusFilter === "featured") query = query.eq("is_featured", true);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reviews: data ?? [], total: count ?? 0, page, pageSize });
}

/**
 * PATCH /api/admin/reviews
 * body: { reviewId: string, is_approved?: boolean, is_featured?: boolean }
 */
export async function PATCH(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const reviewId = typeof body?.reviewId === "string" ? body.reviewId : "";
    if (!reviewId) {
      return NextResponse.json({ ok: false, error: "reviewId가 필요합니다." }, { status: 400 });
    }

    const patch: Record<string, boolean> = {};
    if (typeof body?.is_approved === "boolean") patch.is_approved = body.is_approved;
    if (typeof body?.is_featured === "boolean") patch.is_featured = body.is_featured;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "변경할 값이 없습니다." }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from("naming_reviews").update(patch).eq("id", reviewId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews?id=<reviewId>
 */
export async function DELETE(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const reviewId = url.searchParams.get("id") ?? "";
  if (!reviewId) {
    return NextResponse.json({ ok: false, error: "id가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("naming_reviews").delete().eq("id", reviewId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
