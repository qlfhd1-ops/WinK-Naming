"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

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

const LANGS = [
  { flag: "🇰🇷", label: "Korean", labelKo: "한국어", key: "korean" },
  { flag: "🇺🇸", label: "English", labelKo: "영어", key: "english" },
  { flag: "🇨🇳", label: "Chinese", labelKo: "중국어", key: "chinese" },
  { flag: "🇯🇵", label: "Japanese", labelKo: "일본어", key: "japanese" },
];

export default function MultiLangNameCard({ data, lang = "ko", onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);

  const isKo = lang === "ko";

  function handleClose() {
    // 1) 포커스 해제 (button outline artifact 방지)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // 2) fade-out 시작 → 200ms 후 실제 unmount
    setClosing(true);
    setTimeout(onClose, 200);
  }

  // 한국어 로마자: english 필드 활용 (GPT가 로마자 표기 생성)
  const koreanRomanized = data.english || data.name;

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#0B1634",
      });
      const link = document.createElement("a");
      link.download = `wink_namecard_${data.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("[namecard download]", e);
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    const text = [
      `✦ ${data.name}${data.hanja ? ` (${data.hanja})` : ""}`,
      data.meaning ? `"${data.meaning}"` : "",
      `🇰🇷 ${koreanRomanized}`,
      data.chinese_pinyin ? `🇨🇳 ${data.chinese_pinyin}` : "",
      data.japanese_kana ? `🇯🇵 ${data.japanese_kana}` : "",
      "\n윙크 네이밍 — yoonseul-naming.vercel.app",
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
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.18s ease",
        outline: "none",
      }}
      onClick={handleClose}
    >
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 카드 본체 (다운로드 대상) ── */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            background: "linear-gradient(160deg, #1B2A5E 0%, #0B1634 60%, #0d1a40 100%)",
            border: "1px solid rgba(201,168,76,0.30)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.12)",
            fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
          }}
        >
          {/* 상단 골드 라인 */}
          <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />

          {/* 브랜드 헤더 */}
          <div style={{
            padding: "20px 28px 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(201,168,76,0.65)", fontWeight: 700, textTransform: "uppercase" }}>
              WINK NAMING
            </div>
            <div style={{ fontSize: 10, color: "rgba(201,168,76,0.45)", letterSpacing: "0.1em" }}>
              Name Card
            </div>
          </div>

          {/* 메인 이름 */}
          <div style={{ padding: "24px 28px 0", textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(52px, 13vw, 80px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.08em",
              lineHeight: 1.1,
              textShadow: "0 2px 32px rgba(201,168,76,0.18)",
              fontFamily: "serif",
            }}>
              {data.name}
            </div>

            {/* 한자 */}
            {data.hanja && (
              <div style={{ marginTop: 10 }}>
                <div style={{
                  fontSize: 22,
                  letterSpacing: "0.18em",
                  color: "rgba(201,168,76,0.88)",
                  fontFamily: "serif",
                }}>
                  {data.hanja}
                </div>
                {data.hanja_meaning && (
                  <div style={{
                    fontSize: 11,
                    color: "rgba(201,168,76,0.50)",
                    marginTop: 4,
                    letterSpacing: "0.06em",
                  }}>
                    {data.hanja_meaning}
                  </div>
                )}
              </div>
            )}

            {/* 골드 구분선 */}
            <div style={{
              margin: "20px auto",
              height: 1,
              width: 80,
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)",
            }} />

            {/* 의미 한 줄 요약 */}
            {data.meaning && (
              <div style={{
                fontSize: 13,
                color: "rgba(210,222,245,0.80)",
                lineHeight: 1.7,
                fontStyle: "italic",
                padding: "0 8px",
                marginBottom: 24,
              }}>
                &ldquo;{data.meaning.length > 60 ? data.meaning.slice(0, 58) + "…" : data.meaning}&rdquo;
              </div>
            )}
          </div>

          {/* 다국어 발음 그리드 */}
          <div style={{ padding: "0 20px 24px" }}>
            <div style={{
              background: "rgba(0,0,0,0.28)",
              borderRadius: 16,
              border: "1px solid rgba(201,168,76,0.15)",
              overflow: "hidden",
            }}>
              {/* 헤더 */}
              <div style={{
                padding: "10px 16px",
                background: "rgba(201,168,76,0.08)",
                borderBottom: "1px solid rgba(201,168,76,0.12)",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "rgba(201,168,76,0.70)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}>
                {isKo ? "다국어 발음" : "Global Pronunciation"}
              </div>

              {/* 발음 행 */}
              {[
                {
                  flag: "🇰🇷",
                  label: isKo ? "한국어" : "Korean",
                  main: data.name,
                  sub: koreanRomanized !== data.name ? koreanRomanized : "",
                },
                {
                  flag: "🇺🇸",
                  label: isKo ? "영어" : "English",
                  main: data.english || "—",
                  sub: "",
                },
                {
                  flag: "🇨🇳",
                  label: isKo ? "중국어" : "Chinese",
                  main: data.chinese || "—",
                  sub: data.chinese_pinyin || "",
                },
                {
                  flag: "🇯🇵",
                  label: isKo ? "일본어" : "Japanese",
                  main: data.japanese_kana || "—",
                  sub: data.japanese_reading || "",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{row.flag}</span>
                  <span style={{
                    fontSize: 11,
                    color: "rgba(201,168,76,0.60)",
                    fontWeight: 600,
                    width: 52,
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}>
                    {row.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f4ff" }}>{row.main}</span>
                    {row.sub && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: "rgba(201,168,76,0.70)",
                        fontStyle: "italic",
                      }}>
                        {row.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 */}
          <div style={{
            padding: "14px 28px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(201,168,76,0.10)",
          }}>
            <div style={{ fontSize: 10, color: "rgba(201,168,76,0.40)", letterSpacing: "0.12em" }}>
              yoonseul-naming.vercel.app
            </div>
            {data.score && (
              <div style={{
                fontSize: 10,
                color: "rgba(201,168,76,0.55)",
                background: "rgba(201,168,76,0.10)",
                border: "1px solid rgba(201,168,76,0.22)",
                borderRadius: 99,
                padding: "3px 10px",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}>
                ✦ {data.score}
              </div>
            )}
          </div>

          {/* 하단 골드 라인 */}
          <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
        </div>

        {/* ── 버튼 영역 (다운로드 제외) ── */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg,#C9A84C,#a87c2a)",
              color: "#0B1634",
              fontWeight: 800,
              fontSize: 14,
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
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              background: "rgba(201,168,76,0.12)",
              color: "#C9A84C",
              fontWeight: 700,
              fontSize: 14,
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
          }}
        >
          ✕ {isKo ? "닫기" : "Close"}
        </button>
      </div>
    </div>
  );
}
