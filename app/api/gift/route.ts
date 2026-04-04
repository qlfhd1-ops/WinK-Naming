import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function generateToken(len = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * POST /api/gift
 * Body: { results: NameResult[], brief?: object, userId?: string, lang?: string }
 * Returns: { ok, token }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const results = body?.results;
    const brief   = body?.brief   ?? null;
    const userId  = typeof body?.userId === "string" ? body.userId : null;
    const lang    = typeof body?.lang   === "string" ? body.lang   : "ko";

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ ok: false, error: "results required" }, { status: 400 });
    }

    const token    = generateToken(12);
    const supabase = getAdminClient();
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90일

    const { error } = await supabase.from("gifts").insert({
      token,
      user_id:    userId,
      results:    results,
      brief:      brief,
      lang,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("[gift POST]", error.message);
      // 테이블 미존재 등 → 토큰 반환만 (링크는 작동 안 할 수 있음)
    }

    return NextResponse.json({ ok: true, token });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gift?token=xxx
 * Returns: { ok, gift: { results, brief, lang } }
 */
export async function GET(req: Request) {
  const url   = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || token.length < 6) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("gifts")
      .select("token, results, brief, lang, created_at, expires_at")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Gift not found" }, { status: 404 });
    }

    // 만료 체크
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: "Gift expired" }, { status: 410 });
    }

    return NextResponse.json({ ok: true, gift: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
