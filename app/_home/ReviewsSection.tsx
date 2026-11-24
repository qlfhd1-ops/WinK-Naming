"use client";

import { useEffect, useState } from "react";
import { type HomeCopy } from "./home-copy";
import { type Lang } from "./lang";
import { REVIEWS_GENERAL_PAGE_SIZE, REVIEWS_UI_BY_LANG, type RealReview } from "./reviews-copy";

// ── 고객 후기 데이터 (실제 DB 후기 전용 — 가짜/하드코딩 후기 없음) ──
/** ISO 날짜 문자열 → "2026.10" 형식 */
export function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}.${m}`;
}

// ── 고객 후기 섹션 (베스트 고정 + 누적 실제 후기, 가짜 데이터 없음) ──
export function ReviewsSection({ copy, lang }: { copy: HomeCopy; lang: Lang }) {
  const t = REVIEWS_UI_BY_LANG[lang] ?? REVIEWS_UI_BY_LANG.en;
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  const [bestReviews, setBestReviews] = useState<RealReview[]>([]);
  const [generalReviews, setGeneralReviews] = useState<RealReview[]>([]);
  const [generalTotal, setGeneralTotal] = useState(0);
  const [generalPage, setGeneralPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/reviews/featured?best=1").then((r) => r.json()),
      fetch(`/api/reviews/featured?all=1&page=1&pageSize=${REVIEWS_GENERAL_PAGE_SIZE}`).then((r) => r.json()),
    ])
      .then(([bestData, allData]) => {
        if (cancelled) return;
        if (bestData?.ok) setBestReviews(bestData.reviews ?? []);
        if (allData?.ok) {
          setGeneralReviews(allData.reviews ?? []);
          setGeneralTotal(allData.total ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = () => {
    const nextPage = generalPage + 1;
    setLoadingMore(true);
    fetch(`/api/reviews/featured?all=1&page=${nextPage}&pageSize=${REVIEWS_GENERAL_PAGE_SIZE}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        setGeneralReviews((prev) => [...prev, ...(data.reviews ?? [])]);
        setGeneralPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const hasMore = generalReviews.length < generalTotal;
  const isEmpty = !loading && bestReviews.length === 0 && generalReviews.length === 0;

  const renderReply = (reply: RealReview["reply"], light: boolean) => {
    if (!reply) return null;
    return (
      <div
        className="lg-review-reply"
        style={{ background: light ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.1)" }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: "#C9A84C", marginBottom: 4, letterSpacing: "0.04em" }}>
          ✓ {t.teamReply}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: light ? "#444" : "rgba(255,255,255,0.85)" }}>
          {reply.content}
        </div>
      </div>
    );
  };

  return (
    <section style={{ background: "#FAFAF8", padding: "72px 0" }}>
      <div className="lg-section">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            REVIEWS · 고객 후기
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(22px,2.6vw,34px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {copy.reviewsTitle}
          </h2>
        </div>

        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#FFFFFF", border: "1px solid #EAEAEA", borderRadius: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1B2A5E", marginBottom: 8, fontFamily: serif }}>
              {t.emptyTitle}
            </div>
            <div style={{ fontSize: 14, color: "#777", marginBottom: 20, lineHeight: 1.7 }}>
              {t.emptyDesc}
            </div>
            <button
              type="button"
              className="lg-cta-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {t.emptyCta}
            </button>
          </div>
        ) : (
          <>
            {/* 베스트 영역 (최대 2개) */}
            {bestReviews.length > 0 && (
              <div className="lg-review-best-grid" style={{ marginBottom: 32 }}>
                {bestReviews.map((r) => (
                  <div key={r.id} className="lg-review-best-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 20, padding: "3px 10px" }}>
                        ✦ {t.bestBadge}
                      </span>
                      <span style={{ fontSize: 15, color: "#C9A84C", letterSpacing: 2 }}>{"★".repeat(r.rating)}</span>
                    </div>
                    <div style={{ fontSize: 19, color: "#F3EEE4", lineHeight: 1.8, fontStyle: "italic", marginBottom: 16 }}>
                      &ldquo;{r.content}&rdquo;
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
                        {r.display_name || t.guestFallback}
                      </span>
                      {(r.name_used || r.country) && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                          · {r.name_used || r.country}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>
                        {formatReviewDate(r.created_at)}
                      </span>
                    </div>
                    {renderReply(r.reply, false)}
                  </div>
                ))}
              </div>
            )}

            {/* 일반 영역 (누적, 최신순) */}
            {generalReviews.length > 0 && (
              <div className="lg-reviews-grid">
                {generalReviews.map((r) => (
                  <div key={r.id} className="lg-review-grid-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1B2A5E" }}>
                        {r.display_name || t.guestFallback}
                      </span>
                      {(r.name_used || r.country) && (
                        <span style={{ fontSize: 12, color: "#888" }}> · {r.name_used || r.country}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 16, color: "#333333", lineHeight: 1.8, fontStyle: "italic", marginBottom: 14 }}>
                      &ldquo;{r.content}&rdquo;
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: r.reply ? 10 : 0 }}>
                      <div style={{ fontSize: 15, color: "#C9A84C", letterSpacing: 2 }}>{"★".repeat(r.rating)}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{formatReviewDate(r.created_at)}</div>
                    </div>
                    {renderReply(r.reply, true)}
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <button
                type="button"
                className="lg-reviews-loadmore"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "..." : t.loadMore}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
