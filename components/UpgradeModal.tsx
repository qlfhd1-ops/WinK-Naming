"use client";

import { useState } from "react";
import { PLANS, FREE_MONTHLY_QUOTA } from "@/lib/pricing";

const CATEGORY_HEADLINE: Record<string, { ko: string; en: string }> = {
  child:              { ko: "소중한 아이의 이름이 완성됐습니다", en: "Your child's name has been crafted" },
  brand:              { ko: "브랜드의 이름이 완성됐습니다",      en: "Your brand name is ready" },
  pet:                { ko: "소중한 반려동물의 이름이 완성됐습니다", en: "Your pet's name has been crafted" },
  stage:              { ko: "당신의 활동명이 완성됐습니다",      en: "Your stage name is ready" },
  korean_to_foreign:  { ko: "당신의 이름을 선물합니다",          en: "Your name, as a gift" },
  foreign_to_korean:  { ko: "한국 이름이 완성됐습니다",          en: "Your Korean name is ready" },
};
const DEFAULT_HEADLINE = { ko: "당신의 이름을 선물합니다", en: "Your name, as a gift" };

const COPY = {
  ko: {
    betaNotice: "현재 베타 서비스 운영 중 · 베타 기간 특별 가격 적용",
    sub: (used: number, quota: number) =>
      `이번 달 ${quota}회 무료 체험 중 ${used}회를 사용하셨습니다.\n지금 업그레이드하시면 계속 이름을 설계하실 수 있습니다.`,
    freeLabel: "무료 체험",
    freeQuota: (n: number) => `월 ${n}회 체험`,
    perMonth: "/월",
    startBasic: "Basic 시작하기",
    startPremium: "Premium 시작하기",
    cancel: "나중에 결정하기",
    loading: "이동 중...",
    bestBadge: "BEST",
    features: {
      basic: [
        "월 10회 이름 설계",
        "패키지 10% 할인",
        "우선 고객 지원",
      ],
      premium: [
        "무제한 이름 설계",
        "패키지 20% 할인",
        "무제한 A/S",
        "브랜드 로고 1회 포함",
      ],
    },
  },
  en: {
    betaNotice: "Currently in Beta · Special beta pricing available",
    sub: (used: number, quota: number) =>
      `You've used ${used} of ${quota} free trials this month.\nUpgrade now to continue designing names.`,
    freeLabel: "Free Trial",
    freeQuota: (n: number) => `${n} trial/month`,
    perMonth: "/mo",
    startBasic: "Start Basic",
    startPremium: "Start Premium",
    cancel: "Decide later",
    loading: "Redirecting...",
    bestBadge: "BEST",
    features: {
      basic: [
        "10 name designs/month",
        "10% package discount",
        "Priority support",
      ],
      premium: [
        "Unlimited name designs",
        "20% package discount",
        "Unlimited A/S",
        "1 brand logo included",
      ],
    },
  },
} as const;

type UiLang = keyof typeof COPY;
function toUiLang(lang: string): UiLang {
  return lang in COPY ? (lang as UiLang) : "ko";
}

