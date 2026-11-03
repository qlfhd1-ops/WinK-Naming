import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** 이중 인증: 기존 x-admin-password OR Supabase Bearer 토큰 + admin role */
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
 * GET /api/admin/leads?status=all|completed|started&page=1&pageSize=20
 * 관리자 전용 — 리드(이름 생성 신청자) 상세 목록. 대시보드 "자세히 보기"에서 사용.
 * Auth: x-admin-password header (legacy) OR Authorization: Bearer <token>
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
  const statusFilter = url.searchParams.get("status") ?? "all"; // all | completed | started
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("naming_briefs")
    .select("id, created_at, guest_email, category, lang, status, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter === "completed" || statusFilter === "started") {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    leads: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
