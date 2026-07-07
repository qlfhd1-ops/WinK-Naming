"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import {
  getShortlist,
  removeFromShortlist,
  clearShortlist,
  updateMemo,
  type ShortlistItem,
} from "@/lib/shortlist";
import { trackEvent } from "@/components/GoogleAnalytics";

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
    memoPlaceholder: "메모를 남겨보세요 (장단점, 팀 의견, 검토 사항...)",
    memoSaved: "저장됨",
    compareMode: "비교 모드",
    compareExit: "목록으로",
    compareSelect: "비교할 이름 선택 (2~3개)",
    compareBtn: "비교하기",
    compareMax: "최대 3개까지 선택 가능합니다.",
    compareTitle: "이름 비교",
    rowName: "이름",
    rowHanja: "한자",
    rowMeaning: "의미",
    rowTrack: "트랙",
    rowScore: "점수",
    rowElements: "오행",
    rowStrokes: "획수",
    rowSyllables: "음절",
    rowFitReason: "선정 이유",
    rowMemo: "메모",
    none: "—",
    exportPng: "이미지 저장",
    exporting: "저장 중...",
    share: "공유 링크",
    sharing: "링크 생성 중...",
    shareCopied: "링크 복사됨!",
    shareError: "공유 링크 생성 실패",
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
    memoPlaceholder: "Add a note (pros, cons, team opinion...)",
    memoSaved: "Saved",
    compareMode: "Compare",
    compareExit: "Back to list",
    compareSelect: "Select 2–3 names to compare",
    compareBtn: "Compare",
    compareMax: "Max 3 names can be selected.",
    compareTitle: "Name Comparison",
    rowName: "Name",
    rowHanja: "Hanja",
    rowMeaning: "Meaning",
    rowTrack: "Track",
    rowScore: "Score",
    rowElements: "5 Elements",
    rowStrokes: "Strokes",
    rowSyllables: "Syllables",
    rowFitReason: "Why This Track",
    rowMemo: "Memo",
    none: "—",
    exportPng: "Save as Image",
    exporting: "Saving...",
    share: "Share Link",
    sharing: "Creating link...",
    shareCopied: "Link copied!",
    shareError: "Failed to create share link",
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

// ── 비교 테이블 ────────────────────────────────────────────────────────────────

