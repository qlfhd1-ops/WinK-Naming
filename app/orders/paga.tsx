"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLang } from "@/lib/lang-config";

const LANG_STORAGE_KEY = "wink.naming.preferred-lang";

const COPY = {
  ko: {
    chip: "윙크 네이밍",
    welcome: "환영합니다. 윙크 네이밍입니다.",
    title: "삶의 가치를 높이는 이름을 설계합니다",
    subtitle: "We design names that elevate the value of life.",
    desc: "이름은 단순히 만드는 것이 아니라, 의미·발음·표기·인상·확장성까지 함께 설계하는 일입니다. 윙크 네이밍은 개인과 가족, 브랜드와 글로벌 사용까지 아우르는 프리미엄 네이밍 경험을 제공합니다.",
    trust: [
      "이름은 비공개로 관리됩니다",
      "브랜드명은 1차 유사 검토 후 제안됩니다",
      "글로벌 표기와 발음까지 함께 설계합니다",
      "리포트·패키지 확장까지 고려합니다",
    ],
    sectionTitle: "언어를 선택해 주세요",
    sectionDesc: "선택한 언어를 기준으로 이름 설계 경험이 시작됩니다.",
    continueTitle: "이전 선택 언어로 계속하기",
    continueDesc: "최근 선택한 언어가 저장되어 있습니다.",
    continueButton: "이 언어로 계속",
    selectButton: "새로 선택하기",
  },
  en: {
    chip: "윙크 네이밍",
    welcome: "Welcome. This is 윙크 네이밍.",
    title: "We design names that elevate the value of life.",
    subtitle: "A premium naming experience for people, families, and brands.",
    desc: "A name is not simply generated. It is designed across meaning, pronunciation, spelling, impression, and long-term usability. 윙크 네이밍 offers a premium naming experience for personal, family, brand, and global contexts.",
    trust: [
      "Names are managed privately",
      "Brand names are suggested after an initial similarity check",
      "Global spelling and pronunciation are designed together",
      "Reports and package extensions are considered",
    ],
    sectionTitle: "Choose your language",
    sectionDesc: "Your naming experience begins from the language you select.",
    continueTitle: "Continue with your previous language",
    continueDesc: "Your recently selected language has been saved.",
    continueButton: "Continue in this language",
    selectButton: "Choose again",
  },
} as const;

const LANG_CARDS: Array<{
  code: AppLang;
  label: string;
  sub: string;
  desc: string;
}> = [
  {
    code: "ko",
    label: "한국어",
    sub: "Korean",
    desc: "한국어 기반 이름 설계",
  },
  {
    code: "en",
    label: "English",
    sub: "English",
    desc: "Global naming experience",
  },
  {
    code: "ja",
    label: "日本語",
    sub: "Japanese",
    desc: "日本語圏に合わせた名前設計",
  },
  {
    code: "zh",
    label: "中文",
    sub: "Chinese",
    desc: "面向中文语境的名字设计",
  },
  {
    code: "es",
    label: "Español",
    sub: "Spanish",
    desc: "Diseño de nombres para uso global",
  },
];

const SUPPORTED_LANGS = new Set<AppLang>(["ko", "en", "ja", "zh", "es"]);

