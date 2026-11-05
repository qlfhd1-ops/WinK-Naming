import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** app/api/admin/reviews/route.ts와 동일한 이중 인증 */
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
 * POST /api/admin/reviews/replies
 * body: { reviewId: string, content: string }
 * review_id가 UNIQUE이므로 기존 답변이 있으면 수정, 없으면 새로 생성(upsert).
 */
export async function POST(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const reviewId = typeof body?.reviewId === "string" ? body.reviewId : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!reviewId || !content) {
      return NextResponse.json({ ok: false, error: "reviewId와 content가 필요합니다." }, { status: 400 });
    }

    const supabase = getAdminClient();

    let adminId: string | undefined;
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      adminId = data?.user?.id;
    }

    const { data, error } = await supabase
      .from("review_replies")
      .upsert(
        { review_id: reviewId, content, admin_id: adminId ?? null, updated_at: new Date().toISOString() },
        { onConflict: "review_id" }
      )
      .select("id, review_id, content, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reply: data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/replies?reviewId=<reviewId>
 */
export async function DELETE(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const reviewId = url.searchParams.get("reviewId") ?? "";
  if (!reviewId) {
    return NextResponse.json({ ok: false, error: "reviewId가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("review_replies").delete().eq("review_id", reviewId);

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
