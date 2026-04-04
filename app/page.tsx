"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLang } from "@/lib/lang-config";
import SocialProof from "@/components/SocialProof";

const LANG_STORAGE_KEY = "wink.naming.preferred-lang";
const SUPPORTED_LANGS = new Set<AppLang>(["ko", "en", "ja", "zh", "es", "ru", "fr", "ar", "hi"]);

const COPY: Record<
  AppLang,
  {
    chip: string;
    welcome: string;
    title: string;
    subtitle: string;
    desc: string;
    trust: string[];
    sectionTitle: string;
    sectionDesc: string;
    continueTitle: string;
    continueDesc: string;
    continueButton: string;
    selectButton: string;
    changeLanguageButton: string;
  }
> = {
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
    changeLanguageButton: "언어 다시 고르기",
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
    changeLanguageButton: "Choose another language",
  },
  ja: {
    chip: "윙크 네이밍",
    welcome: "ようこそ。윙크 네이밍です。",
    title: "人生の価値を高める名前を設計します",
    subtitle: "We design names that elevate the value of life.",
    desc: "名前は単に作るものではなく、意味・発音・表記・印象・拡張性まで含めて設計するものです。윙크 네이밍は個人、家族、ブランド、グローバル用途まで支えるプレミアムネーミング体験を提供します。",
    trust: [
      "名前は非公開で管理されます",
      "ブランド名は一次類似確認後に提案されます",
      "グローバル表記と発音を一緒に設計します",
      "レポート・パッケージ拡張も考慮します",
    ],
    sectionTitle: "言語を選択してください",
    sectionDesc: "選択した言語を基準にネーミング体験が始まります。",
    continueTitle: "前回の言語で続ける",
    continueDesc: "最近選択した言語が保存されています。",
    continueButton: "この言語で続ける",
    selectButton: "新しく選ぶ",
    changeLanguageButton: "別の言語を選ぶ",
  },
  zh: {
    chip: "윙크 네이밍",
    welcome: "欢迎来到 윙크 네이밍。",
    title: "我们设计能够提升人生价值的名字",
    subtitle: "We design names that elevate the value of life.",
    desc: "名字不是简单生成的，而是要把含义、发音、写法、印象与延展性一起设计。윙크 네이밍 提供适用于个人、家庭、品牌与全球场景的高端命名体验。",
    trust: [
      "名字将以隐私方式管理",
      "品牌名在初步近似检视后提出",
      "同时考虑全球写法与发音",
      "兼顾报告与配套扩展",
    ],
    sectionTitle: "请选择语言",
    sectionDesc: "命名体验将从您选择的语言开始。",
    continueTitle: "继续使用上次选择的语言",
    continueDesc: "您最近选择的语言已被保存。",
    continueButton: "用此语言继续",
    selectButton: "重新选择",
    changeLanguageButton: "重新选择语言",
  },
  es: {
    chip: "윙크 네이밍",
    welcome: "Bienvenido. Esto es 윙크 네이밍.",
    title: "Diseñamos nombres que elevan el valor de la vida",
    subtitle: "We design names that elevate the value of life.",
    desc: "Un nombre no se genera simplemente. Se diseña considerando significado, pronunciación, escritura, impresión y proyección. 윙크 네이밍 ofrece una experiencia premium para personas, familias, marcas y usos globales.",
    trust: [
      "Los nombres se gestionan de forma privada",
      "Las marcas se sugieren tras una revisión inicial de similitud",
      "Se diseñan juntos la escritura y la pronunciación global",
      "También se considera la expansión a reportes y paquetes",
    ],
    sectionTitle: "Seleccione un idioma",
    sectionDesc: "La experiencia de naming comienza con el idioma que elija.",
    continueTitle: "Continuar con el idioma anterior",
    continueDesc: "Su idioma seleccionado recientemente está guardado.",
    continueButton: "Continuar con este idioma",
    selectButton: "Elegir de nuevo",
    changeLanguageButton: "Elegir otro idioma",
  },
  ru: {
    chip: "윙크 네이밍",
    welcome: "Добро пожаловать. Это 윙크 네이밍.",
    title: "Мы создаём имена, которые повышают ценность жизни",
    subtitle: "We design names that elevate the value of life.",
    desc: "Имя — это не просто генерация. Это проектирование значения, произношения, написания, впечатления и долгосрочной применимости. 윙크 네이밍 предлагает премиальный опыт именования для личных, семейных, брендовых и глобальных нужд.",
    trust: [
      "Имена хранятся конфиденциально",
      "Названия брендов предлагаются после первичной проверки",
      "Глобальное написание и произношение проектируются вместе",
      "Учитываются отчёты и расширение пакетов",
    ],
    sectionTitle: "Выберите язык",
    sectionDesc: "Опыт именования начинается с выбранного вами языка.",
    continueTitle: "Продолжить с предыдущим языком",
    continueDesc: "Ваш недавно выбранный язык сохранён.",
    continueButton: "Продолжить на этом языке",
    selectButton: "Выбрать снова",
    changeLanguageButton: "Выбрать другой язык",
  },
  fr: {
    chip: "윙크 네이밍",
    welcome: "Bienvenue. Voici 윙크 네이밍.",
    title: "Nous créons des noms qui élèvent la valeur de la vie",
    subtitle: "We design names that elevate the value of life.",
    desc: "Un nom ne se génère pas simplement. Il se conçoit en intégrant sens, prononciation, orthographe, impression et durabilité. 윙크 네이밍 offre une expérience de naming premium pour les personnes, les familles, les marques et les usages globaux.",
    trust: [
      "Les noms sont gérés de façon confidentielle",
      "Les noms de marque sont proposés après une vérification initiale",
      "L'orthographe et la prononciation globales sont conçues ensemble",
      "Les rapports et extensions de package sont pris en compte",
    ],
    sectionTitle: "Choisissez votre langue",
    sectionDesc: "Votre expérience de naming commence avec la langue choisie.",
    continueTitle: "Continuer avec la langue précédente",
    continueDesc: "Votre langue récemment sélectionnée a été sauvegardée.",
    continueButton: "Continuer dans cette langue",
    selectButton: "Choisir à nouveau",
    changeLanguageButton: "Choisir une autre langue",
  },
  ar: {
    chip: "윙크 네이밍",
    welcome: "مرحباً. هذا هو 윙크 네이밍.",
    title: "نصمم أسماء ترفع من قيمة الحياة",
    subtitle: "We design names that elevate the value of life.",
    desc: "الاسم لا يُولَّد فحسب، بل يُصمَّم بعناية ليشمل المعنى والنطق والكتابة والانطباع والاستخدام على المدى الطويل. تقدم 윙크 네이밍 تجربة تسمية متميزة للأفراد والعائلات والعلامات التجارية والاستخدامات العالمية.",
    trust: [
      "تُدار الأسماء بسرية تامة",
      "تُقترح أسماء العلامات التجارية بعد مراجعة أولية",
      "يُصمَّم النطق العالمي والكتابة معاً",
      "تُؤخذ التقارير وتوسعات الحزم بعين الاعتبار",
    ],
    sectionTitle: "اختر لغتك",
    sectionDesc: "تبدأ تجربة التسمية بالغة التي تختارها.",
    continueTitle: "المتابعة باللغة السابقة",
    continueDesc: "تم حفظ لغتك المختارة مؤخراً.",
    continueButton: "المتابعة بهذه اللغة",
    selectButton: "اختر مجدداً",
    changeLanguageButton: "اختر لغة أخرى",
  },
  hi: {
    chip: "윙크 네이밍",
    welcome: "स्वागत है। यह है 윙크 네이밍।",
    title: "हम ऐसे नाम डिज़ाइन करते हैं जो जीवन की कीमत बढ़ाएं",
    subtitle: "We design names that elevate the value of life.",
    desc: "एक नाम सिर्फ बनाया नहीं जाता — इसे अर्थ, उच्चारण, लेखन, प्रभाव और दीर्घकालिक उपयोगिता के साथ डिज़ाइन किया जाता है। 윙크 네이밍 व्यक्तिगत, पारिवारिक, ब्रांड और वैश्विक संदर्भों के लिए एक प्रीमियम नामकरण अनुभव प्रदान करता है।",
    trust: [
      "नामों को गोपनीय रखा जाता है",
      "ब्रांड नाम प्रारंभिक समानता जांच के बाद सुझाए जाते हैं",
      "वैश्विक वर्तनी और उच्चारण एक साथ डिज़ाइन किए जाते हैं",
      "रिपोर्ट और पैकेज विस्तार पर भी विचार किया जाता है",
    ],
    sectionTitle: "अपनी भाषा चुनें",
    sectionDesc: "आपका नामकरण अनुभव आपकी चुनी हुई भाषा से शुरू होता है।",
    continueTitle: "पिछली भाषा से जारी रखें",
    continueDesc: "आपकी हाल ही में चुनी गई भाषा सहेजी गई है।",
    continueButton: "इस भाषा में जारी रखें",
    selectButton: "फिर से चुनें",
    changeLanguageButton: "दूसरी भाषा चुनें",
  },
};

