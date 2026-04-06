import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * GET /api/admin/check-role
 * Header: Authorization: Bearer <access_token>
 * Returns: { isAdmin: boolean, userId?: string }
 *
 * profiles 테이블의 role = 'admin' 인 경우만 isAdmin: true 반환.
 * profiles 레코드가 없으면 isAdmin: false.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  try {
    const adminClient = getAdminClient();

    // 토큰으로 사용자 확인
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // profiles 테이블에서 role 확인
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    return NextResponse.json({ isAdmin, userId: user.id });
  } catch (err) {
    console.error("[check-role]", err);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
