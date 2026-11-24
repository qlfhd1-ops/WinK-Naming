"use client";

import KoreanPatternOverlay from "@/components/KoreanPatternOverlay";
import WinkMark from "@/components/WinkMark";
import { DanchingBg } from "./Decor";
import { type AnyCard, type ChildCard, type ForeignCard, type GoodsCard, type KoreanNameCard, type PetCard, type SelfCard, type StageCard } from "./cards";
import { type CatId } from "./categories";
import { type Lang } from "./lang";

// ── 미니 발음 듣기 버튼 (선택 카드 목록용) ─────────────────
export function MiniSpeakButton({ name, meaning, nameLang = "ko-KR" }: { name: string; meaning: string; nameLang?: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const speak = (text: string, lg: string, onEnd?: () => void) => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = lg;
          u.rate = 0.85;
          if (onEnd) u.onend = onEnd;
          window.speechSynthesis.speak(u);
        };
        speak(name, nameLang, () =>
          speak(name, nameLang, () =>
            speak(meaning, nameLang)
          )
        );
      }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
      style={{ background: "none", border: "1.5px solid #C9A84C55", borderRadius: "50%", width: 26, height: 26, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#C9A84C" }}
      title="이름 듣기"
      aria-label="이름 읽어주기"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
      </svg>
    </div>
  );
}

