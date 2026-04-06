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
  // Method 1: legacy password header
  const adminPw = process.env.ADMIN_PASSWORD;
  if (adminPw) {
    const pw = req.headers.get("x-admin-password") ?? "";
    if (pw === adminPw) return true;
  }

  // Method 2: Supabase Bearer token → profiles.role = 'admin'
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

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isoMonth(date: Date): string {
  return date.toISOString().slice(0, 7); // "2025-04"
}

/**
 * GET /api/admin/stats
 * Auth: x-admin-password header (legacy) OR Authorization: Bearer <token>
 */
export async function GET(req: Request) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const now = new Date();

  // 날짜 경계
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekAgoStart = new Date(todayStart); weekAgoStart.setDate(weekAgoStart.getDate() - 6);
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1); twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalBriefsRes,
    weekBriefsRes,
    categoryRes,
    familyRes,
    paidUsersRes,
    totalUsersRes,
    totalOrdersRes,
    revenueRes,
    monthlyRevenueRes,
    recentOrdersRes,
  ] = await Promise.all([
    // 총 이름 생성 수
    supabase.from("naming_briefs").select("*", { count: "exact", head: true }),
    // 최근 7일
    supabase.from("naming_briefs")
      .select("created_at")
      .gte("created_at", weekAgoStart.toISOString()),
    // 카테고리 분포
    supabase.from("naming_briefs").select("category"),
    // 성씨 분포
    supabase.from("naming_briefs").select("family_name").not("family_name", "is", null),
    // 유료 사용자 수
    supabase.from("user_plans")
      .select("*", { count: "exact", head: true })
      .neq("plan", "free")
      .or("plan_expires_at.is.null,plan_expires_at.gt." + now.toISOString()),
    // 총 가입 유저 수 (user_plans 기준 — 첫 이름 생성 시 레코드 생성)
    supabase.from("user_plans").select("*", { count: "exact", head: true }),
    // 총 주문 수
    supabase.from("naming_orders").select("*", { count: "exact", head: true }),
    // 전체 매출 (취소 제외)
    supabase.from("naming_orders")
      .select("total_amount")
      .neq("status", "cancelled"),
    // 월별 매출 — 최근 12개월
    supabase.from("naming_orders")
      .select("total_amount, created_at")
      .neq("status", "cancelled")
      .gte("created_at", twelveMonthsAgo.toISOString()),
    // 최근 주문 20개
    supabase.from("naming_orders")
      .select("id, customer_name, customer_email, total_amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // ── 7일 일별 집계 ──
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgoStart);
    d.setDate(d.getDate() + i);
    dailyMap[isoDay(d)] = 0;
  }
  for (const row of (weekBriefsRes.data ?? [])) {
    const day = isoDay(new Date(row.created_at));
    if (day in dailyMap) dailyMap[day]++;
  }
  const weeklyGenerations = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // ── 카테고리 집계 ──
  const catMap: Record<string, number> = {};
  for (const row of (categoryRes.data ?? [])) {
    const c = row.category ?? "unknown";
    catMap[c] = (catMap[c] ?? 0) + 1;
  }
  const popularCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([category, count]) => ({ category, count }));

  // ── 성씨 집계 ──
  const nameMap: Record<string, number> = {};
  for (const row of (familyRes.data ?? [])) {
    const n = (row.family_name ?? "").trim();
    if (n) nameMap[n] = (nameMap[n] ?? 0) + 1;
  }
  const popularFamilyNames = Object.entries(nameMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // ── 총 매출 ──
  const totalRevenue = (revenueRes.data ?? [])
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  // ── 월별 매출 집계 ──
  const monthMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    monthMap[isoMonth(d)] = 0;
  }
  for (const row of (monthlyRevenueRes.data ?? [])) {
    const key = (row.created_at as string).slice(0, 7);
    if (key in monthMap) monthMap[key] = (monthMap[key] ?? 0) + (row.total_amount ?? 0);
  }
  const monthlyRevenue = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

  // ── 집계 값 ──
  const totalGenerations = totalBriefsRes.count ?? 0;
  const todayGenerations = dailyMap[isoDay(now)] ?? 0;
  const paidUsers        = paidUsersRes.count ?? 0;
  const totalUsers       = totalUsersRes.count ?? 0;
  const totalOrders      = totalOrdersRes.count ?? 0;
  const weekTotal        = weeklyGenerations.reduce((s, d) => s + d.count, 0);
  const weekAvg          = Math.round(weekTotal / 7);
  const conversionRate   = totalGenerations > 0
    ? Math.round((totalOrders / totalGenerations) * 1000) / 10  // X.X%
    : 0;

  return NextResponse.json({
    ok: true,
    stats: {
      totalGenerations,
      todayGenerations,
      weekAvg,
      paidUsers,
      totalUsers,
      totalOrders,
      totalRevenue,
      conversionRate,
      weeklyGenerations,
      popularCategories,
      popularFamilyNames,
      recentOrders: recentOrdersRes.data ?? [],
      monthlyRevenue,
    },
  });
}
