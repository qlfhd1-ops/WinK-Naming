import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// POST /api/shortlist-share  — shortlist 저장 후 token 반환
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body?.items;
    const lang = typeof body?.lang === "string" ? body.lang : "ko";

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "items required" }, { status: 400 });
    }
    if (items.length > 20) {
      return NextResponse.json({ ok: false, error: "max 20 items" }, { status: 400 });
    }

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("shortlist_shares")
      .insert({ items, lang })
      .select("token")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, token: data.token });
  } catch (err) {
    console.error("[shortlist-share POST]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

// GET /api/shortlist-share?token=xxx  — token으로 데이터 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });
    }

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("shortlist_shares")
      .select("items, lang, created_at, expires_at")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "not found or expired" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("[shortlist-share GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
