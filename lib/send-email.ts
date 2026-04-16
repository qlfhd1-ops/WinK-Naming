/**
 * Wink Naming — 공통 이메일 발송 유틸 (Resend)
 * 발신: onboarding@resend.dev (임시 / 도메인 인증 후 noreply@wink-naming.com 으로 변경 예정)
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM = "윙크 네이밍 <onboarding@resend.dev>";
const BASE_URL = "https://yoonseul-naming.vercel.app";

/** 공통 헤더 HTML — 네이비 + 골드 브랜딩 */
function emailWrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { margin:0; padding:0; background:#0B1634; font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif; color:#f0f4ff; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 16px; }
  .card { background:#0F1A42; border-radius:20px; overflow:hidden; border:1px solid rgba(201,168,76,0.25); }
  .header { background:linear-gradient(135deg,#1B2A5E 0%,#0D1A3E 100%); padding:32px 28px 24px; border-bottom:2px solid #C9A84C; text-align:center; }
  .brand { font-size:11px; letter-spacing:0.22em; color:rgba(201,168,76,0.75); font-weight:700; text-transform:uppercase; margin-bottom:12px; }
  .brand-name { font-size:22px; font-weight:900; color:#fff; letter-spacing:2px; margin:0; }
  .brand-sub { font-size:12px; color:rgba(201,168,76,0.6); margin-top:4px; }
  .body { padding:28px; }
  .name-big { font-size:48px; font-weight:900; letter-spacing:8px; color:#fff; font-family:serif; text-align:center; margin:20px 0 6px; }
  .hanja { font-size:20px; letter-spacing:5px; color:rgba(201,168,76,0.85); text-align:center; margin:0 0 6px; }
  .hanja-meaning { font-size:12px; color:rgba(201,168,76,0.55); text-align:center; margin:0 0 20px; }
  .divider { height:1px; background:rgba(201,168,76,0.2); margin:20px 0; }
  .label { font-size:10px; text-transform:uppercase; letter-spacing:0.14em; color:rgba(201,168,76,0.7); font-weight:700; margin-bottom:6px; }
  .text { font-size:14px; color:rgba(200,215,240,0.88); line-height:1.8; }
  .message-box { background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.25); border-radius:12px; padding:16px 18px; font-size:14px; color:rgba(220,230,255,0.9); line-height:1.8; font-style:italic; }
  .btn { display:inline-block; margin-top:8px; background:#C9A84C; color:#0B1634; font-size:14px; font-weight:800; text-decoration:none; padding:14px 32px; border-radius:10px; letter-spacing:0.5px; }
  .section { margin-bottom:20px; }
  .order-row { display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.07); font-size:14px; }
  .order-total { display:flex; justify-content:space-between; padding:14px 0 0; font-size:16px; font-weight:800; }
  .badge { display:inline-block; background:rgba(201,168,76,0.15); border:1px solid rgba(201,168,76,0.35); color:#C9A84C; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:700; letter-spacing:0.1em; }
  .footer { margin-top:24px; text-align:center; font-size:11px; color:rgba(200,215,240,0.3); line-height:2; }
  .footer a { color:rgba(201,168,76,0.5); text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="brand">WINK NAMING · 윙크 네이밍</div>
      <h1 class="brand-name">WINK</h1>
      <div class="brand-sub">Korean-style naming that elevates life's value</div>
    </div>
    <div class="body">
      ${content}
    </div>
  </div>
  <div class="footer">
    본 메일은 윙크 네이밍에서 자동 발송되었습니다.<br/>
    <a href="${BASE_URL}">${BASE_URL}</a><br/>
    © 2025 Wink Naming. All rights reserved.
  </div>
</div>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────
   1. 선물 이메일 — 이름 설계 결과를 받는 분에게 발송
   ───────────────────────────────────────────────────────────── */
export interface GiftEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  senderName?: string;
  giftMessage?: string;
  name: string;
  hanja?: string;
  hanjaMeaning?: string;
  meaning?: string;
  story?: string;
  giftCardUrl?: string;
  lang?: string;
}

export async function sendGiftEmail(payload: GiftEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[send-email] RESEND_API_KEY not set — gift email skipped");
    return;
  }

  const {
    recipientEmail, recipientName = "", senderName = "",
    giftMessage = "", name, hanja = "", hanjaMeaning = "",
    meaning = "", story = "", giftCardUrl = "",
  } = payload;

  const subject = `윙크 네이밍에서 특별한 이름을 선물합니다 🎁`;

  const bodyContent = `
    <div style="text-align:center;margin-bottom:8px;">
      <span class="badge">🎁 이름 선물</span>
    </div>
    ${recipientName ? `<div class="text" style="text-align:center;margin-bottom:4px;">${recipientName} 님께</div>` : ""}
    ${senderName ? `<div class="text" style="text-align:center;color:rgba(200,215,240,0.55);font-size:12px;margin-bottom:20px;">${senderName} 님이 특별한 이름을 선물했습니다</div>` : ""}

    <h2 class="name-big">${name}</h2>
    ${hanja ? `<p class="hanja">${hanja}</p>` : ""}
    ${hanjaMeaning ? `<p class="hanja-meaning">${hanjaMeaning}</p>` : ""}

    ${meaning ? `
    <div class="section">
      <div class="label">이름 의미</div>
      <div class="text">${meaning}</div>
    </div>` : ""}

    ${story ? `
    <div class="section">
      <div class="label">설계 배경</div>
      <div class="text">${story}</div>
    </div>` : ""}

    ${giftMessage ? `
    <div class="divider"></div>
    <div class="section">
      <div class="label">전하는 말</div>
      <div class="message-box">${giftMessage}</div>
    </div>` : ""}

    ${giftCardUrl ? `
    <div class="divider"></div>
    <div style="text-align:center;padding:8px 0;">
      <div class="text" style="margin-bottom:16px;">선물 카드 전체 내용을 확인하세요</div>
      <a href="${giftCardUrl}" class="btn">선물 카드 보기 →</a>
    </div>` : `
    <div class="divider"></div>
    <div style="text-align:center;padding:8px 0;">
      <a href="${BASE_URL}" class="btn">윙크 네이밍 방문하기 →</a>
    </div>`}
  `;

  const html = emailWrap(bodyContent);

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [recipientEmail], subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send-email] Gift email failed:", err);
  }
}

/* ─────────────────────────────────────────────────────────────
   2. 주문 확인 이메일 — 도장/문패 주문 완료 후 고객에게 발송
   ───────────────────────────────────────────────────────────── */
export interface OrderEmailPayload {
  customerEmail: string;
  customerName: string;
  orderId: string;
  name: string;
  hanja?: string;
  items: Array<{ title: string; price: number }>;
  total: number;
  memo?: string;
  lang?: string;
}

export async function sendOrderEmail(payload: OrderEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[send-email] RESEND_API_KEY not set — order email skipped");
    return;
  }

  const {
    customerEmail, customerName, orderId,
    name, hanja = "", items, total, memo = "",
  } = payload;

  const shortId = orderId.slice(0, 8).toUpperCase();
  const subject = `[윙크 네이밍] 주문이 접수되었습니다 — 주문번호 ${shortId}`;

  const itemsHtml = items.map(item => `
    <div class="order-row">
      <span style="color:rgba(200,215,240,0.8)">${item.title}</span>
      <span style="color:#C9A84C;font-weight:700">₩${item.price.toLocaleString()}</span>
    </div>
  `).join("");

  const bodyContent = `
    <div style="text-align:center;margin-bottom:20px;">
      <span class="badge">✅ 주문 접수 완료</span>
    </div>

    <div class="section">
      <div class="text">${customerName} 님, 주문이 정상적으로 접수되었습니다.<br/>
      장인이 직접 제작하며 <strong style="color:#C9A84C">7~10 영업일</strong> 내 발송 예정입니다.</div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="label">주문 정보</div>
      <div class="order-row">
        <span style="color:rgba(200,215,240,0.55)">주문번호</span>
        <span style="font-family:monospace;color:#C9A84C;font-weight:700">${shortId}</span>
      </div>
      <div class="order-row">
        <span style="color:rgba(200,215,240,0.55)">이름</span>
        <span>${name}${hanja ? ` (${hanja})` : ""}</span>
      </div>
    </div>

    <div class="section">
      <div class="label">주문 상품</div>
      ${itemsHtml}
      <div class="order-total">
        <span>합계</span>
        <span style="color:#C9A84C">₩${total.toLocaleString()}</span>
      </div>
    </div>

    ${memo ? `
    <div class="divider"></div>
    <div class="section">
      <div class="label">추가 요청 사항</div>
      <div class="text">${memo}</div>
    </div>` : ""}

    <div class="divider"></div>

    <div class="section">
      <div class="label">안내 사항</div>
      <div class="text" style="font-size:13px;line-height:2;">
        • 주문 확인 후 제작이 시작됩니다.<br/>
        • 배송 시작 시 별도 안내 드립니다.<br/>
        • 문의: <a href="mailto:contact@wink-naming.com" style="color:#C9A84C">contact@wink-naming.com</a>
      </div>
    </div>

    <div style="text-align:center;padding:8px 0;">
      <a href="${BASE_URL}" class="btn">윙크 네이밍 방문하기 →</a>
    </div>
  `;

  const html = emailWrap(bodyContent);

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [customerEmail], subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send-email] Order email failed:", err);
  }
}
