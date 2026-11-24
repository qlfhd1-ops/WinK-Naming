"use client";

import WinkLogoFull from "@/components/WinkLogoFull";
import { CARD_BACKGROUNDS } from "@/lib/card-backgrounds";
import { SERVICE_PRE_LAUNCH } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryVideoCard } from "./_home/CategoryVideoCard";
import { DanchingBg, KnotDivider } from "./_home/Decor";
import { GuideSection } from "./_home/GuideSection";
import { InfoSection } from "./_home/InfoSection";
import { MarqueeBand } from "./_home/MarqueeBand";
import { BigNameCard, MiniSpeakButton } from "./_home/NameCards";
import { ReviewsSection } from "./_home/ReviewsSection";
import { ALL_CARDS, type ChildCard, type ForeignCard, type GoodsCard, type KoreanNameCard, type PetCard, type SelfCard, type StageCard, getCards } from "./_home/cards";
import { CATS, CAT_DESC_BY_LANG, COMING_SOON_BY_LANG, type CatId, GOODS_DISCOUNT_BY_LANG, PRICE_MAP } from "./_home/categories";
import { HOME_COPY, type HomeCopy } from "./_home/home-copy";
import { LANGS, LANG_FLAGS, LANG_KEY, LANG_LABELS, type Lang, THEME } from "./_home/lang";
import { CATEGORY_VIDEOS } from "./_home/videos";

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [selectedId, setSelectedId] = useState<CatId>("korean-name");
  const [cardIdx, setCardIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    try {
      // 매직링크 로그인 등 외부에서 ?lang= 으로 넘어온 경우 최우선 적용
      const fromQuery = new URLSearchParams(window.location.search).get("lang");
      if (fromQuery && LANGS.includes(fromQuery as Lang)) {
        setLang(fromQuery as Lang);
        localStorage.setItem(LANG_KEY, fromQuery);
        return;
      }
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && LANGS.includes(saved as Lang)) { setLang(saved as Lang); return; }

      // 저장된 선택이 없으면 브라우저 언어(Accept-Language)로 자동 감지, 실패 시 en 유지
      // 단, 1차 타깃이 외국인이므로 한국어 브라우저도 기본값은 영문(EN) 유지 — "ko"는 감지 대상에서 제외
      const browserLangs = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
      for (const bl of browserLangs) {
        const code = bl.toLowerCase().split("-")[0];
        if (code === "ko") continue;
        if (LANGS.includes(code as Lang)) { setLang(code as Lang); return; }
      }
    } catch { /* ignore — fallback은 useState 기본값 "en" */ }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      // 영상이 재생 중이면 자동전환을 멈춘다
      if (videoPlaying) return;
      const videoCount = CATEGORY_VIDEOS[selectedId]?.length ?? 0;
      const len = ALL_CARDS[selectedId].length + videoCount;
      setCardIdx(i => (i + 1) % len);
      setAnimKey(k => k + 1);
      setVideoPlaying(false);
    }, 4000);
    return () => clearInterval(t);
  }, [selectedId, lang, videoPlaying]);

  const handleCatSelect = (id: CatId) => {
    setSelectedId(id);
    setCardIdx(0);
    setAnimKey(k => k + 1);
    setVideoPlaying(false);
  };

  const handleStart = (href: (lang: string) => string) => {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
    router.push(href(lang));
  };

  const handleLangSelect = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
    setShowLangPicker(false);
  };

  const cat = CATS.find(c => c.id === selectedId) ?? CATS[0];
  const cards = getCards(lang, selectedId);
  const videos = CATEGORY_VIDEOS[selectedId] ?? [];
  const isVideoSlide = cardIdx >= cards.length;
  const activeVideo = isVideoSlide ? videos[cardIdx - cards.length] : undefined;
  const card = cards[isVideoSlide ? 0 : cardIdx] ?? cards[0];
  const theme = THEME[selectedId];
  const copy = (HOME_COPY[lang] ?? HOME_COPY.ko) as HomeCopy;
  const catCopy = copy.cats[selectedId as CatId];
  const catExtra = (CAT_DESC_BY_LANG[lang] ?? CAT_DESC_BY_LANG.ko)[selectedId as CatId];
  const price = PRICE_MAP[lang];
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";
  const sans = "var(--font-noto-sans-kr,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif)";

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAF8", fontFamily: sans, color: "#111111", overflowX: "hidden", paddingBottom: 68 }}>

      {/* ── 헤더 ── */}
      <header className="lg-header">
        <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <WinkLogoFull className="wink-logo-full-header" />
        </button>
        <button
          onClick={() => setShowLangPicker(true)}
          className="lg-lang-btn"
          aria-label="Change language"
          style={{ background: "linear-gradient(135deg,#C9A84C,#B8953A)", border: "none", borderRadius: 24, padding: "10px 18px", fontSize: 14, color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontFamily: sans, letterSpacing: "0.02em" }}
        >
          <span style={{ fontSize: 15 }}>{LANG_FLAGS[lang]}</span>
          {lang.toUpperCase()}
          <span style={{ fontSize: 9, opacity: 0.85 }}>▾</span>
        </button>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section className="lg-hero">
        <DanchingBg />

        {/* 왼쪽 */}
        <div className="lg-hero-left">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.11)", border: "1px solid rgba(201,168,76,0.30)", borderRadius: 20, padding: "6px 16px", marginBottom: 28, fontSize: 12, color: "#B8953A", fontWeight: 700, letterSpacing: "0.06em", width: "fit-content" }}>
            ✦ {copy.badge} · {copy.time}
          </div>
          <h1 style={{ margin: "0 0 18px", lineHeight: 1.08 }}>
            <div style={{ fontSize: "clamp(32px,4vw,58px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.025em" }}>
              {copy.headline1}
            </div>
            <div style={{ fontSize: "clamp(32px,4vw,58px)", fontWeight: 900, color: "#C9A84C", fontFamily: serif, letterSpacing: "-0.025em", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              {copy.headline2}
              <span style={{ fontSize: "0.36em", color: "#BBBBBB", fontWeight: 600, letterSpacing: "0.04em" }}>{copy.hanja}</span>
            </div>
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: "clamp(14px,1.4vw,17px)", color: "#555555", lineHeight: 1.9, maxWidth: 440 }}>
            {copy.subline}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", marginBottom: 36 }}>
            <button
              onClick={() => handleStart(cat.href)}
              className="lg-cta-btn"
            >
              {copy.ctaMain}
            </button>
            <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>⏱ {copy.time}</span>
              <span style={{ color: "#DDD" }}>·</span>
              <span style={{ color: "#C9A84C", fontWeight: 700 }}>{copy.free}</span>
              <span style={{ color: "#DDD" }}>·</span>
              <span>{SERVICE_PRE_LAUNCH ? (COMING_SOON_BY_LANG[lang] ?? COMING_SOON_BY_LANG.ko) : `${copy.later} ${price.symbol}${price.amount}`}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {([["☯", copy.trust1], ["🌐", copy.trust2], ["⚖️", copy.trust3]] as [string, string][]).map(([icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 빅 네임카드 */}
        <div className="lg-hero-right">
          <div style={{ fontSize: 11, color: "#AAAAAA", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            {cat.emoji} {catCopy.label} · 이름 설계 프리뷰
          </div>
          <div key={`${selectedId}-${animKey}`} style={{ animation: "lgFadeIn 0.4s ease", width: "100%" }}>
            {activeVideo ? (
              <CategoryVideoCard
                video={activeVideo}
                accent={theme.accent}
                bg={theme.bg}
                playing={videoPlaying}
                onPlay={() => setVideoPlaying(true)}
              />
            ) : (
              <BigNameCard
                card={card}
                accent={theme.accent}
                bg={theme.bg}
                lang={lang}
                bgImage={CARD_BACKGROUNDS[cardIdx % CARD_BACKGROUNDS.length].image}
              />
            )}
          </div>
          {/* 슬라이드 도트 */}
          <div style={{ display: "flex", gap: 5, marginTop: 14, justifyContent: "center" }}>
            {cards.map((_, i) => (
              <button
                key={`c${i}`}
                onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); setVideoPlaying(false); }}
                aria-label={`예시 ${i + 1}`}
                style={{ height: 4, borderRadius: 2, border: "none", cursor: "pointer", padding: 0, background: i === cardIdx ? "#C9A84C" : "rgba(0,0,0,0.14)", width: i === cardIdx ? 14 : 5, transition: "all 0.3s" }}
              />
            ))}
            {videos.map((v, vi) => {
              const i = cards.length + vi;
              return (
                <button
                  key={v.id}
                  onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); setVideoPlaying(false); }}
                  aria-label={`영상 ${vi + 1}`}
                  style={{ height: 4, borderRadius: 2, border: "none", cursor: "pointer", padding: 0, background: i === cardIdx ? "#C9A84C" : "rgba(0,0,0,0.14)", width: i === cardIdx ? 14 : 5, transition: "all 0.3s" }}
                />
              );
            })}
          </div>
          {selectedId === "korean-name" && (
            <div style={{ marginTop: 12, textAlign: "center", lineHeight: 2 }}>
              <div style={{ fontSize: 11, color: "#999999" }}><span style={{ color: "#C9A84C" }}>✦</span> 성씨 포함 또는 이름만도 설계 가능합니다</div>
              <div style={{ fontSize: 11, color: "#999999" }}><span style={{ color: "#C9A84C" }}>✦</span> 스승님·가족의 성씨를 이어받아 지을 수도 있어요</div>
            </div>
          )}
        </div>
      </section>

      {/* ── 마퀴 자막 ── */}
      <MarqueeBand lang={lang} />

      {/* ── 3단계 가이드 섹션 ── */}
      <GuideSection lang={lang} onStart={() => handleStart(cat.href)} />

      {/* ── 카테고리 아이콘 바 ── */}
      <div className="lg-cat-bar">
        <div className="lg-cat-bar-inner">
          {CATS.map(c => {
            const isActive = selectedId === c.id;
            const cc = copy.cats[c.id as CatId];
            return (
              <button
                key={c.id}
                className={`lg-cat-tab${isActive ? " active" : ""}`}
                onClick={() => handleCatSelect(c.id as CatId)}
              >
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <span>{cc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 카테고리 상세 섹션 ── */}
      <section className="lg-section" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="lg-cat-detail-grid">
          {/* 왼쪽: 설명 + CTA */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${theme.accent}18`, border: `1px solid ${theme.accent}44`, borderRadius: 20, padding: "5px 14px", marginBottom: 18, fontSize: 12, color: theme.accent, fontWeight: 700 }}>
              {cat.emoji} {catCopy.sub}
            </div>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,2.2vw,30px)", fontWeight: 900, color: "#1B2A5E", fontFamily: serif, lineHeight: 1.2 }}>
              {catCopy.label}
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 16, color: "#555555", lineHeight: 1.9, whiteSpace: "pre-line", maxWidth: 460 }}>
              {catExtra.desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {catExtra.points.map(p => (
                <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, background: theme.accent, flexShrink: 0, boxShadow: `0 0 6px ${theme.accent}55` }} />
                  <span style={{ fontSize: 15, color: "#444", lineHeight: 1.7 }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
              <button onClick={() => handleStart(cat.href)} className="lg-cta-btn">
                {(copy.ctaLabels as Record<CatId, string>)[selectedId]} →
              </button>
              <div style={{ fontSize: 13, color: "#888" }}>
                {selectedId !== "goods"
                  ? (SERVICE_PRE_LAUNCH
                      ? `${copy.emailStart} · ${COMING_SOON_BY_LANG[lang] ?? COMING_SOON_BY_LANG.ko}`
                      : `${copy.emailStart} · ${copy.later} ${price.symbol}${price.amount}`)
                  : <span style={{ color: theme.accent, fontWeight: 700 }}>{GOODS_DISCOUNT_BY_LANG[lang] ?? GOODS_DISCOUNT_BY_LANG.ko}</span>
                }
              </div>
            </div>
          </div>

          {/* 오른쪽: 예시 카드 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cards.map((c, i) => (
              <button
                key={i}
                onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  background: i === cardIdx ? "rgba(27,42,94,0.04)" : "#FFFFFF",
                  border: i === cardIdx ? `1.5px solid ${theme.accent}55` : "1px solid #EAEAEA",
                  borderRadius: 14, padding: "14px 18px",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: i === cardIdx ? `0 4px 16px ${theme.accent}22` : "0 2px 8px rgba(0,0,0,0.03)",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14, fontFamily: sans,
                }}
              >
                <div style={{ width: 4, height: 36, borderRadius: 2, background: i === cardIdx ? theme.accent : "#E8E8E8", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {c.type === "korean-name" && (
                    <>
                      <div style={{ fontSize: 12, color: "#AAA", marginBottom: 3 }}>{(c as KoreanNameCard).originalName} →</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as KoreanNameCard).koreanName}</div>
                        <MiniSpeakButton name={(c as KoreanNameCard).koreanName} meaning={(c as KoreanNameCard).meaning} />
                      </div>
                      {(c as KoreanNameCard).roman && (
                        <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 600, marginTop: 2, letterSpacing: "0.05em" }}>{(c as KoreanNameCard).roman}</div>
                      )}
                    </>
                  )}
                  {c.type === "child" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as ChildCard).surname}{(c as ChildCard).name}</div>
                      <MiniSpeakButton name={`${(c as ChildCard).surname}${(c as ChildCard).name}`} meaning={(c as ChildCard).meaning} />
                    </div>
                  )}
                  {c.type === "self" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as SelfCard).surname}{(c as SelfCard).name}</div>
                      <MiniSpeakButton name={`${(c as SelfCard).surname}${(c as SelfCard).name}`} meaning={(c as SelfCard).meaning} />
                    </div>
                  )}
                  {c.type === "stage" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as StageCard).stageName}</div>
                      <MiniSpeakButton name={(c as StageCard).stageName} meaning={(c as StageCard).meaning} />
                    </div>
                  )}
                  {c.type === "pet" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as PetCard).name}</div>
                      <MiniSpeakButton name={(c as PetCard).name} meaning={(c as PetCard).meaning} />
                    </div>
                  )}
                  {c.type === "foreign" && (
                    <>
                      <div style={{ fontSize: 12, color: "#AAA", marginBottom: 3 }}>{(c as ForeignCard).koreanName} →</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#1B2A5E" }}>{(c as ForeignCard).foreignName}</div>
                        <MiniSpeakButton name={(c as ForeignCard).foreignName} meaning={(c as ForeignCard).meaning} nameLang="en-US" />
                      </div>
                    </>
                  )}
                  {c.type === "goods" && (
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2A5E", fontFamily: serif }}>{(c as GoodsCard).productName}</div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: theme.accent, fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 매듭 구분선 ── */}
      <KnotDivider />

      {/* ── 참고 정보 섹션 ── */}
      <InfoSection copy={copy} lang={lang} />

      {/* ── 고객 후기 섹션 ── */}
      <ReviewsSection copy={copy} lang={lang} />

      {/* ── 모바일 하단 탭바 ── */}
      <div className="lg-mobile-tabs" role="tablist">
        {CATS.map(c => {
          const isActive = selectedId === c.id;
          const cc = copy.cats[c.id as CatId];
          return (
            <button key={c.id} role="tab" aria-selected={isActive} className={`lg-mobile-tab${isActive ? " active" : ""}`} onClick={() => handleCatSelect(c.id as CatId)}>
              <span className="lg-mobile-tab-emoji">{c.emoji}</span>
              <span>{cc.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 언어 선택 모달 ── */}
      {showLangPicker && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(27,42,94,0.18)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowLangPicker(false)}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "28px 24px", width: "min(340px,90vw)", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(27,42,94,0.14)", border: "1px solid #E8E8E8" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1B2A5E", marginBottom: 4, fontFamily: serif }}>🌐 Select your language</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 18 }}>언어 선택 · Language</div>
            {LANGS.map(l => (
              <button key={l} onClick={() => handleLangSelect(l)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12, marginBottom: 6, border: lang === l ? "2px solid #C9A84C" : "1px solid #E8E8E8", background: lang === l ? "rgba(201,168,76,0.08)" : "transparent", cursor: "pointer", fontSize: 15, color: "#1B2A5E", fontWeight: lang === l ? 700 : 500, fontFamily: sans }}>
                <span style={{ fontSize: 20 }}>{LANG_FLAGS[l]}</span>
                {LANG_LABELS[l]}
                {lang === l && <span style={{ marginLeft: "auto", fontSize: 13, color: "#C9A84C" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes lgFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lgSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-track { animation: marqueeScroll 40s linear infinite; }
        @keyframes lgLangPulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(201,168,76,0.45); }
          50%      { box-shadow: 0 4px 22px rgba(201,168,76,0.85), 0 0 0 6px rgba(201,168,76,0.16); }
        }
        .lg-lang-btn { animation: lgLangPulse 2.4s ease-in-out infinite; }
        .lg-lang-btn:hover { animation-play-state: paused; filter: brightness(1.05); }
      `}</style>
    </div>
  );
}
