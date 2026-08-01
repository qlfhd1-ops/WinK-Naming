import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function stripTags(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function POST(req: Request) {
  try {
    // ── 1. Auth check ────────────────────────────────────
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ ok: false, error: "authentication required" }, { status: 401 });
    }

    const adminClient = getAdminClient();
    if (adminClient) {
      const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
      if (authErr || !user) {
        return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
      }

      // ── 2. Plan check (paid only) ──────────────────────
      const { data: profile } = await adminClient
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (!profile || profile.plan === "free") {
        return NextResponse.json(
          { ok: false, error: "paid plan required" },
          { status: 403 }
        );
      }
    }

    // ── 3. Email service check ───────────────────────────
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[send-card] RESEND_API_KEY not configured");
      return NextResponse.json(
        { ok: false, error: "email service not configured — set RESEND_API_KEY in environment variables" },
        { status: 503 }
      );
    }

    // ── 4. Parse body ────────────────────────────────────
    const body = await req.json();
    const email = stripTags(body?.email);
    const item = body?.item ?? {};
    const lang = stripTags(body?.lang) || "ko";
    const brief = body?.brief ?? {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    const name: string = stripTags(item.name) || "-";
    const hanja: string = stripTags(item.hanja) || "";
    const hanjaMeaning: string = stripTags(item.hanja_meaning) || "";
    const meaning: string = stripTags(item.meaning) || "";
    const story: string = stripTags(item.story) || "";
    const english: string = stripTags(item.english) || "";
    const chinese: string = stripTags(item.chinese) || "";
    const chinesePinyin: string = stripTags(item.chinese_pinyin) || "";
    const japaneseKana: string = stripTags(item.japanese_kana) || "";
    const fiveElements: string = stripTags(item.five_elements) || "";
    const hanjaStrokes: string = stripTags(item.hanja_strokes) || "";

    const subject = lang === "ko"
      ? `윙크 네이밍 — "${name}" 이름 설계 카드`
      : `Wink Naming — Name Design Card: "${name}"`;

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${subject}</title>
<style>
  body { margin:0; padding:0; background:#0B1634; font-family: 'Noto Sans KR','Noto Sans',sans-serif; color:#f0f4ff; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 20px; }
  .header { background:linear-gradient(135deg,#1B2A5E,#0D1A3E); border-radius:16px 16px 0 0; padding:32px 28px 24px; border-bottom:3px solid #C9A84C; }
  .brand { font-size:11px; letter-spacing:0.18em; color:rgba(201,168,76,0.75); font-weight:700; margin-bottom:16px; text-transform:uppercase; }
  .name-ko { font-size:52px; font-weight:900; letter-spacing:8px; color:#fff; font-family:serif; margin:0 0 8px; }
  .hanja { font-size:22px; letter-spacing:5px; color:rgba(201,168,76,0.85); margin:0 0 6px; }
  .hanja-meaning { font-size:13px; color:rgba(201,168,76,0.6); margin:0; }
  .body { background:#0F1A42; padding:28px; border-radius:0 0 16px 16px; }
  .section { margin-bottom:20px; }
  .label { font-size:10px; text-transform:uppercase; letter-spacing:0.14em; color:rgba(201,168,76,0.7); font-weight:700; margin-bottom:6px; }
  .text { font-size:14px; color:rgba(200,215,240,0.88); line-height:1.75; }
  .global-grid { display:flex; gap:10px; }
  .mini { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px; text-align:center; }
  .mini-title { font-size:10px; color:rgba(201,168,76,0.65); font-weight:700; margin-bottom:4px; }
  .divider { height:1px; background:rgba(201,168,76,0.18); margin:20px 0; }
  .footer { margin-top:28px; text-align:center; font-size:11px; color:rgba(200,215,240,0.35); line-height:1.8; }
  .social { margin-top:20px; padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; font-size:13px; color:rgba(200,215,240,0.55); line-height:1.8; text-align:center; white-space:pre-line; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <p class="brand">WINK NAMING · NAME DESIGN CARD</p>
    <h1 class="name-ko">${name}</h1>
    ${hanja ? `<p class="hanja">${hanja}</p>` : ""}
    ${hanjaMeaning ? `<p class="hanja-meaning">${hanjaMeaning}</p>` : ""}
  </div>
  <div class="body">
    ${fiveElements ? `<div class="section"><div class="label">오행 / Five Elements</div><div class="text">${fiveElements}</div></div>` : ""}
    ${hanjaStrokes ? `<div class="section"><div class="label">획수 / Strokes</div><div class="text">${hanjaStrokes}</div></div>` : ""}
    <div class="section">
      <div class="label">${lang === "ko" ? "이름 의미" : "Meaning"}</div>
      <div class="text">${meaning}</div>
    </div>
    <div class="section">
      <div class="label">${lang === "ko" ? "설계 배경" : "Design Story"}</div>
      <div class="text">${story}</div>
    </div>
    <div class="divider"></div>
    <div class="section">
      <div class="label">${lang === "ko" ? "다국어 표기" : "Global Script"}</div>
      <div class="global-grid">
        <div class="mini"><div class="mini-title">EN</div><div>${english}</div></div>
        <div class="mini"><div class="mini-title">中文</div><div>${chinese}</div><div style="font-size:11px;opacity:0.6">${chinesePinyin}</div></div>
        <div class="mini"><div class="mini-title">日本語</div><div>${japaneseKana}</div></div>
      </div>
    </div>
    <div class="social">고객님이 선물하신 이름을 통해\n이름 없이 버려진 아이에게 선물을 줄 수 있게 되었습니다.\n윙크 네이밍은 소외된 아이들이 웃을 수 있게 돕고 있습니다. 🤍</div>
  </div>
  <div class="footer">
    윙크 네이밍 · Korean-style naming that elevates life's value<br/>
    ${brief?.familyName ? `성씨 · ${brief.familyName} |` : ""} ${brief?.purpose ? `목적 · ${String(brief.purpose).slice(0, 40)}` : ""}
  </div>
</div>
</body>
</html>`;

    // ── 5. Send via Resend ───────────────────────────────
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "윙크 네이밍 <onboarding@resend.dev>",  // TODO: 도메인 인증 후 noreply@wink-naming.com 으로 변경
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[send-card] Resend error:", err);
      return NextResponse.json({ ok: false, error: "send failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-card error]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
