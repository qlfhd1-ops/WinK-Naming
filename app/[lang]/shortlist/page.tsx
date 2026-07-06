"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import {
  getShortlist,
  removeFromShortlist,
  clearShortlist,
  type ShortlistItem,
} from "@/lib/shortlist";

const COPY = {
  ko: {
    chip: "Wink Shortlist",
    title: "숏리스트",
    sub: "저장한 이름 후보들을 비교하고 최종 선택을 준비하세요.",
    empty: "저장된 이름이 없습니다.",
    goNaming: "이름 설계하러 가기",
    remove: "삭제",
    clearAll: "전체 삭제",
    copy: "전체 복사",
    copied: "복사됨!",
    copyHint: "클립보드에 복사해 팀과 공유하세요.",
    saved: "저장일",
    meaning: "의미",
    track: "트랙",
    score: "점수",
    fiveElements: "오행",
    strokes: "획수",
    phonetic: "음운 조화",
    fitReason: "선정 이유",
    trackSafe: "안정형",
    trackRefined: "세련형",
    trackCreative: "창의형",
    compareNote: "최대 20개까지 저장됩니다.",
  },
  en: {
    chip: "Wink Shortlist",
    title: "Shortlist",
    sub: "Compare your saved name candidates and prepare to finalize.",
    empty: "No saved names yet.",
    goNaming: "Go to Naming",
    remove: "Remove",
    clearAll: "Clear All",
    copy: "Copy All",
    copied: "Copied!",
    copyHint: "Copy to clipboard and share with your team.",
    saved: "Saved",
    meaning: "Meaning",
    track: "Track",
    score: "Score",
    fiveElements: "5 Elements",
    strokes: "Strokes",
    phonetic: "Phonetic Harmony",
    fitReason: "Why This Track",
    trackSafe: "Stable",
    trackRefined: "Refined",
    trackCreative: "Creative",
    compareNote: "Up to 20 names can be saved.",
  },
} as const;

type UiLang = keyof typeof COPY;
function toUiLang(l: string): UiLang {
  return l in COPY ? (l as UiLang) : "ko";
}

function trackLabel(track: string, ui: (typeof COPY)[UiLang]) {
  if (track === "safe") return ui.trackSafe;
  if (track === "refined") return ui.trackRefined;
  return ui.trackCreative;
}

function formatDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
      month: "short", day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function ShortlistPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setItems(getShortlist());
  }, []);

  function handleRemove(id: string) {
    removeFromShortlist(id);
    setItems(getShortlist());
  }

  function handleClearAll() {
    clearShortlist();
    setItems([]);
  }

  function handleCopyAll() {
    const text = items.map((item, i) => {
      const lines = [
        `${i + 1}. ${item.name}${item.hanja ? ` (${item.hanja})` : ""}`,
        item.meaning ? `   의미: ${item.meaning}` : "",
        item.english && item.english !== item.name ? `   로마자: ${item.english}` : "",
        item.five_elements ? `   오행: ${item.five_elements.split("—")[0].trim()}` : "",
        item.story ? `   설명: ${item.story.slice(0, 80)}…` : "",
      ].filter(Boolean);
      return lines.join("\n");
    }).join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px 60px", maxWidth: 680, margin: "0 auto" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", borderRadius: 99,
          border: "1px solid rgba(201,168,76,0.35)",
          color: "rgba(201,168,76,0.85)", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
        }}>
          {ui.chip}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--text-main)" }}>
          {ui.title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          {ui.sub}
        </p>
        <p style={{ fontSize: 12, color: "rgba(180,200,240,0.40)" }}>{ui.compareNote}</p>
      </div>

      {items.length === 0 ? (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          border: "1px solid rgba(120,160,255,0.12)", borderRadius: 20,
          background: "var(--bg-panel)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 20 }}>{ui.empty}</div>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/category`)}
            style={{
              padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg,#C9A84C,#a87c2a)",
              color: "#0B1634", border: "none", cursor: "pointer",
            }}
          >
            {ui.goNaming}
          </button>
        </div>
      ) : (
        <>
          {/* 액션 바 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopyAll}
              style={{
                flex: 1, minWidth: 120, padding: "11px 0", borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: "1px solid rgba(120,200,160,0.35)",
                background: "rgba(120,200,160,0.08)",
                color: "rgba(120,200,160,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              {copied ? `✓ ${ui.copied}` : `📋 ${ui.copy}`}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                padding: "11px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: "pointer", border: "1px solid rgba(220,80,80,0.25)",
                background: "rgba(220,80,80,0.06)", color: "rgba(220,120,120,0.75)",
              }}
            >
              {ui.clearAll}
            </button>
          </div>

          {copied && (
            <div style={{
              marginBottom: 12, padding: "10px 16px", borderRadius: 10,
              background: "rgba(120,200,160,0.10)", border: "1px solid rgba(120,200,160,0.25)",
              fontSize: 13, color: "rgba(120,200,160,0.85)",
            }}>
              ✓ {ui.copyHint}
            </div>
          )}

          {/* 숏리스트 카드들 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item, idx) => (
              <article
                key={item.id}
                style={{
                  borderRadius: 18, overflow: "hidden",
                  border: "1px solid rgba(120,160,255,0.14)",
                  background: "var(--bg-panel)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ padding: "18px 18px 0" }}>
                  {/* 상단: 번호 + 트랙 + 날짜 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color: "rgba(201,168,76,0.70)",
                        background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.22)",
                        borderRadius: 99, padding: "2px 9px",
                      }}>
                        #{idx + 1} {trackLabel(item.track, ui)}
                      </span>
                      {item.score && (
                        <span style={{ fontSize: 11, color: "rgba(201,168,76,0.55)", fontWeight: 700 }}>
                          ✦ {item.score}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(180,200,240,0.35)" }}>
                      {formatDate(item.savedAt, rawLang)}
                    </span>
                  </div>

                  {/* 이름 */}
                  <div style={{ fontSize: 30, fontWeight: 900, color: "var(--text-main)", fontFamily: "serif", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {item.name}
                  </div>
                  {item.hanja && (
                    <div style={{ fontSize: 14, color: "rgba(201,168,76,0.70)", fontFamily: "serif", letterSpacing: "0.12em", marginBottom: 8 }}>
                      {item.hanja}
                      {item.hanja_meaning && (
                        <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.6 }}>{item.hanja_meaning}</span>
                      )}
                    </div>
                  )}

                  {/* 의미 */}
                  <div style={{ fontSize: 13, color: "rgba(200,215,245,0.72)", lineHeight: 1.65, marginBottom: 12 }}>
                    {item.meaning}
                  </div>

                  {/* 메타 칩 */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {/^[\uAC00-\uD7A3]+$/.test(item.name) && (
                      <span style={chipStyle}>🔤 {item.name.length}음절</span>
                    )}
                    {item.english && item.english !== item.name && (
                      <span style={chipStyle}>🌐 {item.english}</span>
                    )}
                    {item.five_elements && (
                      <span style={chipStyle}>⚡ {item.five_elements.split("—")[0].trim()}</span>
                    )}
                    {item.hanja_strokes && (
                      <span style={chipStyle}>✦ {item.hanja_strokes.split("=")[1]?.trim() ?? item.hanja_strokes.slice(0, 12)}</span>
                    )}
                  </div>

                  {/* fit_reason */}
                  {item.fit_reason && (
                    <div style={{
                      fontSize: 12, color: "rgba(180,200,240,0.55)", lineHeight: 1.6,
                      marginBottom: 12, padding: "8px 12px",
                      background: "rgba(120,160,255,0.05)", borderRadius: 8,
                      border: "1px solid rgba(120,160,255,0.10)",
                    }}>
                      {item.fit_reason}
                    </div>
                  )}
                </div>

                {/* 삭제 버튼 */}
                <div style={{ padding: "10px 18px 14px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    style={{
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: "1px solid rgba(220,80,80,0.20)",
                      background: "rgba(220,80,80,0.05)",
                      color: "rgba(220,120,120,0.60)",
                      padding: "6px 14px", borderRadius: 8,
                    }}
                  >
                    {ui.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* 이름 설계 CTA */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => router.push(`/${lang}/category`)}
              style={{
                padding: "13px 32px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: "rgba(201,168,76,0.10)", color: "rgba(201,168,76,0.85)",
                border: "1px solid rgba(201,168,76,0.30)", cursor: "pointer",
              }}
            >
              + {ui.goNaming}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

const chipStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
  color: "rgba(180,200,240,0.70)",
  background: "rgba(120,160,255,0.07)",
  border: "1px solid rgba(120,160,255,0.14)",
  borderRadius: 99, padding: "3px 9px",
};
