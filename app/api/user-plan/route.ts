import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { PlanId } from "@/lib/pricing";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** GET /api/user-plan?userId=xxx */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ plan: "free" as PlanId });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("user_plans")
      .select("plan, plan_expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ plan: "free" as PlanId });
    }

    // 만료 여부 확인
    const expired =
      data.plan_expires_at && new Date(data.plan_expires_at) < new Date();

    const plan: PlanId = expired ? "free" : (data.plan as PlanId) ?? "free";
    return NextResponse.json({ plan, expiresAt: data.plan_expires_at });
  } catch {
    return NextResponse.json({ plan: "free" as PlanId });
  }
}