// ── 이름 카드 (라이트 테마) ───────────────────────────────
export function NameCard({ card, accent }: { card: AnyCard; accent: string }) {
  const base: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 20,
    border: "1px solid #EAEAEA",
    boxShadow: "0 8px 36px rgba(27,42,94,0.09)",
    width: "100%",
    maxWidth: 380,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  const AccentBar = () => (
    <div style={{ height: 4, background: `linear-gradient(90deg, #1B2A5E 0%, ${accent} 100%)` }} />
  );

  if (card.type === "korean-name") {
    const c = card as KoreanNameCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase" }}>KOREAN NAME DESIGN</span>
            <span style={{ fontSize: 12, background: "#1B2A5E", color: accent, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{c.flag} {c.nationality}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#AAA" }}>{c.originalName}</span>
            <span style={{ fontSize: 16, color: accent }}>→</span>
            <span style={{ fontSize: 42, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 4, lineHeight: 1 }}>{c.koreanName}</span>
          </div>
          <div style={{ fontSize: 15, color: accent, marginBottom: 16, letterSpacing: 4, fontFamily: "serif", fontWeight: 600 }}>{c.hanja}</div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "child") {
    const c = card as ChildCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>BABY NAME DESIGN · 아이 이름</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 20, color: accent, fontFamily: "serif", fontWeight: 900 }}>{c.surname}</span>
            <span style={{ fontSize: 50, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 6, lineHeight: 1 }}>{c.name}</span>
          </div>
          <div style={{ fontSize: 15, color: accent, letterSpacing: 5, marginBottom: 4, fontFamily: "serif", fontWeight: 600 }}>{c.fullHanja}</div>
          <div style={{ fontSize: 11, color: "#AAA", marginBottom: 18, letterSpacing: "0.06em" }}>{c.roman}</div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "self") {
    const c = card as SelfCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>RENAME DESIGN · 개명</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 20, color: accent, fontFamily: "serif", fontWeight: 900 }}>{c.surname}</span>
            <span style={{ fontSize: 50, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 6, lineHeight: 1 }}>{c.name}</span>
          </div>
          <div style={{ fontSize: 15, color: accent, letterSpacing: 5, marginBottom: 4, fontFamily: "serif", fontWeight: 600 }}>{c.fullHanja}</div>
          <div style={{ fontSize: 11, color: "#AAA", marginBottom: 18, letterSpacing: "0.06em" }}>{c.roman}</div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "stage") {
    const c = card as StageCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase" }}>STAGE NAME DESIGN</span>
            <span style={{ fontSize: 12, background: "#1B2A5E", color: accent, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{c.field}</span>
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 6, lineHeight: 1, marginBottom: 8 }}>{c.stageName}</div>
          <div style={{ fontSize: 11, color: "#AAA", marginBottom: 18, letterSpacing: "0.06em" }}>{c.roman}</div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "pet") {
    const c = card as PetCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase" }}>PET NAME DESIGN</span>
            <span style={{ fontSize: 14 }}>{c.animal}</span>
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 6, lineHeight: 1, marginBottom: 8 }}>{c.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: accent, fontWeight: 700 }}>{c.english}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#DDD", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#AAA" }}>English</span>
          </div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "foreign") {
    const c = card as ForeignCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>GLOBAL NAME DESIGN</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#CCC", fontFamily: serif, letterSpacing: 2 }}>{c.koreanName}</span>
            <span style={{ fontSize: 18, color: accent }}>→</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#1B2A5E", letterSpacing: "0.02em" }}>{c.foreignName}</span>
          </div>
          <div style={{ display: "inline-block", fontSize: 12, color: "#FFF", background: "#1B2A5E", borderRadius: 20, padding: "4px 12px", marginBottom: 18, fontWeight: 600 }}>{c.foreignLang}</div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: "#1B2A5E", fontWeight: 700, marginBottom: 8 }}>{c.meaning}</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.85 }}>{c.story}</div>
        </div>
      </div>
    );
  }

  if (card.type === "goods") {
    const c = card as GoodsCard;
    return (
      <div style={base}>
        <AccentBar />
        <div style={{ padding: "22px 26px 26px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>WINK NAMING GOODS · 한국문양 굿즈</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, minHeight: 80 }}>
            {c.visual === "stamp" && (
              <svg width="80" height="96" viewBox="0 0 80 96" fill="none">
                <rect x="28" y="2" width="24" height="30" rx="6" fill="#1B2A5E" opacity="0.12"/>
                <rect x="12" y="30" width="56" height="40" rx="4" fill="#1B2A5E" opacity="0.1"/>
                <rect x="12" y="68" width="56" height="22" rx="3" fill="#C0392B" opacity="0.8"/>
                <text x="40" y="84" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="900" fontFamily="serif" letterSpacing="2">{c.engravedName.slice(0,4)}</text>
                <rect x="14" y="70" width="52" height="18" rx="2" fill="none" stroke="rgba(255,200,200,0.5)" strokeWidth="0.8"/>
              </svg>
            )}
            {c.visual === "hat" && (
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                <path d="M20 65 Q16 38 28 22 Q42 8 60 7 Q78 8 92 22 Q104 38 100 65Z" fill="#1B2A5E" opacity="0.1"/>
                <ellipse cx="60" cy="67" rx="52" ry="9" fill="#1B2A5E" opacity="0.08"/>
                <text x="60" y="48" textAnchor="middle" fill={accent} fontSize="14" fontWeight="bold" fontFamily="serif" letterSpacing="4">{c.engravedName}</text>
              </svg>
            )}
            {c.visual === "tumbler" && (
              <svg width="60" height="96" viewBox="0 0 60 96" fill="none">
                <rect x="10" y="10" width="40" height="78" rx="8" fill="#1B2A5E" opacity="0.09"/>
                <rect x="10" y="30" width="40" height="36" rx="0" fill="#1B2A5E" opacity="0.06"/>
                <text x="30" y="52" textAnchor="middle" fill={accent} fontSize="12" fontWeight="bold" fontFamily="serif" letterSpacing="3">{c.engravedName}</text>
              </svg>
            )}
            {c.visual === "magnet" && (
              <svg width="110" height="78" viewBox="0 0 110 78" fill="none">
                <rect x="5" y="4" width="100" height="66" rx="10" fill="#F5F0E8" stroke={accent} strokeWidth="1.5" opacity="0.65"/>
                <text x="55" y="47" textAnchor="middle" fill="#1B2A5E" fontSize="22" fontWeight="900" fontFamily="serif" letterSpacing="6">{c.engravedName}</text>
              </svg>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1B2A5E", marginBottom: 4, fontFamily: serif }}>{c.productName}</div>
          <div style={{ fontSize: 11, color: "#AAA", marginBottom: 12 }}>{c.material}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 20, color: accent, fontWeight: 800 }}>{c.price}</span>
            <span style={{ fontSize: 11, color: "#FFF", background: "#1B2A5E", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>이름 각인 포함</span>
          </div>
          <div style={{ height: 1, background: "#EAEAEA", marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: "#1B2A5E", fontWeight: 700, marginBottom: 6 }}>{c.tagline}</div>
          <div style={{ fontSize: 12, color: "#777", lineHeight: 1.8 }}>{c.desc}</div>
        </div>
      </div>
    );
  }

  return null;
}

// ── 빅 네임카드 (16:9) ────────────────────────────────────
export function BigNameCard({ card, accent, bg, lang, bgImage }: { card: AnyCard; accent: string; bg: string; lang: Lang; bgImage?: string }) {
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  let name = "", hanja = "", meaning = "", story = "", badge = "", roman = "";
  if (card.type === "korean-name") {
    const c = card as KoreanNameCard;
    name = c.koreanName; hanja = c.hanja; meaning = c.meaning; story = c.story;
    badge = `${c.flag} ${c.nationality}`; roman = c.roman ?? "";
  } else if (card.type === "child") {
    const c = card as ChildCard;
    name = `${c.surname}${c.name}`; hanja = c.fullHanja; meaning = c.meaning; story = c.story; badge = c.roman;
  } else if (card.type === "self") {
    const c = card as SelfCard;
    name = `${c.surname}${c.name}`; hanja = c.fullHanja; meaning = c.meaning; story = c.story; badge = c.roman;
  } else if (card.type === "stage") {
    const c = card as StageCard;
    name = c.stageName; hanja = c.roman; meaning = c.meaning; story = c.story; badge = c.field;
  } else if (card.type === "pet") {
    const c = card as PetCard;
    name = c.name; hanja = c.english; meaning = c.meaning; story = c.story; badge = c.animal;
  } else if (card.type === "foreign") {
    const c = card as ForeignCard;
    name = c.foreignName; hanja = c.koreanName; meaning = c.meaning; story = c.story; badge = c.foreignLang;
  } else if (card.type === "goods") {
    const c = card as GoodsCard;
    name = c.engravedName; hanja = c.productName; meaning = c.tagline; story = c.desc; badge = c.material;
  }

  // 발음 듣기 버튼 — 이름을 새로 설계하는 카테고리(굿즈 제외)에 모두 노출
  const SPEAKABLE_TYPES: CatId[] = ["korean-name", "child", "self", "stage", "pet", "foreign"];
  const canSpeak = SPEAKABLE_TYPES.includes(card.type);
  // "foreign" 카테고리는 이름이 외국어 표기이므로 영어 음성으로, 그 외는 한국어 음성으로 읽음
  const nameSpeakLang = card.type === "foreign" ? "en-US" : "ko-KR";

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const speak = (text: string, lg: string, onEnd?: () => void) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lg; u.rate = 0.82;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
    };
    // 이름 2번 → 뜻 현지 언어
    const meaningLang: Record<Lang, string> = {
      ko:"ko-KR", en:"en-US", ja:"ja-JP", zh:"zh-CN",
      es:"es-ES", fr:"fr-FR", ru:"ru-RU", ar:"ar-SA", hi:"hi-IN",
    };
    speak(name, nameSpeakLang, () =>
      speak(name, nameSpeakLang, () =>
        speak(meaning, meaningLang[lang] ?? "ko-KR")
      )
    );
  };

  return (
    <div
      className="lg-big-name-card"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, #1B2A5E 100%)`, border: `1px solid ${accent}22` }}
    >
      {/* 한국 랜드마크 사진 배경 */}
      {bgImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background:
                "linear-gradient(90deg, rgba(5,10,24,0.82) 0%, rgba(5,10,24,0.5) 48%, rgba(5,10,24,0.82) 100%)",
            }}
          />
          <KoreanPatternOverlay size={150} opacity={0.35} color={accent} />
        </>
      )}
      {/* 상단 그라디언트 바 */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, #1B2A5E 0%, ${accent} 100%)`, zIndex: 2 }} />
      {/* 단청 문양 오버레이 */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, zIndex: 0 }} aria-hidden="true">
        <DanchingBg />
      </div>
      {/* 기와(瓦) 질감 오버레이 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          zIndex: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 8px)",
          pointerEvents: "none",
        }}
      />
      <div className="lg-big-name-card-inner">
        {/* 왼쪽: 큰 이름 */}
        <div className="lg-big-name-left">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <WinkMark size={18} />
            <div style={{ fontSize: 10, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
              {badge}
            </div>
          </div>
          <div style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, color: "#FFFFFF", fontFamily: serif, letterSpacing: "0.12em", lineHeight: 1 }}>
            {name}
          </div>
          {roman && (
            <div style={{ fontSize: 13, color: `${accent}CC`, fontWeight: 600, letterSpacing: "0.1em", marginTop: 10 }}>
              {roman}
            </div>
          )}
          {canSpeak && (
            <button
              type="button"
              onClick={handleSpeak}
              style={{
                marginTop: 14,
                display: "inline-flex", alignItems: "center", gap: 7,
                background: `${accent}22`, border: `1px solid ${accent}55`,
                borderRadius: 20, padding: "6px 14px",
                color: accent, fontSize: 12, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.04em",
              }}
              aria-label="이름 읽어주기"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              듣기
            </button>
          )}
        </div>
        {/* 오른쪽: 한자 + 의미 + 설명 */}
        <div className="lg-big-name-right" style={{ borderLeft: `1px solid ${accent}33` }}>
          <div style={{ fontSize: "clamp(16px,2vw,26px)", color: accent, fontFamily: "serif", letterSpacing: 4, marginBottom: 10, fontWeight: 600, lineHeight: 1.3 }}>
            {hanja}
          </div>
          <div style={{ fontSize: "clamp(12px,1.2vw,16px)", color: "#FFFFFF", fontWeight: 700, marginBottom: 8, lineHeight: 1.5 }}>
            {meaning}
          </div>
          <div style={{ fontSize: "clamp(11px,0.95vw,13px)", color: "rgba(255,255,255,0.58)", lineHeight: 1.85 }}>
            {story}
          </div>
        </div>
      </div>
    </div>
  );
}
