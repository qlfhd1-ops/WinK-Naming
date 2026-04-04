import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function checkAuth(req: Request): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  const header = req.headers.get("x-admin-password") ?? "";
  return header === adminPw;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * GET /api/admin/stats
 * Header: x-admin-password: <password>
 */
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const now = new Date();

  // 오늘 / 7일 전 경계
  const todayStart  = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekAgoStart = new Date(todayStart); weekAgoStart.setDate(weekAgoStart.getDate() - 6);

  const [
    totalRes,
    weekRes,
    categoryRes,
    familyRes,
    paidRes,
    ordersRes,
  ] = await Promise.all([
    // 총 생성 수
    supabase.from("naming_briefs").select("*", { count: "exact", head: true }),
    // 최근 7일 row (날짜 집계용)
    supabase.from("naming_briefs")
      .select("created_at")
      .gte("created_at", weekAgoStart.toISOString()),
    // 카테고리 분포
    supabase.from("naming_briefs").select("category"),
    // 성씨 분포 (상위 10)
    supabase.from("naming_briefs").select("family_name").not("family_name", "is", null),
    // 유료 사용자 수
    supabase.from("user_plans")
      .select("*", { count: "exact", head: true })
      .neq("plan", "free")
      .or("plan_expires_at.is.null,plan_expires_at.gt." + now.toISOString()),
    // 최근 주문 10개
    supabase.from("naming_orders")
      .select("id, customer_name, customer_email, total_amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // 일별 집계
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgoStart);
    d.setDate(d.getDate() + i);
    dailyMap[isoDay(d)] = 0;
  }
  for (const row of (weekRes.data ?? [])) {
    const day = isoDay(new Date(row.created_at));
    if (day in dailyMap) dailyMap[day]++;
  }
  const weeklyGenerations = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // 카테고리 집계
  const catMap: Record<string, number> = {};
  for (const row of (categoryRes.data ?? [])) {
    const c = row.category ?? "unknown";
    catMap[c] = (catMap[c] ?? 0) + 1;
  }
  const popularCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([category, count]) => ({ category, count }));

  // 성씨 집계
  const nameMap: Record<string, number> = {};
  for (const row of (familyRes.data ?? [])) {
    const n = (row.family_name ?? "").trim();
    if (n) nameMap[n] = (nameMap[n] ?? 0) + 1;
  }
  const popularFamilyNames = Object.entries(nameMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const totalGenerations = totalRes.count ?? 0;
  const todayGenerations = dailyMap[isoDay(now)] ?? 0;
  const paidUsers        = paidRes.count ?? 0;
  const weekTotal        = weeklyGenerations.reduce((s, d) => s + d.count, 0);
  const weekAvg          = Math.round(weekTotal / 7);

  return NextResponse.json({
    ok: true,
    stats: {
      totalGenerations,
      todayGenerations,
      weekAvg,
      paidUsers,
      weeklyGenerations,
      popularCategories,
      popularFamilyNames,
      recentOrders: ordersRes.data ?? [],
    },
  });
}
