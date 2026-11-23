/**
 * 선물 열기 페이지(/present)로 가는 링크 데이터.
 * 이름카드 메일의 "🎁 선물 열기" 버튼이 이 값을 d= 쿼리로 실어 보낸다.
 * 이메일·계정 같은 개인 정보는 넣지 않고, 이름 카드에 보이는 공개 내용만 담는다(로그인·DB 조회 없이 열림).
 */

export type GiftPayload = {
  /** 이름 */
  n: string;
  /** 영문 표기 */
  e?: string;
  /** 한자 */
  h?: string;
  /** 한자 풀이 */
  hm?: string;
  /** 이름 의미 */
  m?: string;
  /** 언어 */
  l?: string;
  /** 카드 스타일(사진 배경 id) */
  s?: string;
};

const LIMITS: Record<keyof GiftPayload, number> = { n: 20, e: 40, h: 12, hm: 120, m: 140, l: 5, s: 40 };

function clean(p: GiftPayload): GiftPayload {
  const out: Record<string, string> = {};
  (Object.keys(LIMITS) as (keyof GiftPayload)[]).forEach((k) => {
    const v = p[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, LIMITS[k]);
  });
  return out as GiftPayload;
}

export function encodeGift(p: GiftPayload): string {
  const json = JSON.stringify(clean(p));
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeGift(d: string | null | undefined): GiftPayload | null {
  if (!d || d.length > 2000) return null;
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const obj = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
    if (!obj || typeof obj !== "object" || typeof obj.n !== "string" || !obj.n.trim()) return null;
    const p: Record<string, string> = {};
    (Object.keys(LIMITS) as (keyof GiftPayload)[]).forEach((k) => {
      const v = obj[k];
      if (typeof v === "string") p[k] = v;
    });
    const c = clean(p as unknown as GiftPayload);
    return c.n ? c : null;
  } catch {
    return null;
  }
}