const LANG_CARDS: Array<{
  code: AppLang;
  label: string;
  sub: string;
  desc: string;
}> = [
  { code: "ko", label: "한국어", sub: "Korean", desc: "한국어 기반 이름 설계" },
  { code: "en", label: "English", sub: "English", desc: "Global naming experience" },
  { code: "ja", label: "日本語", sub: "Japanese", desc: "日本語圏に合わせた名前設計" },
  { code: "zh", label: "中文", sub: "Chinese", desc: "面向中文语境的名字设计" },
  { code: "es", label: "Español", sub: "Spanish", desc: "Diseño de nombres para uso global" },
  { code: "ru", label: "Русский", sub: "Russian", desc: "Создание имён на русском языке" },
  { code: "fr", label: "Français", sub: "French", desc: "Conception de noms en français" },
  { code: "ar", label: "العربية", sub: "Arabic", desc: "تصميم الأسماء باللغة العربية" },
  { code: "hi", label: "हिन्दी", sub: "Hindi", desc: "हिंदी में नाम डिज़ाइन करें" },
];

export default function HomePage() {
  const router = useRouter();
  const [savedLang, setSavedLang] = useState<AppLang | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.has(stored as AppLang)) {
        setSavedLang(stored as AppLang);
      } else {
        setSavedLang(null);
      }
    } catch {
      setSavedLang(null);
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const s = usePageStyles(isLight);

  const savedLangMeta = useMemo(() => {
    if (!savedLang) return null;
    return LANG_CARDS.find((item) => item.code === savedLang) ?? null;
  }, [savedLang]);

  const ui = useMemo(() => {
    if (savedLang && !showSelector) {
      return COPY[savedLang];
    }
    return COPY.ko;
  }, [savedLang, showSelector]);

  const shouldShowContinue = mounted && Boolean(savedLangMeta) && !showSelector;
  const shouldShowSelector = mounted && (!savedLangMeta || showSelector);

  const handleMove = (lang: AppLang) => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    router.push(`/${lang}/category`);
  };

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>

        <section style={s.heroSection}>
          <div style={s.welcome}>{ui.welcome}</div>

          <h1
            className="wink-title"
            style={{
              marginBottom: 10,
              maxWidth: 920,
              lineHeight: 1.08,
              fontSize: "clamp(24px, 3.8vw, 52px)",
              whiteSpace: "nowrap",
            }}
          >
            {ui.title}
          </h1>

          <p style={s.subtitle}>{ui.subtitle}</p>
          <p style={s.desc}>{ui.desc}</p>
        </section>

        <div className="wink-trust-row" style={{ marginBottom: 28 }}>
          {ui.trust.map((item) => (
            <div key={item} className="wink-trust-item">
              {item}
            </div>
          ))}
        </div>

        <SocialProof isLight={isLight} />

        {shouldShowContinue ? (
          <section className="wink-form-section" style={s.continueSection}>
            <div className="wink-section-head" style={{ marginBottom: 20 }}>
              <h2 className="wink-section-title">{ui.continueTitle}</h2>
              <p className="wink-section-desc">{ui.continueDesc}</p>
            </div>

            <div style={s.continueGrid}>
              <div style={s.savedCard}>
                <div className="wink-card-title">{savedLangMeta?.label}</div>
                <div
                  className="wink-result-label"
                  style={{ marginTop: 6, marginBottom: 0 }}
                >
                  {savedLangMeta?.sub}
                </div>
                <div className="wink-result-text" style={{ marginTop: 10 }}>
                  {savedLangMeta?.desc}
                </div>
              </div>

              <div style={s.continueButtonsWrap}>
                <button
                  type="button"
                  onClick={() => savedLangMeta && handleMove(savedLangMeta.code)}
                  style={s.primaryButton}
                >
                  {ui.continueButton}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSelector(true)}
                  style={s.secondaryButton}
                >
                  {ui.changeLanguageButton}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {shouldShowSelector ? (
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

            {savedLangMeta ? (
              <div className="wink-actions" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  style={s.secondaryButton}
                  onClick={() => setShowSelector(false)}
                >
                  {ui.selectButton}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function usePageStyles(isLight: boolean) {
  return useMemo((): Record<string, CSSProperties> => ({
    heroSection: {
      marginBottom: 28,
      padding: "30px 24px",
      borderRadius: 28,
      border: isLight
        ? "1px solid rgba(160, 120, 60, 0.22)"
        : "1px solid rgba(120, 160, 255, 0.18)",
      background: isLight
        ? "linear-gradient(180deg, rgba(255, 249, 235, 0.98) 0%, rgba(255, 244, 220, 0.96) 100%)"
        : "radial-gradient(circle at top left, rgba(31, 92, 255, 0.18), transparent 35%), linear-gradient(180deg, rgba(7, 17, 40, 0.96) 0%, rgba(4, 11, 28, 0.98) 100%)",
      boxShadow: isLight
        ? "0 18px 50px rgba(80, 55, 20, 0.12)"
        : "0 18px 50px rgba(0, 0, 0, 0.28)",
    },
    welcome: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--gold-strong)",
      marginBottom: 10,
      letterSpacing: "-0.01em",
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 1.7,
      color: isLight ? "var(--text-soft)" : "rgba(220, 228, 242, 0.92)",
      margin: 0,
      maxWidth: 780,
      fontWeight: 500,
    },
    desc: {
      fontSize: 15,
      lineHeight: 1.85,
      color: "var(--text-soft)",
      marginTop: 18,
      marginBottom: 0,
      maxWidth: 860,
    },
    continueSection: {
      marginBottom: 24,
      border: isLight
        ? "1px solid rgba(160, 120, 60, 0.20)"
        : "1px solid rgba(120, 160, 255, 0.2)",
      background: isLight
        ? "linear-gradient(180deg, rgba(255, 250, 238, 0.98) 0%, rgba(255, 245, 225, 0.96) 100%)"
        : "linear-gradient(180deg, rgba(9, 20, 46, 0.96) 0%, rgba(7, 15, 33, 0.98) 100%)",
    },
    continueGrid: {
      display: "grid",
      gap: 14,
      gridTemplateColumns: "minmax(0, 1fr)",
      alignItems: "stretch",
    },
    savedCard: {
      borderRadius: 22,
      padding: "18px 20px",
      border: isLight
        ? "1px solid rgba(160, 120, 60, 0.18)"
        : "1px solid rgba(120, 160, 255, 0.18)",
      background: isLight
        ? "rgba(255, 251, 240, 0.98)"
        : "linear-gradient(135deg, rgba(8, 28, 68, 0.96), rgba(5, 17, 41, 0.98))",
    },
    continueButtonsWrap: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap" as const,
    },
    primaryButton: {
      height: 54,
      padding: "0 20px",
      borderRadius: 16,
      border: isLight ? "1px solid rgba(27, 42, 94, 0.30)" : "1px solid rgba(94, 150, 255, 0.55)",
      background: isLight
        ? "linear-gradient(180deg, #1B2A5E 0%, #2a4faa 100%)"
        : "linear-gradient(180deg, rgba(31, 92, 255, 0.95) 0%, rgba(17, 66, 204, 0.95) 100%)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
      boxShadow: isLight
        ? "0 8px 22px rgba(27, 42, 94, 0.24)"
        : "0 10px 24px rgba(20, 73, 220, 0.28)",
    },
    secondaryButton: {
      height: 54,
      padding: "0 18px",
      borderRadius: 16,
      border: isLight ? "1px solid var(--line-strong)" : "1px solid rgba(120, 160, 255, 0.22)",
      background: isLight ? "rgba(255, 251, 242, 0.96)" : "rgba(9, 18, 40, 0.88)",
      color: isLight ? "var(--text-main)" : "rgba(232, 237, 245, 0.92)",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
    },
  }), [isLight]);
}