function CompareTable({
  items,
  ui,
}: {
  items: ShortlistItem[];
  ui: (typeof COPY)[UiLang];
}) {
  const COL_W = Math.max(160, Math.floor(560 / items.length));

  const rows: { label: string; render: (item: ShortlistItem) => string }[] = [
    {
      label: ui.rowName,
      render: (item) =>
        item.name + (item.english && item.english !== item.name ? ` / ${item.english}` : ""),
    },
    {
      label: ui.rowHanja,
      render: (item) =>
        item.hanja
          ? item.hanja + (item.hanja_meaning ? ` (${item.hanja_meaning})` : "")
          : ui.none,
    },
    { label: ui.rowMeaning, render: (item) => item.meaning || ui.none },
    { label: ui.rowTrack,   render: (item) => trackLabel(item.track, ui) },
    { label: ui.rowScore,   render: (item) => item.score ? String(item.score) : ui.none },
    {
      label: ui.rowElements,
      render: (item) => item.five_elements ? item.five_elements.split("—")[0].trim() : ui.none,
    },
    {
      label: ui.rowStrokes,
      render: (item) =>
        item.hanja_strokes
          ? (item.hanja_strokes.split("=")[1]?.trim() ?? item.hanja_strokes.slice(0, 20))
          : ui.none,
    },
    {
      label: ui.rowSyllables,
      render: (item) =>
        /^[\uAC00-\uD7A3]+$/.test(item.name) ? `${item.name.length}음절` : ui.none,
    },
    { label: ui.rowFitReason, render: (item) => item.fit_reason || ui.none },
    { label: ui.rowMemo,      render: (item) => item.memo || ui.none },
  ];

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{
        borderCollapse: "collapse",
        minWidth: COL_W * (items.length + 1),
        width: "100%",
        fontSize: 13,
      }}>
        <thead>
          <tr>
            {/* 항목 헤더 열 */}
            <th style={thStyle(80, true)}></th>
            {items.map((item, i) => (
              <th key={item.id} style={thStyle(COL_W, false)}>
                <span style={{
                  fontSize: 11, color: "rgba(201,168,76,0.60)", fontWeight: 700,
                  display: "block", marginBottom: 4,
                }}>
                  #{i + 1}
                </span>
                <span style={{
                  fontSize: 20, fontWeight: 900, color: "var(--text-main)",
                  fontFamily: "serif", letterSpacing: "0.06em",
                }}>
                  {item.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td style={labelCellStyle}>{row.label}</td>
              {items.map((item) => (
                <td key={item.id} style={valueCellStyle(row.label === ui.rowMeaning || row.label === ui.rowFitReason || row.label === ui.rowMemo)}>
                  {row.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = (w: number, isLabel: boolean): React.CSSProperties => ({
  padding: "14px 12px",
  textAlign: isLabel ? "left" : "center",
  width: w,
  minWidth: w,
  background: "rgba(120,160,255,0.05)",
  borderBottom: "2px solid rgba(120,160,255,0.14)",
  fontWeight: 700,
  color: "var(--text-main)",
  verticalAlign: "bottom",
});

const labelCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(180,200,240,0.50)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: "1px solid rgba(120,160,255,0.08)",
  background: "rgba(120,160,255,0.03)",
};

const valueCellStyle = (wrap: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  color: "rgba(200,215,245,0.80)",
  fontSize: 13,
  lineHeight: 1.6,
  textAlign: "center",
  verticalAlign: "top",
  borderBottom: "1px solid rgba(120,160,255,0.08)",
  whiteSpace: wrap ? "normal" : "nowrap",
  maxWidth: wrap ? 220 : undefined,
  wordBreak: wrap ? "keep-all" : undefined,
});

// ── 메인 페이지 ────────────────────────────────────────────────────────────────

export default function ShortlistPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];

  const exportRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [memoSavedId, setMemoSavedId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(getShortlist());
  }, []);

  function handleRemove(id: string) {
    removeFromShortlist(id);
    setItems(getShortlist());
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleClearAll() {
    clearShortlist();
    setItems([]);
    setSelectedIds(new Set());
    setCompareMode(false);
    setShowCompare(false);
  }

  function handleMemoChange(id: string, memo: string) {
    updateMemo(id, memo);
    setItems(getShortlist());
    setMemoSavedId(id);
    setTimeout(() => setMemoSavedId(null), 1500);
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else if (s.size < 3) {
        s.add(id);
      }
      return s;
    });
  }

  async function handleExportPng() {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        backgroundColor: "#0B1634",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `wink-shortlist-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      trackEvent("shortlist_exported", { count: items.length });
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShare() {
    if (isSharing || items.length === 0) return;
    setIsSharing(true);
    setShareMsg(null);
    try {
      const res = await fetch("/api/shortlist-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, lang: rawLang }),
      });
      const data = await res.json();
      if (!data.ok || !data.token) throw new Error("no token");
      const shareUrl = `${window.location.origin}/${lang}/shortlist/share/${data.token}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg(ui.shareCopied);
      trackEvent("shortlist_shared", { count: items.length });
    } catch {
      setShareMsg(ui.shareError);
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareMsg(null), 3000);
    }
  }

  function handleCopyAll() {
    const text = items.map((item, i) => {
      const lines = [
        `${i + 1}. ${item.name}${item.hanja ? ` (${item.hanja})` : ""}`,
        item.meaning ? `   의미: ${item.meaning}` : "",
        item.english && item.english !== item.name ? `   로마자: ${item.english}` : "",
        item.five_elements ? `   오행: ${item.five_elements.split("—")[0].trim()}` : "",
        item.story ? `   설명: ${item.story.slice(0, 80)}…` : "",
        item.memo ? `   메모: ${item.memo}` : "",
      ].filter(Boolean);
      return lines.join("\n");
    }).join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const compareItems = items.filter(it => selectedIds.has(it.id));

  // ── 비교 화면 ──────────────────────────────────────────────────────────────

  if (showCompare && compareItems.length >= 2) {
    return (
      <main style={{ minHeight: "100vh", padding: "24px 16px 80px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowCompare(false)}
            style={{
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: "1px solid rgba(120,160,255,0.22)",
              background: "rgba(120,160,255,0.06)",
              color: "rgba(180,200,240,0.75)",
              padding: "8px 16px", borderRadius: 10, marginBottom: 20,
            }}
          >
            ← {ui.compareExit}
          </button>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 99,
            border: "1px solid rgba(201,168,76,0.35)",
            color: "rgba(201,168,76,0.85)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12,
          }}>
            {ui.chip}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-main)", marginBottom: 4 }}>
            {ui.compareTitle}
          </h1>
          <p style={{ fontSize: 12, color: "rgba(180,200,240,0.40)" }}>
            {compareItems.length}개 이름 비교
          </p>
        </div>

        <div style={{
          borderRadius: 18, overflow: "hidden",
          border: "1px solid rgba(120,160,255,0.14)",
          background: "var(--bg-panel)",
        }}>
          <CompareTable items={compareItems} ui={ui} />
        </div>
      </main>
    );
  }

  // ── 목록 화면 ──────────────────────────────────────────────────────────────

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
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopyAll}
              style={{
                flex: 1, minWidth: 100, padding: "11px 0", borderRadius: 12,
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
              onClick={() => {
                setCompareMode(m => !m);
                setSelectedIds(new Set());
              }}
              style={{
                flex: 1, minWidth: 100, padding: "11px 0", borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: compareMode
                  ? "1px solid rgba(201,168,76,0.50)"
                  : "1px solid rgba(201,168,76,0.25)",
                background: compareMode
                  ? "rgba(201,168,76,0.15)"
                  : "rgba(201,168,76,0.05)",
                color: "rgba(201,168,76,0.85)",
              }}
            >
              {compareMode ? `✓ ${ui.compareMode}` : `⚖ ${ui.compareMode}`}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              style={{
                flex: 1, minWidth: 100, padding: "11px 0", borderRadius: 12,
                fontSize: 13, fontWeight: 700,
                cursor: isSharing ? "default" : "pointer",
                border: "1px solid rgba(120,180,255,0.28)",
                background: "rgba(120,180,255,0.06)",
                color: "rgba(140,190,255,0.80)",
                opacity: isSharing ? 0.6 : 1,
              }}
            >
              {isSharing ? ui.sharing : `🔗 ${ui.share}`}
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              style={{
                padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: isExporting ? "default" : "pointer",
                border: "1px solid rgba(180,160,255,0.25)",
                background: "rgba(180,160,255,0.06)", color: "rgba(180,160,255,0.75)",
                opacity: isExporting ? 0.6 : 1,
              }}
            >
              {isExporting ? ui.exporting : `🖼 ${ui.exportPng}`}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: "pointer", border: "1px solid rgba(220,80,80,0.25)",
                background: "rgba(220,80,80,0.06)", color: "rgba(220,120,120,0.75)",
              }}
            >
              {ui.clearAll}
            </button>
          </div>

          {/* 비교 모드 안내 + 실행 버튼 */}
          {compareMode && (
            <div style={{
              marginBottom: 16, padding: "12px 16px", borderRadius: 12,
              background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.20)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 13, color: "rgba(201,168,76,0.80)" }}>
                {selectedIds.size === 0
                  ? ui.compareSelect
                  : selectedIds.size >= 3
                  ? ui.compareMax
                  : `${selectedIds.size}개 선택됨`}
              </span>
              {selectedIds.size >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("compare_opened", { count: selectedIds.size });
                    setShowCompare(true);
                  }}
                  style={{
                    padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 800,
                    cursor: "pointer", border: "none",
                    background: "linear-gradient(135deg,#C9A84C,#a87c2a)",
                    color: "#0B1634",
                  }}
                >
                  {ui.compareBtn} →
                </button>
              )}
            </div>
          )}

          {copied && (
            <div style={{
              marginBottom: 12, padding: "10px 16px", borderRadius: 10,
              background: "rgba(120,200,160,0.10)", border: "1px solid rgba(120,200,160,0.25)",
              fontSize: 13, color: "rgba(120,200,160,0.85)",
            }}>
              ✓ {ui.copyHint}
            </div>
          )}

          {shareMsg && (
            <div style={{
              marginBottom: 12, padding: "10px 16px", borderRadius: 10,
              background: shareMsg === ui.shareCopied
                ? "rgba(120,180,255,0.10)" : "rgba(220,80,80,0.08)",
              border: shareMsg === ui.shareCopied
                ? "1px solid rgba(120,180,255,0.25)" : "1px solid rgba(220,80,80,0.20)",
              fontSize: 13,
              color: shareMsg === ui.shareCopied
                ? "rgba(140,190,255,0.85)" : "rgba(220,120,120,0.85)",
            }}>
              {shareMsg === ui.shareCopied ? "🔗 " : "⚠ "}{shareMsg}
            </div>
          )}

          {/* 숏리스트 카드들 */}
          <div ref={exportRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item, idx) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <article
                  key={item.id}
                  style={{
                    borderRadius: 18, overflow: "hidden",
                    border: isSelected
                      ? "1.5px solid rgba(201,168,76,0.55)"
                      : "1px solid rgba(120,160,255,0.14)",
                    background: isSelected
                      ? "rgba(201,168,76,0.04)"
                      : "var(--bg-panel)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(201,168,76,0.08)"
                      : "0 4px 16px rgba(0,0,0,0.08)",
                    cursor: compareMode ? "pointer" : "default",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onClick={compareMode ? () => toggleSelect(item.id) : undefined}
                >
                  <div style={{ padding: "18px 18px 0" }}>
                    {/* 상단: 번호 + 트랙 + 날짜 + 선택 체크 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {compareMode && (
                          <span style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            border: isSelected
                              ? "2px solid rgba(201,168,76,0.80)"
                              : "2px solid rgba(180,200,240,0.25)",
                            background: isSelected ? "rgba(201,168,76,0.80)" : "transparent",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, color: "#0B1634", fontWeight: 900,
                          }}>
                            {isSelected ? "✓" : ""}
                          </span>
                        )}
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

                  {/* 메모 입력 — 비교 모드일 때 클릭 이벤트 버블링 방지 */}
                  <div
                    style={{ padding: "0 18px 10px" }}
                    onClick={(e) => compareMode && e.stopPropagation()}
                  >
                    <div style={{ position: "relative" }}>
                      <textarea
                        rows={2}
                        defaultValue={item.memo ?? ""}
                        placeholder={ui.memoPlaceholder}
                        onBlur={(e) => handleMemoChange(item.id, e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "9px 12px", borderRadius: 10,
                          background: "rgba(120,160,255,0.05)",
                          border: "1px solid rgba(120,160,255,0.14)",
                          color: "rgba(200,215,245,0.80)",
                          fontSize: 12, lineHeight: 1.6, resize: "none",
                          outline: "none", fontFamily: "inherit",
                        }}
                      />
                      {memoSavedId === item.id && (
                        <span style={{
                          position: "absolute", bottom: 8, right: 10,
                          fontSize: 10, color: "rgba(120,200,160,0.80)", fontWeight: 700,
                        }}>
                          ✓ {ui.memoSaved}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <div
                    style={{ padding: "4px 18px 14px" }}
                    onClick={(e) => compareMode && e.stopPropagation()}
                  >
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
              );
            })}
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
