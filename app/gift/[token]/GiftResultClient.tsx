"use client";

import { useState } from "react";

type NameResult = {
  rank_order: number;
  track: string;
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  hanja_strokes?: string;
  five_elements?: string;
  phonetic_harmony?: string;
  english?: string;
  chinese?: string;
  chinese_pinyin?: string;
  japanese_kana?: string;
  japanese_reading?: string;
  meaning?: string;
  story?: string;
  fit_reason?: string;
  teasing_risk?: string;
  similarity_risk?: string;
  pronunciation_risk?: string;
  caution?: string;
  connection_analysis?: string;
  score?: number;
};

type GiftData = {
  token: string;
  results: NameResult[];
  brief: Record<string, string> | null;
  lang: string;
  created_at: string;
  expires_at: string | null;
};

const COPY = {
  ko: {
    badge: "이름 설계 결과 선물",
    sub: "이 이름은 AI 작명 전문가가 성씨 음운 조화, 오행 획수, 발음 안전성을 함께 반영해 설계했습니다.",
    top3: "이름 후보 3가지",
    meaning: "의미",
    hanja: "한자",
    hanjaDetail: "한자 풀이",
    hanjaStrokes: "획수 조합",
    fiveElements: "오행 균형",
    phoneticHarmony: "음운 조화",
    story: "설계 이야기",
    fitReason: "선정 이유",
    pronunciation: "표기",
    en: "영어", zh: "중문", ja: "일본어",
    score: "점수",
    caution: "주의사항",
    trackSafe: "안정형", trackRefined: "세련형", trackCreative: "창의형",
    copyLink: "링크 복사",
    copied: "복사됨!",
    shareNative: "공유하기",
    shareKakao: "카카오톡",
    footer: "윙크 네이밍 — 이름은 평생의 선물",
    goService: "내 이름도 설계받기",
  },
  en: {
    badge: "Name Design Gift",
    sub: "This name was designed by AI with phonetic harmony, five elements, and pronunciation safety in mind.",
    top3: "3 Name Proposals",
    meaning: "Meaning",
    hanja: "Hanja",
    hanjaDetail: "Character Analysis",
    hanjaStrokes: "Stroke Count",
    fiveElements: "Five Elements",
    phoneticHarmony: "Phonetic Harmony",
    story: "Design Story",
    fitReason: "Why This Track",
    pronunciation: "Script",
    en: "English", zh: "Chinese", ja: "Japanese",
    score: "Score",
    caution: "Caution",
    trackSafe: "Stable", trackRefined: "Refined", trackCreative: "Creative",
    copyLink: "Copy link",
    copied: "Copied!",
    shareNative: "Share",
    shareKakao: "KakaoTalk",
    footer: "윙크 네이밍 — A name is a gift for life",
    goService: "Design my name",
  },
  zh: {
    badge: "姓名设计礼品",
    sub: "此名字由AI综合音韵和谐、五行笔画、发音安全性精心设计。",
    top3: "三个候选名字",
    meaning: "含义",
    hanja: "汉字",
    hanjaDetail: "汉字解析",
    hanjaStrokes: "笔画",
    fiveElements: "五行平衡",
    phoneticHarmony: "音韵调和",
    story: "设计故事",
    fitReason: "选择理由",
    pronunciation: "标注",
    en: "英文", zh: "中文", ja: "日文",
    score: "评分",
    caution: "注意事项",
    trackSafe: "稳健型", trackRefined: "精致型", trackCreative: "创意型",
    copyLink: "复制链接",
    copied: "已复制！",
    shareNative: "分享",
    shareKakao: "KakaoTalk",
    footer: "윙크 네이밍 — 名字是送给人生的礼物",
    goService: "为我设计名字",
  },
  ja: {
    badge: "ネーミングデザインギフト",
    sub: "このお名前はAIが音韻調和・五行・画数・発音安全性を反映して設計しました。",
    top3: "3つの候補",
    meaning: "意味",
    hanja: "漢字",
    hanjaDetail: "漢字解説",
    hanjaStrokes: "画数",
    fiveElements: "五行バランス",
    phoneticHarmony: "音韻調和",
    story: "設計ストーリー",
    fitReason: "選定理由",
    pronunciation: "表記",
    en: "英語", zh: "中国語", ja: "日本語",
    score: "スコア",
    caution: "注意事項",
    trackSafe: "安定型", trackRefined: "洗練型", trackCreative: "創意型",
    copyLink: "リンクをコピー",
    copied: "コピーしました！",
    shareNative: "共有する",
    shareKakao: "KakaoTalk",
    footer: "윙크 네이밍 — 名前は一生の贈り物",
    goService: "私の名前も設計する",
  },
} as const;

