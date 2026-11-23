"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CARD_BACKGROUNDS } from "@/lib/card-backgrounds";
import type { GiftPayload } from "@/lib/gift-link";

type Copy = {
  tap: string; open: string; heroKicker: string; heroTitle: string;
  certKicker: string; certLine: string; issued: string;
  again: string; slow: string; share: string; copied: string;
  make: string; unsupported: string; missing: string; site: string; wrapped: string;
};

/** 9개 언어(ko/en/ja/zh/es/ru/fr/ar/hi) */
const COPY: Record<string, Copy> = {
  ko: { tap: "상자를 눌러 열어 보세요", open: "🎁 선물 열기", heroKicker: "당신을 위한 선물", heroTitle: "당신의 한국 이름이\n도착했어요", certKicker: "한국 이름 증서", certLine: "윙크 네이밍이 정성껏 설계한, 오직 당신을 위한 이름입니다", issued: "발급일", again: "🔊 다시 듣기", slow: "🐢 천천히 듣기", share: "↗ 선물 공유하기", copied: "✓ 링크가 복사됐어요", make: "나도 한국 이름 만들기", unsupported: "이 브라우저에서는 음성 재생을 지원하지 않아요. Chrome이나 Safari로 열어 주세요.", missing: "열 수 있는 선물을 찾지 못했어요. 메일의 선물 열기 버튼으로 다시 들어와 주세요.", site: "윙크 네이밍 둘러보기", wrapped: "정성껏 포장했어요" },
  en: { tap: "Tap the box to open it", open: "🎁 Open the gift", heroKicker: "A GIFT FOR YOU", heroTitle: "Your Korean name\nhas arrived", certKicker: "CERTIFICATE OF KOREAN NAME", certLine: "A name thoughtfully designed by Wink Naming, just for you", issued: "Issued", again: "🔊 Hear again", slow: "🐢 Slowly", share: "↗ Share this gift", copied: "✓ Link copied", make: "Create my Korean name", unsupported: "This browser can't play speech. Please open this page in Chrome or Safari.", missing: "We couldn't find a gift to open. Please use the Open button in your email again.", site: "Explore Wink Naming", wrapped: "Wrapped with care" },
  ja: { tap: "箱をタップして開けてみてください", open: "🎁 贈り物を開ける", heroKicker: "あなたへの贈り物", heroTitle: "あなたの韓国名が\n届きました", certKicker: "韓国名 証書", certLine: "Wink Namingが心を込めて設計した、あなただけのお名前です", issued: "発行日", again: "🔊 もう一度聞く", slow: "🐢 ゆっくり聞く", share: "↗ 贈り物を共有", copied: "✓ リンクをコピーしました", make: "私も韓国名をつくる", unsupported: "このブラウザでは音声再生に対応していません。Chrome または Safari で開いてください。", missing: "開ける贈り物が見つかりませんでした。メールの「贈り物を開ける」ボタンからもう一度お入りください。", site: "Wink Naming を見る", wrapped: "心を込めて包みました" },
  zh: { tap: "点击礼盒即可打开", open: "🎁 打开礼物", heroKicker: "送给您的礼物", heroTitle: "您的韩文名字\n已送达", certKicker: "韩文名字证书", certLine: "由 Wink Naming 精心设计、只属于您的名字", issued: "颁发日期", again: "🔊 再听一次", slow: "🐢 慢速播放", share: "↗ 分享这份礼物", copied: "✓ 链接已复制", make: "我也要取韩文名字", unsupported: "此浏览器不支持语音播放，请使用 Chrome 或 Safari 打开。", missing: "没有找到可以打开的礼物，请再次点击邮件中的“打开礼物”按钮。", site: "浏览 Wink Naming", wrapped: "用心包装" },
  es: { tap: "Toca la caja para abrirla", open: "🎁 Abrir el regalo", heroKicker: "UN REGALO PARA TI", heroTitle: "Tu nombre coreano\nha llegado", certKicker: "CERTIFICADO DE NOMBRE COREANO", certLine: "Un nombre diseñado con esmero por Wink Naming, solo para ti", issued: "Emitido", again: "🔊 Escuchar de nuevo", slow: "🐢 Más despacio", share: "↗ Compartir el regalo", copied: "✓ Enlace copiado", make: "Crear mi nombre coreano", unsupported: "Este navegador no puede reproducir voz. Abre esta página en Chrome o Safari.", missing: "No encontramos un regalo para abrir. Usa de nuevo el botón del correo.", site: "Explorar Wink Naming", wrapped: "Envuelto con cariño" },
  ru: { tap: "Нажмите на коробку, чтобы открыть", open: "🎁 Открыть подарок", heroKicker: "ПОДАРОК ДЛЯ ВАС", heroTitle: "Ваше корейское имя\nприбыло", certKicker: "СЕРТИФИКАТ КОРЕЙСКОГО ИМЕНИ", certLine: "Имя, бережно созданное Wink Naming специально для вас", issued: "Дата выдачи", again: "🔊 Ещё раз", slow: "🐢 Медленно", share: "↗ Поделиться подарком", copied: "✓ Ссылка скопирована", make: "Создать моё корейское имя", unsupported: "Этот браузер не поддерживает воспроизведение речи. Откройте страницу в Chrome или Safari.", missing: "Не удалось найти подарок. Нажмите кнопку в письме ещё раз.", site: "Открыть Wink Naming", wrapped: "Упаковано с заботой" },
  fr: { tap: "Touchez la boîte pour l'ouvrir", open: "🎁 Ouvrir le cadeau", heroKicker: "UN CADEAU POUR VOUS", heroTitle: "Votre prénom coréen\nest arrivé", certKicker: "CERTIFICAT DE PRÉNOM CORÉEN", certLine: "Un prénom conçu avec soin par Wink Naming, rien que pour vous", issued: "Délivré le", again: "🔊 Réécouter", slow: "🐢 Lentement", share: "↗ Partager ce cadeau", copied: "✓ Lien copié", make: "Créer mon prénom coréen", unsupported: "Ce navigateur ne peut pas lire la voix. Ouvrez cette page dans Chrome ou Safari.", missing: "Aucun cadeau à ouvrir. Utilisez de nouveau le bouton de l'e-mail.", site: "Découvrir Wink Naming", wrapped: "Emballé avec soin" },
  ar: { tap: "اضغط على الصندوق لفتحه", open: "🎁 افتح الهدية", heroKicker: "هدية لك", heroTitle: "وصل اسمك الكوري", certKicker: "شهادة الاسم الكوري", certLine: "اسم صمّمته Wink Naming بعناية، لك وحدك", issued: "تاريخ الإصدار", again: "🔊 استمع مرة أخرى", slow: "🐢 ببطء", share: "↗ شارك الهدية", copied: "✓ تم نسخ الرابط", make: "أنشئ اسمي الكوري", unsupported: "هذا المتصفح لا يدعم تشغيل الصوت. افتح الصفحة في Chrome أو Safari.", missing: "لم نجد هدية لفتحها. استخدم زر الفتح في البريد مرة أخرى.", site: "استكشف Wink Naming", wrapped: "مغلّفة بعناية" },
  hi: { tap: "खोलने के लिए बॉक्स पर टैप करें", open: "🎁 उपहार खोलें", heroKicker: "आपके लिए एक उपहार", heroTitle: "आपका कोरियाई नाम\nआ गया है", certKicker: "कोरियाई नाम प्रमाणपत्र", certLine: "Wink Naming द्वारा सोच-समझकर बनाया गया, सिर्फ़ आपके लिए नाम", issued: "जारी करने की तिथि", again: "🔊 फिर से सुनें", slow: "🐢 धीरे सुनें", share: "↗ उपहार शेयर करें", copied: "✓ लिंक कॉपी हो गया", make: "मेरा कोरियाई नाम बनाएँ", unsupported: "यह ब्राउज़र आवाज़ चलाने में सक्षम नहीं है। कृपया Chrome या Safari में खोलें।", missing: "खोलने के लिए कोई उपहार नहीं मिला। कृपया ईमेल का बटन फिर से दबाएँ।", site: "Wink Naming देखें", wrapped: "प्यार से लपेटा गया" },
};

