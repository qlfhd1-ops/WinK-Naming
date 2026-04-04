import { NextResponse } from "next/server";

// ─── 지역 분류 ────────────────────────────────────────────────
const EU_CODES = new Set([
  "DE","FR","GB","IT","NL","BE","AT","CH","SE","NO","DK","FI",
  "PL","CZ","HU","RO","PT","GR","SK","HR","BG","SI","LT","LV",
  "EE","LU","MT","CY","IE","IS","LI","RS","UA","BY","TR",
]);

const SEA_CODES = new Set([
  "TH","VN","MY","SG","ID","PH","MM","KH","LA","BN","TL",
]);

// ─── 국가별 기본 요금 ─────────────────────────────────────────
function getRate(code: string): { fee: number; days: string; zone: string } {
  switch (code) {
    case "KR": return { fee: 2500,  days: "1–3",   zone: "domestic" };
    case "JP": return { fee: 10000, days: "5–7",   zone: "JP" };
    case "CN": return { fee: 12000, days: "7–10",  zone: "CN" };
    case "TW": return { fee: 12000, days: "5–8",   zone: "CN" };
    case "HK": return { fee: 12000, days: "5–7",   zone: "CN" };
    case "US": return { fee: 22000, days: "10–14", zone: "US" };
    case "CA": return { fee: 22000, days: "10–14", zone: "US" };
    case "AU": return { fee: 22000, days: "10–14", zone: "US" };
    case "NZ": return { fee: 22000, days: "12–16", zone: "US" };
    default:
      if (EU_CODES.has(code))  return { fee: 24000, days: "10–14", zone: "EU" };
      if (SEA_CODES.has(code)) return { fee: 15000, days: "7–10",  zone: "SEA" };
      return { fee: 30000, days: "14–21", zone: "OTHER" };
  }
}

// 이벤트 무료 배송 종료일 (env 없으면 기본 3개월)
function getEventEnd(): Date {
  const raw = process.env.SHIPPING_FREE_EVENT_UNTIL;
  if (raw) return new Date(raw);
  // 기본: 서비스 시작 2026-04-01 기준 +3개월
  return new Date("2026-07-01T00:00:00+09:00");
}

/** 국내 무료 배송 기준 금액 */
const FREE_KR_THRESHOLD = 50_000;

/**
 * POST /api/shipping/calculate
 * Body: { country_code: string, product_weight?: number, order_total?: number }
 * Response: { shipping_fee, base_fee, is_free, free_reason, estimated_days, zone }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const countryCode = String(body.country_code ?? "KR").toUpperCase().trim();
    const orderTotal  = Number(body.order_total  ?? 0);
    // product_weight는 현재 고정 취급 (추후 무게별 요금 확장 대비)
    const _weight = Number(body.product_weight ?? 500);

    const { fee: baseFee, days, zone } = getRate(countryCode);

    let shippingFee = baseFee;
    let isFree      = false;
    let freeReason: "event" | "threshold" | null = null;

    if (countryCode === "KR") {
      const now = new Date();
      if (now < getEventEnd()) {
        isFree     = true;
        shippingFee = 0;
        freeReason = "event";
      } else if (orderTotal >= FREE_KR_THRESHOLD) {
        isFree     = true;
        shippingFee = 0;
        freeReason = "threshold";
      }
    }

    return NextResponse.json({
      ok: true,
      country_code:   countryCode,
      shipping_fee:   shippingFee,
      base_fee:       baseFee,
      is_free:        isFree,
      free_reason:    freeReason,
      estimated_days: days,
      zone,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
