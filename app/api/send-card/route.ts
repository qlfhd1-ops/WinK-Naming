import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildNameCardEmail } from "@/lib/name-card-email";

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
    if (!adminClient) {
      console.error("[send-card] Supabase service role not configured");
      return NextResponse.json({ ok: false, error: "server misconfigured" }, { status: 503 });
    }

    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
    }

    // ── 2. 무료/유료 구분 없이 로그인한 사용자 누구나 이름카드를 받을 수 있다.
    //      (이전의 `users` 테이블 plan 조회는 존재하지 않는 테이블이라 항상 403이었음)
    //      스팸 릴레이 방지를 위해 수신 주소는 로그인한 본인 이메일로만 허용한다.
    const ownEmail = (user.email ?? "").trim().toLowerCase();

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

    const briefId = typeof body?.briefId === "string" ? body.briefId : "";
    const sessionToken = typeof body?.sessionToken === "string" ? body.sessionToken : "";
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const name: string = stripTags(item.name) || "-";

    // ── 수신자 결정 ─────────────────────────────────────────
    //  · briefId 가 있으면(이름 선택 자동 발송): 서버가 brief 에서 수신 주소를 직접 조회하고,
    //    brief 당 "처음 선택한 이름 1건"만 발송한다(원자적 선점으로 중복 방지).
    //  · briefId 가 없으면(기존 수동 발송): 로그인한 본인 이메일로만 허용.
    let recipient = email.toLowerCase();
    let claimedAt: string | null = null;

    if (briefId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(briefId)) {
        return NextResponse.json({ ok: false, error: "invalid briefId" }, { status: 400 });
      }
      const { data: row, error: rowErr } = await adminClient
        .from("naming_briefs")
        .select("id,user_id,session_token,guest_email,card_sent_at,card_sent_name,card_sent_to")
        .eq("id", briefId)
        .maybeSingle();
      if (rowErr || !row) {
        return NextResponse.json({ ok: false, error: "brief not found" }, { status: 404 });
      }

      const guestEmail = (row.guest_email ?? "").trim().toLowerCase();
      const owns =
        row.user_id === user.id ||
        (!row.user_id && !!sessionToken && row.session_token === sessionToken) ||
        (!!guestEmail && guestEmail === ownEmail);
      if (!owns) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }

      // 이미 발송됨 → 다시 보내지 않고 처음 발송한 정보를 알려준다.
      if (row.card_sent_at) {
        return NextResponse.json({
          ok: true, already: true, sentName: row.card_sent_name ?? "", sentTo: row.card_sent_to ?? "",
        });
      }

      recipient = EMAIL_RE.test(guestEmail) ? guestEmail : ownEmail;
      if (!EMAIL_RE.test(recipient)) {
        return NextResponse.json({ ok: false, error: "no recipient" }, { status: 400 });
      }

      // 같은 수신 주소로 24시간 내 3통 초과 발송 금지(남의 주소로의 스팸 악용 방지)
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count } = await adminClient
        .from("naming_briefs")
        .select("id", { count: "exact", head: true })
        .eq("card_sent_to", recipient)
        .gte("card_sent_at", since);
      if ((count ?? 0) >= 3) {
        return NextResponse.json({ ok: false, error: "too many cards for this address" }, { status: 429 });
      }

      // 발송 권한 선점: card_sent_at 이 NULL 인 row 만 갱신되므로 동시 요청 중 한 건만 통과한다.
      const now = new Date().toISOString();
      const { data: claimed } = await adminClient
        .from("naming_briefs")
        .update({ card_sent_at: now, card_sent_name: name, card_sent_to: recipient })
        .eq("id", briefId)
        .is("card_sent_at", null)
        .select("id");
      if (!claimed || claimed.length === 0) {
        const { data: again } = await adminClient
          .from("naming_briefs")
          .select("card_sent_name,card_sent_to")
          .eq("id", briefId)
          .maybeSingle();
        return NextResponse.json({
          ok: true, already: true, sentName: again?.card_sent_name ?? "", sentTo: again?.card_sent_to ?? "",
        });
      }
      claimedAt = now;
    } else {
      if (!email || !EMAIL_RE.test(email)) {
        return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
      }
      if (!ownEmail || email.toLowerCase() !== ownEmail) {
        return NextResponse.json({ ok: false, error: "recipient must be your account email" }, { status: 403 });
      }
    }

    // 선점한 발송 권한을 되돌린다(발송 실패 시 재시도 가능하도록).
    const releaseClaim = async () => {
      if (!briefId || !claimedAt) return;
      await adminClient
        .from("naming_briefs")
        .update({ card_sent_at: null, card_sent_name: null, card_sent_to: null })
        .eq("id", briefId)
        .eq("card_sent_at", claimedAt);
    };

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

    // ── 카드 이미지(선택): 사이트의 네임카드를 고객 화면에서 이미지로 만들어 함께 보낸 경우 ──
    //    data URL(jpeg/png, base64)만 허용하고 크기를 제한한다.
    let imageBase64 = "";
    let imageType = "image/jpeg";
    const rawImage = typeof body?.cardImage === "string" ? body.cardImage : "";
    const imgMatch = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(rawImage);
    if (imgMatch && imgMatch[2].length <= 4_500_000) {
      imageType = imgMatch[1];
      imageBase64 = imgMatch[2];
    }

    const baseUrl = "https://wink-naming.com";
    const listenUrl =
      `${baseUrl}/listen?n=${encodeURIComponent(name)}` +
      `${english ? `&r=${encodeURIComponent(english)}` : ""}&lang=${encodeURIComponent(lang)}`;

    const { subject, html } = buildNameCardEmail({
      lang,
      item: { name, hanja, hanjaMeaning, meaning, story, english, chinese, chinesePinyin, japaneseKana, fiveElements, hanjaStrokes },
      familyName: stripTags(brief?.familyName),
      purpose: stripTags(brief?.purpose),
      hasImage: !!imageBase64,
      cardStyle: typeof body?.cardStyle === "string" ? body.cardStyle.slice(0, 40) : "",
      listenUrl,
      siteUrl: `${baseUrl}/${lang}`,
    });

    // ── 5. Send via Resend ───────────────────────────────
    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend 도메인(wink-naming.com) 인증 완료 — RESEND_FROM 환경변수로 덮어쓸 수 있음.
        from: process.env.RESEND_FROM || "윙크 네이밍 <noreply@wink-naming.com>",
        to: [recipient],
        subject,
        html,
        ...(imageBase64
          ? {
              attachments: [
                {
                  filename: `wink-namecard-${name.replace(/[^\p{L}\p{N}_-]/gu, "")}.${imageType === "image/png" ? "png" : "jpg"}`,
                  content: imageBase64,
                  content_type: imageType,
                },
              ],
            }
          : {}),
      }),
      });
    } catch (netErr) {
      console.error("[send-card] Resend network error:", netErr);
      await releaseClaim();
      return NextResponse.json({ ok: false, error: "send failed" }, { status: 500 });
    }

    if (!res.ok) {
      const err = await res.text();
      console.error("[send-card] Resend error:", err);
      await releaseClaim();
      return NextResponse.json({ ok: false, error: "send failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sentTo: recipient, sentName: name });
  } catch (err) {
    console.error("[send-card error]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