type UiLang = keyof typeof COPY;

const TRACK_ACCENT: Record<string, string> = {
  safe: "rgba(100,180,255,0.85)",
  refined: "rgba(201,168,76,0.9)",
  creative: "rgba(160,110,220,0.85)",
};

type AnyUi = { trackSafe: string; trackRefined: string; trackCreative: string };
function trackLabel(track: string, ui: AnyUi) {
  if (track === "safe")     return ui.trackSafe;
  if (track === "refined")  return ui.trackRefined;
  if (track === "creative") return ui.trackCreative;
  return track;
}

export default function GiftResultClient({ gift }: { gift: GiftData }) {
  const lang = (gift.lang in COPY ? gift.lang : "ko") as UiLang;
  const ui   = COPY[lang];
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${gift.results[0]?.name ?? ""} — ${ui.badge}`,
        url: pageUrl,
      });
    } else {
      handleCopy();
    }
  };

  const handleKakao = () => {
    const kakao = (window as unknown as { Kakao?: { isInitialized?: () => boolean; Share?: { sendScrap: (o: object) => void } } }).Kakao;
    if (kakao?.isInitialized?.() && kakao.Share?.sendScrap) {
      kakao.Share.sendScrap({ requestUrl: pageUrl });
    } else {
      handleCopy();
    }
  };

  const results = gift.results ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a1432 0%, #060d22 100%)", padding: "40px 16px 60px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ display: "inline-block", padding: "6px 20px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.4)", color: "rgba(242,210,110,0.95)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {ui.badge}
          </span>
          <p style={{ color: "rgba(200,218,248,0.7)", fontSize: 14, lineHeight: 1.8, marginTop: 16, maxWidth: 480, margin: "16px auto 0" }}>
            {ui.sub}
          </p>
        </div>

        {/* Section title */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(201,168,76,0.75)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, paddingLeft: 4 }}>
          {ui.top3}
        </div>

        {/* Name cards */}
        {results.map((item, idx) => (
          <article
            key={`${item.name}-${idx}`}
            style={{
              borderRadius: 22,
              padding: "28px 24px",
              background: idx === 0
                ? "radial-gradient(circle at top left, rgba(201,168,76,0.14), transparent 40%), linear-gradient(180deg, #162132 0%, #0f1725 100%)"
                : "rgba(255,255,255,0.03)",
              border: idx === 0
                ? "1px solid rgba(201,168,76,0.32)"
                : "1px solid rgba(255,255,255,0.07)",
              marginBottom: 20,
              boxShadow: idx === 0 ? "0 20px 50px rgba(0,0,0,0.35)" : "none",
            }}
          >
            {/* Track badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                color: TRACK_ACCENT[item.track] ?? "rgba(200,215,240,0.7)",
                padding: "3px 12px", borderRadius: 999,
                border: `1px solid ${TRACK_ACCENT[item.track] ?? "rgba(200,215,240,0.25)"}20`,
                background: `${TRACK_ACCENT[item.track] ?? "rgba(200,215,240,0.1)"}18`,
                textTransform: "uppercase",
              }}>
                {trackLabel(item.track, ui)}
              </span>
              {item.score && (
                <span style={{ fontSize: 11, color: "rgba(200,215,240,0.45)" }}>
                  {ui.score} {item.score}
                </span>
              )}
            </div>

            {/* Name */}
            <div style={{ fontSize: "clamp(44px, 9vw, 64px)", fontWeight: 800, color: "#f8fbff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
              {item.name}
            </div>

            {item.hanja && (
              <div style={{ fontSize: 22, color: "rgba(242,210,110,0.82)", letterSpacing: "0.1em", marginBottom: 14 }}>
                {item.hanja}
              </div>
            )}

            {/* Hanja detail */}
            {item.hanja_meaning && (
              <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(201,168,76,0.12)" }}>
                <div style={{ fontSize: 10, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{ui.hanjaDetail}</div>
                <div style={{ color: "rgba(215,228,248,0.88)", fontSize: 13, lineHeight: 1.7 }}>{item.hanja_meaning}</div>
                {item.hanja_strokes && <div style={{ color: "rgba(200,215,240,0.5)", fontSize: 11, marginTop: 3 }}>{ui.hanjaStrokes}: {item.hanja_strokes}</div>}
              </div>
            )}

            {item.five_elements && (
              <div style={{ marginBottom: 12, padding: "8px 14px", borderRadius: 10, background: "rgba(0,0,0,0.18)", border: "1px solid rgba(120,160,255,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "rgba(140,180,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{ui.fiveElements}</span>
                <span style={{ color: "rgba(210,225,248,0.82)", fontSize: 13 }}>{item.five_elements}</span>
              </div>
            )}

            {/* Meaning */}
            {item.meaning && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{ui.meaning}</div>
                <div style={{ color: "rgba(218,230,250,0.9)", fontSize: 14, lineHeight: 1.8 }}>{item.meaning}</div>
              </div>
            )}

            {/* Phonetic harmony */}
            {item.phonetic_harmony && (
              <div style={{ marginBottom: 14, padding: "8px 14px", borderRadius: 10, background: "rgba(0,0,0,0.18)", border: "1px solid rgba(120,160,255,0.12)" }}>
                <div style={{ fontSize: 10, color: "rgba(140,180,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{ui.phoneticHarmony}</div>
                <div style={{ color: "rgba(210,225,248,0.85)", fontSize: 13, lineHeight: 1.65 }}>{item.phonetic_harmony}</div>
              </div>
            )}

            {/* Story */}
            {item.story && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{ui.story}</div>
                <div style={{ color: "rgba(200,218,246,0.8)", fontSize: 13, lineHeight: 1.82 }}>{item.story}</div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)", margin: "16px 0" }} />

            {/* Pronunciation grid */}
            <div style={{ fontSize: 10, color: "rgba(201,168,76,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{ui.pronunciation}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: ui.en, value: item.english, sub: null },
                { label: ui.zh, value: item.chinese, sub: item.chinese_pinyin || null },
                { label: ui.ja, value: item.japanese_kana, sub: item.japanese_reading || null },
              ].map((p) => (
                <div key={p.label} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 10, color: "rgba(201,168,76,0.65)", fontWeight: 700, marginBottom: 3 }}>{p.label}</div>
                  <div style={{ color: "#f0f5ff", fontSize: 14, fontWeight: 600 }}>{p.value || "—"}</div>
                  {p.sub && <div style={{ color: "rgba(190,210,240,0.55)", fontSize: 10, marginTop: 2 }}>{p.sub}</div>}
                </div>
              ))}
            </div>

            {/* Caution */}
            {item.caution && (
              <div style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, background: "rgba(255,160,60,0.07)", border: "1px solid rgba(255,160,60,0.15)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,170,70,0.75)" }}>{ui.caution}: </span>
                <span style={{ fontSize: 12, color: "rgba(220,235,255,0.72)" }}>{item.caution}</span>
              </div>
            )}
          </article>
        ))}

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <button
            type="button"
            onClick={handleNativeShare}
            style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(201,168,76,0.45)", background: "rgba(201,168,76,0.1)", color: "rgba(242,210,110,0.95)", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {ui.shareNative}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button type="button" onClick={handleKakao}
              style={{ padding: "12px 8px", borderRadius: 10, border: "1px solid rgba(255,210,0,0.3)", background: "rgba(254,229,0,0.08)", color: "rgba(254,229,0,0.9)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              💬 {ui.shareKakao}
            </button>
            <button type="button" onClick={handleCopy}
              style={{ padding: "12px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(210,225,250,0.8)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {copied ? "✓" : "🔗"} {copied ? ui.copied : ui.copyLink}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 36, textAlign: "center" }}>
          <a
            href="/"
            style={{ display: "inline-block", padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))", border: "1px solid rgba(201,168,76,0.45)", color: "rgba(242,210,110,0.95)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
          >
            ✨ {ui.goService}
          </a>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "rgba(150,170,210,0.45)", letterSpacing: "0.05em" }}>
          {ui.footer}
        </div>
      </div>
    </main>
  );
}
