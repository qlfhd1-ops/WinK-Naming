"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import WinkMark from "@/components/WinkMark";
import { PLAQUES, PLAQUE_KEYS, LIGHT_PLAQUE_KEYS, OHAENG_COLORS, type PlaqueKey } from "@/lib/plaques";

export interface NameCardData {
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  meaning: string;
  english: string;
  chinese: string;
  chinese_pinyin: string;
  japanese_kana: string;
  japanese_reading: string;
  score?: number;
}

interface Props {
  data: NameCardData;
  lang?: string;
  onClose: () => void;
}

export default function MultiLangNameCard({ data, lang = "ko", onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [plaqueKey, setPlaqueKey] = useState<PlaqueKey>("giwa");
  // closing: true → opacity 0 트랜지션 시작, onTransitionEnd에서 onClose() 호출
  const [closing, setClosing] = useState(false);
  // 중복 호출 방지
  const closingRef = useRef(false);

  const isKo = lang === "ko";
  const koreanRomanized = data.english || data.name;
  const plaque = PLAQUES[plaqueKey];
  const isLight = LIGHT_PLAQUE_KEYS.includes(plaqueKey);
  const textPrimary = isLight ? "#1D1B18" : "#F3EEE4";
  const textSecondary = isLight ? "rgba(29,27,24,0.65)" : "rgba(243,238,228,0.65)";
  const panelBg = isLight ? "rgba(29,27,24,0.045)" : "rgba(255,255,255,0.04)";
  const panelBorder = isLight ? "rgba(29,27,24,0.10)" : "rgba(255,255,255,0.08)";
  const panelHeaderBg = isLight ? "rgba(29,27,24,0.05)" : `${plaque.ink}14`;

  // 마운트 시 body 스크롤 잠금, 언마운트 시 복원
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    if (closingRef.current) return; // 중복 방지
    closingRef.current = true;

    // 포커스 해제 → button outline artifact 방지
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setClosing(true);
    // onTransitionEnd 미발생 안전망 (300ms fallback)
    const timer = setTimeout(onClose, 300);
    overlayRef.current?.addEventListener(
      "transitionend",
      () => { clearTimeout(timer); onClose(); },
      { once: true }
    );
  }

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: plaqueKey === "sagye" ? "#F0F8FF" : isLight ? "#FBF8F2" : "#0B1634",
      });
      const link = document.createElement("a");
      link.download = `wink_namecard_${data.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("[namecard download]", e);
    } finally {
      setDownloading(false);
      // html-to-image가 body에 남긴 숨겨진 iframe·canvas 정리
      document.querySelectorAll<HTMLElement>(
        "body > iframe[style*='visibility:hidden'], body > canvas[style*='display:none']"
      ).forEach((el) => el.remove());
    }
  }

  async function handleShare() {
    const text = [
      `✦ ${data.name}${data.hanja ? ` (${data.hanja})` : ""}`,
      data.meaning ? `"${data.meaning}"` : "",
      `🇰🇷 ${koreanRomanized}`,
      data.chinese_pinyin ? `🇨🇳 ${data.chinese_pinyin}` : "",
      data.japanese_kana ? `🇯🇵 ${data.japanese_kana}` : "",
      "\n윙크 네이밍 — wink-naming.com",
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        // 닫히는 중: 완전 투명 + 클릭·터치 차단
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
        transition: "opacity 0.22s ease",
        outline: "none",
        // isolation: contain으로 자식 border/shadow가 overlay 밖으로 번지지 않도록
        isolation: "isolate",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "100%",
          maxWidth: 420,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 카드 스타일 선택 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%" }}>
          {PLAQUE_KEYS.map((key) => {
            const p = PLAQUES[key];
            const active = key === plaqueKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlaqueKey(key)}
                style={{
                  padding: "8px 2px",
                  borderRadius: 10,
                  background: active ? p.frame : "rgba(255,255,255,0.08)",
                  border: active ? `1px solid ${p.frame}` : "1px solid rgba(255,255,255,0.14)",
                  color: active ? (key === "kkot" ? "#FFFFFF" : p.ink) : "rgba(230,230,230,0.65)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ fontSize: 12, flexShrink: 0 }}>{p.badge}</span>
                {p.label}
              </button>
            );
          })}
        </div>

        {/* ── 카드 본체 (다운로드 대상) ── */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            background: plaque.bg,
            border: `1px solid ${plaque.line}`,
            boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08)",
            fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
          }}
        >
          {/* 질감 패턴 오버레이 */}
          {plaque.pattern !== "none" && (
            <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: plaque.pattern, pointerEvents: "none" }} />
          )}

          {/* 상단 라인 */}
          <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${plaque.frame}, transparent)`, position: "relative" }} />

          {/* 브랜드 헤더: 좌측 WINK Mark / 우측 한자 배지 */}
          <div style={{
            padding: "18px 24px 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WinkMark size={24} />
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: plaque.sub, fontWeight: 700, textTransform: "uppercase" }}>
                WINK NAMING
              </div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: plaque.frame, color: "#F3EEE4",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, flexShrink: 0,
            }}>
              {plaque.badge}
            </div>
          </div>

          {/* 메인 이름 */}
          <div style={{ padding: "22px 28px 0", textAlign: "center", position: "relative" }}>
            <div style={{
              fontSize: "clamp(52px, 13vw, 80px)",
              fontWeight: 900,
              color: plaque.ink,
              letterSpacing: "0.08em",
              lineHeight: 1.1,
              textShadow: isLight ? "none" : `0 2px 32px ${plaque.ink}2e`,
              fontFamily: "serif",
            }}>
              {data.name}
            </div>
            {koreanRomanized && koreanRomanized !== data.name && (
              <div style={{ fontSize: 13, color: plaque.sub, fontWeight: 600, letterSpacing: "0.12em", marginTop: 6 }}>
                {koreanRomanized}
              </div>
            )}

            {data.hanja && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 22, letterSpacing: "0.18em", color: plaque.sub, fontFamily: "serif" }}>
                  {data.hanja}
                </div>
                {data.hanja_meaning && (
                  <div style={{ fontSize: 11, color: textSecondary, marginTop: 4, letterSpacing: "0.06em" }}>
                    {data.hanja_meaning}
                  </div>
                )}
              </div>
            )}

            <div style={{
              margin: "20px auto", height: 1, width: 80,
              background: `linear-gradient(90deg, transparent, ${plaque.line}, transparent)`,
            }} />

            {data.meaning && (
              <div style={{
                fontSize: 13, color: textPrimary,
                lineHeight: 1.7, fontStyle: "italic",
                padding: "0 8px", marginBottom: 22, opacity: 0.88,
              }}>
                &ldquo;{data.meaning.length > 60 ? data.meaning.slice(0, 58) + "…" : data.meaning}&rdquo;
              </div>
            )}
          </div>

          {/* 다국어 발음 그리드 */}
          <div style={{ padding: "0 20px 18px", position: "relative" }}>
            <div style={{
              background: panelBg, borderRadius: 16,
              border: `1px solid ${panelBorder}`, overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 16px",
                background: panelHeaderBg,
                borderBottom: `1px solid ${panelBorder}`,
                fontSize: 10, letterSpacing: "0.15em",
                color: plaque.sub, fontWeight: 700, textTransform: "uppercase",
              }}>
                {isKo ? "다국어 발음" : "Global Pronunciation"}
              </div>

              {[
                { flag: "🇰🇷", label: isKo ? "한국어" : "Korean",  main: data.name,              sub: koreanRomanized !== data.name ? koreanRomanized : "" },
                { flag: "🇺🇸", label: isKo ? "영어"   : "English", main: data.english || "—",    sub: "" },
                { flag: "🇨🇳", label: isKo ? "중국어" : "Chinese", main: data.chinese || "—",    sub: data.chinese_pinyin || "" },
                { flag: "🇯🇵", label: isKo ? "일본어" : "Japanese",main: data.japanese_kana || "—", sub: data.japanese_reading || "" },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${panelBorder}` : "none",
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{row.flag}</span>
                  <span style={{ fontSize: 11, color: plaque.sub, fontWeight: 600, width: 52, flexShrink: 0, letterSpacing: "0.04em" }}>
                    {row.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>{row.main}</span>
                    {row.sub && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: plaque.sub, fontStyle: "italic" }}>
                        {row.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오행 밸런스 미니 바 */}
          <div style={{ padding: "0 28px 14px", position: "relative" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", color: textSecondary, marginBottom: 6, textTransform: "uppercase" }}>
              {isKo ? "오행 밸런스 · 목화토금수" : "Five Elements Balance"}
            </div>
            <div style={{ display: "flex", gap: 3, height: 5, borderRadius: 4, overflow: "hidden" }}>
              {Object.values(OHAENG_COLORS).map((c) => (
                <div key={c} style={{ flex: 1, background: c, opacity: 0.85 }} />
              ))}
            </div>
          </div>

          {/* 하단: QR 영역(예약) + 브랜드 */}
          <div style={{
            padding: "10px 28px 20px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
            borderTop: `1px solid ${panelBorder}`,
            position: "relative",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              border: `1px dashed ${plaque.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, color: textSecondary, letterSpacing: "0.04em",
            }}>
              QR
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: plaque.sub, letterSpacing: "0.12em" }}>
                wink-naming.com
              </div>
              {data.score && (
                <div style={{
                  marginTop: 4,
                  fontSize: 10, color: plaque.sub,
                  background: panelBg, border: `1px solid ${panelBorder}`,
                  borderRadius: 99, padding: "3px 10px", fontWeight: 700, letterSpacing: "0.06em",
                  display: "inline-block",
                }}>
                  ✦ {data.score}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${plaque.frame}, transparent)`, position: "relative" }} />
        </div>

        {/* ── 버튼 영역 ── */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 12,
              background: "linear-gradient(135deg,#C9A84C,#a87c2a)",
              color: "#0B1634", fontWeight: 800, fontSize: 14,
              border: "none",
              cursor: downloading ? "not-allowed" : "pointer",
              opacity: downloading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {downloading ? "저장 중..." : "⬇ 이미지 저장"}
          </button>

          <button
            type="button"
            onClick={handleShare}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 12,
              background: "rgba(201,168,76,0.12)", color: "#C9A84C",
              fontWeight: 700, fontSize: 14,
              border: "1px solid rgba(201,168,76,0.35)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {copied ? "✓ 복사됨" : "↗ 공유하기"}
          </button>
        </div>

        {/* 닫기 */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            background: "none", border: "none", outline: "none",
            color: "rgba(200,215,240,0.45)",
            fontSize: 13, cursor: "pointer", letterSpacing: "0.06em",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ✕ {isKo ? "닫기" : "Close"}
        </button>
      </div>
    </div>
  );
}
