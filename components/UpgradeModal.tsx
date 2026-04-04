"use client";

import { useState } from "react";
import { PLANS, FREE_MONTHLY_QUOTA } from "@/lib/pricing";

const COPY = {
  ko: {
    betaNotice: "현재 베타 서비스 운영 중 · 베타 기간 특별 가격 적용",
    title: "이번 달 무료 체험을 사용하셨습니다",
    sub: (used: number, quota: number) => `이번 달 ${quota}회 무료 체험 중 ${used}회를 사용하셨습니다.\n다음 달 1일에 다시 무료로 체험하실 수 있어요.\n지금 바로 구매하시면 이름 설계를 계속 받으실 수 있습니다.`,
    free: "무료 체험",
    freeQuota: (n: number) => `월 ${n}회 무료`,
    current: "현재 플랜",
    perMonth: "/월",
    startBasic: "Basic 시작하기",
    startPremium: "Premium 시작하기",
    cancel: "나중에",
    loading: "이동 중...",
    features: {
      basic: ["월 10회 이름 설계", "패키지 할인 10%", "우선 고객 지원"],
      premium: ["무제한 이름 설계", "패키지 할인 20%", "A/S 무제한", "브랜드 로고 1회 포함"],
    },
  },
  en: {
    betaNotice: "Currently in Beta · Special beta pricing available",
    title: "You've used your free trial this month",
    sub: (used: number, quota: number) => `You've used ${used} of ${quota} free trials this month.\nYou can try again on the 1st of next month.\nUpgrade now to continue naming design.`,
    free: "Free Trial",
    freeQuota: (n: number) => `${n} free/month`,
    current: "Current",
    perMonth: "/mo",
    startBasic: "Start Basic",
    startPremium: "Start Premium",
    cancel: "Later",
    loading: "Redirecting...",
    features: {
      basic: ["10 name designs/month", "10% package discount", "Priority support"],
      premium: ["Unlimited name designs", "20% package discount", "Unlimited A/S", "1 brand logo included"],
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
  onClose: () => void;
}

export default function UpgradeModal({ lang, userId, email, usedCount, onClose }: Props) {
  const ui = COPY[toUiLang(lang)];
  const [loading, setLoading] = useState<string | null>(null);

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
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, rgba(11,22,52,0.98), rgba(6,13,34,0.99))",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 20,
          padding: "32px 24px",
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Beta notice banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(8,18,48,0.5))",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10,
          padding: "8px 14px",
          marginBottom: 20,
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(201,168,76,0.9)",
          textAlign: "center",
          letterSpacing: "0.03em",
        }}>
          ✦ {ui.betaNotice}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <h2
            style={{
              fontSize: "clamp(16px,3vw,20px)",
              fontWeight: 800,
              color: "#f0f4ff",
              marginBottom: 10,
              lineHeight: 1.4,
            }}
          >
            {ui.title}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(200,215,240,0.75)", lineHeight: 1.7 }}>
            {ui.sub(usedCount, FREE_MONTHLY_QUOTA)}
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {/* Free (current) */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#f0f4ff", fontSize: 15 }}>{ui.free}</div>
              <div style={{ fontSize: 13, color: "rgba(200,215,240,0.6)", marginTop: 2 }}>
                {ui.freeQuota(FREE_MONTHLY_QUOTA)}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(200,215,240,0.6)",
              }}
            >
              {ui.current}
            </div>
          </div>

          {/* Basic */}
          <div
            style={{
              padding: "18px 18px",
              borderRadius: 12,
              border: "1px solid rgba(91,164,212,0.45)",
              background: "linear-gradient(160deg, rgba(91,164,212,0.08), rgba(8,18,48,0.6))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#f0f4ff", fontSize: 16 }}>{PLANS.basic.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#5BA4D4", marginTop: 2 }}>
                  ${PLANS.basic.priceUSD}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{ui.perMonth}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUpgrade("basic")}
                disabled={loading !== null}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #5BA4D4, #3880B0)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading && loading !== "basic" ? 0.5 : 1,
                }}
              >
                {loading === "basic" ? ui.loading : ui.startBasic}
              </button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
              {ui.features.basic.map((f) => (
                <li key={f} style={{ fontSize: 12, color: "rgba(200,215,240,0.75)", paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#5BA4D4" }}>·</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div
            style={{
              padding: "18px 18px",
              borderRadius: 12,
              border: "1px solid rgba(201,168,76,0.5)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.10), rgba(8,18,48,0.6))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#f0f4ff", fontSize: 16 }}>
                  {PLANS.premium.label}
                  <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.2)", color: "rgba(201,168,76,0.95)", border: "1px solid rgba(201,168,76,0.4)" }}>
                    BEST
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(201,168,76,0.95)", marginTop: 2 }}>
                  ${PLANS.premium.priceUSD}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>{ui.perMonth}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUpgrade("premium")}
                disabled={loading !== null}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, rgba(201,168,76,0.95), rgba(160,120,40,0.95))",
                  color: "#070e28",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading && loading !== "premium" ? 0.5 : 1,
                }}
              >
                {loading === "premium" ? ui.loading : ui.startPremium}
              </button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
              {ui.features.premium.map((f) => (
                <li key={f} style={{ fontSize: 12, color: "rgba(200,215,240,0.75)", paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "rgba(201,168,76,0.85)" }}>·</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "rgba(200,215,240,0.5)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {ui.cancel}
        </button>
      </div>
    </div>
  );
}
