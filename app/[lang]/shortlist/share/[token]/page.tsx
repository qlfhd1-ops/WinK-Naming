"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupportedLang, type AppLang } from "@/lib/lang-config";
import type { ShortlistItem } from "@/lib/shortlist";
import { addToShortlist } from "@/lib/shortlist";

const COPY = {
  ko: {
    chip: "Wink Shortlist",
    title: "공유된 숏리스트",
    sub: "이름 후보 목록을 확인하고 내 숏리스트에 저장할 수 있습니다.",
    loading: "불러오는 중...",
    notFound: "링크가 만료되었거나 존재하지 않습니다.",
    goHome: "홈으로",
    saveAll: "내 숏리스트에 저장",
    saveOne: "저장",
    saved: "저장됨 ✓",
    allSaved: "전체 저장 완료!",
    expires: "만료일",
    trackSafe: "안정형",
    trackRefined: "세련형",
    trackCreative: "창의형",
    none: "—",
  },
  en: {
    chip: "Wink Shortlist",
    title: "Shared Shortlist",
    sub: "View this name candidate list and save it to your own shortlist.",
    loading: "Loading...",
    notFound: "This link has expired or does not exist.",
    goHome: "Go Home",
    saveAll: "Save All to My Shortlist",
    saveOne: "Save",
    saved: "Saved ✓",
    allSaved: "All saved!",
    expires: "Expires",
    trackSafe: "Stable",
    trackRefined: "Refined",
    trackCreative: "Creative",
    none: "—",
  },
} as const;

type UiLang = keyof typeof COPY;
function toUiLang(l: string): UiLang { return l in COPY ? (l as UiLang) : "ko"; }

function trackLabel(track: string, ui: (typeof COPY)[UiLang]) {
  if (track === "safe") return ui.trackSafe;
  if (track === "refined") return ui.trackRefined;
  return ui.trackCreative;
}

const chipStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
  color: "rgba(180,200,240,0.70)",
  background: "rgba(120,160,255,0.07)",
  border: "1px solid rgba(120,160,255,0.14)",
  borderRadius: 99, padding: "3px 9px",
};

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];
  const token = String(params.token || "");

  const [items, setItems] = useState<ShortlistItem[] | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [allSaved, setAllSaved] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/shortlist-share?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.ok || !Array.isArray(data.items)) {
          setNotFound(true);
        } else {
          setItems(data.items);
          setExpiresAt(data.expires_at ?? null);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  function handleSaveOne(item: ShortlistItem) {
    const ok = addToShortlist({
      name: item.name,
      hanja: item.hanja,
      hanja_meaning: item.hanja_meaning,
      hanja_strokes: item.hanja_strokes,
      five_elements: item.five_elements,
      phonetic_harmony: item.phonetic_harmony,
      meaning: item.meaning,
      story: item.story,
      fit_reason: item.fit_reason,
      english: item.english,
      track: item.track,
      score: item.score,
      category: item.category,
      lang: rawLang,
    });
    if (ok) setSavedIds(prev => new Set([...prev, item.id]));
  }

  function handleSaveAll() {
    if (!items) return;
    items.forEach(item => handleSaveOne(item));
    setAllSaved(true);
    setTimeout(() => setAllSaved(false), 2500);
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 15, color: "var(--text-dim)" }}>{ui.loading}</div>
      </main>
    );
  }

  if (notFound || !items) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ fontSize: 36 }}>🔗</div>
        <div style={{ fontSize: 16, color: "var(--text-dim)", textAlign: "center" }}>{ui.notFound}</div>
        <button
          type="button"
          onClick={() => router.push(`/${lang}/category`)}
          style={{
            padding: "11px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: "rgba(201,168,76,0.10)", color: "rgba(201,168,76,0.85)",
            border: "1px solid rgba(201,168,76,0.30)", cursor: "pointer",
          }}
        >
          {ui.goHome}
        </button>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px 80px", maxWidth: 680, margin: "0 auto" }}>
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
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-main)", marginBottom: 8 }}>
          {ui.title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8 }}>
          {ui.sub}
        </p>
        {expiresAt && (
          <p style={{ fontSize: 11, color: "rgba(180,200,240,0.30)" }}>
            {ui.expires}: {new Date(expiresAt).toLocaleDateString(rawLang === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
      </div>

      {/* 전체 저장 버튼 */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={handleSaveAll}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 700,
            cursor: "pointer", border: "none",
            background: allSaved
              ? "rgba(120,200,160,0.15)"
              : "linear-gradient(135deg,#C9A84C,#a87c2a)",
            color: allSaved ? "rgba(120,200,160,0.90)" : "#0B1634",
          }}
        >
          {allSaved ? `✓ ${ui.allSaved}` : `📋 ${ui.saveAll}`}
        </button>
      </div>

      {/* 카드 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((item, idx) => {
          const isSaved = savedIds.has(item.id);
          return (
            <article
              key={item.id ?? idx}
              style={{
                borderRadius: 18, overflow: "hidden",
                border: "1px solid rgba(120,160,255,0.14)",
                background: "var(--bg-panel)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ padding: "18px 18px 0" }}>
                {/* 상단 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
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

                {/* 메모 (읽기 전용) */}
                {item.memo && (
                  <div style={{
                    fontSize: 12, color: "rgba(200,215,245,0.55)", lineHeight: 1.6,
                    marginBottom: 12, padding: "8px 12px", fontStyle: "italic",
                    background: "rgba(120,160,255,0.03)", borderRadius: 8,
                    border: "1px solid rgba(120,160,255,0.08)",
                  }}>
                    💬 {item.memo}
                  </div>
                )}
              </div>

              {/* 저장 버튼 */}
              <div style={{ padding: "4px 18px 16px" }}>
                <button
                  type="button"
                  onClick={() => handleSaveOne(item)}
                  disabled={isSaved}
                  style={{
                    fontSize: 12, fontWeight: 700, cursor: isSaved ? "default" : "pointer",
                    border: isSaved
                      ? "1px solid rgba(120,200,160,0.35)"
                      : "1px solid rgba(120,200,160,0.28)",
                    background: isSaved
                      ? "rgba(80,180,120,0.10)"
                      : "rgba(120,200,160,0.06)",
                    color: isSaved
                      ? "rgba(120,200,160,0.80)"
                      : "rgba(120,200,160,0.70)",
                    padding: "7px 18px", borderRadius: 9,
                    opacity: isSaved ? 0.8 : 1,
                  }}
                >
                  {isSaved ? ui.saved : `+ ${ui.saveOne}`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
