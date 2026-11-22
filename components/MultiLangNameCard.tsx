"use client";

import { useEffect, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import WinkMarkClassic from "@/components/WinkMarkClassic";
import { PLAQUES, PLAQUE_KEYS, LIGHT_PLAQUE_KEYS, OHAENG_COLORS, type PlaqueKey, type PlaqueStyle } from "@/lib/plaques";
import { CARD_BACKGROUNDS } from "@/lib/card-backgrounds";
import { getCountryFlag } from "@/lib/country-flags";
import KoreanPatternOverlay from "@/components/KoreanPatternOverlay";

/** 프레임형(예시) — 패널 없이 사진 전면 + 금테두리만으로 구성하는 미니멀 레이아웃 */
const FRAME_EXAMPLE = {
  id: "gwangan-frame" as const,
  name: "Gwangan Bridge (Frame)",
  nameKo: "광안대교 · 프레임형",
  image: "/images/cards/gwangan-bridge.jpg",
};

type CardStyleKey = PlaqueKey | (typeof CARD_BACKGROUNDS)[number]["id"] | typeof FRAME_EXAMPLE.id;

/** 랜드마크 사진 스타일의 고정 팔레트 — 금장(gold) 톤 */
const PHOTO_STYLE: PlaqueStyle = {
  bg: "#0B1634",
  pattern: "none",
  ink: "#FFFFFF",
  sub: "#D9BC7A",
  frame: "#C9A45C",
  line: "rgba(201,164,92,.7)",
  badge: "✦",
  label: "Landmark",
};

/** 카드 창 문구 (ko/en/ja/zh/es/ru/fr/ar/hi) */
const MODAL_COPY: Record<string, { listen: string; global: string; korean: string; english: string; chinese: string; japanese: string; five: string; save: string; saving: string; share: string; copied: string; close: string }> = {
  ko: { listen: "이름 발음 듣기", global: "다국어 발음", korean: "한국어", english: "영어", chinese: "중국어", japanese: "일본어", five: "오행 밸런스 · 목화토금수", save: "⬇ 이미지 저장", saving: "저장 중...", share: "↗ 공유하기", copied: "✓ 복사됨", close: "닫기" },
  en: { listen: "Listen to pronunciation", global: "Global Pronunciation", korean: "Korean", english: "English", chinese: "Chinese", japanese: "Japanese", five: "Five Elements Balance", save: "⬇ Save image", saving: "Saving...", share: "↗ Share", copied: "✓ Copied", close: "Close" },
  ja: { listen: "名前の発音を聞く", global: "多言語の発音", korean: "韓国語", english: "英語", chinese: "中国語", japanese: "日本語", five: "五行バランス", save: "⬇ 画像を保存", saving: "保存中...", share: "↗ 共有", copied: "✓ コピーしました", close: "閉じる" },
  zh: { listen: "收听名字发音", global: "多语言发音", korean: "韩语", english: "英语", chinese: "中文", japanese: "日语", five: "五行平衡", save: "⬇ 保存图片", saving: "保存中...", share: "↗ 分享", copied: "✓ 已复制", close: "关闭" },
  es: { listen: "Escuchar pronunciación", global: "Pronunciación global", korean: "Coreano", english: "Inglés", chinese: "Chino", japanese: "Japonés", five: "Equilibrio de los cinco elementos", save: "⬇ Guardar imagen", saving: "Guardando...", share: "↗ Compartir", copied: "✓ Copiado", close: "Cerrar" },
  ru: { listen: "Послушать произношение", global: "Произношение на разных языках", korean: "Корейский", english: "Английский", chinese: "Китайский", japanese: "Японский", five: "Баланс пяти стихий", save: "⬇ Сохранить изображение", saving: "Сохранение...", share: "↗ Поделиться", copied: "✓ Скопировано", close: "Закрыть" },
  fr: { listen: "Écouter la prononciation", global: "Prononciation internationale", korean: "Coréen", english: "Anglais", chinese: "Chinois", japanese: "Japonais", five: "Équilibre des cinq éléments", save: "⬇ Enregistrer l'image", saving: "Enregistrement...", share: "↗ Partager", copied: "✓ Copié", close: "Fermer" },
  ar: { listen: "الاستماع إلى النطق", global: "النطق بلغات متعددة", korean: "الكورية", english: "الإنجليزية", chinese: "الصينية", japanese: "اليابانية", five: "توازن العناصر الخمسة", save: "⬇ حفظ الصورة", saving: "جارٍ الحفظ...", share: "↗ مشاركة", copied: "✓ تم النسخ", close: "إغلاق" },
  hi: { listen: "उच्चारण सुनें", global: "बहुभाषी उच्चारण", korean: "कोरियाई", english: "अंग्रेज़ी", chinese: "चीनी", japanese: "जापानी", five: "पाँच तत्वों का संतुलन", save: "⬇ इमेज सेव करें", saving: "सेव हो रहा है...", share: "↗ शेयर करें", copied: "✓ कॉपी हो गया", close: "बंद करें" },
};

export interface NameCardData {
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  meaning: string;
  story?: string;
  english: string;
  chinese: string;
  chinese_pinyin: string;
  japanese_kana: string;
  japanese_reading: string;
  score?: number;
}

/** 카드 창 안의 "이메일로 받기" 동작 — 고객이 고른 스타일 그대로 이미지를 만들어 부모에 넘긴다 */
export interface NameCardEmailAction {
  label: string;
  sendingLabel: string;
  status: "idle" | "sending" | "sent" | "already" | "error";
  message: string;
  onSend: (imageDataUrl: string | null, styleKey?: string) => void;
}

interface Props {
  data: NameCardData;
  lang?: string;
  targetCountry?: string;
  onClose: () => void;
  email?: NameCardEmailAction;
}

export default function MultiLangNameCard({ data, lang = "ko", targetCountry, onClose, email }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [plaqueKey, setPlaqueKey] = useState<CardStyleKey>("giwa");
  // closing: true → opacity 0 트랜지션 시작, onTransitionEnd에서 onClose() 호출
  const [closing, setClosing] = useState(false);
  // 중복 호출 방지
  const closingRef = useRef(false);

  const t = MODAL_COPY[lang] ?? MODAL_COPY.en;
  const koreanRomanized = data.english || data.name;
  const isFrameExample = plaqueKey === FRAME_EXAMPLE.id;
  const photoBg = isFrameExample ? FRAME_EXAMPLE : CARD_BACKGROUNDS.find((b) => b.id === plaqueKey) ?? null;
  const plaque = photoBg ? PHOTO_STYLE : PLAQUES[plaqueKey as PlaqueKey];
  const isLight = !photoBg && LIGHT_PLAQUE_KEYS.includes(plaqueKey as PlaqueKey);
  const textPrimary = isLight ? "#1D1B18" : "#F3EEE4";
  const textSecondary = isLight ? "rgba(29,27,24,0.65)" : "rgba(243,238,228,0.65)";
  const panelBg = isLight ? "rgba(29,27,24,0.045)" : "rgba(255,255,255,0.04)";
  const panelBorder = isLight ? "rgba(29,27,24,0.10)" : "rgba(255,255,255,0.08)";
  const panelHeaderBg = isLight ? "rgba(29,27,24,0.05)" : `${plaque.ink}14`;
  const flagEmoji = getCountryFlag(targetCountry);

  function handleSpeak(e: React.MouseEvent) {
    e.stopPropagation();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(data.name);
    u.lang = "ko-KR";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

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

  /** 지금 보이는 카드(고객이 고른 스타일)를 JPEG 이미지로 만들어 메일 발송 동작에 넘긴다. 실패하면 이미지 없이 넘긴다. */
  async function handleEmail() {
    if (!email || capturing || email.status === "sending" || email.status === "sent" || email.status === "already") return;
    setCapturing(true);
    let dataUrl: string | null = null;
    try {
      if (cardRef.current) {
        dataUrl = await toJpeg(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.9,
          // 메일 본문 배경색과 맞춰 둥근 모서리 뒤에 어두운 배경이 비치지 않게 한다
          backgroundColor: "#F3EEE4",
          // 메일 속 이미지에서는 눌러도 소리가 나지 않는 🔊 버튼은 제외한다
          filter: (node) => !(node instanceof HTMLElement && /발음|pronunciation/i.test(node.getAttribute("aria-label") ?? "")),
        });
      }
    } catch (e) {
      console.error("[namecard email capture]", e);
      dataUrl = null;
    } finally {
      document.querySelectorAll<HTMLElement>(
        "body > iframe[style*='visibility:hidden'], body > canvas[style*='display:none']"
      ).forEach((el) => el.remove());
      setCapturing(false);
    }
    email.onSend(dataUrl, String(plaqueKey));
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
          {CARD_BACKGROUNDS.map((bg) => {
            const active = bg.id === plaqueKey;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => setPlaqueKey(bg.id)}
                style={{
                  height: 34,
                  borderRadius: 10,
                  backgroundImage: `linear-gradient(rgba(10,15,30,${active ? 0.25 : 0.45}), rgba(10,15,30,${active ? 0.25 : 0.45})), url(${bg.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: active ? "1px solid #C9A45C" : "1px solid rgba(255,255,255,0.14)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}
              >
                {bg.nameKo}
              </button>
            );
          })}
          {(() => {
            const active = isFrameExample;
            return (
              <button
                type="button"
                onClick={() => setPlaqueKey(FRAME_EXAMPLE.id)}
                style={{
                  height: 34,
                  borderRadius: 10,
                  backgroundImage: `linear-gradient(rgba(10,15,30,${active ? 0.25 : 0.45}), rgba(10,15,30,${active ? 0.25 : 0.45})), url(${FRAME_EXAMPLE.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: active ? "1px solid #C9A45C" : "1px solid rgba(255,255,255,0.14)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}
              >
                {FRAME_EXAMPLE.nameKo}
              </button>
            );
          })()}
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
            border: isFrameExample ? "5px solid #C9A45C" : `1px solid ${plaque.line}`,
            boxShadow: isFrameExample
              ? "0 32px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.22)"
              : "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08)",
            fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
          }}
        >
          {isFrameExample ? (
            /* ── 프레임형(예시): 패널 없이 사진 전면 + 이름/뜻/스피커만 ── */
            <div style={{ position: "relative", width: "100%", aspectRatio: "8 / 5" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FRAME_EXAMPLE.image}
                alt={FRAME_EXAMPLE.name}
                crossOrigin="anonymous"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* 가독성용 좌측 그라디언트 */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(100deg, rgba(4,8,20,0.74) 0%, rgba(4,8,20,0.40) 45%, rgba(4,8,20,0.06) 70%, transparent 85%)",
                }}
              />
              <KoreanPatternOverlay size={140} opacity={0.5} color="#D9BC7A" />

              {/* 국기 배지 */}
              <div
                aria-hidden
                style={{
                  position: "absolute", top: 18, left: 20,
                  display: "flex", gap: 6, fontSize: 20,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                <span>🇰🇷</span>
                {flagEmoji !== "🇰🇷" && <span>{flagEmoji}</span>}
              </div>

              {/* 이름 · 로마자/한자 · 뜻 */}
              <div style={{ position: "absolute", left: 24, right: 24, bottom: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    fontSize: "clamp(40px, 10vw, 64px)", fontWeight: 900, color: "#FFFFFF",
                    fontFamily: "serif", letterSpacing: "0.05em", lineHeight: 1,
                    textShadow: "0 2px 16px rgba(0,0,0,0.55)",
                  }}>
                    {data.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    aria-label={t.listen}
                    style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      border: "1px solid rgba(217,188,122,0.6)",
                      background: "rgba(0,0,0,0.3)", color: "#D9BC7A",
                      fontSize: 15, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    🔊
                  </button>
                </div>

                <div style={{ fontSize: 15, color: "#D9BC7A", fontWeight: 600, letterSpacing: "0.04em", marginTop: 8 }}>
                  {koreanRomanized}{data.hanja ? `  ${data.hanja}` : ""}
                </div>

                {(data.meaning || data.story) && (
                  <div style={{ fontSize: 13, color: "rgba(230,222,200,0.92)", lineHeight: 1.6, maxWidth: 420, marginTop: 10 }}>
                    {data.meaning && <div>{data.meaning}</div>}
                    {data.story && <div style={{ marginTop: 2 }}>{data.story}</div>}
                  </div>
                )}
              </div>
            </div>
          ) : (
          <>
          {/* 랜드마크 사진 배경 + 그라디언트 오버레이 + 전통 문양 + 국기 배지 */}
          {photoBg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoBg.image}
                alt={photoBg.name}
                crossOrigin="anonymous"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(6,10,22,0.22) 0%, rgba(6,10,22,0.58) 45%, rgba(4,8,18,0.9) 100%)",
                }}
              />
              <KoreanPatternOverlay size={150} opacity={0.22} />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 14,
                  left: 16,
                  display: "flex",
                  gap: 5,
                  fontSize: 18,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                <span>🇰🇷</span>
                {flagEmoji !== "🇰🇷" && <span>{flagEmoji}</span>}
              </div>
            </>
          ) : (
            plaque.pattern !== "none" && (
              <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: plaque.pattern, pointerEvents: "none" }} />
            )
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
              <WinkMarkClassic size={24} />
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
            <button
              type="button"
              onClick={handleSpeak}
              aria-label={t.listen}
              style={{
                position: "absolute",
                top: 0,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${plaque.line}`,
                background: isLight ? "rgba(29,27,24,0.06)" : "rgba(255,255,255,0.08)",
                color: plaque.sub,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔊
            </button>
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
                {t.global}
              </div>

              {[
                { flag: "🇰🇷", label: t.korean,  main: data.name,              sub: koreanRomanized !== data.name ? koreanRomanized : "" },
                { flag: "🇺🇸", label: t.english, main: data.english || "—",    sub: "" },
                { flag: "🇨🇳", label: t.chinese, main: data.chinese || "—",    sub: data.chinese_pinyin || "" },
                { flag: "🇯🇵", label: t.japanese,main: data.japanese_kana || "—", sub: data.japanese_reading || "" },
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
              {t.five}
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
          </>
          )}
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
            {downloading ? t.saving : t.save}
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
            {copied ? t.copied : t.share}
          </button>
        </div>

        {/* 이메일로 받기 (이름카드는 한 번만 발송) */}
        {email && (
          <div style={{ width: "100%" }}>
            {email.status === "sent" || email.status === "already" ? (
              <div role="status" style={{ padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700, lineHeight: 1.6, color: "#BFE9CF", background: "rgba(47,158,98,0.18)", border: "1px solid rgba(47,158,98,0.55)", textAlign: "center" }}>
                {email.message}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEmail}
                  disabled={capturing || email.status === "sending"}
                  style={{
                    width: "100%", padding: "15px 0", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#F0CF7A,#C9A84C)", color: "#0B1634",
                    fontWeight: 900, fontSize: 15, letterSpacing: "0.02em",
                    cursor: capturing || email.status === "sending" ? "not-allowed" : "pointer",
                    opacity: capturing || email.status === "sending" ? 0.7 : 1,
                  }}
                >
                  {capturing || email.status === "sending" ? email.sendingLabel : email.label}
                </button>
                {email.status === "error" && (
                  <div role="alert" style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: "#FF9B8F", textAlign: "center" }}>{email.message}</div>
                )}
              </>
            )}
          </div>
        )}

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
          ✕ {t.close}
        </button>
      </div>
    </div>
  );
}