const NAVY = "#1B2A5E";
const GOLD = "#B8923A";
const SEAL = "#B3261E";
const SERIF = "var(--font-noto-serif-kr,'Noto Serif KR','Nanum Myeongjo',serif)";
const SANS = "var(--font-noto-sans-kr,'Noto Sans KR','Apple SD Gothic Neo',sans-serif)";

const SPARKS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const r = 110 + (i % 4) * 34;
  return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r) - 30, d: (i % 6) * 40, s: 6 + (i % 3) * 3 };
});

export default function PresentClient({ gift }: { gift: GiftPayload | null }) {
  const rawLang = gift?.l ?? "en";
  const lang = Object.prototype.hasOwnProperty.call(COPY, rawLang) ? rawLang : "en";
  const t = COPY[lang];
  const rtl = lang === "ar";

  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const [supported, setSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const photo = useMemo(() => {
    const id = gift?.s === "gwangan-frame" ? "gwangan-bridge" : gift?.s;
    return (CARD_BACKGROUNDS.find((b) => b.id === id) ?? CARD_BACKGROUNDS[0]).image;
  }, [gift?.s]);

  const issued = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang, { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) setSupported(false);
    const tm = timers.current;
    return () => { tm.forEach(clearTimeout); try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
  }, []);

  const speak = (rate: number) => {
    if (!gift?.n || typeof window === "undefined" || !window.speechSynthesis) { setSupported(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(gift.n);
    u.lang = "ko-KR";
    u.rate = rate;
    window.speechSynthesis.speak(u);
  };

  const openGift = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    // 일부 브라우저(특히 iOS Safari)는 사용자 터치 안에서 음성을 한 번 열어 두어야 이후 자동 재생이 된다.
    try {
      if (window.speechSynthesis) {
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        window.speechSynthesis.speak(warm);
      }
    } catch { /* ignore */ }
    timers.current.push(setTimeout(() => setPhase("open"), 1250));
    timers.current.push(setTimeout(() => speak(0.85), 2150));
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) { await navigator.share({ title: `🎁 ${gift?.n ?? ""}`, url }); return; }
    } catch { return; }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* ignore */ }
  };

  const chars = Array.from(gift?.n ?? "");

  return (
    <main dir={rtl ? "rtl" : undefined} style={{ minHeight: "100vh", background: `radial-gradient(120% 80% at 50% 0%, #243a7a 0%, #0B1634 62%)`, color: "#fff", fontFamily: SANS, display: "flex", justifyContent: "center", padding: "28px 16px 48px", overflow: "hidden" }}>
      <style>{`
        @keyframes gFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes gShake { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-4deg) } 40% { transform: rotate(4deg) } 60% { transform: rotate(-3deg) } 80% { transform: rotate(3deg) } }
        @keyframes gLid { 0% { transform: translateY(0) rotate(0); opacity: 1 } 100% { transform: translateY(-120px) rotate(-14deg); opacity: 0 } }
        @keyframes gBody { 0% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(.86) translateY(24px) } }
        @keyframes gSpark { 0% { transform: translate(0,0) scale(0); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(var(--x), var(--y)) scale(1); opacity: 0 } }
        @keyframes gGlow { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes gRise { 0% { opacity: 0; transform: translateY(18px) scale(.96) } 100% { opacity: 1; transform: none } }
        @keyframes gPop { 0% { opacity: 0; transform: translateY(26px) scale(.6) } 70% { opacity: 1; transform: translateY(-4px) scale(1.06) } 100% { opacity: 1; transform: none } }
        @keyframes gStamp { 0% { opacity: 0; transform: scale(2.6) rotate(-24deg) } 60% { opacity: 1; transform: scale(.94) rotate(-6deg) } 100% { opacity: 1; transform: scale(1) rotate(-6deg) } }
        @media (prefers-reduced-motion: reduce) { .g-anim, .g-anim * { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.26em", fontWeight: 700, color: "#E7CD8A", marginBottom: 18 }}>WINK NAMING</div>

        {!gift ? (
          <div style={{ marginTop: 60, padding: "34px 22px", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(231,205,138,0.35)" }}>
            <div style={{ fontSize: 34, marginBottom: 12 }}>🎁</div>
            <p role="alert" style={{ fontSize: 14, lineHeight: 1.8, color: "#F3EEE4", margin: 0 }}>{t.missing}</p>
          </div>
        ) : phase !== "open" ? (
          /* ───── 닫힌 선물 상자 ───── */
          <div className="g-anim" style={{ marginTop: 36 }}>
            <button
              type="button"
              onClick={openGift}
              aria-label={t.open}
              style={{ position: "relative", width: 260, height: 270, background: "none", border: "none", padding: 0, cursor: "pointer", animation: phase === "closed" ? "gFloat 3.2s ease-in-out infinite" : "gShake .55s ease-in-out" }}
            >
              <div aria-hidden style={{ position: "absolute", left: "50%", top: "46%", width: 300, height: 300, transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(231,205,138,0.5) 0%, rgba(231,205,138,0) 65%)", animation: "gGlow 2.4s ease-in-out infinite" }} />
              {/* 상자 몸통 */}
              <div style={{ position: "absolute", left: 32, bottom: 14, width: 196, height: 150, borderRadius: "6px 6px 12px 12px", background: `linear-gradient(160deg, #C9362C 0%, ${SEAL} 100%)`, boxShadow: "0 18px 40px rgba(0,0,0,0.45)", animation: phase === "opening" ? "gBody .5s ease-in 0.75s forwards" : undefined }}>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 26, marginLeft: -13, background: "linear-gradient(90deg, #D9BC7A, #F1DDA5, #D9BC7A)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 0 }} />
              </div>
              {/* 뚜껑 */}
              <div style={{ position: "absolute", left: 20, bottom: 150, width: 220, height: 58, borderRadius: 10, background: "linear-gradient(160deg, #D63F34 0%, #B3261E 100%)", boxShadow: "0 8px 18px rgba(0,0,0,0.35)", animation: phase === "opening" ? "gLid .75s cubic-bezier(.3,.7,.3,1) .45s forwards" : undefined }}>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 30, marginLeft: -15, background: "linear-gradient(90deg, #D9BC7A, #F1DDA5, #D9BC7A)" }} />
                {/* 리본 매듭 */}
                <div aria-hidden style={{ position: "absolute", left: "50%", top: -30, marginLeft: -50, width: 100, height: 40 }}>
                  <div style={{ position: "absolute", left: 0, top: 4, width: 48, height: 32, borderRadius: "70% 30% 70% 30%", background: "linear-gradient(160deg,#F1DDA5,#C9A45C)", transform: "rotate(-14deg)" }} />
                  <div style={{ position: "absolute", right: 0, top: 4, width: 48, height: 32, borderRadius: "30% 70% 30% 70%", background: "linear-gradient(200deg,#F1DDA5,#C9A45C)", transform: "rotate(14deg)" }} />
                  <div style={{ position: "absolute", left: "50%", top: 10, width: 20, height: 20, marginLeft: -10, borderRadius: "50%", background: "#E7CD8A" }} />
                </div>
              </div>
              {/* 반짝임 */}
              {phase === "opening" && SPARKS.map((s, i) => (
                <span key={i} aria-hidden style={{ position: "absolute", left: "50%", top: "46%", width: s.s, height: s.s, marginLeft: -s.s / 2, borderRadius: "50%", background: i % 3 === 0 ? "#fff" : "#E7CD8A", boxShadow: "0 0 10px #E7CD8A", ["--x" as string]: `${s.x}px`, ["--y" as string]: `${s.y}px`, animation: `gSpark 1s ease-out ${0.55 + s.d / 1000}s forwards`, opacity: 0 } as React.CSSProperties} />
              ))}
            </button>

            <p style={{ marginTop: 26, fontSize: 14, color: "#E8E0CB" }}>{phase === "closed" ? t.tap : t.wrapped}</p>
            <button
              type="button"
              onClick={openGift}
              disabled={phase !== "closed"}
              style={{ marginTop: 14, padding: "15px 40px", borderRadius: 999, border: "none", background: "linear-gradient(180deg,#E7CD8A,#C9A45C)", color: "#1B2A5E", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 26px rgba(201,164,92,0.35)", opacity: phase === "closed" ? 1 : 0.6 }}
            >
              {t.open}
            </button>
          </div>
        ) : (
          /* ───── 펼쳐진 이름 증서 ───── */
          <div className="g-anim" style={{ animation: "gRise .7s ease-out both" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.5)", border: `2px solid ${GOLD}`, background: "#FFFDF7" }}>
              {/* 히어로 */}
              <div style={{ position: "relative", backgroundColor: NAVY, backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div style={{ background: "rgba(8,14,34,0.52)", padding: "34px 18px 30px" }}>
                  <div style={{ fontSize: 26, marginBottom: 10, animation: "gPop .8s ease-out .15s both" }}>🎁</div>
                  <div style={{ fontSize: 11, letterSpacing: "0.28em", fontWeight: 700, color: "#E7CD8A", marginBottom: 10, animation: "gRise .7s ease-out .3s both" }}>{t.heroKicker}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 900, lineHeight: 1.4, whiteSpace: "pre-line", animation: "gRise .7s ease-out .45s both" }}>{t.heroTitle}</div>
                </div>
              </div>

              {/* 증서 */}
              <div style={{ padding: 10, color: NAVY }}>
                <div style={{ border: "1px solid #D9BC7A", padding: "26px 16px 22px" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: GOLD, animation: "gRise .6s ease-out .7s both" }}>{t.certKicker}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: "#6B6558", marginTop: 8, animation: "gRise .6s ease-out .8s both" }}>{t.certLine}</div>

                  <div dir="ltr" style={{ marginTop: 18, fontFamily: SERIF, fontSize: chars.length > 4 ? 44 : 62, fontWeight: 900, letterSpacing: 6, lineHeight: 1.15, display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    {chars.map((ch, i) => (
                      <span key={i} style={{ display: "inline-block", animation: `gPop .7s cubic-bezier(.2,.9,.3,1.2) ${1.0 + i * 0.22}s both` }}>{ch}</span>
                    ))}
                  </div>
                  {gift.e && <div style={{ fontSize: 14, letterSpacing: "0.12em", color: GOLD, marginTop: 8, animation: "gRise .6s ease-out 1.9s both" }}>{gift.e}</div>}
                  {gift.h && (
                    <div style={{ animation: "gRise .6s ease-out 2.1s both" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 24, letterSpacing: 8, marginTop: 16 }}>{gift.h}</div>
                      {gift.hm && <div style={{ fontSize: 12, lineHeight: 1.7, color: "#6B6558", marginTop: 6 }}>{gift.hm}</div>}
                    </div>
                  )}
                  {gift.m && (
                    <div style={{ animation: "gRise .6s ease-out 2.4s both" }}>
                      <div style={{ width: 40, height: 1, background: "#D9BC7A", margin: "18px auto 14px" }} />
                      <div style={{ fontSize: 14, lineHeight: 1.85 }}>“{gift.m}”</div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 22, textAlign: rtl ? "right" : "left" }}>
                    <div style={{ fontSize: 11, lineHeight: 1.8, color: "#8A8372" }}>
                      <div style={{ letterSpacing: "0.14em", fontWeight: 700, color: GOLD }}>WINK NAMING</div>
                      <div>{t.issued} · {issued}</div>
                    </div>
                    <div aria-hidden style={{ width: 52, height: 52, borderRadius: 6, background: SEAL, color: "#fff", fontFamily: SERIF, fontSize: 17, fontWeight: 900, lineHeight: 1.15, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "gStamp .5s ease-out 2.9s both" }}>윙<br />크</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 소리 / 공유 */}
            <div style={{ animation: "gRise .7s ease-out 3.1s both" }}>
              {supported ? (
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button type="button" onClick={() => speak(0.85)} style={{ flex: 1, padding: "14px 0", borderRadius: 999, border: "none", background: "linear-gradient(180deg,#E7CD8A,#C9A45C)", color: NAVY, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>{t.again}</button>
                  <button type="button" onClick={() => speak(0.55)} style={{ flex: 1, padding: "14px 0", borderRadius: 999, border: "1.5px solid #E7CD8A", background: "transparent", color: "#E7CD8A", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{t.slow}</button>
                </div>
              ) : (
                <p role="alert" style={{ marginTop: 18, fontSize: 13, lineHeight: 1.7, color: "#FFB4A8" }}>{t.unsupported}</p>
              )}
              <button type="button" onClick={share} style={{ width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {copied ? t.copied : t.share}
              </button>
              <a href={`https://wink-naming.com/?lang=${lang}`} style={{ display: "block", marginTop: 26, fontSize: 15, fontWeight: 800, color: "#E7CD8A", textDecoration: "underline" }}>{t.make}</a>
              <a href={`https://wink-naming.com/?lang=${lang}`} style={{ display: "block", marginTop: 10, fontSize: 12, color: "#B9B3A2", textDecoration: "none" }}>{t.site}</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
