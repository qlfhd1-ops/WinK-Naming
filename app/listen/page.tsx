"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * /listen?n=<이름>&r=<로마자>&lang=<언어>
 * 이름카드 메일의 "🔊 발음 듣기" 버튼이 여는 페이지.
 * 메일 안에서는 소리를 재생할 수 없으므로, 이 페이지에서 브라우저 음성합성(ko-KR)으로 이름을 읽어 준다.
 * 로그인·DB 조회 없이 쿼리의 이름만 사용하며(텍스트로만 렌더), 이름은 20자까지만 허용한다.
 */

const COPY: Record<string, { title: string; play: string; slow: string; unsupported: string; site: string }> = {
  ko: { title: "이름 발음 듣기", play: "🔊 다시 듣기", slow: "🐢 천천히 듣기", unsupported: "이 브라우저에서는 음성 재생을 지원하지 않아요. 다른 브라우저(Chrome, Safari)로 열어 주세요.", site: "윙크 네이밍 둘러보기" },
  en: { title: "Hear the pronunciation", play: "🔊 Play again", slow: "🐢 Slowly", unsupported: "This browser can't play speech. Please open this page in Chrome or Safari.", site: "Explore Wink Naming" },
  ja: { title: "名前の発音を聞く", play: "🔊 もう一度聞く", slow: "🐢 ゆっくり聞く", unsupported: "このブラウザでは音声再生に対応していません。Chrome または Safari で開いてください。", site: "Wink Naming を見る" },
  zh: { title: "收听名字发音", play: "🔊 再听一次", slow: "🐢 慢速播放", unsupported: "此浏览器不支持语音播放，请使用 Chrome 或 Safari 打开。", site: "浏览 Wink Naming" },
  es: { title: "Escuchar la pronunciación", play: "🔊 Escuchar de nuevo", slow: "🐢 Más despacio", unsupported: "Este navegador no puede reproducir voz. Abre esta página en Chrome o Safari.", site: "Explorar Wink Naming" },
  ru: { title: "Послушать произношение", play: "🔊 Ещё раз", slow: "🐢 Медленно", unsupported: "Этот браузер не поддерживает воспроизведение речи. Откройте страницу в Chrome или Safari.", site: "Открыть Wink Naming" },
  fr: { title: "Écouter la prononciation", play: "🔊 Réécouter", slow: "🐢 Lentement", unsupported: "Ce navigateur ne peut pas lire la voix. Ouvrez cette page dans Chrome ou Safari.", site: "Découvrir Wink Naming" },
  ar: { title: "الاستماع إلى النطق", play: "🔊 استمع مرة أخرى", slow: "🐢 ببطء", unsupported: "هذا المتصفح لا يدعم تشغيل الصوت. افتح الصفحة في Chrome أو Safari.", site: "استكشف Wink Naming" },
  hi: { title: "उच्चारण सुनें", play: "🔊 फिर से सुनें", slow: "🐢 धीरे सुनें", unsupported: "यह ब्राउज़र आवाज़ चलाने में सक्षम नहीं है। कृपया Chrome या Safari में खोलें।", site: "Wink Naming देखें" },
};

function ListenInner() {
  const sp = useSearchParams();
  const name = (sp.get("n") ?? "").trim().slice(0, 20);
  const roman = (sp.get("r") ?? "").trim().slice(0, 40);
  const rawLang = sp.get("lang") ?? "en";
  const lang = Object.prototype.hasOwnProperty.call(COPY, rawLang) ? rawLang : "en";
  const ui = COPY[lang];
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);

  const speak = (rate: number) => {
    if (!name || typeof window === "undefined" || !window.speechSynthesis) { setSupported(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(name);
    u.lang = "ko-KR";
    u.rate = rate;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) setSupported(false);
    // 일부 브라우저는 사용자 동작 없이 재생을 막으므로, 자동 재생은 시도만 하고 버튼으로도 재생할 수 있게 한다.
    const t = setTimeout(() => speak(0.85), 400);
    return () => { clearTimeout(t); try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";
  const sans = "var(--font-noto-sans-kr,'Noto Sans KR',sans-serif)";

  return (
    <main dir={lang === "ar" ? "rtl" : undefined} style={{ minHeight: "100vh", background: "#F3EEE4", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: sans }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center", color: "#1B2A5E" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: "#B8923A", marginBottom: 18 }}>WINK NAMING</div>
        <div style={{ background: "#fff", border: "1px solid #E4D9BE", borderRadius: 20, padding: "36px 22px", boxShadow: "0 4px 24px rgba(27,42,94,0.08)" }}>
          <div style={{ fontSize: 13, color: "#6B6558", marginBottom: 14 }}>{ui.title}</div>
          {name ? (
            <>
              <div style={{ fontFamily: serif, fontSize: 60, fontWeight: 900, letterSpacing: 8, lineHeight: 1.15 }}>{name}</div>
              {roman && <div style={{ marginTop: 8, fontSize: 15, letterSpacing: "0.08em", color: "#B8923A" }}>{roman}</div>}
              {supported ? (
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button type="button" onClick={() => speak(0.85)} style={{ flex: 1, padding: "14px 0", borderRadius: 999, border: "none", background: "#1B2A5E", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: playing ? 0.8 : 1 }}>
                    {ui.play}
                  </button>
                  <button type="button" onClick={() => speak(0.55)} style={{ flex: 1, padding: "14px 0", borderRadius: 999, border: "1.5px solid #B8923A", background: "transparent", color: "#B8923A", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {ui.slow}
                  </button>
                </div>
              ) : (
                <p role="alert" style={{ marginTop: 22, fontSize: 13, lineHeight: 1.7, color: "#C53030" }}>{ui.unsupported}</p>
              )}
            </>
          ) : null}
        </div>
        <a href={`https://wink-naming.com/?lang=${lang}`} style={{ display: "inline-block", marginTop: 22, fontSize: 13, fontWeight: 700, color: "#1B2A5E", textDecoration: "underline" }}>
          {ui.site}
        </a>
      </div>
    </main>
  );
}

export default function ListenPage() {
  return (
    <Suspense fallback={null}>
      <ListenInner />
    </Suspense>
  );
}
