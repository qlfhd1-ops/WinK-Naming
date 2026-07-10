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
    hangeulChip: string;
    hangeulTitle: string;
    hangeulBody: string;
    hangeulGift: string;
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
    hangeulChip: "한글의 우수성",
    hangeulTitle: "세계가 주목하는 문자, 한글",
    hangeulBody: "한글은 소리와 뜻을 동시에 담을 수 있도록 과학적으로 설계된 문자입니다. 자음과 모음이 어우러져 만들어내는 정교한 조화, 배우기 쉬우면서도 표현의 깊이가 남다른 언어 — 전 세계 언어학자들이 가장 우수한 문자 체계 중 하나로 꼽는 이유입니다.",
    hangeulGift: "나와 소중한 사람들에게 한글 이름을 선물하세요. 뜻과 소리가 함께 깃든 한국식 이름은 단순한 호칭을 넘어 하나의 정체성이 됩니다. 언젠가 대한민국을 찾는 날, 자신만의 한국 이름으로 현지인과 마음을 나눠보세요.",
  },
  en: {
    chip: "Wink Naming",
    welcome: "Welcome to Wink Naming.",
    title: "We design names that elevate the value of life.",
    subtitle: "A premium naming experience for people, families, and brands.",
    desc: "A name is not simply generated. It is designed across meaning, pronunciation, spelling, impression, and long-term usability. Wink Naming offers a premium naming experience for personal, family, brand, and global contexts.",
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
    hangeulChip: "Why Hangul?",
    hangeulTitle: "Hangul — The Script the World Admires",
    hangeulBody: "Hangul was scientifically designed to capture both sound and meaning with perfect precision. Its elegant harmony of consonants and vowels makes it one of the most logical, learnable, and expressive writing systems ever created — celebrated by linguists worldwide as a true masterpiece of human design.",
    hangeulGift: "Gift a Korean name to yourself and the people you love. A name rooted in both meaning and sound becomes more than a label — it becomes an identity. And when you one day set foot in Korea, that name becomes your first bridge to the people here.",
  },
  ja: {
    chip: "ウィンクネーミング",
    welcome: "ようこそ。ウィンクネーミングへ。",
    title: "人生の価値を高める名前を設計します",
    subtitle: "個人・ご家族・ブランドのためのプレミアムネーミング体験",
    desc: "名前は単に作るものではなく、意味・発音・表記・印象・拡張性まで含めて設計するものです。ウィンクネーミングは個人、家族、ブランド、グローバル用途まで支えるプレミアムネーミング体験を提供します。",
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
    hangeulChip: "ハングルの優秀性",
    hangeulTitle: "世界が注目する文字、ハングル",
    hangeulBody: "ハングルは、音と意味を同時に表現できるよう科学的に設計された文字体系です。子音と母音が織り成す精巧な調和、習得しやすさと深い表現力を兼ね備えた言語として、世界中の言語学者から最も優れた文字体系のひとつに挙げられています。",
    hangeulGift: "大切な人と自分へ、ハングルの名前を贈りましょう。意味と音が宿る韓国式の名前は、単なる呼び名を超えて、ひとつのアイデンティティになります。いつか韓国を訪れる日、その名前があなたと現地の人々をつなぐ橋になるでしょう。",
  },
  zh: {
    chip: "Wink Naming",
    welcome: "欢迎来到 Wink Naming。",
    title: "我们设计能够提升人生价值的名字",
    subtitle: "为个人、家庭和品牌提供高端命名体验",
    desc: "名字不是简单生成的，而是要把含义、发音、写法、印象与延展性一起设计。Wink Naming 提供适用于个人、家庭、品牌与全球场景的高端命名体验。",
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
    hangeulChip: "韩文的卓越性",
    hangeulTitle: "举世瞩目的文字——韩文",
    hangeulBody: "韩文是一套经过科学设计的文字体系，能够同时承载声音与意义。辅音与元音相互呼应，构成精妙的和谐，易于学习却深具表达力——这正是全球语言学家将其列为最优秀文字体系之一的原因。",
    hangeulGift: "为自己和珍爱的人送上一个韩文名字吧。一个兼具意义与声音的韩国式名字，不仅仅是一个称呼，更是一种独特的身份认同。终有一天踏上韩国的土地时，那个名字将成为你与当地人心意相通的桥梁。",
  },
  es: {
    chip: "Wink Naming",
    welcome: "Bienvenido a Wink Naming.",
    title: "Diseñamos nombres que elevan el valor de la vida",
    subtitle: "Una experiencia de naming premium para personas, familias y marcas",
    desc: "Un nombre no se genera simplemente. Se diseña considerando significado, pronunciación, escritura, impresión y proyección. Wink Naming ofrece una experiencia premium para personas, familias, marcas y usos globales.",
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
    hangeulChip: "La excelencia del Hangul",
    hangeulTitle: "El alfabeto que el mundo admira: el Hangul",
    hangeulBody: "El Hangul fue diseñado científicamente para capturar sonido y significado con precisión perfecta. Su armoniosa combinación de consonantes y vocales lo convierte en uno de los sistemas de escritura más lógicos, accesibles y expresivos jamás creados, celebrado por lingüistas de todo el mundo.",
    hangeulGift: "Regálate a ti mismo y a quienes amas un nombre en coreano. Un nombre arraigado en el sonido y el significado se convierte en algo más que una etiqueta: se convierte en una identidad. Y cuando algún día pongas un pie en Corea, ese nombre será tu primer puente hacia su gente.",
  },
  ru: {
    chip: "Wink Naming",
    welcome: "Добро пожаловать в Wink Naming.",
    title: "Мы создаём имена, которые повышают ценность жизни",
    subtitle: "Премиальный опыт именования для людей, семей и брендов",
    desc: "Имя — это не просто генерация. Это проектирование значения, произношения, написания, впечатления и долгосрочной применимости. Wink Naming предлагает премиальный опыт именования для личных, семейных, брендовых и глобальных нужд.",
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
    hangeulChip: "Превосходство хангыля",
    hangeulTitle: "Письмо, восхищающее весь мир — хангыль",
    hangeulBody: "Хангыль был научно разработан для точной передачи звука и смысла одновременно. Гармоничное сочетание согласных и гласных делает его одной из самых логичных, доступных и выразительных письменных систем в мире — признанным лингвистами всей планеты шедевром человеческого замысла.",
    hangeulGift: "Подарите себе и близким корейское имя. Имя, в котором живут звук и смысл, становится больше чем просто словом — оно становится частью вашей личности. И когда вы однажды окажетесь в Корее, именно это имя станет вашим первым мостом к местным жителям.",
  },
  fr: {
    chip: "Wink Naming",
    welcome: "Bienvenue chez Wink Naming.",
    title: "Nous créons des noms qui élèvent la valeur de la vie",
    subtitle: "Une expérience de naming premium pour les personnes, les familles et les marques",
    desc: "Un nom ne se génère pas simplement. Il se conçoit en intégrant sens, prononciation, orthographe, impression et durabilité. Wink Naming offre une expérience de naming premium pour les personnes, les familles, les marques et les usages globaux.",
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
    hangeulChip: "L'excellence du Hangul",
    hangeulTitle: "Hangul — L'écriture que le monde admire",
    hangeulBody: "Le Hangul a été scientifiquement conçu pour capturer à la fois le son et le sens avec une précision parfaite. Son harmonie élégante entre consonnes et voyelles en fait l'un des systèmes d'écriture les plus logiques, accessibles et expressifs jamais créés — salué par les linguistes du monde entier comme un chef-d'œuvre de conception humaine.",
    hangeulGift: "Offrez un prénom coréen à vous-même et aux êtres qui vous sont chers. Un nom ancré dans le son et le sens devient bien plus qu'une étiquette — il devient une identité. Et le jour où vous poserez le pied en Corée, ce nom sera votre premier pont vers ses habitants.",
  },
  ar: {
    chip: "Wink Naming",
    welcome: "مرحباً بكم في Wink Naming.",
    title: "نصمم أسماء ترفع من قيمة الحياة",
    subtitle: "تجربة تسمية متميزة للأفراد والعائلات والعلامات التجارية",
    desc: "الاسم لا يُولَّد فحسب، بل يُصمَّم بعناية ليشمل المعنى والنطق والكتابة والانطباع والاستخدام على المدى الطويل. تقدم Wink Naming تجربة تسمية متميزة للأفراد والعائلات والعلامات التجارية والاستخدامات العالمية.",
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
    hangeulChip: "تميّز الهانغول",
    hangeulTitle: "الهانغول — الخط الذي يُبهر العالم",
    hangeulBody: "صُمِّم الهانغول بعناية علمية ليجمع بين الصوت والمعنى بدقة متناهية. تُشكّل الأحرف الساكنة والمتحركة تناسقاً بديعاً يجعل منه أحد أكثر أنظمة الكتابة منطقية وسهولة وتعبيراً في العالم — وهو ما يُشيد به علماء اللغة في كل مكان.",
    hangeulGift: "أهدِ لنفسك ولمن تُحب اسماً كورياً. اسم تتجذّر فيه المعاني والأصوات يتجاوز مجرد لقب ليصبح هوية حقيقية. وحين تطأ قدماك يوماً أرض كوريا، سيكون هذا الاسم أوّل جسر يصلك بأهلها.",
  },
  hi: {
    chip: "Wink Naming",
    welcome: "Wink Naming में आपका स्वागत है।",
    title: "हम ऐसे नाम डिज़ाइन करते हैं जो जीवन की कीमत बढ़ाएं",
    subtitle: "व्यक्तियों, परिवारों और ब्रांड के लिए प्रीमियम नामकरण अनुभव",
    desc: "एक नाम सिर्फ बनाया नहीं जाता — इसे अर्थ, उच्चारण, लेखन, प्रभाव और दीर्घकालिक उपयोगिता के साथ डिज़ाइन किया जाता है। Wink Naming व्यक्तिगत, पारिवारिक, ब्रांड और वैश्विक संदर्भों के लिए एक प्रीमियम नामकरण अनुभव प्रदान करता है।",
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
    hangeulChip: "हंगुल की उत्कृष्टता",
    hangeulTitle: "हंगुल — वह लिपि जिसे पूरी दुनिया सराहती है",
    hangeulBody: "हंगुल को वैज्ञानिक रूप से ध्वनि और अर्थ दोनों को एक साथ सटीकता से व्यक्त करने के लिए डिज़ाइन किया गया है। व्यंजन और स्वरों का यह सुंदर समन्वय इसे दुनिया की सबसे तार्किक, सरल और अभिव्यंजक लेखन प्रणालियों में से एक बनाता है — जिसे वैश्विक भाषाविद् मानव रचनात्मकता का उत्कृष्ट उदाहरण मानते हैं।",
    hangeulGift: "अपने लिए और अपने प्रियजनों को एक कोरियाई नाम का उपहार दें। ध्वनि और अर्थ से भरा एक कोरियाई नाम महज एक पहचान से कहीं अधिक बन जाता है — यह एक अस्तित्व की पहचान बन जाता है। और जब कभी आप कोरिया की धरती पर कदम रखें, वह नाम ही आपको यहाँ के लोगों से जोड़ने का पहला सेतु बनेगा।",
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
    if (savedLang && !showSelector) return COPY[savedLang];
    // 저장된 언어 없으면 브라우저 언어 감지: 한국어면 ko, 나머지는 en
    if (typeof navigator !== "undefined") {
      const bl = navigator.language?.slice(0, 2) ?? "ko";
      const detected = bl === "ko" ? "ko" : "en";
      return COPY[detected as AppLang] ?? COPY.ko;
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

        <SocialProof isLight={isLight} lang={savedLang ?? "ko"} />

        {/* 한글 우수성 섹션 */}
        <section style={{
          margin: "28px 0",
          padding: "28px 28px 24px",
          borderRadius: 22,
          border: isLight
            ? "1px solid rgba(160, 120, 60, 0.20)"
            : "1px solid rgba(120, 160, 255, 0.14)",
          background: isLight
            ? "linear-gradient(135deg, rgba(255, 249, 235, 0.98), rgba(255, 244, 218, 0.95))"
            : "linear-gradient(135deg, rgba(12, 26, 60, 0.80), rgba(7, 15, 36, 0.90))",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const,
            color: "rgba(201,168,76,0.85)",
            background: "rgba(201,168,76,0.10)",
            border: "1px solid rgba(201,168,76,0.28)",
            borderRadius: 99, padding: "3px 11px", marginBottom: 16,
          }}>
            {ui.hangeulChip}
          </div>
          <h2 style={{
            fontSize: "clamp(18px, 2.4vw, 26px)", fontWeight: 900,
            color: "var(--text-main)", marginBottom: 12, lineHeight: 1.2,
          }}>
            {ui.hangeulTitle}
          </h2>
          <p style={{
            fontSize: 14, lineHeight: 1.85, color: "var(--text-soft)",
            maxWidth: 720, marginBottom: 16,
          }}>
            {ui.hangeulBody}
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.85,
            color: isLight ? "rgba(120, 80, 20, 0.78)" : "rgba(201,168,76,0.72)",
            maxWidth: 720, marginBottom: 0,
            padding: "14px 18px",
            borderRadius: 12,
            background: isLight
              ? "rgba(201,168,76,0.08)"
              : "rgba(201,168,76,0.06)",
            border: "1px solid rgba(201,168,76,0.18)",
          }}>
            {ui.hangeulGift}
          </p>
        </section>

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