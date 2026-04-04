/**
 * 윙크 네이밍 — 가격 정책 v3 (2026-03-30 업데이트)
 *
 * ┌─────────────────────────┬────────────┐
 * │ 서비스                  │ 가격        │
 * ├─────────────────────────┼────────────┤
 * │ 이름 생성 리포트        │ ₩9,900     │
 * │ 도장 (인장)             │ ₩29,000    │
 * │ 문패/명패               │ ₩49,000    │
 * │ 이름 선물 카드          │ ₩9,900     │
 * └─────────────────────────┴────────────┘
 *
 * 패키지 (10% 할인):
 * - 리포트 + 도장: ₩34,900 (정가 ₩38,900)
 * - 리포트 + 문패: ₩52,900 (정가 ₩58,900)
 * - 풀패키지:      ₩77,900 (정가 ₩87,800)
 */

export const PRICING = {
  /** 이름 생성 리포트 PDF */
  naming: 9_900,
  /** 인장/도장 */
  stamp: 29_000,
  /** 문패/명패 */
  doorplate: 49_000,
  /** 이름 선물 카드 SNS 공유 */
  giftCardShare: 9_900,
  /** 브랜드 AI 로고 패키지 */
  logoPackage: 29_000,
} as const;

/** 패키지 (10% 할인) */
export const PACKAGES = {
  reportStamp: {
    label: "이름 리포트 + 도장",
    items: ["naming", "stamp"] as const,
    original: 9_900 + 29_000,  // 38,900
    price: 34_900,
  },
  reportDoorplate: {
    label: "이름 리포트 + 문패",
    items: ["naming", "doorplate"] as const,
    original: 9_900 + 49_000,  // 58,900
    price: 52_900,
  },
  full: {
    label: "풀패키지 (리포트+도장+문패)",
    items: ["naming", "stamp", "doorplate"] as const,
    original: 9_900 + 29_000 + 49_000,  // 87,800
    price: 77_900,
  },
} as const;

/** 카테고리별 이름 설계 기본 가격 */
export const CATEGORY_PRICING: Record<string, number> = {
  child: 9_900,
  self: 9_900,
  brand: 9_900,
  pet: 4_900,
  stage: 9_900,
  korean_to_foreign: 9_900,
  foreign_to_korean: 9_900,
};

/** 카테고리별 인장(도장) 패키지 표시 여부 */
export const SHOW_SEAL: Record<string, boolean> = {
  child: true,
  self: true,
  brand: true,
  pet: false,
  stage: true,
  korean_to_foreign: true,
  foreign_to_korean: true,
};

/** 카테고리별 문패/명패 패키지 표시 여부 */
export const SHOW_NAMEPLATE: Record<string, boolean> = {
  child: true,
  self: true,
  brand: true,
  pet: false,
  stage: true,
  korean_to_foreign: true,
  foreign_to_korean: true,
};

/** 로그인 시 월 무료 이름 생성 횟수 */
export const FREE_MONTHLY_QUOTA = 1;

/** A/S 신청 가능 기간 (결제 후 일수) */
export const ARS_ELIGIBLE_DAYS = 30;

/** 구독 플랜 */
export const PLANS = {
  basic: {
    id: "basic",
    priceUSD: 9.9,
    label: "Basic",
    monthlyQuota: 10,
    envKey: "STRIPE_PRICE_BASIC",
  },
  premium: {
    id: "premium",
    priceUSD: 29,
    label: "Premium",
    monthlyQuota: Infinity,
    envKey: "STRIPE_PRICE_PREMIUM",
  },
} as const;

export type PlanId = "free" | "basic" | "premium";
