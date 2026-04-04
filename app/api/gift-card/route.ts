import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limiter";
import { PRICING } from "@/lib/pricing";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateToken(len = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function getIp(req: Request): string {
  return (
    (req as unknown as { headers: { get: (k: string) => string | null } }).headers.get(
      "x-forwarded-for"
    )?.split(",")[0]?.trim() ?? "unknown"
  );
}

/**
 * POST /api/gift-card
 * 이름 선물 카드 생성 + 주문 접수 (₩9,900)
 *
 * body: {
 *   nameResult: NameResult,
 *   briefId?: string,
 *   senderName?: string,
 *   recipientName?: string,
 *   message?: string,
 *   userId?: string,
 *   lang?: string,
 * }
 */
export async function POST(req: Request) {
  const ip = getIp(req);
  const { allowed } = rateLimit(`giftcard:${ip}`, 10, 3600);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const nameResult = body?.nameResult;
    const briefId = typeof body?.briefId === "string" ? body.briefId : null;
    const senderName = body?.senderName?.trim() ?? "";
    const recipientName = body?.recipientName?.trim() ?? "";
    const message = body?.message?.trim() ?? "";
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const lang = body?.lang ?? "ko";
    const customerName = body?.customerName?.trim() ?? senderName;
    const customerEmail = body?.customerEmail?.trim() ?? "";

    if (!nameResult?.name) {
      return NextResponse.json({ ok: false, error: "nameResult.name required" }, { status: 400 });
    }

    const token = generateToken(10);
    const supabase = getAdminClient();

    // 1. 선물 카드 레코드 저장
    const { data: cardRow, error: cardErr } = await supabase
      .from("naming_gift_cards")
      .insert({
        token,
        brief_id: briefId,
        user_id: userId,
        name: nameResult.name,
        hanja: nameResult.hanja ?? null,
        hanja_meaning: nameResult.hanja_meaning ?? null,
        hanja_strokes: nameResult.hanja_strokes ?? null,
        five_elements: nameResult.five_elements ?? null,
        english: nameResult.english ?? null,
        chinese: nameResult.chinese ?? null,
        chinese_pinyin: nameResult.chinese_pinyin ?? null,
        japanese_kana: nameResult.japanese_kana ?? null,
        japanese_reading: nameResult.japanese_reading ?? null,
        meaning: nameResult.meaning ?? null,
        story: nameResult.story ?? null,
        phonetic_harmony: nameResult.phonetic_harmony ?? null,
        sender_name: senderName || null,
        recipient_name: recipientName || null,
        message: message || null,
        paid: false,
        lang,
      })
      .select("id, token")
      .single();

    // 카드 저장 실패해도 토큰은 반환 (fallback)
    const finalToken = cardRow?.token ?? token;

    // 2. 주문 저장 (가격 ₩9,900)
    let orderId: string | null = null;
    if (customerEmail) {
      const { data: orderRow } = await supabase
        .from("naming_orders")
        .insert({
          user_id: userId,
          customer_name: customerName || nameResult.name,
          customer_email: customerEmail,
          customer_note: `이름 선물 카드: ${nameResult.name}${nameResult.hanja ? ` (${nameResult.hanja})` : ""}\n수신자: ${recipientName || "-"}\n메시지: ${message || "-"}`,
          total_amount: PRICING.giftCardShare,
          currency: "KRW",
          status: "pending",
        })
        .select("id")
        .single();

      if (orderRow?.id) {
        orderId = orderRow.id;
        await supabase.from("naming_order_items").insert({
          order_id: orderId,
          user_id: userId,
          brief_id: briefId,
          package_type: "giftcard-share",
          title: `이름 선물 카드 — ${nameResult.name}${nameResult.hanja ? ` ${nameResult.hanja}` : ""}`,
          description: "이름 선물 카드 SNS 공유",
          price: PRICING.giftCardShare,
          quantity: 1,
          lang,
        });

        // 카드 paid 상태 업데이트 (주문 생성 시점에 유료 처리)
        if (cardRow?.id) {
          await supabase
            .from("naming_gift_cards")
            .update({ paid: true, order_id: orderId })
            .eq("id", cardRow.id);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      token: finalToken,
      orderId,
      price: PRICING.giftCardShare,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gift-card?token=xxx — 공개 선물 카드 조회
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || token.length < 6) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("naming_gift_cards")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, card: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