export default function HomePage() {
  const router = useRouter();
  const [savedLang, setSavedLang] = useState<AppLang | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const ui = COPY.ko;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.has(stored as AppLang)) {
        setSavedLang(stored as AppLang);
      }
    } catch {
      setSavedLang(null);
    }
  }, []);

  const savedLangMeta = useMemo(() => {
    if (!savedLang) return null;
    return LANG_CARDS.find((item) => item.code === savedLang) ?? null;
  }, [savedLang]);

  const handleMove = (lang: AppLang) => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors safely
    }
    router.push(`/${lang}/category`);
  };

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>

        <section
          style={{
            marginBottom: 28,
            padding: "28px 24px",
            borderRadius: 28,
            border: "1px solid rgba(120, 160, 255, 0.18)",
            background:
              "radial-gradient(circle at top left, rgba(31, 92, 255, 0.18), transparent 35%), linear-gradient(180deg, rgba(7, 17, 40, 0.96) 0%, rgba(4, 11, 28, 0.98) 100%)",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--primary-strong)",
              marginBottom: 10,
              letterSpacing: "-0.01em",
            }}
          >
            {ui.welcome}
          </div>

          <h1
            className="wink-title"
            style={{
              marginBottom: 10,
              maxWidth: 920,
              lineHeight: 1.08,
            }}
          >
            {ui.title}
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(220, 228, 242, 0.92)",
              margin: 0,
              maxWidth: 780,
              fontWeight: 500,
            }}
          >
            {ui.subtitle}
          </p>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.85,
              color: "var(--text-soft)",
              marginTop: 18,
              marginBottom: 0,
              maxWidth: 860,
            }}
          >
            {ui.desc}
          </p>
        </section>

        <div className="wink-trust-row" style={{ marginBottom: 28 }}>
          {ui.trust.map((item) => (
            <div key={item} className="wink-trust-item">
              {item}
            </div>
          ))}
        </div>

        {savedLangMeta && !showSelector ? (
          <section
            className="wink-form-section"
            style={{
              marginBottom: 24,
              border: "1px solid rgba(120, 160, 255, 0.2)",
              background:
                "linear-gradient(180deg, rgba(9, 20, 46, 0.96) 0%, rgba(7, 15, 33, 0.98) 100%)",
            }}
          >
            <div className="wink-section-head" style={{ marginBottom: 20 }}>
              <h2 className="wink-section-title">{ui.continueTitle}</h2>
              <p className="wink-section-desc">{ui.continueDesc}</p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "1fr auto auto",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  borderRadius: 22,
                  padding: "18px 20px",
                  border: "1px solid rgba(120, 160, 255, 0.18)",
                  background:
                    "linear-gradient(135deg, rgba(8, 28, 68, 0.96), rgba(5, 17, 41, 0.98))",
                }}
              >
                <div className="wink-card-title">{savedLangMeta.label}</div>
                <div
                  className="wink-result-label"
                  style={{ marginTop: 6, marginBottom: 0 }}
                >
                  {savedLangMeta.sub}
                </div>
                <div className="wink-result-text" style={{ marginTop: 10 }}>
                  {savedLangMeta.desc}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleMove(savedLangMeta.code)}
                style={primaryButtonStyle}
              >
                {ui.continueButton}
              </button>

              <button
                type="button"
                onClick={() => setShowSelector(true)}
                style={secondaryButtonStyle}
              >
                {ui.selectButton}
              </button>
            </div>
          </section>
        ) : null}

        <section className="wink-form-section">
          <div className="wink-section-head">
            <h2 className="wink-section-title">{ui.sectionTitle}</h2>
            <p className="wink-section-desc">{ui.sectionDesc}</p>
          </div>

          <div className="wink-language-grid">
            {LANG_CARDS.map((item) => (
              <button
                key={item.code}
                type="button"
                className="wink-language-card"
                onClick={() => handleMove(item.code)}
                aria-label={`${item.label} / ${item.sub}`}
              >
                <div className="wink-card-title">{item.label}</div>
                <div
                  className="wink-result-label"
                  style={{ marginTop: 6, marginBottom: 0 }}
                >
                  {item.sub}
                </div>
                <div className="wink-result-text" style={{ marginTop: 10 }}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  height: 54,
  padding: "0 20px",
  borderRadius: 16,
  border: "1px solid rgba(94, 150, 255, 0.55)",
  background:
    "linear-gradient(180deg, rgba(31, 92, 255, 0.95) 0%, rgba(17, 66, 204, 0.95) 100%)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 10px 24px rgba(20, 73, 220, 0.28)",
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 54,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid rgba(120, 160, 255, 0.22)",
  background: "rgba(9, 18, 40, 0.88)",
  color: "rgba(232, 237, 245, 0.92)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};