interface Props {
  lang: string;
  userId: string;
  email?: string;
  usedCount: number;
  category?: string;
  onClose: () => void;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="rgba(201,168,76,0.18)" />
      <path d="M4 7l2 2 4-4" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UpgradeModal({ lang, userId, email, usedCount, category, onClose }: Props) {
  const uiLang = toUiLang(lang);
  const ui = COPY[uiLang];
  const [loading, setLoading] = useState<string | null>(null);

  const headlineObj: { ko: string; en: string } = (category ? CATEGORY_HEADLINE[category] : null) ?? DEFAULT_HEADLINE;
  const headline = uiLang === "ko" ? headlineObj.ko : headlineObj.en;

  const handleUpgrade = async (plan: "basic" | "premium") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId, email, lang }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "오류가 발생했습니다");
        setLoading(null);
      }
    } catch {
      alert("네트워크 오류가 발생했습니다");
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4,8,28,0.82)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #1B2A5E 0%, #0D1A3E 55%, #080F28 100%)",
          border: "1.5px solid rgba(201,168,76,0.35)",
          borderRadius: 24,
          padding: "32px 28px 28px",
          width: "100%",
          maxWidth: 600,
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08) inset",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div aria-hidden style={{
          position: "absolute", top: -80, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Beta banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(8,18,48,0.4))",
          border: "1px solid rgba(201,168,76,0.28)",
          borderRadius: 10,
          padding: "8px 14px",
          marginBottom: 24,
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(201,168,76,0.85)",
          textAlign: "center",
          letterSpacing: "0.04em",
        }}>
          ✦ {ui.betaNotice}
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontSize: 36,
            marginBottom: 14,
            filter: "drop-shadow(0 0 12px rgba(201,168,76,0.4))",
          }}>
            ✨
          </div>
          <h2 style={{
            fontSize: "clamp(18px, 3.5vw, 24px)",
            fontWeight: 900,
            color: "#F0D080",
            marginBottom: 12,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            textShadow: "0 0 32px rgba(240,208,128,0.2)",
            fontFamily: "'Noto Serif KR', serif",
          }}>
            {headline}
          </h2>
          <p style={{
            fontSize: 14,
            color: "rgba(200,215,240,0.72)",
            lineHeight: 1.75,
            whiteSpace: "pre-line",
          }}>
            {ui.sub(usedCount, FREE_MONTHLY_QUOTA)}
          </p>
        </div>

        {/* Gold divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)",
          marginBottom: 24,
        }} />

        {/* Plan cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}>
          {/* Basic */}
          <div style={{
            borderRadius: 16,
            border: "1.5px solid rgba(91,164,212,0.35)",
            background: "linear-gradient(160deg, rgba(91,164,212,0.09), rgba(8,18,48,0.5))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}>
            <div>
              <div style={{ fontWeight: 800, color: "#eef3ff", fontSize: 17, marginBottom: 4 }}>
                {PLANS.basic.label}
              </div>
              <div style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#5BA4D4",
                lineHeight: 1,
              }}>
                ${PLANS.basic.priceUSD}
                <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(200,215,240,0.55)", marginLeft: 2 }}>
                  {ui.perMonth}
                </span>
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {ui.features.basic.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(200,215,240,0.80)" }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleUpgrade("basic")}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: loading === "basic"
                  ? "rgba(91,164,212,0.5)"
                  : "linear-gradient(135deg, #5BA4D4, #3880B0)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading !== null ? "not-allowed" : "pointer",
                opacity: loading !== null && loading !== "basic" ? 0.45 : 1,
                transition: "opacity 0.2s",
                letterSpacing: "0.02em",
              }}
            >
              {loading === "basic" ? ui.loading : ui.startBasic}
            </button>
          </div>

          {/* Premium */}
          <div style={{
            borderRadius: 16,
            border: "1.5px solid rgba(201,168,76,0.5)",
            background: "linear-gradient(160deg, rgba(201,168,76,0.11), rgba(8,18,48,0.5))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
          }}>
            {/* BEST badge */}
            <div style={{
              position: "absolute",
              top: -1,
              right: 16,
              background: "linear-gradient(135deg, #C9A84C, #A07828)",
              color: "#070e28",
              fontSize: 9,
              fontWeight: 900,
              padding: "4px 10px",
              borderRadius: "0 0 8px 8px",
              letterSpacing: "0.08em",
            }}>
              {ui.bestBadge}
            </div>

            <div>
              <div style={{ fontWeight: 800, color: "#eef3ff", fontSize: 17, marginBottom: 4 }}>
                {PLANS.premium.label}
              </div>
              <div style={{
                fontSize: 26,
                fontWeight: 900,
                color: "rgba(201,168,76,0.95)",
                lineHeight: 1,
              }}>
                ${PLANS.premium.priceUSD}
                <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(200,215,240,0.55)", marginLeft: 2 }}>
                  {ui.perMonth}
                </span>
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {ui.features.premium.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(200,215,240,0.80)" }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleUpgrade("premium")}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 10,
                border: "none",
                background: loading === "premium"
                  ? "rgba(201,168,76,0.45)"
                  : "linear-gradient(135deg, #C9A84C 0%, #A07828 100%)",
                color: "#070e28",
                fontWeight: 900,
                fontSize: 14,
                cursor: loading !== null ? "not-allowed" : "pointer",
                opacity: loading !== null && loading !== "premium" ? 0.45 : 1,
                transition: "opacity 0.2s",
                letterSpacing: "0.02em",
                boxShadow: loading !== "premium" ? "0 4px 18px rgba(201,168,76,0.30)" : "none",
              }}
            >
              {loading === "premium" ? ui.loading : ui.startPremium}
            </button>
          </div>
        </div>

        {/* Cancel */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(200,215,240,0.38)",
              fontSize: 13,
              cursor: "pointer",
              padding: "6px 12px",
              letterSpacing: "0.02em",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              textDecorationColor: "rgba(200,215,240,0.2)",
            }}
          >
            {ui.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
