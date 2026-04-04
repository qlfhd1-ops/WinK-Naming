"use client";

import { useEffect, useRef, useState } from "react";

// ─── 더미 후기 데이터 ─────────────────────────────────────────
const REVIEWS = [
  {
    name: "김지수 님",
    tag: "아이 이름",
    body: "AI가 한자·오행·음운까지 분석해준다는 게 놀라웠어요. 딸아이 이름으로 바로 결정했습니다.",
    date: "2025.12",
    stars: 5,
  },
  {
    name: "박○○ 님",
    tag: "브랜드명",
    body: "카페 브랜드 이름을 찾고 있었는데 세 방향으로 설계해줘서 고민이 바로 해결됐어요. 주변 반응도 정말 좋아요.",
    date: "2026.01",
    stars: 5,
  },
  {
    name: "Akira T.",
    tag: "아이 이름 · 日本語",
    body: "名前の意味だけでなく、漢字の画数や五行バランスまで詳しく説明してくれて感動しました。",
    date: "2026.01",
    stars: 5,
  },
  {
    name: "Sarah K.",
    tag: "Child Name · EN",
    body: "I was amazed at how phonetic harmony, hanja strokes, and global usability were all considered together. Our baby's name is perfect.",
    date: "2026.02",
    stars: 5,
  },
  {
    name: "이○○ 님",
    tag: "개명",
    body: "새로운 시작에 맞는 이름을 원했어요. 제 성씨와 완벽하게 어울리는 이름을 받아서 너무 만족스럽습니다.",
    date: "2026.02",
    stars: 5,
  },
  {
    name: "李美华",
    tag: "孩子姓名 · 中文",
    body: "不仅给出了韩文名字，还提供了中文写法和拼音，对我们海外华人非常实用。",
    date: "2026.03",
    stars: 5,
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  child:   "아이 이름",
  brand:   "브랜드명",
  pet:     "반려동물",
  stage:   "활동명·예명",
  self:    "본인 개명",
  korean_to_foreign: "한→외 표기",
  foreign_to_korean: "외→한 표기",
};

// ─── 카운터 애니메이션 ─────────────────────────────────────────
function useCountUp(target: number, duration = 1600): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const cur = Math.floor(ease * target);
      if (cur !== start) { start = cur; setVal(cur); }
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────
export default function SocialProof({ isLight }: { isLight: boolean }) {
  const [totalCount, setTotalCount] = useState(0);
  const [reviewIdx, setReviewIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayCount = useCountUp(totalCount, 1800);

  // 이름 카운터 fetch
  useEffect(() => {
    fetch("/api/stats/naming-count")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setTotalCount(j.count); })
      .catch(() => setTotalCount(1000));
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setReviewIdx((i) => (i + 1) % REVIEWS.length);
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const prev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setReviewIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);
  };
  const next = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setReviewIdx((i) => (i + 1) % REVIEWS.length);
  };

  const review = REVIEWS[reviewIdx];

  // ─── 스타일 토큰 ─────────────────────────────────────────────
  const panelBg = isLight
    ? "linear-gradient(180deg, rgba(255,250,238,0.98) 0%, rgba(255,245,225,0.96) 100%)"
    : "linear-gradient(180deg, rgba(9,20,46,0.96) 0%, rgba(7,15,33,0.98) 100%)";
  const panelBorder = isLight
    ? "1px solid rgba(160,120,60,0.20)"
    : "1px solid rgba(120,160,255,0.14)";
  const textMain  = isLight ? "#1a1a2e" : "#f8fbff";
  const textSoft  = isLight ? "rgba(60,50,30,0.72)" : "rgba(200,218,248,0.72)";
  const goldColor = "rgba(201,168,76,0.95)";

  return (
    <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ─ 통계 카운터 + 전문가 검수 뱃지 ─ */}
      <div
        style={{
          borderRadius: 22,
          padding: "22px 24px",
          background: panelBg,
          border: panelBorder,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        {/* 카운터 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: "clamp(32px, 5vw, 46px)",
                fontWeight: 800,
                color: goldColor,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {displayCount.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: textMain }}>개</span>
          </div>
          <span style={{ fontSize: 13, color: textSoft, fontWeight: 500 }}>
            지금까지 설계된 이름
          </span>
        </div>

        {/* 전문가 검수 뱃지 2개 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { icon: "✦", label: "AI + 전문 작명가 검수" },
            { icon: "🔒", label: "개인정보 비공개 보장" },
            { icon: "🌐", label: "글로벌 표기 동시 설계" },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${isLight ? "rgba(160,120,60,0.30)" : "rgba(201,168,76,0.35)"}`,
                background: isLight ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.07)",
                fontSize: 12,
                fontWeight: 700,
                color: isLight ? "rgba(120,80,10,0.85)" : goldColor,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 11 }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ─ 사용자 후기 슬라이더 ─ */}
      <div
        style={{
          borderRadius: 22,
          padding: "22px 24px",
          background: panelBg,
          border: panelBorder,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: goldColor,
                textTransform: "uppercase",
              }}
            >
              사용자 후기
            </span>
            <span
              style={{
                fontSize: 11,
                color: textSoft,
                padding: "2px 8px",
                borderRadius: 999,
                border: `1px solid ${isLight ? "rgba(160,120,60,0.20)" : "rgba(200,218,248,0.15)"}`,
              }}
            >
              {reviewIdx + 1} / {REVIEWS.length}
            </span>
          </div>

          {/* 화살표 */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["←", "→"] as const).map((arrow, idx) => (
              <button
                key={arrow}
                type="button"
                onClick={idx === 0 ? prev : next}
                aria-label={idx === 0 ? "이전 후기" : "다음 후기"}
                style={{
                  width: 30, height: 30,
                  borderRadius: "50%",
                  border: `1px solid ${isLight ? "rgba(160,120,60,0.25)" : "rgba(200,218,248,0.18)"}`,
                  background: "transparent",
                  color: textSoft,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>

        {/* 별점 */}
        <div style={{ color: goldColor, fontSize: 13, marginBottom: 10, letterSpacing: 2 }}>
          {"★".repeat(review.stars)}
        </div>

        {/* 후기 본문 */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.82,
            color: textMain,
            margin: "0 0 14px",
            minHeight: 60,
          }}
        >
          &ldquo;{review.body}&rdquo;
        </p>

        {/* 하단: 이름 + 태그 + 날짜 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: textMain }}>
            {review.name}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 999,
              background: isLight ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.1)",
              border: `1px solid ${isLight ? "rgba(160,120,60,0.22)" : "rgba(201,168,76,0.28)"}`,
              color: isLight ? "rgba(120,80,10,0.8)" : goldColor,
              fontWeight: 600,
            }}
          >
            {review.tag}
          </span>
          <span style={{ fontSize: 11, color: textSoft, marginLeft: "auto" }}>
            {review.date}
          </span>
        </div>

        {/* 진행 바 */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            height: 2,
            width: `${((reviewIdx + 1) / REVIEWS.length) * 100}%`,
            background: `linear-gradient(90deg, ${goldColor}, rgba(201,168,76,0.4))`,
            transition: "width 0.4s ease",
            borderRadius: "0 2px 0 0",
          }}
        />
      </div>
    </div>
  );
}
