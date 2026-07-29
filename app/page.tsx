"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LANG_KEY = "wink.naming.preferred-lang";
const LANGS = ["ko","en","ja","zh","es","ru","fr","ar","hi"] as const;
type Lang = typeof LANGS[number];
const LANG_LABELS: Record<Lang, string> = {
  ko:"한국어", en:"English", ja:"日本語", zh:"中文",
  es:"Español", fr:"Français", ru:"Русский", ar:"العربية", hi:"हिन्दी",
};

const THEME = {
  "korean-name":  { accent: "#C9A84C", bg: "#0F1A3A", badge: "#1a2d5a" },
  "child":        { accent: "#5B8ED6", bg: "#0A1628", badge: "#14244a" },
  "pet":          { accent: "#6AAE8F", bg: "#0C1E18", badge: "#162e24" },
  "foreign":      { accent: "#B87DBF", bg: "#1A0E2A", badge: "#2a1842" },
  "goods":        { accent: "#C4845A", bg: "#1E1208", badge: "#2e1c10" },
} as const;

const CATS = [
  {
    id: "korean-name",
    label: "나의 한국 이름",
    sub: "외국인 한국 이름 · Korean Name for You",
    emoji: "🇰🇷",
    desc: "한국을 사랑하는 당신에게\n특별한 한국 이름을 드립니다.\n발음·의미·느낌 모두 고려한 설계.",
    points: ["국적·이름의 음운 기반 변환", "의미와 감성까지 담은 설계", "한자·한글 병기 제공", "영어·일본어·중국어 원명 반영"],
    href: (lang: string) => `/${lang}/design?type=foreign_to_korean`,
    secondary: null,
    cta: "나의 한국 이름 만들기",
  },
  {
    id: "child",
    label: "아이 이름",
    sub: "태명 · 아기이름 · 개명",
    emoji: "✨",
    desc: "세상에 하나뿐인 이름을 설계합니다.\n성씨 음운 조화, 한자 오행 획수,\n놀림감 필터까지 모두 반영합니다.",
    points: ["성씨와 이름의 음운 조화", "한자 오행·획수 분석", "놀림감·유사 이름 필터", "다국어 발음 동시 설계"],
    href: (lang: string) => `/${lang}/design?type=child`,
    secondary: null,
    cta: "이름 설계 시작하기",
  },
  {
    id: "pet",
    label: "반려동물",
    sub: "반려견 · 반려묘 · 기타",
    emoji: "🐾",
    desc: "소중한 가족의 이름을 설계합니다.\n한국 고유의 감성을 담은\n기억하기 좋은 이름으로.",
    points: ["성격·외모 기반 설계", "한국 고유어·음식·자연에서 영감", "부르기 좋은 음절 고려", "귀여움·위엄·개성 반영"],
    href: (lang: string) => `/${lang}/design?type=pet`,
    secondary: null,
    cta: "반려동물 이름 짓기",
  },
  {
    id: "foreign",
    label: "외국 이름",
    sub: "한국이름 → 외국이름",
    emoji: "🌍",
    desc: "발음과 의미를 함께 살려\n국경을 넘는 이름을 만듭니다.\n글로벌 무대를 위한 설계.",
    points: ["발음 기반 자연스러운 변환", "의미·분위기 기반 새 이름", "영어·중국어·프랑스어 등 지원", "국제 무대에서 쓰기 좋은 이름"],
    href: (lang: string) => `/${lang}/design?type=korean_to_foreign`,
    secondary: null,
    cta: "이름 설계 시작하기",
  },
  {
    id: "goods",
    label: "도장 · 굿즈",
    sub: "도장 · 문패 · 선물",
    emoji: "🏮",
    desc: "설계한 이름을 실물로 만듭니다.\n목인·흑단·수우각 도장과\n이름 새긴 문패·선물 세트.",
    points: ["목인·흑단·자수정 도장 제작", "이름 새긴 문패 제작", "네임카드·선물 패키지", "이름 설계와 연계 구성"],
    href: () => `/ko/order`,
    secondary: null,
    cta: "도장·굿즈 주문하기",
  },
] as const;

type CatId = typeof CATS[number]["id"];

// ── 카테고리 설명 + 포인트 다국어 ───────────────────────────
const CAT_DESC_BY_LANG = {
  ko: {
    "korean-name": { desc: "한국을 사랑하는 당신에게\n특별한 한국 이름을 드립니다.\n발음·의미·느낌 모두 고려한 설계.", points: ["국적·이름의 음운 기반 변환", "의미와 감성까지 담은 설계", "한자·한글 병기 제공", "영어·일본어·중국어 원명 반영"] },
    "child":        { desc: "세상에 하나뿐인 이름을 설계합니다.\n성씨 음운 조화, 한자 오행 획수,\n놀림감 필터까지 모두 반영합니다.", points: ["성씨와 이름의 음운 조화", "한자 오행·획수 분석", "놀림감·유사 이름 필터", "다국어 발음 동시 설계"] },
    "pet":          { desc: "소중한 가족의 이름을 설계합니다.\n한국 고유의 감성을 담은\n기억하기 좋은 이름으로.", points: ["성격·외모 기반 설계", "한국 고유어·음식·자연에서 영감", "부르기 좋은 음절 고려", "귀여움·위엄·개성 반영"] },
    "foreign":      { desc: "발음과 의미를 함께 살려\n국경을 넘는 이름을 만듭니다.\n글로벌 무대를 위한 설계.", points: ["발음 기반 자연스러운 변환", "의미·분위기 기반 새 이름", "영어·중국어·프랑스어 등 지원", "국제 무대에서 쓰기 좋은 이름"] },
    "goods":        { desc: "설계한 이름을 실물로 만듭니다.\n목인·흑단·수우각 도장과\n이름 새긴 문패·선물 세트.", points: ["목인·흑단·자수정 도장 제작", "이름 새긴 문패 제작", "네임카드·선물 패키지", "이름 설계와 연계 구성"] },
  },
  en: {
    "korean-name": { desc: "For those who love Korea,\nwe design your special Korean name.\nPhonetics · Meaning · Feel — all crafted.", points: ["Phonetic conversion by nationality & name", "Design with meaning and emotion", "Hanja & Hangul both provided", "Transcribed in English · Japanese · Chinese"] },
    "child":        { desc: "We design a one-of-a-kind name\nfor your precious child.\nSurname harmony, hanja ohaeng, teasing filter — all included.", points: ["Surname-name phonetic harmony", "Hanja ohaeng & stroke analysis", "Teasing & duplicate name filter", "Multi-language pronunciation design"] },
    "pet":          { desc: "We design a name for your precious family.\nUnique Korean sensibility\nin an easy-to-remember name.", points: ["Based on personality & appearance", "Inspired by Korean words, food & nature", "Easy-to-call syllables", "Cuteness · dignity · personality"] },
    "foreign":      { desc: "Preserving both sound and meaning,\nwe create names that cross borders.\nDesigned for the global stage.", points: ["Natural phonetic conversion", "New name from meaning & atmosphere", "English · Chinese · French & more", "International-stage ready names"] },
    "goods":        { desc: "Bring your designed name to life.\nStamps in wood, ebony & horn,\nnameplates & gift sets engraved.", points: ["Wood · ebony · amethyst stamps", "Nameplate with engraved name", "Name card & gift package", "Linked with name design"] },
  },
  zh: {
    "korean-name": { desc: "为热爱韩国的您\n设计独特的韩国名字。\n发音·意义·感觉 — 全面考量。", points: ["基于国籍·姓名的音韵转换", "融入意义与情感的设计", "同时提供汉字与韩字", "翻译为英语·日语·中文"] },
    "child":        { desc: "为您的宝贝设计\n世界上独一无二的名字。\n姓氏音韵、汉字五行、绰号过滤全面考量。", points: ["姓名音韵和谐", "汉字五行·笔画分析", "绰号·相似名字过滤", "多语言发音同步设计"] },
    "pet":          { desc: "为您珍贵的家人设计名字。\n融入韩国独特感性\n易于记忆的名字。", points: ["基于性格·外貌的设计", "从韩国固有词·食物·自然中汲取灵感", "考虑易于呼唤的音节", "可爱·威严·个性反映"] },
    "foreign":      { desc: "兼顾发音与意义\n打造跨越国界的名字。\n为全球舞台而设计。", points: ["基于发音的自然转换", "基于意义·氛围的新名字", "支持英语·中文·法语等", "适合国际舞台的名字"] },
    "goods":        { desc: "将设计好的名字变为实物。\n木质·乌木·水牛角印章\n刻有名字的门牌·礼品套装。", points: ["木质·乌木·紫水晶印章制作", "刻有名字的门牌制作", "名片·礼品套餐", "与名字设计联动方案"] },
  },
  ja: {
    "korean-name": { desc: "韓国を愛するあなたへ\n特別な韓国名を設計します。\n音韻·意味·感覚 — すべて考慮。", points: ["国籍·名前に基づく音韻変換", "意味と感性を込めた設計", "漢字とハングルを併記提供", "英語·日本語·中国語に翻訳"] },
    "child":        { desc: "世界に一つだけの名前を設計します。\n姓の音韻調和、漢字五行画数、\nあだ名フィルターも反映。", points: ["姓と名の音韻調和", "漢字五行·画数分析", "あだ名·類似名フィルター", "多言語発音同時設計"] },
    "pet":          { desc: "大切な家族の名前を設計します。\n韓国固有の感性を込めた\n覚えやすい名前で。", points: ["性格·外見に基づく設計", "韓国固有語·食べ物·自然からインスピレーション", "呼びやすい音節を考慮", "かわいさ·威厳·個性を反映"] },
    "foreign":      { desc: "発音と意味を活かして\n国境を越える名前を作ります。\nグローバルステージのための設計。", points: ["発音に基づく自然な変換", "意味·雰囲気に基づく新名前", "英語·中国語·フランス語など対応", "国際舞台で使いやすい名前"] },
    "goods":        { desc: "設計した名前を実物に。\n木製·黒壇·水牛角の印鑑と\n名前を刻んだ表札·ギフトセット。", points: ["木製·黒壇·アメジスト印鑑制作", "名前を刻んだ表札制作", "名刺·ギフトパッケージ", "名前設計との連携構成"] },
  },
  es: {
    "korean-name": { desc: "Para los que aman Corea,\ndiseñamos tu nombre coreano especial.\nFonética · Significado · Sensación — todo considerado.", points: ["Conversión fonética por nacionalidad y nombre", "Diseño con significado y emoción", "Hanja y Hangul provistos", "Traducido al inglés · japonés · chino"] },
    "child":        { desc: "Diseñamos el nombre único\npara tu precioso hijo.\nArmonía de apellido, hanja ohaeng, filtro de burlas — todo.", points: ["Armonía fonética apellido-nombre", "Análisis de hanja ohaeng y trazos", "Filtro de apodos y nombres similares", "Diseño de pronunciación multilingüe"] },
    "pet":          { desc: "Diseñamos el nombre para tu familia.\nSensibilidad coreana única\nen un nombre fácil de recordar.", points: ["Basado en personalidad y apariencia", "Inspirado en palabras, comida y naturaleza coreana", "Sílabas fáciles de pronunciar", "Ternura · dignidad · personalidad"] },
    "foreign":      { desc: "Preservando sonido y significado,\ncreamos nombres que cruzan fronteras.\nDiseñado para el escenario global.", points: ["Conversión fonética natural", "Nuevo nombre por significado y atmósfera", "Inglés · chino · francés y más", "Nombres listos para el escenario internacional"] },
    "goods":        { desc: "Convierte tu nombre en realidad.\nSellos en madera, ébano y cuerno,\nplacas y sets de regalo grabados.", points: ["Sellos de madera · ébano · amatista", "Placa con nombre grabado", "Tarjeta de nombre y paquete de regalo", "Integrado con diseño de nombre"] },
  },
  fr: {
    "korean-name": { desc: "Pour ceux qui aiment la Corée,\nnous concevons votre prénom coréen spécial.\nPhonétique · Sens · Sensation — tout considéré.", points: ["Conversion phonétique par nationalité et prénom", "Conception avec sens et émotion", "Hanja et Hangul fournis", "Traduit en anglais · japonais · chinois"] },
    "child":        { desc: "Nous concevons le prénom unique\npour votre précieux enfant.\nHarmonie, hanja ohaeng, filtre de moquerie — tout inclus.", points: ["Harmonie phonétique nom-prénom", "Analyse hanja ohaeng et traits", "Filtre de surnoms et prénoms similaires", "Conception de prononciation multilingue"] },
    "pet":          { desc: "Nous concevons un prénom pour votre famille.\nSensibilité coréenne unique\ndans un prénom facile à retenir.", points: ["Basé sur la personnalité et l'apparence", "Inspiré des mots, aliments et nature coréens", "Syllabes faciles à prononcer", "Mignonnerie · dignité · personnalité"] },
    "foreign":      { desc: "Préservant son et signification,\nnous créons des prénoms qui franchissent les frontières.\nConçu pour la scène mondiale.", points: ["Conversion phonétique naturelle", "Nouveau prénom par sens et atmosphère", "Anglais · chinois · français et plus", "Prénoms prêts pour la scène internationale"] },
    "goods":        { desc: "Donnez vie à votre prénom conçu.\nSceaux en bois, ébène et corne,\nplaques et coffrets cadeaux gravés.", points: ["Sceaux bois · ébène · améthyste", "Plaque avec prénom gravé", "Carte de visite et coffret cadeau", "Intégré avec la conception du prénom"] },
  },
  ru: {
    "korean-name": { desc: "Для тех, кто любит Корею,\nмы создаём ваше особое корейское имя.\nФонетика · Значение · Ощущение — всё учтено.", points: ["Фонетическая конверсия по национальности и имени", "Дизайн со смыслом и эмоцией", "Ханджа и хангыль — оба варианта", "Переведено на английский · японский · китайский"] },
    "child":        { desc: "Мы создаём уникальное имя\nдля вашего драгоценного ребёнка.\nГармония фамилии, ханджа охэн, фильтр — всё включено.", points: ["Фонетическая гармония фамилии и имени", "Анализ ханджа охэн и черт", "Фильтр прозвищ и похожих имён", "Многоязычный дизайн произношения"] },
    "pet":          { desc: "Мы создаём имя для вашей дорогой семьи.\nУникальная корейская чувственность\nв запоминающемся имени.", points: ["На основе характера и внешности", "Вдохновлено корейскими словами, едой и природой", "Удобные для произношения слоги", "Милота · достоинство · индивидуальность"] },
    "foreign":      { desc: "Сохраняя звук и смысл,\nмы создаём имена, пересекающие границы.\nДля мировой сцены.", points: ["Естественная фонетическая конверсия", "Новое имя по смыслу и атмосфере", "Английский · китайский · французский и др.", "Имена для международной сцены"] },
    "goods":        { desc: "Воплотите ваше имя в жизнь.\nПечати из дерева, эбонита и рога,\nтаблички и подарочные наборы с гравировкой.", points: ["Печати дерево · эбонит · аметист", "Табличка с гравировкой имени", "Визитная карточка и подарочный набор", "Интегрировано с дизайном имени"] },
  },
  ar: {
    "korean-name": { desc: "لمحبي كوريا،\nنصمم اسمك الكوري الخاص.\nالصوتيات · المعنى · الشعور — كل شيء مدروس.", points: ["تحويل صوتي بحسب الجنسية والاسم", "تصميم يجمع المعنى والعاطفة", "الهانجا والهانغول معاً", "مترجم للإنجليزية · اليابانية · الصينية"] },
    "child":        { desc: "نصمم اسماً فريداً\nلطفلك العزيز.\nتناسق اللقب، هانجا أوهيج، فلتر — كل شيء.", points: ["تناسق صوتي للقب والاسم", "تحليل هانجا أوهيج والخطوط", "فلتر الألقاب والأسماء المشابهة", "تصميم نطق متعدد اللغات"] },
    "pet":          { desc: "نصمم اسماً لعائلتك الثمينة.\nالحساسية الكورية الفريدة\nفي اسم سهل التذكر.", points: ["مبني على الشخصية والمظهر", "مستلهم من الكلمات والطعام والطبيعة الكورية", "مقاطع سهلة النطق", "رقة · وقار · شخصية"] },
    "foreign":      { desc: "مع الحفاظ على الصوت والمعنى،\nنخلق أسماء تعبر الحدود.\nمصمم للمسرح العالمي.", points: ["تحويل صوتي طبيعي", "اسم جديد من المعنى والجو", "الإنجليزية · الصينية · الفرنسية وأكثر", "أسماء جاهزة للمسرح الدولي"] },
    "goods":        { desc: "أحضر اسمك إلى الواقع.\nأختام خشب وأبنوس وقرن،\nألواح وطقم هدايا منقوشة.", points: ["أختام خشب · أبنوس · أميثيست", "لافتة منقوش عليها الاسم", "بطاقة اسم وحزمة هدايا", "متكاملة مع تصميم الاسم"] },
  },
  hi: {
    "korean-name": { desc: "कोरिया से प्यार करने वालों के लिए,\nहम आपका विशेष कोरियाई नाम डिज़ाइन करते हैं।\nध्वनि · अर्थ · अनुभव — सब कुछ ध्यान में।", points: ["राष्ट्रीयता और नाम के आधार पर ध्वनि रूपांतरण", "अर्थ और भावना के साथ डिज़ाइन", "हांजा और हांगुल दोनों प्रदान", "अंग्रेजी · जापानी · चीनी में अनुवाद"] },
    "child":        { desc: "हम आपके प्यारे बच्चे के लिए\nएक अनोखा नाम डिज़ाइन करते हैं।\nउपनाम सामंजस्य, हांजा ओहेंग, उपहास फ़िल्टर।", points: ["उपनाम-नाम ध्वन्यात्मक सामंजस्य", "हांजा ओहेंग और स्ट्रोक विश्लेषण", "उपहास और समान नाम फ़िल्टर", "बहुभाषी उच्चारण डिज़ाइन"] },
    "pet":          { desc: "हम आपके प्यारे परिवार के लिए नाम डिज़ाइन करते हैं।\nकोरियाई अनूठी संवेदनशीलता\nयाद रखने में आसान नाम।", points: ["व्यक्तित्व और रूप पर आधारित", "कोरियाई शब्दों, खाना और प्रकृति से प्रेरित", "बुलाने में आसान अक्षर", "प्यारापन · गरिमा · व्यक्तित्व"] },
    "foreign":      { desc: "ध्वनि और अर्थ दोनों को संजोते हुए,\nहम सीमाओं को पार करने वाले नाम बनाते हैं।\nवैश्विक मंच के लिए डिज़ाइन।", points: ["प्राकृतिक ध्वन्यात्मक रूपांतरण", "अर्थ और माहौल से नया नाम", "अंग्रेजी · चीनी · फ्रेंच और अधिक", "अंतर्राष्ट्रीय मंच के लिए तैयार नाम"] },
    "goods":        { desc: "अपने डिज़ाइन किए नाम को जीवंत करें।\nलकड़ी, आबनूस और सींग की मुहरें,\nनाम उकेरी नेमप्लेट और उपहार सेट।", points: ["लकड़ी · आबनूस · नीलम मुहरें", "नाम उकेरी नेमप्लेट", "नेम कार्ड और उपहार पैकेज", "नाम डिज़ाइन से जुड़ी"] },
  },
} satisfies Record<string, Record<CatId, { desc: string; points: string[] }>>;

const GOODS_DISCOUNT_BY_LANG: Record<string, string> = {
  ko: "이름 설계 후 연계 주문 시 10% 할인",
  en: "10% off when ordering after name design",
  zh: "名字设计后联动订购享10%折扣",
  ja: "名前設計後の連携注文で10%割引",
  es: "10% de descuento al pedir después del diseño",
  fr: "10% de réduction lors d'une commande après conception",
  ru: "10% скидка при заказе после дизайна имени",
  ar: "خصم 10% عند الطلب بعد تصميم الاسم",
  hi: "नाम डिज़ाइन के बाद ऑर्डर पर 10% छूट",
};

type BaseCard = { cat: CatId; type: string };
type KoreanNameCard = BaseCard & {
  type: "korean-name";
  originalName: string;
  nationality: string;
  flag: string;
  koreanName: string;
  hanja: string;
  meaning: string;
  story: string;
  roman?: string;
};
type ChildCard = BaseCard & {
  type: "child";
  surname: string;
  name: string;
  fullHanja: string;
  roman: string;
  meaning: string;
  story: string;
};
type PetCard = BaseCard & {
  type: "pet";
  name: string;
  english: string;
  animal: string;
  meaning: string;
  story: string;
};
type ForeignCard = BaseCard & {
  type: "foreign";
  koreanName: string;
  foreignName: string;
  foreignLang: string;
  meaning: string;
  story: string;
};
type GoodsCard = BaseCard & {
  type: "goods";
  visual: "hat" | "tumbler" | "magnet" | "stamp";
  productName: string;
  engravedName: string;
  material: string;
  price: string;
  tagline: string;
  desc: string;
};
type AnyCard = KoreanNameCard | ChildCard | PetCard | ForeignCard | GoodsCard;

const ALL_CARDS: Record<CatId, AnyCard[]> = {
  "korean-name": [
    { cat: "korean-name", type: "korean-name", originalName: "Emma", nationality: "미국 · USA", flag: "🇺🇸", koreanName: "이하늘", hanja: "李夏訥", roman: "Lee Ha-neul", meaning: "하늘처럼 넓고 자유로운 영혼", story: "Emma의 부드럽고 밝은 음감을 살려 '하늘'로 연결했습니다. 여름 하늘처럼 넓고 자유로운 삶을 바라는 이름입니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Michael", nationality: "영국 · UK", flag: "🇬🇧", koreanName: "강도윤", hanja: "姜道潤", roman: "Kang Do-yun", meaning: "바른 길로 윤택하게", story: "Michael의 '신의 뜻을 따르는' 의미에서 '도윤(道潤)' — 바른 길을 따라 풍요롭게 — 로 설계했습니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Yuki", nationality: "일본 · Japan", flag: "🇯🇵", koreanName: "박서연", hanja: "朴瑞蓮", roman: "Park Seo-yeon", meaning: "상서로운 연꽃처럼 아름답게", story: "雪(유키·눈)의 순수함을 '서연(瑞蓮)' — 상서로운 연꽃 — 으로 승화시켰습니다. 한국적 감성을 가득 담은 이름입니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Jake", nationality: "미국 · USA", flag: "🇺🇸", koreanName: "수지", hanja: "秀志", roman: "Su-ji", meaning: "빼어난 뜻을 품은 이름", story: "Jake의 명확하고 힘있는 음감에서 '수지(秀志)' — 빼어난 뜻 — 로 설계했습니다. 성씨 없이 이름만으로도 완성되는 한국 이름입니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Anna", nationality: "독일 · Germany", flag: "🇩🇪", koreanName: "선희", hanja: "善熙", roman: "Seon-hee", meaning: "선하고 밝게 빛나는 존재", story: "Anna의 우아하고 따뜻한 음감을 살려 '선희(善熙)' — 선하고 빛나는 — 으로 설계했습니다. 스승님·가족의 성씨를 이어받아 지을 수도 있어요." },
  ],
  "child": [
    { cat: "child", type: "child", surname: "김", name: "서연", fullHanja: "金瑞姸", roman: "Kim Seoyeon", meaning: "상서로운 빛으로 곱게 피어남", story: "金(김) 성씨와 瑞(상서)·姸(곱다)의 조합. 오행 수·금의 조화가 고르고, 음운이 부드럽게 이어집니다." },
    { cat: "child", type: "child", surname: "박", name: "준호", fullHanja: "朴俊浩", roman: "Park Junho", meaning: "넓고 깊은 바다처럼 준수하게", story: "朴(박) 성씨에 俊(준수)·浩(넓은 물)의 조합. 남성적 기운이 넘치면서도 음절 균형이 자연스럽습니다." },
    { cat: "child", type: "child", surname: "이", name: "하늘", fullHanja: "李·", roman: "Lee Haneul", meaning: "드넓은 하늘처럼 높고 자유롭게", story: "순우리말 이름 '하늘'. 性(이) 성씨와 두 음절의 경쾌한 조화. 어디서든 기억되는 맑고 밝은 이름입니다." },
  ],
  "pet": [
    { cat: "pet", type: "pet", name: "진주", english: "Pearl", animal: "🐕 말티즈", meaning: "빛나는 진주처럼 귀하고 소중한", story: "하얀 털이 진주처럼 빛나는 말티즈에게 딱 맞는 이름. 짧고 부르기 좋으며, 품격과 사랑스러움을 동시에 담았습니다." },
    { cat: "pet", type: "pet", name: "두부", english: "Tofu", animal: "🐈 흰 고양이", meaning: "포근하고 순수한 흰 솜뭉치", story: "하얗고 보들보들한 두부처럼 부드러운 아이. 한국의 대표 음식에서 따온 이름으로 친근하고 따뜻한 느낌을 줍니다." },
    { cat: "pet", type: "pet", name: "이슬이", english: "Dew", animal: "🐕 포메라니안", meaning: "아침이슬처럼 맑고 영롱한 존재", story: "이슬처럼 반짝이는 눈을 가진 아이에게 어울리는 이름. '이슬이'라는 호칭이 자연스럽고 애정이 담겨있습니다." },
  ],
  "foreign": [
    { cat: "foreign", type: "foreign", koreanName: "이민준", foreignName: "James Lee", foreignLang: "🇺🇸 English", meaning: "국제 무대에서도 품격 있는 이름", story: "이민준의 '민(民)'의 영어 감성 'James' — 고전적이고 신뢰감 있는 이름으로 자연스러운 변환입니다." },
    { cat: "foreign", type: "foreign", koreanName: "김소연", foreignName: "Céline Kim", foreignLang: "🇫🇷 Français", meaning: "우아하고 섬세한 프랑스 감성", story: "소연의 부드러운 음감과 우아한 느낌이 프랑스 이름 'Céline'과 완벽하게 어울립니다." },
    { cat: "foreign", type: "foreign", koreanName: "박서준", foreignName: "Haojun Park", foreignLang: "🇨🇳 中文", meaning: "한중 이중 정체성을 담은 이름", story: "서준(徐俊)의 한자에서 중국어 발음 'Hàojùn'을 그대로 살렸습니다. 한국인이면서도 중국에서 자연스럽게 불릴 수 있습니다." },
  ],
  "goods": [
    { cat: "goods", type: "goods", visual: "hat", productName: "한국문양 버킷햇", engravedName: "하늘", material: "프리미엄 면혼방 · 국내 자수 제작", price: "₩58,000~", tagline: "설계한 이름을 모자에 새기다", desc: "전통 단청 문양과 함께 이름을 자수로 새긴 프리미엄 버킷햇. 한국의 멋을 일상에서." },
    { cat: "goods", type: "goods", visual: "tumbler", productName: "이름 새긴 텀블러", engravedName: "서연", material: "스테인리스 500ml · 레이저 각인", price: "₩42,000~", tagline: "매일 쓰는 물건에 이름의 의미를", desc: "청화백자 문양 밴드와 함께 이름을 레이저로 각인합니다. 보온·보냉 이중 진공 구조." },
    { cat: "goods", type: "goods", visual: "magnet", productName: "한국이름 마그네틱", engravedName: "준호", material: "고급 아크릴 · 7×5cm", price: "₩18,000~", tagline: "이름의 의미를 매일 마주하다", desc: "한국 전통 운문(雲紋) 위에 이름과 한자를 담은 냉장고 자석. 기념품·선물로 인기." },
    { cat: "goods", type: "goods", visual: "stamp", productName: "전각 목인 도장", engravedName: "金瑞姸", material: "황양목 · 흑단 · 자수정 선택", price: "₩89,000~", tagline: "이름을 전각으로 새기다", desc: "설계한 이름을 전통 전각체 글씨로 새깁니다. 일상 날인부터 작품 낙관까지." },
  ],
};

// ── 카드 텍스트 번역 오버레이 (meaning/story/tagline/desc만 언어별로) ──
type KNTrans = { meaning: string; story: string };
type GoodsTrans = { tagline: string; desc: string };
type CardTransByCat = { "korean-name": KNTrans[]; "child": KNTrans[]; "pet": KNTrans[]; "foreign": KNTrans[]; "goods": GoodsTrans[] };
const CARD_TRANS_BY_LANG: Record<Lang, CardTransByCat> = {
  ko: {
    "korean-name": [
      { meaning: "하늘처럼 넓고 자유로운 영혼", story: "Emma의 부드럽고 밝은 음감을 살려 '하늘'로 연결했습니다. 여름 하늘처럼 넓고 자유로운 삶을 바라는 이름입니다." },
      { meaning: "바른 길로 윤택하게", story: "Michael의 '신의 뜻을 따르는' 의미에서 '도윤(道潤)' — 바른 길을 따라 풍요롭게 — 로 설계했습니다." },
      { meaning: "상서로운 연꽃처럼 아름답게", story: "雪(유키·눈)의 순수함을 '서연(瑞蓮)' — 상서로운 연꽃 — 으로 승화시켰습니다. 한국적 감성을 가득 담은 이름입니다." },
      { meaning: "빼어난 뜻을 품은 이름", story: "Jake의 명확하고 힘있는 음감에서 '수지(秀志)' — 빼어난 뜻 — 로 설계했습니다. 성씨 없이 이름만으로도 완성되는 한국 이름입니다." },
      { meaning: "선하고 밝게 빛나는 존재", story: "Anna의 우아하고 따뜻한 음감을 살려 '선희(善熙)' — 선하고 빛나는 — 으로 설계했습니다. 스승님·가족의 성씨를 이어받아 지을 수도 있어요." },
    ],
    "child": [
      { meaning: "상서로운 빛으로 곱게 피어남", story: "金(김) 성씨와 瑞(상서)·姸(곱다)의 조합. 오행 수·금의 조화가 고르고, 음운이 부드럽게 이어집니다." },
      { meaning: "넓고 깊은 바다처럼 준수하게", story: "朴(박) 성씨에 俊(준수)·浩(넓은 물)의 조합. 남성적 기운이 넘치면서도 음절 균형이 자연스럽습니다." },
      { meaning: "드넓은 하늘처럼 높고 자유롭게", story: "순우리말 이름 '하늘'. 性(이) 성씨와 두 음절의 경쾌한 조화. 어디서든 기억되는 맑고 밝은 이름입니다." },
    ],
    "pet": [
      { meaning: "빛나는 진주처럼 귀하고 소중한", story: "하얀 털이 진주처럼 빛나는 말티즈에게 딱 맞는 이름. 짧고 부르기 좋으며, 품격과 사랑스러움을 동시에 담았습니다." },
      { meaning: "포근하고 순수한 흰 솜뭉치", story: "하얗고 보들보들한 두부처럼 부드러운 아이. 한국의 대표 음식에서 따온 이름으로 친근하고 따뜻한 느낌을 줍니다." },
      { meaning: "아침이슬처럼 맑고 영롱한 존재", story: "이슬처럼 반짝이는 눈을 가진 아이에게 어울리는 이름. '이슬이'라는 호칭이 자연스럽고 애정이 담겨있습니다." },
    ],
    "foreign": [
      { meaning: "국제 무대에서도 품격 있는 이름", story: "이민준의 '민(民)'의 영어 감성 'James' — 고전적이고 신뢰감 있는 이름으로 자연스러운 변환입니다." },
      { meaning: "우아하고 섬세한 프랑스 감성", story: "소연의 부드러운 음감과 우아한 느낌이 프랑스 이름 'Céline'과 완벽하게 어울립니다." },
      { meaning: "한중 이중 정체성을 담은 이름", story: "서준(徐俊)의 한자에서 중국어 발음 'Hàojùn'을 그대로 살렸습니다. 한국인이면서도 중국에서 자연스럽게 불릴 수 있습니다." },
    ],
    "goods": [
      { tagline: "설계한 이름을 모자에 새기다", desc: "전통 단청 문양과 함께 이름을 자수로 새긴 프리미엄 버킷햇. 한국의 멋을 일상에서." },
      { tagline: "매일 쓰는 물건에 이름의 의미를", desc: "청화백자 문양 밴드와 함께 이름을 레이저로 각인합니다. 보온·보냉 이중 진공 구조." },
      { tagline: "이름의 의미를 매일 마주하다", desc: "한국 전통 운문(雲紋) 위에 이름과 한자를 담은 냉장고 자석. 기념품·선물로 인기." },
      { tagline: "이름을 전각으로 새기다", desc: "설계한 이름을 전통 전각체 글씨로 새깁니다. 일상 날인부터 작품 낙관까지." },
    ],
  },
  en: {
    "korean-name": [
      { meaning: "A soul as vast and free as the sky", story: "Emma's soft and bright sound led us to '하늘 (sky)'. A name wishing for a life as wide and free as a summer sky." },
      { meaning: "Flourishing on the righteous path", story: "From Michael's meaning of 'following God's will', we designed '도윤 (道潤)' — thriving along the right path." },
      { meaning: "Beautiful as an auspicious lotus", story: "The purity of 雪 (Yuki·snow) was elevated to '서연 (瑞蓮)' — an auspicious lotus. A name full of Korean sensibility." },
      { meaning: "A name carrying outstanding aspirations", story: "From Jake's clear and strong sound, we designed '수지 (秀志)' — outstanding will. A complete Korean name even without a family name." },
      { meaning: "A bright and virtuous existence", story: "Anna's elegant and warm sound became '선희 (善熙)' — virtuous and radiant. You can also adopt a mentor's or family surname." },
    ],
    "child": [
      { meaning: "Blooming beautifully in auspicious light", story: "Kim (金) surname with 瑞 (auspicious) · 姸 (beautiful). Balanced ohaeng of water and metal, with smooth phonetic flow." },
      { meaning: "Handsome as a wide and deep sea", story: "Park (朴) surname with 俊 (handsome) · 浩 (vast water). Masculine energy with naturally balanced syllables." },
      { meaning: "High and free as the vast sky", story: "'하늘 (sky)' — a pure Korean name. Lee surname with two crisp syllables. Clear and bright, memorable everywhere." },
    ],
    "pet": [
      { meaning: "Precious and dear as a shining pearl", story: "Perfect for a Maltese whose white fur shines like a pearl. Short, easy to call, full of elegance and adorableness." },
      { meaning: "A soft and pure white fluff", story: "Gentle as white tofu. A name from Korea's iconic food — friendly and warm, just like your pet." },
      { meaning: "Clear and sparkling as morning dew", story: "Perfect for a pup with eyes that sparkle like dewdrops. '이슬이' sounds natural as a nickname, full of affection." },
    ],
    "foreign": [
      { meaning: "A dignified name on the international stage", story: "The English spirit of '민 (民)' in Lee Minjun became 'James' — a classic, trustworthy name. A natural transformation." },
      { meaning: "Elegant and delicate French sensibility", story: "Soyeon's soft sound and graceful feel match perfectly with the French name 'Céline'." },
      { meaning: "A name carrying dual Korean-Chinese identity", story: "The Chinese pronunciation 'Hàojùn' was directly drawn from the hanja of 서준 (徐俊). Natural in both Korea and China." },
    ],
    "goods": [
      { tagline: "Engrave your designed name on a hat", desc: "Premium bucket hat with your name embroidered alongside traditional dancheong patterns. Korean aesthetics in everyday life." },
      { tagline: "Bring your name's meaning to daily objects", desc: "Laser-engraved with a blue-white porcelain pattern band. Double vacuum insulation for hot & cold." },
      { tagline: "Face the meaning of your name every day", desc: "Fridge magnet featuring your name and hanja on a traditional Korean cloud pattern. Popular as a gift or souvenir." },
      { tagline: "Engrave your name in traditional seal script", desc: "Your designed name carved in traditional Korean seal calligraphy. From daily stamping to artwork seals." },
    ],
  },
  ja: {
    "korean-name": [
      { meaning: "空のように広く自由な魂", story: "Emmaの柔らかく明るい音感から「하늘（空）」へ。夏空のように広く自由な人生を願う名前です。" },
      { meaning: "正しい道を歩み、豊かに栄える", story: "Michaelの「神の意志に従う」意味から「도윤（道潤）」を設計。正しい道を歩み豊かに栄えるという願いを込めています。" },
      { meaning: "めでたい蓮のように美しく", story: "雪（ゆき）の純粋さを「서연（瑞蓮）」—めでたい蓮—へ昇華。韓国の感性をたっぷり込めた名前です。" },
      { meaning: "優れた志を抱く名前", story: "Jakeの明確で力強い音感から「수지（秀志）」—優れた志—を設計。姓なしでも完成する韓国名です。" },
      { meaning: "善良で明るく輝く存在", story: "Annaの上品で温かな音感を活かし「선희（善熙）」—善良で輝く—を設計。恩師や家族の姓を受け継ぐことも可能です。" },
    ],
    "child": [
      { meaning: "めでたい光の中で美しく咲く", story: "金（キム）姓と瑞（めでたい）・姸（美しい）の組み合わせ。水・金の五行バランスが整い、音韻も滑らかです。" },
      { meaning: "広く深い海のように凛々しく", story: "朴（パク）姓に俊（凛々しい）・浩（広い水）の組み合わせ。男性的な力強さと自然な音節バランスを持つ名前。" },
      { meaning: "広大な空のように高く自由に", story: "純韓国語名「하늘（空）」。李（イ）姓と二音節の爽やかな響き。どこでも覚えてもらえる明るい名前です。" },
    ],
    "pet": [
      { meaning: "輝く真珠のように大切で愛しい", story: "白い毛並みが真珠のように輝くマルチーズにぴったりの名前。短くて呼びやすく、品格と可愛らしさを兼ね備えています。" },
      { meaning: "ふんわり純白のわた雪のような子", story: "白くふんわりとした豆腐のように柔らかな子。韓国の代表的な食べ物から取った名前で、親しみやすく温かみがあります。" },
      { meaning: "朝露のように澄んで煌めく存在", story: "露のようにキラキラした目の子にぴったりの名前。「이슬이」という呼び方が自然で、愛情が込められています。" },
    ],
    "foreign": [
      { meaning: "国際舞台でも品格ある名前", story: "イ・ミンジュンの「민（民）」の英語感性「James」—古典的で信頼感のある名前への自然な変換です。" },
      { meaning: "優雅で繊細なフランスの感性", story: "ソヨンの柔らかな音感と優雅な印象がフランス名「Céline」と完璧にマッチします。" },
      { meaning: "韓中二重アイデンティティを込めた名前", story: "서준（徐俊）の漢字から中国語発音「Hàojùn」をそのまま活かしました。韓国人でも中国で自然に呼ばれる名前です。" },
    ],
    "goods": [
      { tagline: "設計した名前を帽子に刻む", desc: "伝統的な丹青文様とともに名前を刺繍したプレミアムバケットハット。日常で韓国の美を。" },
      { tagline: "毎日使うものに名前の意味を", desc: "青花白磁文様バンドとともに名前をレーザー刻印。保温・保冷二重真空構造。" },
      { tagline: "名前の意味を毎日見つめる", desc: "韓国伝統の雲文（雲紋）の上に名前と漢字を載せた冷蔵庫マグネット。記念品・贈り物に人気。" },
      { tagline: "名前を篆刻で刻む", desc: "設計した名前を伝統的な篆刻書体で刻みます。日常の押印から作品の落款まで。" },
    ],
  },
  zh: {
    "korean-name": [
      { meaning: "如天空般宽广自由的灵魂", story: "从Emma柔和明亮的音感联结到「하늘（天空）」。祝愿拥有如夏日天空般宽广自由的人生。" },
      { meaning: "走正确之路，润泽丰盛", story: "从Michael「遵从神旨」的含义设计出「도윤（道潤）」——沿着正确的道路繁荣昌盛。" },
      { meaning: "如吉祥莲花般美丽", story: "将雪（유키）的纯洁升华为「서연（瑞蓮）」——吉祥莲花。充满韩国美学感性的名字。" },
      { meaning: "承载卓越志向的名字", story: "从Jake清晰有力的音感设计出「수지（秀志）」——卓越志向。即使没有姓氏也是完整的韩国名字。" },
      { meaning: "善良明亮、光彩照人", story: "将Anna优雅温暖的音感化为「선희（善熙）」——善良光辉。也可以继承老师或家人的姓氏。" },
    ],
    "child": [
      { meaning: "在吉祥的光芒中美丽绽放", story: "金（김）姓与瑞（吉祥）·姸（美丽）的组合。五行水·金的平衡协调，音韵流畅自然。" },
      { meaning: "如宽阔深邃的大海般英俊", story: "朴（박）姓配以俊（英俊）·浩（宽广之水）的组合。充满阳刚之气，音节平衡自然。" },
      { meaning: "如广阔天空般高远自由", story: "纯韩语名「하늘（天空）」。李（이）姓与两个轻快音节的完美融合。清亮明朗，令人难忘。" },
    ],
    "pet": [
      { meaning: "如闪亮珍珠般珍贵可爱", story: "白色毛发如珍珠般闪亮的马尔济斯的完美名字。简短易叫，兼具品格与可爱。" },
      { meaning: "柔软纯白的小棉球", story: "白嫩柔软如豆腐一般的孩子。取自韩国代表性食物的名字，亲切温暖。" },
      { meaning: "如晨露般清澈晶莹的存在", story: "适合眼睛如露水般闪亮的孩子。「이슬이」这个称呼自然流畅，充满爱意。" },
    ],
    "foreign": [
      { meaning: "在国际舞台上也有品格的名字", story: "李民俊「민（民）」的英语感性「James」——经典可信赖的名字，自然流畅的转换。" },
      { meaning: "优雅细腻的法式感性", story: "素妍柔和的音感与优雅气质与法国名字「Céline」完美契合。" },
      { meaning: "承载韩中双重身份的名字", story: "从서준（徐俊）的汉字直接提取中文发音「Hàojùn」。身为韩国人，在中国也能自然地被称呼。" },
    ],
    "goods": [
      { tagline: "将设计好的名字刻在帽子上", desc: "搭配传统丹青纹样，将名字绣在高档渔夫帽上。在日常生活中感受韩国之美。" },
      { tagline: "将名字的意义融入日常用品", desc: "搭配青花白瓷纹样腰带，将名字激光雕刻其上。双层真空保温保冷结构。" },
      { tagline: "每天与名字的意义相遇", desc: "在韩国传统云纹上刻有名字和汉字的冰箱贴。深受欢迎，适合作纪念品或礼物。" },
      { tagline: "将名字用篆刻艺术铭刻", desc: "用传统篆刻字体刻下设计好的名字。从日常盖章到作品落款皆适用。" },
    ],
  },
  es: {
    "korean-name": [
      { meaning: "Un alma tan amplia y libre como el cielo", story: "El sonido suave y brillante de Emma nos llevó a '하늘 (cielo)'. Un nombre que desea una vida tan libre como el cielo de verano." },
      { meaning: "Prosperando en el camino recto", story: "Del significado 'seguir la voluntad de Dios' de Michael, diseñamos '도윤 (道潤)' — prosperando en el camino correcto." },
      { meaning: "Hermosa como un loto de buen augurio", story: "La pureza de 雪 (Yuki·nieve) fue elevada a '서연 (瑞蓮)' — un loto auspicioso. Lleno de sensibilidad coreana." },
      { meaning: "Un nombre con aspiraciones sobresalientes", story: "Del sonido claro y fuerte de Jake, diseñamos '수지 (秀志)' — voluntad sobresaliente. Un nombre coreano completo incluso sin apellido." },
      { meaning: "Una existencia virtuosa y radiante", story: "El sonido elegante y cálido de Anna se convirtió en '선희 (善熙)' — virtuosa y radiante. También puedes adoptar el apellido de tu maestro o familia." },
    ],
    "child": [
      { meaning: "Floreciendo bellamente en luz auspiciosa", story: "Apellido Kim (金) con 瑞 (auspicioso) · 姸 (bello). Equilibrio de ohaeng agua y metal con flujo fonético suave." },
      { meaning: "Apuesto como un mar ancho y profundo", story: "Apellido Park (朴) con 俊 (apuesto) · 浩 (agua vasta). Energía masculina con sílabas naturalmente equilibradas." },
      { meaning: "Alto y libre como el vasto cielo", story: "'하늘 (cielo)' — nombre puramente coreano. Apellido Lee con dos sílabas nítidas. Claro y brillante, memorable en cualquier lugar." },
    ],
    "pet": [
      { meaning: "Precioso como una perla brillante", story: "Perfecto para un Maltés cuyo pelo blanco brilla como una perla. Corto, fácil de llamar, lleno de elegancia y ternura." },
      { meaning: "Un suave y puro copo de algodón blanco", story: "Suave como el tofu blanco. Un nombre del icónico alimento coreano — amigable y cálido, igual que tu mascota." },
      { meaning: "Claro y brillante como el rocío de la mañana", story: "Perfecto para una mascota con ojos que brillan como gotas de rocío. '이슬이' suena natural como apodo, lleno de cariño." },
    ],
    "foreign": [
      { meaning: "Un nombre con dignidad en el escenario internacional", story: "El espíritu inglés de '민 (民)' en Lee Minjun se convirtió en 'James' — un nombre clásico y digno de confianza." },
      { meaning: "Sensibilidad francesa elegante y delicada", story: "El sonido suave y la elegancia de Soyeon encajan perfectamente con el nombre francés 'Céline'." },
      { meaning: "Un nombre con identidad coreano-china dual", story: "La pronunciación china 'Hàojùn' fue extraída directamente del hanja de 서준 (徐俊). Natural tanto en Corea como en China." },
    ],
    "goods": [
      { tagline: "Graba tu nombre diseñado en un sombrero", desc: "Sombrero bucket premium con tu nombre bordado junto a patrones dancheong tradicionales. Estética coreana en la vida diaria." },
      { tagline: "Lleva el significado de tu nombre a objetos cotidianos", desc: "Grabado láser con banda de patrón de porcelana azul y blanca. Aislamiento de doble vacío para caliente y frío." },
      { tagline: "Encuentra el significado de tu nombre cada día", desc: "Imán de nevera con tu nombre y hanja sobre un patrón de nubes coreano tradicional. Popular como regalo o recuerdo." },
      { tagline: "Graba tu nombre en caligrafía de sello tradicional", desc: "Tu nombre diseñado tallado en caligrafía de sello coreano tradicional. Desde uso diario hasta sellos de obra de arte." },
    ],
  },
  fr: {
    "korean-name": [
      { meaning: "Une âme aussi vaste et libre que le ciel", story: "Le son doux et lumineux d'Emma nous a conduits à '하늘 (ciel)'. Un prénom souhaitant une vie aussi libre que le ciel d'été." },
      { meaning: "Prospérer sur le juste chemin", story: "Du sens de Michael 'suivre la volonté de Dieu', nous avons conçu '도윤 (道潤)' — prospérer sur le bon chemin." },
      { meaning: "Belle comme un lotus de bon augure", story: "La pureté de 雪 (Yuki·neige) a été sublimée en '서연 (瑞蓮)' — un lotus auspicieux. Plein de sensibilité coréenne." },
      { meaning: "Un prénom portant des aspirations remarquables", story: "Du son clair et fort de Jake, nous avons conçu '수지 (秀志)' — volonté remarquable. Un prénom coréen complet même sans nom de famille." },
      { meaning: "Une existence vertueuse et rayonnante", story: "Le son élégant et chaleureux d'Anna est devenu '선희 (善熙)' — vertueuse et rayonnante. Vous pouvez aussi adopter le nom de famille d'un mentor ou de la famille." },
    ],
    "child": [
      { meaning: "S'épanouissant dans une lumière auspicieuse", story: "Nom de famille Kim (金) avec 瑞 (auspicieux) · 姸 (beau). Équilibre des cinq éléments eau et métal, phonétique douce." },
      { meaning: "Beau comme une mer large et profonde", story: "Nom de famille Park (朴) avec 俊 (beau) · 浩 (vaste eau). Énergie masculine avec des syllabes naturellement équilibrées." },
      { meaning: "Haut et libre comme le vaste ciel", story: "'하늘 (ciel)' — prénom purement coréen. Nom de famille Lee avec deux syllabes vives. Clair et lumineux, mémorable partout." },
    ],
    "pet": [
      { meaning: "Précieux comme une perle brillante", story: "Parfait pour un Maltais dont le pelage blanc brille comme une perle. Court, facile à appeler, alliant élégance et mignonnerie." },
      { meaning: "Un doux et pur petit flocon blanc", story: "Doux comme du tofu blanc. Un prénom tiré de l'aliment iconique coréen — amical et chaleureux, tout comme votre animal." },
      { meaning: "Clair et étincelant comme la rosée du matin", story: "Parfait pour un animal aux yeux qui brillent comme des gouttes de rosée. '이슬이' sonne naturellement, plein d'affection." },
    ],
    "foreign": [
      { meaning: "Un prénom avec de la dignité sur la scène internationale", story: "L'esprit anglais de '민 (民)' chez Lee Minjun est devenu 'James' — un prénom classique et digne de confiance." },
      { meaning: "Sensibilité française élégante et délicate", story: "Le son doux et l'élégance de Soyeon s'harmonisent parfaitement avec le prénom français 'Céline'." },
      { meaning: "Un prénom portant une double identité coréano-chinoise", story: "La prononciation chinoise 'Hàojùn' a été directement tirée du hanja de 서준 (徐俊). Naturel en Corée comme en Chine." },
    ],
    "goods": [
      { tagline: "Graver votre prénom conçu sur un chapeau", desc: "Chapeau bucket premium avec votre prénom brodé aux côtés de motifs dancheong traditionnels. L'esthétique coréenne au quotidien." },
      { tagline: "Apporter le sens de votre prénom aux objets du quotidien", desc: "Gravure laser avec un bandeau à motif de porcelaine bleue et blanche. Double isolation sous vide pour chaud et froid." },
      { tagline: "Rencontrer le sens de votre prénom chaque jour", desc: "Aimant de réfrigérateur avec votre prénom et hanja sur un motif de nuages coréen traditionnel. Populaire comme cadeau ou souvenir." },
      { tagline: "Graver votre prénom en calligraphie de sceau traditionnelle", desc: "Votre prénom conçu gravé en calligraphie de sceau coréen traditionnel. De l'usage quotidien aux sceaux d'œuvres d'art." },
    ],
  },
  ru: {
    "korean-name": [
      { meaning: "Душа, широкая и свободная, как небо", story: "Мягкий и яркий звук Emma привёл нас к «하늘 (небо)». Имя, желающее жизни такой же широкой и свободной, как летнее небо." },
      { meaning: "Процветание на праведном пути", story: "Из значения Michael «следовать воле Бога» мы создали «도윤 (道潤)» — процветание на правильном пути." },
      { meaning: "Прекрасная, как благостный лотос", story: "Чистота 雪 (Юки·снег) была возвышена до «서연 (瑞蓮)» — благостный лотос. Имя, наполненное корейской чувственностью." },
      { meaning: "Имя, несущее выдающиеся стремления", story: "Из чёткого и сильного звука Jake мы создали «수지 (秀志)» — выдающаяся воля. Полноценное корейское имя даже без фамилии." },
      { meaning: "Добродетельное и светлое существо", story: "Элегантный и тёплый звук Anna стал «선희 (善熙)» — добродетельная и сияющая. Можно также взять фамилию наставника или семьи." },
    ],
    "child": [
      { meaning: "Расцветающая в благостном свете", story: "Фамилия Ким (金) с 瑞 (благостный) · 姸 (прекрасный). Сбалансированные пять элементов воды и металла с плавной фонетикой." },
      { meaning: "Статный, как широкое и глубокое море", story: "Фамилия Пак (朴) с 俊 (статный) · 浩 (широкая вода). Мужественная энергия с естественно сбалансированными слогами." },
      { meaning: "Высокий и свободный, как бескрайнее небо", story: "«하늘 (небо)» — чисто корейское имя. Фамилия Ли с двумя чёткими слогами. Светлое и яркое, запоминается везде." },
    ],
    "pet": [
      { meaning: "Драгоценный и любимый, как сияющая жемчужина", story: "Идеальное имя для мальтийской болонки с белой шерстью, сияющей как жемчуг. Короткое, лёгкое в произношении, изящное и милое." },
      { meaning: "Мягкий и чистый белый комочек", story: "Нежный, как белый тофу. Имя из знакового корейского блюда — дружелюбное и тёплое, как ваш питомец." },
      { meaning: "Чистый и сверкающий, как утренняя роса", story: "Идеально для питомца с глазами, сверкающими как капли росы. «이슬이» звучит естественно как прозвище, полное ласки." },
    ],
    "foreign": [
      { meaning: "Достойное имя на международной арене", story: "Английский дух «민 (民)» в имени Ли Минджун стал «James» — классическое и надёжное имя. Естественное преобразование." },
      { meaning: "Элегантная и утончённая французская чувственность", story: "Мягкий звук и изящность Соён идеально сочетаются с французским именем «Céline»." },
      { meaning: "Имя, несущее двойную корейско-китайскую идентичность", story: "Китайское произношение «Hàojùn» было напрямую взято из иероглифов 서준 (徐俊). Естественно звучит как в Корее, так и в Китае." },
    ],
    "goods": [
      { tagline: "Выгравируйте своё имя на шляпе", desc: "Премиальная шляпа-ведро с именем, вышитым рядом с традиционными узорами данчхон. Корейская эстетика в повседневной жизни." },
      { tagline: "Привнесите смысл своего имени в повседневные предметы", desc: "Лазерная гравировка с полосой в стиле сине-белого фарфора. Двойная вакуумная изоляция для горячего и холодного." },
      { tagline: "Встречайте смысл своего имени каждый день", desc: "Магнит на холодильник с именем и иероглифами на традиционном корейском облачном узоре. Популярен как подарок или сувенир." },
      { tagline: "Выгравируйте имя в традиционной каллиграфии печати", desc: "Ваше имя, вырезанное в традиционной корейской каллиграфии печати. От ежедневного использования до печатей на произведениях искусства." },
    ],
  },
  ar: {
    "korean-name": [
      { meaning: "روح واسعة وحرة كالسماء", story: "قادنا صوت Emma الناعم والمشرق إلى «하늘 (السماء)». اسم يتمنى حياة واسعة وحرة كسماء الصيف." },
      { meaning: "الازدهار على الطريق الصحيح", story: "من معنى Michael «اتباع إرادة الله»، صممنا «도윤 (道潤)» — الازدهار على الطريق الصحيح." },
      { meaning: "جميلة كلوتس ميمون", story: "رُقِّيت نقاء 雪 (يوكي·الثلج) إلى «서연 (瑞蓮)» — لوتس ميمون. اسم مليء بالحساسية الكورية." },
      { meaning: "اسم يحمل تطلعات متميزة", story: "من صوت Jake الواضح والقوي، صممنا «수지 (秀志)» — إرادة متميزة. اسم كوري مكتمل حتى بدون اسم عائلة." },
      { meaning: "كيان فاضل ومشرق", story: "تحوّل صوت Anna الأنيق والدافئ إلى «선희 (善熙)» — فاضلة ومشرقة. يمكنك أيضاً تبني لقب معلمك أو عائلتك." },
    ],
    "child": [
      { meaning: "تتفتح بجمال في ضوء ميمون", story: "اسم عائلة Kim (金) مع 瑞 (ميمون) · 姸 (جميل). توازن العناصر الخمسة للماء والمعدن مع تدفق صوتي سلس." },
      { meaning: "وسيم كبحر واسع وعميق", story: "اسم عائلة Park (朴) مع 俊 (وسيم) · 浩 (ماء شاسع). طاقة رجولية مع مقاطع متوازنة بشكل طبيعي." },
      { meaning: "عالٍ وحر كالسماء الشاسعة", story: "«하늘 (السماء)» — اسم كوري خالص. اسم عائلة Lee مع مقطعين نضيرين. صافٍ ومشرق، لا يُنسى في أي مكان." },
    ],
    "pet": [
      { meaning: "ثمين وعزيز كلؤلؤة لامعة", story: "مثالي لكلب مالطي يتلألأ فراؤه الأبيض كاللؤلؤ. قصير وسهل النداء، يجمع الأناقة والحلاوة." },
      { meaning: "قطعة قطن ناعمة وبيضاء نقية", story: "ناعم كالتوفو الأبيض. اسم مأخوذ من الطعام الكوري الشهير — ودود ودافئ مثل حيوانك الأليف." },
      { meaning: "صافٍ ولامع كندى الصباح", story: "مثالي لحيوان أليف بعيون تلمع كقطرات الندى. «이슬이» يبدو طبيعياً كلقب، مليء بالمحبة." },
    ],
    "foreign": [
      { meaning: "اسم ذو مكانة على المسرح الدولي", story: "تحوّلت روح «민 (民)» الإنجليزية في Lee Minjun إلى «James» — اسم كلاسيكي وجدير بالثقة." },
      { meaning: "حساسية فرنسية أنيقة ورقيقة", story: "يتناسب الصوت الناعم وأناقة Soyeon تماماً مع الاسم الفرنسي «Céline»." },
      { meaning: "اسم يحمل هوية كورية-صينية مزدوجة", story: "استُخرج النطق الصيني «Hàojùn» مباشرة من هانجا 서준 (徐俊). طبيعي في كوريا والصين على حد سواء." },
    ],
    "goods": [
      { tagline: "نقش اسمك المصمم على قبعة", desc: "قبعة دلو فاخرة مع اسمك المطرز جانباً لأنماط الدانتشيونج التقليدية. الجماليات الكورية في الحياة اليومية." },
      { tagline: "أضف معنى اسمك إلى الأشياء اليومية", desc: "نقش بالليزر مع شريط بنمط الخزف الأزرق والأبيض. عزل مزدوج بالتفريغ للساخن والبارد." },
      { tagline: "التقِ بمعنى اسمك كل يوم", desc: "مغناطيس ثلاجة يضم اسمك وهانجا على نمط السحاب الكوري التقليدي. شائع كهدية أو تذكار." },
      { tagline: "نقش اسمك بخط الختم التقليدي", desc: "اسمك المصمم منقوش بخط الختم الكوري التقليدي. من الاستخدام اليومي إلى ختم الأعمال الفنية." },
    ],
  },
  hi: {
    "korean-name": [
      { meaning: "आकाश जैसी विशाल और स्वतंत्र आत्मा", story: "Emma की कोमल और उज्ज्वल ध्वनि ने हमें '하늘 (आकाश)' तक पहुँचाया। ग्रीष्म के आकाश जैसी विशाल और स्वतंत्र जीवन की कामना।" },
      { meaning: "सही राह पर चलकर समृद्ध होना", story: "Michael के 'ईश्वर की इच्छा का पालन करना' अर्थ से '도윤 (道潤)' — सही राह पर समृद्धि — डिज़ाइन किया।" },
      { meaning: "शुभ कमल की तरह सुंदर", story: "雪 (युकि·बर्फ) की शुद्धता को '서연 (瑞蓮)' — शुभ कमल — में उन्नत किया। कोरियाई संवेदनशीलता से भरपूर नाम।" },
      { meaning: "उत्कृष्ट आकांक्षाएं समेटा नाम", story: "Jake की स्पष्ट और शक्तिशाली ध्वनि से '수지 (秀志)' — उत्कृष्ट संकल्प — डिज़ाइन किया। बिना उपनाम के भी पूर्ण कोरियाई नाम।" },
      { meaning: "सदाचारी और उज्ज्वल अस्तित्व", story: "Anna की सुरुचिपूर्ण और गर्म ध्वनि '선희 (善熙)' — सदाचारी और दीप्तिमान — बन गई। गुरु या परिवार का उपनाम भी अपना सकते हैं।" },
    ],
    "child": [
      { meaning: "शुभ प्रकाश में सुंदर खिलना", story: "Kim (金) उपनाम के साथ 瑞 (शुभ) · 姸 (सुंदर) का संयोजन। जल और धातु के पाँच तत्वों का संतुलन, सुचारु ध्वन्यात्मक प्रवाह।" },
      { meaning: "विशाल और गहरे समुद्र जैसा सुन्दर", story: "Park (朴) उपनाम के साथ 俊 (सुन्दर) · 浩 (विशाल जल) का संयोजन। पौरुष ऊर्जा और प्राकृतिक संतुलित अक्षर।" },
      { meaning: "विशाल आकाश जैसा ऊँचा और स्वतंत्र", story: "'하늘 (आकाश)' — शुद्ध कोरियाई नाम। Lee उपनाम के साथ दो स्पष्ट अक्षर। स्वच्छ और उज्ज्वल, हर जगह यादगार।" },
    ],
    "pet": [
      { meaning: "चमकते मोती जैसा अनमोल और प्रिय", story: "माल्टीज़ के लिए उत्तम नाम जिसका सफेद फर मोती जैसा चमकता है। छोटा, पुकारने में आसान, सुरुचिपूर्ण और प्यारा।" },
      { meaning: "मुलायम और शुद्ध सफेद रुई का गोला", story: "सफेद टोफू जैसा कोमल। कोरिया के प्रतिष्ठित भोजन से लिया गया नाम — मित्रवत और गर्म।" },
      { meaning: "सुबह की ओस जैसा स्वच्छ और चमकदार", story: "उस जानवर के लिए उत्तम जिसकी आँखें ओस की बूंदों जैसी चमकती हैं। '이슬이' उपनाम के रूप में स्वाभाविक लगता है।" },
    ],
    "foreign": [
      { meaning: "अंतर्राष्ट्रीय मंच पर भी गरिमामय नाम", story: "Lee Minjun में '민 (民)' की अंग्रेज़ी भावना 'James' बन गई — एक क्लासिक और विश्वसनीय नाम।" },
      { meaning: "सुरुचिपूर्ण और繊細 फ्रांसीसी संवेदनशीलता", story: "Soyeon की कोमल ध्वनि और सुरुचिपूर्णता फ्रांसीसी नाम 'Céline' के साथ परिपूर्ण मेल खाती है।" },
      { meaning: "कोरियाई-चीनी दोहरी पहचान समेटा नाम", story: "서준 (徐俊) के हानजा से चीनी उच्चारण 'Hàojùn' सीधे लिया गया। कोरिया और चीन दोनों में स्वाभाविक।" },
    ],
    "goods": [
      { tagline: "अपना डिज़ाइन किया नाम टोपी पर उकेरें", desc: "पारंपरिक दानचेओंग पैटर्न के साथ आपका नाम कढ़ाई किया हुआ प्रीमियम बकेट हैट।" },
      { tagline: "रोज़मर्रा की वस्तुओं में अपने नाम का अर्थ लाएं", desc: "नीले-सफेद चीनी मिट्टी के पैटर्न बैंड के साथ लेज़र उत्कीर्णन। दोहरा वैक्यूम इन्सुलेशन।" },
      { tagline: "हर दिन अपने नाम के अर्थ से मिलें", desc: "पारंपरिक कोरियाई बादल पैटर्न पर आपका नाम और हानजा के साथ फ्रिज मैग्नेट।" },
      { tagline: "परंपरागत मुहर लिपि में नाम उकेरें", desc: "आपका डिज़ाइन किया नाम पारंपरिक कोरियाई मुहर सुलेख में उकेरा गया।" },
    ],
  },
};

function getCards(lang: Lang, catId: CatId): AnyCard[] {
  const base = ALL_CARDS[catId];
  const trans = (CARD_TRANS_BY_LANG[lang] ?? CARD_TRANS_BY_LANG.ko)[catId] as (KNTrans | GoodsTrans)[];
  return base.map((card, i) => ({ ...card, ...(trans[i] ?? {}) }));
}

const HOME_COPY = {
  ko: {
    headline1: "한국적인 이름을", headline2: "설계합니다",
    hanja: "名設計",
    subline: "단순 생성이 아닌, 음운·한자·오행을 담은 진짜 이름 설계",
    ctaMain: "이름 만들기 시작 →",
    free: "첫 이름 무료", time: "약 2분 완성", later: "이후",
    noLogin: "비로그인 상태에서도 1회 무료",
    trust1: "성명학·사주 반영", trust2: "다국어 동시 설계", trust3: "오행·음운 균형",
    badge: "한국 프리미엄 네이밍 서비스",
    infoTitle: "이름 트렌드 & 참고 정보", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "나의 한국 이름", sub: "외국인 한국 이름" },
      "child":        { label: "아이 이름",      sub: "태명·아기이름" },
      "pet":          { label: "반려동물",        sub: "반려견·반려묘" },
      "foreign":      { label: "외국 이름",       sub: "한국→외국이름" },
      "goods":        { label: "도장·굿즈",       sub: "도장·문패·선물" },
    },
    ctaLabels: {
      "korean-name": "나의 한국이름 만들기",
      "child":        "이름 설계 시작하기",
      "pet":          "반려동물 이름 짓기",
      "foreign":      "이름 설계 시작하기",
      "goods":        "도장·굿즈 주문하기",
    },
    reviewsTitle: "전 세계 고객의 한국이름 이야기",
  },
  en: {
    headline1: "Design Your", headline2: "Korean Name",
    hanja: "名設計",
    subline: "Not just generation — real name design with phonetics, hanja & ohaeng",
    ctaMain: "Start Designing →",
    free: "First name free", time: "~2 min", later: "After:",
    noLogin: "1 free design without sign-in",
    trust1: "Saju & Phonetics", trust2: "Multi-language", trust3: "Ohaeng Balance",
    badge: "Korean Premium Naming",
    infoTitle: "Name Trends & Reference", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "My Korean Name",  sub: "Korean name for you" },
      "child":        { label: "Baby Name",       sub: "Newborn · Rename" },
      "pet":          { label: "Pet Name",        sub: "Dog · Cat · Other" },
      "foreign":      { label: "Foreign Name",    sub: "Korean → Foreign" },
      "goods":        { label: "Stamp · Goods",   sub: "Stamp · Nameplate" },
    },
    ctaLabels: {
      "korean-name": "Create My Korean Name",
      "child":        "Design a Name",
      "pet":          "Name My Pet",
      "foreign":      "Design a Name",
      "goods":        "Order Goods",
    },
    reviewsTitle: "Stories from Around the World",
  },
  zh: {
    headline1: "为您设计", headline2: "韩国名字",
    hanja: "名設計",
    subline: "不只是生成 — 融合音韵、汉字、五行的真正名字设计",
    ctaMain: "开始名字设计 →",
    free: "首次免费", time: "约2分钟", later: "之后",
    noLogin: "无需登录即可免费使用一次",
    trust1: "四柱·音韵", trust2: "多语言设计", trust3: "五行平衡",
    badge: "韩国高端命名服务",
    infoTitle: "名字趋势 & 参考资料", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "我的韩国名字", sub: "外国人韩国名字" },
      "child":        { label: "儿童名字",     sub: "新生儿·改名" },
      "pet":          { label: "宠物名字",     sub: "狗·猫·其他" },
      "foreign":      { label: "外国名字",     sub: "韩国→外国名字" },
      "goods":        { label: "印章·商品",    sub: "印章·门牌·礼品" },
    },
    ctaLabels: {
      "korean-name": "创建我的韩国名字",
      "child":        "开始名字设计",
      "pet":          "为宠物起名",
      "foreign":      "开始名字设计",
      "goods":        "订购印章·商品",
    },
    reviewsTitle: "来自全球客户的故事",
  },
  ja: {
    headline1: "あなたの韓国名を", headline2: "設計します",
    hanja: "名設計",
    subline: "単なる生成ではなく、音韻・漢字・五行を込めた本物の名前設計",
    ctaMain: "名前設計を始める →",
    free: "初回無料", time: "約2分", later: "以降",
    noLogin: "ログイン不要で1回無料",
    trust1: "四柱·音韻", trust2: "多言語対応", trust3: "五行バランス",
    badge: "韓国プレミアムネーミング",
    infoTitle: "名前トレンド & 参考情報", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "私の韓国名",   sub: "外国人向け韓国名" },
      "child":        { label: "お子様の名前", sub: "赤ちゃん·改名" },
      "pet":          { label: "ペット名",     sub: "犬·猫·その他" },
      "foreign":      { label: "外国名",       sub: "韓国→外国名" },
      "goods":        { label: "印鑑·グッズ",  sub: "印鑑·表札·贈り物" },
    },
    ctaLabels: {
      "korean-name": "韓国名を作る",
      "child":        "名前設計を始める",
      "pet":          "ペット名を付ける",
      "foreign":      "名前設計を始める",
      "goods":        "印鑑·グッズを注文",
    },
    reviewsTitle: "世界中のお客様の声",
  },
  es: {
    headline1: "Diseña tu", headline2: "nombre coreano",
    hanja: "名設計",
    subline: "Diseño real con fonética, hanja y ohaeng — no solo generación",
    ctaMain: "Empezar diseño →",
    free: "Primero gratis", time: "~2 min", later: "Después:",
    noLogin: "1 diseño gratis sin registro",
    trust1: "Saju·Fonética", trust2: "Multilingüe", trust3: "Balance Ohaeng",
    badge: "Nomenclatura Coreana Premium",
    infoTitle: "Tendencias & Referencia", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "Mi nombre coreano", sub: "Para extranjeros" },
      "child":        { label: "Nombre de bebé",    sub: "Recién nacido" },
      "pet":          { label: "Nombre de mascota", sub: "Perro · Gato" },
      "foreign":      { label: "Nombre extranjero", sub: "Coreano → Extranjero" },
      "goods":        { label: "Sello · Artículos", sub: "Sello · Placa" },
    },
    ctaLabels: {
      "korean-name": "Crear mi nombre coreano",
      "child":        "Diseñar un nombre",
      "pet":          "Nombrar mi mascota",
      "foreign":      "Diseñar un nombre",
      "goods":        "Pedir sello · artículos",
    },
    reviewsTitle: "Historias de clientes de todo el mundo",
  },
  fr: {
    headline1: "Concevez votre", headline2: "prénom coréen",
    hanja: "名設計",
    subline: "Conception réelle avec phonétique, hanja et ohaeng",
    ctaMain: "Commencer →",
    free: "Premier gratuit", time: "~2 min", later: "Ensuite:",
    noLogin: "1 conception gratuite sans connexion",
    trust1: "Saju·Phonétique", trust2: "Multilingue", trust3: "Balance Ohaeng",
    badge: "Nommage Coréen Premium",
    infoTitle: "Tendances & Référence", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "Mon prénom coréen", sub: "Pour étrangers" },
      "child":        { label: "Prénom bébé",       sub: "Nouveau-né" },
      "pet":          { label: "Prénom animal",     sub: "Chien · Chat" },
      "foreign":      { label: "Prénom étranger",   sub: "Coréen → Étranger" },
      "goods":        { label: "Sceau · Articles",  sub: "Sceau · Plaque" },
    },
    ctaLabels: {
      "korean-name": "Créer mon prénom coréen",
      "child":        "Concevoir un prénom",
      "pet":          "Nommer mon animal",
      "foreign":      "Concevoir un prénom",
      "goods":        "Commander des articles",
    },
    reviewsTitle: "Témoignages de clients du monde entier",
  },
  ru: {
    headline1: "Создайте ваше", headline2: "корейское имя",
    hanja: "名設計",
    subline: "Настоящий дизайн имени с фонетикой, ханджа и пятью элементами",
    ctaMain: "Начать дизайн →",
    free: "Первое бесплатно", time: "~2 мин", later: "Далее:",
    noLogin: "1 раз бесплатно без входа",
    trust1: "Саджу·Фонетика", trust2: "Мультиязычный", trust3: "Баланс Охэн",
    badge: "Корейский Премиум Нейминг",
    infoTitle: "Тенденции имён & Справка", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "Моё корейское имя", sub: "Для иностранцев" },
      "child":        { label: "Имя ребёнка",       sub: "Новорождённый" },
      "pet":          { label: "Кличка питомца",    sub: "Собака · Кошка" },
      "foreign":      { label: "Иностранное имя",   sub: "Корейское → Иностранное" },
      "goods":        { label: "Печать · Сувениры", sub: "Печать · Табличка" },
    },
    ctaLabels: {
      "korean-name": "Создать корейское имя",
      "child":        "Начать дизайн имени",
      "pet":          "Назвать питомца",
      "foreign":      "Начать дизайн имени",
      "goods":        "Заказать печать",
    },
    reviewsTitle: "Истории клиентов со всего мира",
  },
  ar: {
    headline1: "صمّم", headline2: "اسمك الكوري",
    hanja: "名設計",
    subline: "تصميم حقيقي بالصوتيات والهانجا والعناصر الخمسة",
    ctaMain: "ابدأ التصميم →",
    free: "الأول مجاني", time: "~دقيقتان", later: "بعدها:",
    noLogin: "تصميم مجاني واحد بدون تسجيل",
    trust1: "ساجو·الصوتيات", trust2: "متعدد اللغات", trust3: "توازن أوهيج",
    badge: "التسمية الكورية الفاخرة",
    infoTitle: "اتجاهات الأسماء & مرجع", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "اسمي الكوري",     sub: "للأجانب" },
      "child":        { label: "اسم الطفل",       sub: "مولود جديد" },
      "pet":          { label: "اسم الحيوان",     sub: "كلب · قطة" },
      "foreign":      { label: "الاسم الأجنبي",   sub: "كوري → أجنبي" },
      "goods":        { label: "ختم · بضائع",     sub: "ختم · لافتة" },
    },
    ctaLabels: {
      "korean-name": "إنشاء اسمي الكوري",
      "child":        "تصميم اسم",
      "pet":          "تسمية حيواني",
      "foreign":      "تصميم اسم",
      "goods":        "طلب ختم · بضائع",
    },
    reviewsTitle: "قصص عملاء من حول العالم",
  },
  hi: {
    headline1: "अपना कोरियाई", headline2: "नाम डिज़ाइन करें",
    hanja: "名設計",
    subline: "केवल जेनरेशन नहीं — ध्वन्यात्मकता, हांजा और पांच तत्वों के साथ असली नाम डिज़ाइन",
    ctaMain: "डिज़ाइन शुरू करें →",
    free: "पहला नाम मुफ़्त", time: "~2 मिनट", later: "बाद में:",
    noLogin: "बिना लॉगिन 1 बार मुफ़्त",
    trust1: "साजू·ध्वन्यात्मकता", trust2: "बहुभाषी", trust3: "ओहेंग संतुलन",
    badge: "कोरियाई प्रीमियम नामकरण",
    infoTitle: "नाम ट्रेंड्स & संदर्भ", infoHanja: "名資料",
    cats: {
      "korean-name": { label: "मेरा कोरियाई नाम", sub: "विदेशियों के लिए" },
      "child":        { label: "बच्चे का नाम",     sub: "नवजात · नाम बदलें" },
      "pet":          { label: "पालतू का नाम",     sub: "कुत्ता · बिल्ली" },
      "foreign":      { label: "विदेशी नाम",       sub: "कोरियाई → विदेशी" },
      "goods":        { label: "स्टाम्प · वस्तुएं", sub: "स्टाम्प · नेमप्लेट" },
    },
    ctaLabels: {
      "korean-name": "मेरा कोरियाई नाम बनाएं",
      "child":        "नाम डिज़ाइन शुरू करें",
      "pet":          "पालतू का नाम रखें",
      "foreign":      "नाम डिज़ाइन शुरू करें",
      "goods":        "स्टाम्प ऑर्डर करें",
    },
    reviewsTitle: "दुनिया भर के ग्राहकों की कहानियां",
  },
} as const;

type HomeCopy = typeof HOME_COPY["ko"];

const PRICE_MAP: Record<Lang, { symbol: string; amount: string }> = {
  ko: { symbol: "₩", amount: "9,900" },
  en: { symbol: "$", amount: "7.90" },
  zh: { symbol: "¥", amount: "57" },
  ja: { symbol: "¥", amount: "1,200" },
  es: { symbol: "€", amount: "7.30" },
  fr: { symbol: "€", amount: "7.30" },
  ru: { symbol: "₽", amount: "720" },
  ar: { symbol: "$", amount: "7.90" },
  hi: { symbol: "₹", amount: "660" },
};

const MARQUEE_BY_LANG: Record<Lang, { text: string; color: string }[]> = {
  ko: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake(미국) 태권도 사범님 덕분에 알게 된 윙크네이밍, 난 운이 좋다! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna(독일) 한국 도착 후 가장 먼저 한국 이름 만들기. 친구들에게 윙크네이밍 추천 중! ✦ ", color: "#FFFFFF" },
  ],
  en: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (USA) My taekwondo master introduced me to Wink Naming — I'm so lucky! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (Germany) First thing in Korea: getting a Korean name. Recommending Wink Naming to everyone! ✦ ", color: "#FFFFFF" },
  ],
  ja: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake（アメリカ）テコンドーの師範のおかげでWinkNamingと出会いました。本当にラッキー！ ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna（ドイツ）韓国到着後まず最初に韓国名を作りました。友達みんなにWinkNamingを勧めています！ ✦ ", color: "#FFFFFF" },
  ],
  zh: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake（美国）因跆拳道教练认识了WinkNaming，我真是太幸运了！ ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna（德国）到达韩国后第一件事就是取韩国名字，正在向朋友们推荐WinkNaming！ ✦ ", color: "#FFFFFF" },
  ],
  es: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (EE.UU.) Mi maestro de taekwondo me presentó Wink Naming — ¡qué suerte tengo! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (Alemania) Lo primero en Corea: conseguir un nombre coreano. ¡Recomendando Wink Naming a todos! ✦ ", color: "#FFFFFF" },
  ],
  fr: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (États-Unis) Mon maître de taekwondo m'a fait découvrir Wink Naming — quelle chance ! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (Allemagne) Première chose en Corée : créer un prénom coréen. Je recommande Wink Naming à tous ! ✦ ", color: "#FFFFFF" },
  ],
  ru: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (США) Тренер по тхэквондо познакомил меня с Wink Naming — мне так повезло! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (Германия) Первое в Корее: создать корейское имя. Рекомендую Wink Naming всем! ✦ ", color: "#FFFFFF" },
  ],
  ar: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (أمريكا) أستاذ التايكوندو عرّفني بـ Wink Naming — ما أحظاني! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (ألمانيا) أول ما فعلته في كوريا: الحصول على اسم كوري. أنصح الجميع بـ Wink Naming! ✦ ", color: "#FFFFFF" },
  ],
  hi: [
    { text: "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦ 6위 시우 ✦ 7위 주원 ✦ 8위 지호 ✦ 9위 준서 ✦ 10위 윤우 ✦ 🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦ 6위 지아 ✦ 7위 서하 ✦ 8위 아윤 ✦ 9위 윤서 ✦ 10위 설아 ✦ ", color: "#C9A84C" },
    { text: "💬 Jake (अमेरिका) ताइक्वांडो गुरु की वजह से Wink Naming से परिचय हुआ — मैं कितना भाग्यशाली हूँ! ✦ ", color: "#FFFFFF" },
    { text: "💬 Anna (जर्मनी) कोरिया में पहला काम: कोरियाई नाम बनवाना। सभी को Wink Naming की सिफ़ारिश! ✦ ", color: "#FFFFFF" },
  ],
};

const INFO_TABS_BY_LANG: Record<Lang, { id: string; label: string }[]> = {
  ko: [
    { id: "rank",    label: "📊 인기순위" },
    { id: "saju",    label: "☯ 성명학·사주" },
    { id: "sejong",  label: "👑 세종대왕·한글" },
    { id: "culture", label: "🌍 한국이름문화" },
    { id: "tips",    label: "💡 이름선택팁" },
  ],
  en: [
    { id: "rank",    label: "📊 Name Rankings" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 King Sejong" },
    { id: "culture", label: "🌍 Korean Name Culture" },
    { id: "tips",    label: "💡 Naming Tips" },
  ],
  ja: [
    { id: "rank",    label: "📊 人気ランキング" },
    { id: "saju",    label: "☯ 四柱·五行" },
    { id: "sejong",  label: "👑 世宗大王·ハングル" },
    { id: "culture", label: "🌍 韓国名文化" },
    { id: "tips",    label: "💡 命名のヒント" },
  ],
  zh: [
    { id: "rank",    label: "📊 热门排名" },
    { id: "saju",    label: "☯ 四柱·五行" },
    { id: "sejong",  label: "👑 世宗大王·韩文" },
    { id: "culture", label: "🌍 韩国名字文化" },
    { id: "tips",    label: "💡 起名技巧" },
  ],
  es: [
    { id: "rank",    label: "📊 Rankings" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 Rey Sejong" },
    { id: "culture", label: "🌍 Cultura de Nombres" },
    { id: "tips",    label: "💡 Consejos de Nombre" },
  ],
  fr: [
    { id: "rank",    label: "📊 Classements" },
    { id: "saju",    label: "☯ Saju & Ohaeng" },
    { id: "sejong",  label: "👑 Roi Sejong" },
    { id: "culture", label: "🌍 Culture des Prénoms" },
    { id: "tips",    label: "💡 Conseils de Prénom" },
  ],
  ru: [
    { id: "rank",    label: "📊 Рейтинги" },
    { id: "saju",    label: "☯ Саджу·Оhэн" },
    { id: "sejong",  label: "👑 Король Сечжон" },
    { id: "culture", label: "🌍 Культура имён" },
    { id: "tips",    label: "💡 Советы по именам" },
  ],
  ar: [
    { id: "rank",    label: "📊 تصنيفات الأسماء" },
    { id: "saju",    label: "☯ ساجو وأوهيج" },
    { id: "sejong",  label: "👑 الملك سيجونغ" },
    { id: "culture", label: "🌍 ثقافة الأسماء الكورية" },
    { id: "tips",    label: "💡 نصائح التسمية" },
  ],
  hi: [
    { id: "rank",    label: "📊 नाम रैंकिंग" },
    { id: "saju",    label: "☯ साजू·ओहेंग" },
    { id: "sejong",  label: "👑 राजा सेजोंग" },
    { id: "culture", label: "🌍 कोरियाई नाम संस्कृति" },
    { id: "tips",    label: "💡 नामकरण टिप्स" },
  ],
};

const INFO_TABS = INFO_TABS_BY_LANG.ko;
type InfoTabId = "rank" | "saju" | "sejong" | "culture" | "tips";

type InfoCard = { title: string; body: string; highlight?: string };
type InfoCardSet = Record<InfoTabId, InfoCard[]>;

const INFO_CARDS_BY_LANG: Record<Lang, InfoCardSet> = {
  ko: {
    saju: [
      { title: "음양오행(陰陽五行)", body: "목(木)·화(火)·토(土)·금(金)·수(水) 다섯 기운의 균형. 이름 획수와 오행이 사주와 조화를 이루어야 생동감 있는 이름이 됩니다.", highlight: "木 火 土 金 水" },
      { title: "발음오행(發音五行)", body: "이름 첫 자음의 발음 기운. ㄱ·ㅋ=목, ㄴ·ㄹ=화, ㅇ·ㅎ=토, ㅅ·ㅈ=금, ㅁ·ㅂ=수. 성씨 오행과 균형이 필요합니다.", highlight: "초성별 오행 분류" },
      { title: "자원오행(字源五行)", body: "한자 자체가 지닌 오행 기운. 水(물 수)=수, 木(나무 목)=목 처럼 한자의 의미와 오행이 일치해야 이름이 더 강해집니다.", highlight: "한자 의미 오행" },
      { title: "수리오행(數理五行)", body: "이름 획수의 합산으로 보는 기운. 성씨 획수+이름 획수의 조합이 길수(吉數)인지 확인합니다. 81수리가 기준입니다.", highlight: "81수리 기준" },
    ],
    sejong: [
      { title: "👑 세종대왕 한글 창제 (1443)", body: "조선 4대 왕 세종대왕이 1443년 창제한 한글. 당시 백성들이 어려운 한자를 배우지 못해 글을 모르는 현실을 안타깝게 여겨 만들었습니다.", highlight: "1443년 훈민정음" },
      { title: "🔬 세계 가장 과학적인 문자", body: "한글은 자음 14자·모음 10자 총 24자로 구성. 발음기관의 모양을 본떠 만든 세계 유일의 과학적 문자입니다.", highlight: "자음 14자 + 모음 10자" },
      { title: "📜 UNESCO 세계기록유산", body: "1997년 훈민정음 해례본이 UNESCO 세계기록유산에 등재. 현존하는 유일한 문자 창제 해설서로 세계적 가치를 인정받았습니다.", highlight: "UNESCO 1997년 등재" },
      { title: "🌐 한글의 우수성", body: "영국 언어학자 Geoffrey Sampson은 한글을 '인류의 가장 위대한 지적 업적'으로 평가. 24개 자모로 11,172가지 음절 표현이 가능합니다.", highlight: "11,172가지 음절 표현" },
    ],
    rank: [
      { title: "🏆 남아 1위 · 도윤", body: "2026년 가장 많이 지어진 남자 이름. 밝은 빛(도)과 윤택함(윤)의 조화.", highlight: "도윤 · 道潤" },
      { title: "🌸 여아 1위 · 서윤", body: "2026년 가장 인기 있는 여자 이름. 상서로운(서) 윤택함(윤)을 담은 이름.", highlight: "서윤 · 瑞潤" },
      { title: "📈 트렌드 키워드", body: "2026년 이름 트렌드: '윤·준·하·서'가 가장 많이 쓰인 음절. 밝고 개방적인 느낌 선호.", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 순우리말 부활", body: "하늘, 가온, 봄, 누리 등 순우리말 이름이 2026년 꾸준히 증가세.", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "한국 이름의 구조", body: "성(姓) 1자 + 이름 2자가 일반적. 총 3자. 이름에 돌림자(항렬자)를 넣는 전통이 있습니다.", highlight: "성 1자 + 이름 2자" },
      { title: "한자 문화권", body: "한국 이름의 80% 이상은 한자에 기원합니다. 같은 이름도 한자가 다르면 뜻이 다릅니다.", highlight: "漢字 기반" },
      { title: "외국인 한국 이름", body: "원래 이름의 발음·의미·느낌을 분석해 한국어로 재설계합니다. 단순 음역이 아닌 진짜 '한국 이름'입니다.", highlight: "음역 → 의역 → 창작" },
      { title: "이름과 인상", body: "한국에서는 이름이 첫인상에 큰 영향을 미칩니다. 발음의 강약, 한자의 의미, 획수까지 모두 고려됩니다.", highlight: "이름 = 첫인상" },
    ],
    tips: [
      { title: "부르기 좋은 이름", body: "2음절 이름이 부르기 가장 편합니다. 받침이 너무 많으면 답답하게 들릴 수 있으니 개방형 음절을 활용하세요.", highlight: "2음절 · 개방형 음절" },
      { title: "미래를 고려하세요", body: "어릴 때뿐 아니라 어른이 됐을 때도 어울리는 이름이 좋습니다. 너무 유아적이거나 시대적인 이름은 피하세요.", highlight: "평생 쓰는 이름" },
      { title: "다국어 발음 확인", body: "글로벌 시대에는 영어권·중국어권에서 이름이 어떻게 발음되는지 미리 확인하는 것이 좋습니다.", highlight: "영어 · 중국어 · 일본어" },
      { title: "가족과 함께 결정", body: "이름은 혼자 고르는 것보다 가족이 함께 여러 후보를 두고 불러보며 결정하는 것을 권장합니다.", highlight: "3개 후보 비교" },
    ],
  },
  en: {
    saju: [
      { title: "Five Elements (陰陽五行)", body: "Balance of Wood·Fire·Earth·Metal·Water. The name's stroke count and elements must harmonize with the saju chart for a vibrant name.", highlight: "Wood Fire Earth Metal Water" },
      { title: "Phonetic Elements (發音五行)", body: "The elemental energy of the first consonant. ㄱ·ㅋ=Wood, ㄴ·ㄹ=Fire, ㅇ·ㅎ=Earth, ㅅ·ㅈ=Metal, ㅁ·ㅂ=Water. Balance with the family name element is essential.", highlight: "Initial consonant classification" },
      { title: "Hanja Elements (字源五行)", body: "The elemental energy within the hanja itself. 水 (water)=Water, 木 (wood)=Wood — the hanja meaning and element should align to strengthen the name.", highlight: "Hanja meaning element" },
      { title: "Numerological Elements (數理五行)", body: "Energy derived from the sum of stroke counts. We check whether the combination of family+given name strokes forms a lucky number (吉數). Based on the 81-number system.", highlight: "81-number system" },
    ],
    sejong: [
      { title: "👑 King Sejong Creates Hangul (1443)", body: "King Sejong, the 4th king of Joseon, created Hangul in 1443. He was saddened that ordinary people couldn't read because Chinese characters were too difficult.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 The World's Most Scientific Script", body: "Hangul consists of 14 consonants and 10 vowels — 24 letters total. It is the world's only writing system modeled after the shape of the human speech organs.", highlight: "14 consonants + 10 vowels" },
      { title: "📜 UNESCO Memory of the World", body: "In 1997, the Hunminjeongeum Haeryebon was inscribed on UNESCO's Memory of the World Register as the only existing explanatory document of a script's creation.", highlight: "UNESCO 1997" },
      { title: "🌐 Excellence of Hangul", body: "British linguist Geoffrey Sampson called Hangul 'the greatest intellectual achievement in human history.' With 24 letters, it can express 11,172 distinct syllables.", highlight: "11,172 syllable expressions" },
    ],
    rank: [
      { title: "🏆 Boys #1 · Doyun", body: "The most given boy's name in 2026. A harmony of bright light (Do) and abundance (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Girls #1 · Seoyun", body: "The most popular girl's name in 2026. A name carrying auspiciousness (Seo) and abundance (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Trend Keywords", body: "2026 name trends: 'Yun·Jun·Ha·Seo' are the most-used syllables. Bright and open-feeling names are preferred.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Pure Korean Revival", body: "Pure Korean names like Haneul (sky), Gaon, Bom (spring), Nuri are steadily growing in 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Structure of Korean Names", body: "Typically 1 surname + 2 given name characters = 3 total. There is a tradition of including a generation character (돌림자) shared among siblings.", highlight: "1 surname + 2 given" },
      { title: "Hanja (Chinese Character) Culture", body: "Over 80% of Korean names originate from hanja. Even the same name can have different meanings depending on which hanja characters are used.", highlight: "漢字 based" },
      { title: "Korean Names for Foreigners", body: "We analyze the phonetics, meaning, and feel of the original name to redesign it in Korean. Not mere transliteration — a true Korean name.", highlight: "Transliteration → Meaning → Creation" },
      { title: "Names & First Impressions", body: "In Korea, a name has a significant impact on first impressions. The strength of pronunciation, meaning of hanja, and stroke count are all considered.", highlight: "Name = First Impression" },
    ],
    tips: [
      { title: "Names That Are Easy to Call", body: "2-syllable names are the easiest to call. Too many final consonants can sound cramped, so open syllables are recommended.", highlight: "2 syllables · open syllables" },
      { title: "Think About the Future", body: "A name that suits both childhood and adulthood is ideal. Avoid names that sound too childish or too tied to a specific era.", highlight: "A name for life" },
      { title: "Check Multilingual Pronunciation", body: "In the global era, it's wise to check how the name sounds in English and Chinese before deciding.", highlight: "English · Chinese · Japanese" },
      { title: "Decide Together as a Family", body: "Rather than choosing alone, we recommend that the whole family tries calling several candidates aloud together before deciding.", highlight: "Compare 3 candidates" },
    ],
  },
  ja: {
    saju: [
      { title: "陰陽五行", body: "木·火·土·金·水の五つの気の均衡。名前の画数と五行が四柱と調和することで、生き生きとした名前になります。", highlight: "木 火 土 金 水" },
      { title: "発音五行", body: "名前の最初の子音の発音の気。ㄱ·ㅋ=木、ㄴ·ㄹ=火、ㅇ·ㅎ=土、ㅅ·ㅈ=金、ㅁ·ㅂ=水。姓の五行とのバランスが必要です。", highlight: "初声別五行分類" },
      { title: "字源五行", body: "漢字自体が持つ五行の気。水(水)=水、木(木)=木のように、漢字の意味と五行が一致することで名前がより強くなります。", highlight: "漢字意味五行" },
      { title: "数理五行", body: "名前の画数の合計で見る気。姓の画数+名前の画数の組み合わせが吉数かどうかを確認します。81数理が基準です。", highlight: "81数理基準" },
    ],
    sejong: [
      { title: "👑 世宗大王ハングル創制 (1443)", body: "朝鮮第4代王・世宗大王が1443年に創制したハングル。当時の民が難しい漢字を学べず文字を知らない現実を憂い作りました。", highlight: "1443年 訓民正音" },
      { title: "🔬 世界最も科学的な文字", body: "ハングルは子音14字·母音10字、計24字で構成。発音器官の形を模した世界唯一の科学的文字です。", highlight: "子音14字 + 母音10字" },
      { title: "📜 UNESCO世界記録遺産", body: "1997年、訓民正音解例本がUNESCO世界記録遺産に登録。現存する唯一の文字創制解説書として世界的価値を認められました。", highlight: "UNESCO 1997年登録" },
      { title: "🌐 ハングルの優秀性", body: "英国の言語学者Geoffrey Sampsonはハングルを「人類最大の知的業績」と評価。24字母で11,172種類の音節表現が可能です。", highlight: "11,172種類の音節" },
    ],
    rank: [
      { title: "🏆 男の子1位 · 도윤", body: "2026年最も多く付けられた男の子の名前。明るい光(도)と潤い(윤)の調和。", highlight: "도윤 · 道潤" },
      { title: "🌸 女の子1位 · 서윤", body: "2026年最も人気のある女の子の名前。縁起良い(서)潤い(윤)を込めた名前。", highlight: "서윤 · 瑞潤" },
      { title: "📈 トレンドキーワード", body: "2026年の名前トレンド：「윤·준·하·서」が最も多く使われた音節。明るく開放的な印象が好まれます。", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 純韓国語の復活", body: "하늘(空)、가온、봄(春)、누리など純韓国語の名前が2026年着実に増加中。", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "韓国名の構造", body: "姓1字+名2字が一般的。計3字。名前に通し字（항렬자）を入れる伝統があります。", highlight: "姓1字 + 名2字" },
      { title: "漢字文化圏", body: "韓国名の80%以上は漢字に由来します。同じ名前でも漢字が違えば意味が異なります。", highlight: "漢字ベース" },
      { title: "外国人の韓国名", body: "元の名前の発音·意味·印象を分析して韓国語で再設計します。単なる音訳ではなく本物の「韓国名」です。", highlight: "音訳 → 意訳 → 創作" },
      { title: "名前と第一印象", body: "韓国では名前が第一印象に大きく影響します。発音の強弱、漢字の意味、画数まで全て考慮されます。", highlight: "名前 = 第一印象" },
    ],
    tips: [
      { title: "呼びやすい名前", body: "2音節の名前が最も呼びやすいです。パッチムが多すぎると詰まって聞こえるので、開放型音節の活用をお勧めします。", highlight: "2音節 · 開放型音節" },
      { title: "将来を考えてください", body: "子どもの頃だけでなく、大人になっても似合う名前が良いです。幼すぎたり時代的すぎる名前は避けましょう。", highlight: "一生使う名前" },
      { title: "多言語発音の確認", body: "グローバル時代には英語圏·中国語圏でどう発音されるか事前に確認することをお勧めします。", highlight: "英語 · 中国語 · 日本語" },
      { title: "家族で決める", body: "一人で選ぶより、家族で複数の候補を声に出して呼んでみて決めることをお勧めします。", highlight: "3候補を比較" },
    ],
  },
  zh: {
    saju: [
      { title: "阴阳五行", body: "木·火·土·金·水五种气的平衡。名字的笔画数和五行需要与四柱相协调，才能成为充满生命力的名字。", highlight: "木 火 土 金 水" },
      { title: "发音五行", body: "名字第一个声母的发音之气。ㄱ·ㅋ=木，ㄴ·ㄹ=火，ㅇ·ㅎ=土，ㅅ·ㅈ=金，ㅁ·ㅂ=水。需要与姓氏五行保持平衡。", highlight: "声母五行分类" },
      { title: "字源五行", body: "汉字本身所含的五行之气。水(水)=水，木(木)=木，汉字含义与五行一致才能使名字更加有力。", highlight: "汉字含义五行" },
      { title: "数理五行", body: "由名字笔画总数看出的气。确认姓氏笔画+名字笔画的组合是否为吉数。以81数理为基准。", highlight: "81数理基准" },
    ],
    sejong: [
      { title: "👑 世宗大王创制韩文 (1443)", body: "朝鲜第4代国王世宗大王于1443年创制了韩文。他对当时百姓因无法学习艰涩汉字而不识字的现实深感痛心。", highlight: "1443年 训民正音" },
      { title: "🔬 世界最科学的文字", body: "韩文由14个辅音·10个元音共24个字母组成。是世界上唯一以发音器官形状为基础创制的科学文字。", highlight: "辅音14个 + 元音10个" },
      { title: "📜 UNESCO世界记忆遗产", body: "1997年，《训民正音》解例本被列入UNESCO世界记忆遗产。作为现存唯一的文字创制解说书，获得了全球认可。", highlight: "UNESCO 1997年入选" },
      { title: "🌐 韩文的优越性", body: "英国语言学家Geoffrey Sampson将韩文评为「人类最伟大的智识成就」。24个字母可以表达11,172种音节。", highlight: "11,172种音节表达" },
    ],
    rank: [
      { title: "🏆 男孩第1名 · 도윤", body: "2026年取名最多的男孩名字。明亮之光（도）与润泽（윤）的和谐。", highlight: "도윤 · 道潤" },
      { title: "🌸 女孩第1名 · 서윤", body: "2026年最受欢迎的女孩名字。承载吉祥（서）与润泽（윤）的名字。", highlight: "서윤 · 瑞潤" },
      { title: "📈 流行关键词", body: "2026年名字趋势：「윤·준·하·서」是使用最多的音节。偏爱明亮开朗的感觉。", highlight: "윤 · 준 · 하 · 서" },
      { title: "🔤 纯韩语复兴", body: "하늘(天空)、가온、봄(春天)、누리等纯韩语名字在2026年持续增长。", highlight: "하늘 · 가온 · 봄" },
    ],
    culture: [
      { title: "韩国名字的结构", body: "通常为姓1字+名2字，共3字。名字中有放入「字辈字」（항렬자）的传统。", highlight: "姓1字 + 名2字" },
      { title: "汉字文化圈", body: "韩国名字80%以上源自汉字。即使是相同的名字，使用不同汉字意义也会不同。", highlight: "漢字为基础" },
      { title: "外国人的韩国名字", body: "分析原名的发音·含义·感觉后用韩语重新设计。不是简单的音译，而是真正的「韩国名字」。", highlight: "音译 → 意译 → 创作" },
      { title: "名字与第一印象", body: "在韩国，名字对第一印象有很大影响。发音的强弱、汉字的含义、笔画数都会被考虑。", highlight: "名字 = 第一印象" },
    ],
    tips: [
      { title: "容易呼唤的名字", body: "2个音节的名字最容易呼唤。尾音太多会显得沉闷，建议使用开放型音节。", highlight: "2音节 · 开放型音节" },
      { title: "考虑未来", body: "适合童年也适合成年的名字才是好名字。避免过于幼稚或过于时代性的名字。", highlight: "一生使用的名字" },
      { title: "确认多语言发音", body: "在全球化时代，建议提前确认名字在英语圈·中文圈如何发音。", highlight: "英语 · 中文 · 日语" },
      { title: "与家人共同决定", body: "比起一个人选择，建议全家人一起大声呼唤几个候选名字后再做决定。", highlight: "比较3个候选" },
    ],
  },
  es: {
    saju: [
      { title: "Cinco Elementos (陰陽五行)", body: "Equilibrio de Madera·Fuego·Tierra·Metal·Agua. Los trazos del nombre y los elementos deben armonizar con el saju para un nombre vibrante.", highlight: "Madera Fuego Tierra Metal Agua" },
      { title: "Elementos Fonéticos (發音五行)", body: "La energía elemental de la primera consonante. ㄱ·ㅋ=Madera, ㄴ·ㄹ=Fuego, ㅇ·ㅎ=Tierra, ㅅ·ㅈ=Metal, ㅁ·ㅂ=Agua. Balance con el apellido es esencial.", highlight: "Clasificación por consonante" },
      { title: "Elementos Hanja (字源五行)", body: "La energía elemental dentro del hanja mismo. 水=Agua, 木=Madera — el significado del hanja y el elemento deben alinearse.", highlight: "Elemento de significado hanja" },
      { title: "Elementos Numerológicos (數理五行)", body: "Energía derivada de la suma de trazos. Verificamos si la combinación apellido+nombre forma un número auspicioso. Sistema de 81 números.", highlight: "Sistema 81 números" },
    ],
    sejong: [
      { title: "👑 Rey Sejong Crea Hangul (1443)", body: "El Rey Sejong, 4° rey de Joseon, creó el Hangul en 1443. Le entristecía que el pueblo no pudiera leer porque los caracteres chinos eran demasiado difíciles.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 El Alfabeto Más Científico", body: "Hangul consta de 14 consonantes y 10 vocales — 24 letras. Es el único sistema de escritura del mundo modelado según los órganos del habla.", highlight: "14 consonantes + 10 vocales" },
      { title: "📜 UNESCO Memoria del Mundo", body: "En 1997, el Hunminjeongeum Haeryebon fue inscrito en la Memoria del Mundo de la UNESCO como único documento explicativo existente de un alfabeto.", highlight: "UNESCO 1997" },
      { title: "🌐 Excelencia del Hangul", body: "El lingüista británico Geoffrey Sampson llamó al Hangul 'el mayor logro intelectual de la historia humana.' Con 24 letras expresa 11,172 sílabas.", highlight: "11,172 expresiones silábicas" },
    ],
    rank: [
      { title: "🏆 Niños #1 · Doyun", body: "El nombre de niño más dado en 2026. Armonía de luz brillante (Do) y abundancia (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Niñas #1 · Seoyun", body: "El nombre de niña más popular en 2026. Nombre que lleva auspicio (Seo) y abundancia (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Palabras Clave de Tendencia", body: "Tendencias de nombres en 2026: 'Yun·Jun·Ha·Seo' son las sílabas más usadas. Se prefieren nombres brillantes y abiertos.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Renacimiento del Coreano Puro", body: "Nombres en coreano puro como Haneul (cielo), Gaon, Bom (primavera), Nuri crecen constantemente en 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Estructura de Nombres Coreanos", body: "Típicamente 1 apellido + 2 caracteres de nombre dado = 3 en total. Hay tradición de incluir un carácter generacional compartido entre hermanos.", highlight: "1 apellido + 2 nombre" },
      { title: "Cultura Hanja", body: "Más del 80% de los nombres coreanos tienen origen en hanja. Incluso el mismo nombre puede tener diferentes significados según qué hanja se use.", highlight: "Basado en 漢字" },
      { title: "Nombres Coreanos para Extranjeros", body: "Analizamos la fonética, el significado y el sentido del nombre original para rediseñarlo en coreano. No es mera transliteración — es un nombre coreano real.", highlight: "Transliteración → Significado → Creación" },
      { title: "Nombres y Primera Impresión", body: "En Corea, el nombre tiene un gran impacto en la primera impresión. Se considera la fuerza de pronunciación, el significado del hanja y los trazos.", highlight: "Nombre = Primera Impresión" },
    ],
    tips: [
      { title: "Nombres Fáciles de Llamar", body: "Los nombres de 2 sílabas son los más fáciles de llamar. Demasiadas consonantes finales pueden sonar atiborradas; se recomiendan sílabas abiertas.", highlight: "2 sílabas · sílabas abiertas" },
      { title: "Piensa en el Futuro", body: "Un nombre que se adapte tanto a la infancia como a la adultez es ideal. Evita nombres demasiado infantiles o ligados a una era específica.", highlight: "Un nombre para toda la vida" },
      { title: "Verifica la Pronunciación Multilingüe", body: "En la era global, es prudente verificar cómo suena el nombre en inglés y chino antes de decidir.", highlight: "Inglés · Chino · Japonés" },
      { title: "Decide en Familia", body: "En lugar de elegir solo, recomendamos que toda la familia pruebe llamar varios candidatos en voz alta antes de decidir.", highlight: "Compara 3 candidatos" },
    ],
  },
  fr: {
    saju: [
      { title: "Cinq Éléments (陰陽五行)", body: "Équilibre entre Bois·Feu·Terre·Métal·Eau. Les traits du prénom et les éléments doivent s'harmoniser avec le saju pour un prénom vibrant.", highlight: "Bois Feu Terre Métal Eau" },
      { title: "Éléments Phonétiques (發音五行)", body: "L'énergie élémentale de la première consonne. ㄱ·ㅋ=Bois, ㄴ·ㄹ=Feu, ㅇ·ㅎ=Terre, ㅅ·ㅈ=Métal, ㅁ·ㅂ=Eau. L'équilibre avec le nom de famille est essentiel.", highlight: "Classification par consonne" },
      { title: "Éléments Hanja (字源五行)", body: "L'énergie élémentale dans le hanja lui-même. 水=Eau, 木=Bois — le sens du hanja et l'élément doivent s'aligner.", highlight: "Élément de sens hanja" },
      { title: "Éléments Numériques (數理五行)", body: "Énergie dérivée de la somme des traits. Nous vérifions si la combinaison nom de famille+prénom forme un nombre auspicieux. Système à 81 nombres.", highlight: "Système 81 nombres" },
    ],
    sejong: [
      { title: "👑 Le Roi Sejong Crée Hangul (1443)", body: "Le Roi Sejong, 4e roi de Joseon, a créé le Hangul en 1443. Il était attristé que le peuple ne puisse pas lire car les caractères chinois étaient trop difficiles.", highlight: "1443 Hunminjeongeum" },
      { title: "🔬 L'Alphabet le Plus Scientifique", body: "Hangul se compose de 14 consonnes et 10 voyelles — 24 lettres. C'est le seul système d'écriture au monde modélisé sur les organes de la parole.", highlight: "14 consonnes + 10 voyelles" },
      { title: "📜 UNESCO Mémoire du Monde", body: "En 1997, le Hunminjeongeum Haeryebon a été inscrit au Registre Mémoire du Monde de l'UNESCO comme unique document explicatif existant d'un alphabet.", highlight: "UNESCO 1997" },
      { title: "🌐 Excellence du Hangul", body: "Le linguiste britannique Geoffrey Sampson a qualifié Hangul de « la plus grande réalisation intellectuelle de l'histoire humaine ». Avec 24 lettres, il exprime 11 172 syllabes.", highlight: "11 172 expressions syllabiques" },
    ],
    rank: [
      { title: "🏆 Garçons #1 · Doyun", body: "Le prénom de garçon le plus donné en 2026. Une harmonie de lumière vive (Do) et d'abondance (Yun).", highlight: "도윤 · 道潤" },
      { title: "🌸 Filles #1 · Seoyun", body: "Le prénom de fille le plus populaire en 2026. Un prénom portant la chance (Seo) et l'abondance (Yun).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Mots-Clés Tendance", body: "Tendances des prénoms en 2026 : « Yun·Jun·Ha·Seo » sont les syllabes les plus utilisées. Les prénoms lumineux et ouverts sont préférés.", highlight: "Yun · Jun · Ha · Seo" },
      { title: "🔤 Renaissance du Coréen Pur", body: "Les prénoms en coréen pur comme Haneul (ciel), Gaon, Bom (printemps), Nuri croissent régulièrement en 2026.", highlight: "Haneul · Gaon · Bom" },
    ],
    culture: [
      { title: "Structure des Prénoms Coréens", body: "Typiquement 1 nom de famille + 2 caractères de prénom = 3 au total. Il y a une tradition d'inclure un caractère de génération partagé entre frères et sœurs.", highlight: "1 nom + 2 prénom" },
      { title: "Culture Hanja", body: "Plus de 80% des prénoms coréens ont une origine en hanja. Même le même prénom peut avoir des significations différentes selon les hanja utilisés.", highlight: "Basé sur 漢字" },
      { title: "Prénoms Coréens pour Étrangers", body: "Nous analysons la phonétique, le sens et l'impression du prénom original pour le reconcevoir en coréen. Pas de simple translittération — un vrai prénom coréen.", highlight: "Translittération → Sens → Création" },
      { title: "Prénoms et Première Impression", body: "En Corée, le prénom a un impact significatif sur la première impression. La force de prononciation, le sens du hanja et le nombre de traits sont tous considérés.", highlight: "Prénom = Première Impression" },
    ],
    tips: [
      { title: "Prénoms Faciles à Appeler", body: "Les prénoms de 2 syllabes sont les plus faciles à appeler. Trop de consonnes finales peuvent sonner étouffées ; des syllabes ouvertes sont recommandées.", highlight: "2 syllabes · syllabes ouvertes" },
      { title: "Pensez à l'Avenir", body: "Un prénom qui convient à la fois à l'enfance et à l'âge adulte est idéal. Évitez les prénoms trop enfantins ou trop liés à une époque spécifique.", highlight: "Un prénom pour la vie" },
      { title: "Vérifiez la Prononciation Multilingue", body: "À l'ère mondiale, il est judicieux de vérifier comment le prénom sonne en anglais et en chinois avant de décider.", highlight: "Anglais · Chinois · Japonais" },
      { title: "Décidez en Famille", body: "Plutôt que de choisir seul, nous recommandons que toute la famille essaie d'appeler plusieurs candidats à voix haute avant de décider.", highlight: "Comparez 3 candidats" },
    ],
  },
  ru: {
    saju: [
      { title: "Пять элементов (陰陽五行)", body: "Баланс Дерева·Огня·Земли·Металла·Воды. Черты имени и элементы должны гармонировать с саджу для живого имени.", highlight: "Дерево Огонь Земля Металл Вода" },
      { title: "Фонетические элементы (發音五行)", body: "Стихийная энергия первой согласной. ㄱ·ㅋ=Дерево, ㄴ·ㄹ=Огонь, ㅇ·ㅎ=Земля, ㅅ·ㅈ=Металл, ㅁ·ㅂ=Вода. Баланс с фамильным элементом обязателен.", highlight: "Классификация по согласной" },
      { title: "Элементы Ханджа (字源五行)", body: "Стихийная энергия в самом ханджа. 水=Вода, 木=Дерево — значение ханджа и элемент должны совпадать для усиления имени.", highlight: "Элемент значения ханджа" },
      { title: "Числовые элементы (數理五行)", body: "Энергия, получаемая из суммы черт. Проверяем, образует ли сочетание фамилия+имя счастливое число. Система 81 числа.", highlight: "Система 81 числа" },
    ],
    sejong: [
      { title: "👑 Король Сечжон создаёт Хангыль (1443)", body: "Король Сечжон, 4-й король Чосон, создал Хангыль в 1443 году. Его печалило, что простой народ не мог читать из-за сложности китайских иероглифов.", highlight: "1443 Хунминчонъым" },
      { title: "🔬 Самое научное письмо в мире", body: "Хангыль состоит из 14 согласных и 10 гласных — 24 буквы. Это единственная в мире система письма, созданная по форме речевых органов.", highlight: "14 согласных + 10 гласных" },
      { title: "📜 Память мира ЮНЕСКО", body: "В 1997 году Хунминчонъым Хэрэбон был внесён в реестр «Память мира» ЮНЕСКО как единственный существующий пояснительный документ создания алфавита.", highlight: "ЮНЕСКО 1997" },
      { title: "🌐 Превосходство Хангыля", body: "Британский лингвист Джеффри Сэмпсон назвал Хангыль «величайшим интеллектуальным достижением в истории человечества». 24 буквы выражают 11 172 слога.", highlight: "11 172 слоговых выражений" },
    ],
    rank: [
      { title: "🏆 Мальчики #1 · Доюн", body: "Самое популярное имя для мальчиков в 2026 году. Гармония яркого света (До) и изобилия (Юн).", highlight: "도윤 · 道潤" },
      { title: "🌸 Девочки #1 · Союн", body: "Самое популярное имя для девочек в 2026 году. Имя, несущее удачу (Со) и изобилие (Юн).", highlight: "서윤 · 瑞潤" },
      { title: "📈 Ключевые слова тренда", body: "Тенденции имён в 2026 году: «Юн·Джун·Ха·Со» — наиболее используемые слоги. Предпочтение отдаётся светлым и открытым именам.", highlight: "Юн · Джун · Ха · Со" },
      { title: "🔤 Возрождение чистокорейских имён", body: "Чистокорейские имена как Ханыль (небо), Гаон, Бом (весна), Нури неуклонно растут в 2026 году.", highlight: "Ханыль · Гаон · Бом" },
    ],
    culture: [
      { title: "Структура корейских имён", body: "Обычно 1 фамилия + 2 иероглифа имени = 3 всего. Существует традиция включать поколенческий иероглиф, общий для братьев и сестёр.", highlight: "1 фамилия + 2 имени" },
      { title: "Культура ханджа", body: "Более 80% корейских имён происходят из ханджа. Даже одно и то же имя может иметь разные значения в зависимости от используемых ханджа.", highlight: "Основано на 漢字" },
      { title: "Корейские имена для иностранцев", body: "Мы анализируем фонетику, значение и ощущение исходного имени, чтобы переосмыслить его по-корейски. Не просто транслитерация — настоящее корейское имя.", highlight: "Транслит. → Значение → Создание" },
      { title: "Имена и первое впечатление", body: "В Корее имя оказывает значительное влияние на первое впечатление. Учитывается сила произношения, значение ханджа и количество черт.", highlight: "Имя = Первое впечатление" },
    ],
    tips: [
      { title: "Имена, которые легко произносить", body: "Двусложные имена самые удобные. Слишком много финальных согласных может звучать громоздко; рекомендуются открытые слоги.", highlight: "2 слога · открытые слоги" },
      { title: "Думайте о будущем", body: "Идеально имя, подходящее и в детстве, и во взрослой жизни. Избегайте слишком детских или слишком привязанных к эпохе имён.", highlight: "Имя на всю жизнь" },
      { title: "Проверьте многоязычное произношение", body: "В глобальную эпоху разумно заранее проверить, как имя звучит по-английски и по-китайски.", highlight: "Английский · Китайский · Японский" },
      { title: "Решайте вместе с семьёй", body: "Вместо того чтобы выбирать в одиночку, мы рекомендуем всей семьёй вслух называть нескольких кандидатов перед принятием решения.", highlight: "Сравните 3 кандидата" },
    ],
  },
  ar: {
    saju: [
      { title: "العناصر الخمسة (陰陽五行)", body: "توازن الخشب·النار·الأرض·المعدن·الماء. يجب أن تتناسب خطوط الاسم وعناصره مع ساجو لاسم نابض بالحياة.", highlight: "خشب نار أرض معدن ماء" },
      { title: "العناصر الصوتية (發音五行)", body: "الطاقة العنصرية للحرف الأول. ㄱ·ㅋ=خشب، ㄴ·ㄹ=نار، ㅇ·ㅎ=أرض، ㅅ·ㅈ=معدن، ㅁ·ㅂ=ماء. التوازن مع عنصر اسم العائلة ضروري.", highlight: "تصنيف الحروف الساكنة" },
      { title: "عناصر الهانجا (字源五行)", body: "الطاقة العنصرية في الهانجا نفسه. 水=ماء، 木=خشب — يجب أن يتوافق معنى الهانجا والعنصر لتقوية الاسم.", highlight: "عنصر معنى الهانجا" },
      { title: "العناصر العددية (數理五行)", body: "طاقة مشتقة من مجموع الخطوط. نتحقق مما إذا كان مجموع خطوط العائلة+الاسم يشكل رقماً مباركاً. نظام 81 رقماً.", highlight: "نظام 81 رقماً" },
    ],
    sejong: [
      { title: "👑 الملك سيجونغ يبتكر الهانغول (1443)", body: "الملك سيجونغ، رابع ملوك جوسون، ابتكر الهانغول عام 1443. كان حزيناً لأن الشعب لم يستطع القراءة بسبب صعوبة الحروف الصينية.", highlight: "1443 هونمينجونغيوم" },
      { title: "🔬 أكثر الأبجديات علمية في العالم", body: "يتكون الهانغول من 14 حرفاً ساكناً و10 حروف متحركة — 24 حرفاً. إنه نظام الكتابة الوحيد في العالم المنمذج على شكل أعضاء النطق.", highlight: "14 ساكن + 10 متحرك" },
      { title: "📜 ذاكرة العالم لليونسكو", body: "عام 1997، سُجّل هونمينجونغيوم هيريبون في سجل ذاكرة العالم لليونسكو باعتباره الوثيقة التفسيرية الوحيدة الموجودة لإنشاء أبجدية.", highlight: "اليونسكو 1997" },
      { title: "🌐 تفوق الهانغول", body: "وصف عالم اللغويات البريطاني جيفري سامبسون الهانغول بأنه «أعظم إنجاز فكري في تاريخ البشرية». بـ24 حرفاً يمكن التعبير عن 11,172 مقطعاً.", highlight: "11,172 تعبيراً مقطعياً" },
    ],
    rank: [
      { title: "🏆 أولاد #1 · دويون", body: "الاسم الأكثر إعطاءً للأولاد في 2026. تناسق بين الضوء الساطع (دو) والوفرة (يون).", highlight: "도윤 · 道潤" },
      { title: "🌸 بنات #1 · سيويون", body: "الاسم الأكثر شعبية للبنات في 2026. اسم يحمل اليمن (سيو) والوفرة (يون).", highlight: "서윤 · 瑞潤" },
      { title: "📈 كلمات مفتاحية للاتجاهات", body: "اتجاهات الأسماء في 2026: «يون·جون·ها·سيو» هي المقاطع الأكثر استخداماً. يُفضّل الأسماء المشرقة والمفتوحة.", highlight: "يون · جون · ها · سيو" },
    ],
    culture: [
      { title: "بنية الأسماء الكورية", body: "عادةً 1 اسم عائلة + 2 حرف اسم مُعطى = 3 إجمالاً. هناك تقليد بتضمين حرف جيلي مشترك بين الأشقاء.", highlight: "1 عائلة + 2 اسم" },
      { title: "ثقافة الهانجا", body: "أكثر من 80% من الأسماء الكورية لها أصل في الهانجا. حتى نفس الاسم قد يحمل معاني مختلفة حسب الهانجا المستخدم.", highlight: "مبني على 漢字" },
      { title: "الأسماء الكورية للأجانب", body: "نحلل الصوتيات والمعنى والإحساس بالاسم الأصلي لإعادة تصميمه بالكورية. ليس مجرد نقل صوتي — اسم كوري حقيقي.", highlight: "نقل صوتي → معنى → إبداع" },
      { title: "الأسماء والانطباع الأول", body: "في كوريا، يؤثر الاسم تأثيراً كبيراً على الانطباع الأول. يُراعى قوة النطق ومعنى الهانجا وعدد الخطوط.", highlight: "الاسم = الانطباع الأول" },
    ],
    tips: [
      { title: "أسماء سهلة النداء", body: "الأسماء المكونة من مقطعين هي الأسهل في النداء. كثرة الحروف الساكنة الأخيرة قد تبدو مكتظة؛ يُنصح بالمقاطع المفتوحة.", highlight: "مقطعان · مقاطع مفتوحة" },
      { title: "فكّر في المستقبل", body: "الاسم المناسب للطفولة والنضج على حد سواء هو الأمثل. تجنب الأسماء الطفولية جداً أو المرتبطة بحقبة معينة.", highlight: "اسم لمدى الحياة" },
      { title: "تحقق من النطق متعدد اللغات", body: "في العصر العالمي، من الحكمة التحقق من كيفية نطق الاسم بالإنجليزية والصينية قبل اتخاذ القرار.", highlight: "إنجليزي · صيني · ياباني" },
      { title: "قرر مع العائلة", body: "بدلاً من الاختيار منفرداً، نوصي أن تقوم العائلة بالجهر بعدة مرشحين قبل اتخاذ القرار.", highlight: "قارن 3 مرشحين" },
    ],
  },
  hi: {
    saju: [
      { title: "पाँच तत्व (陰陽五行)", body: "लकड़ी·अग्नि·पृथ्वी·धातु·जल का संतुलन। नाम के स्ट्रोक और तत्व साजू के साथ सामंजस्य में होने चाहिए।", highlight: "लकड़ी अग्नि पृथ्वी धातु जल" },
      { title: "ध्वन्यात्मक तत्व (發音五行)", body: "पहले व्यंजन की तत्वीय ऊर्जा। ㄱ·ㅋ=लकड़ी, ㄴ·ㄹ=अग्नि, ㅇ·ㅎ=पृथ्वी, ㅅ·ㅈ=धातु, ㅁ·ㅂ=जल। उपनाम तत्व के साथ संतुलन आवश्यक है।", highlight: "व्यंजन वर्गीकरण" },
      { title: "हांजा तत्व (字源五行)", body: "हांजा में स्वयं की तत्वीय ऊर्जा। 水=जल, 木=लकड़ी — नाम को मजबूत करने के लिए हांजा का अर्थ और तत्व एक होने चाहिए।", highlight: "हांजा अर्थ तत्व" },
      { title: "संख्यात्मक तत्व (數理五行)", body: "स्ट्रोक के योग से प्राप्त ऊर्जा। जाँचते हैं कि उपनाम+नाम का संयोजन शुभ संख्या बनाता है या नहीं। 81-संख्या प्रणाली।", highlight: "81-संख्या प्रणाली" },
    ],
    sejong: [
      { title: "👑 राजा सेजोंग ने हानगुल बनाया (1443)", body: "जोसेन के चौथे राजा सेजोंग ने 1443 में हानगुल बनाया। उन्हें दुख था कि लोग चीनी अक्षरों की कठिनाई के कारण पढ़ नहीं सकते थे।", highlight: "1443 हुनमिनजेओंगेउम" },
      { title: "🔬 दुनिया की सबसे वैज्ञानिक लिपि", body: "हानगुल में 14 व्यंजन और 10 स्वर — कुल 24 अक्षर हैं। यह दुनिया की एकमात्र लिपि है जो वाक् अंगों के आकार पर आधारित है।", highlight: "14 व्यंजन + 10 स्वर" },
      { title: "📜 यूनेस्को विश्व स्मृति", body: "1997 में हुनमिनजेओंगेउम हेरयेबोन को यूनेस्को की विश्व स्मृति में दर्ज किया गया — किसी लिपि निर्माण का एकमात्र उपलब्ध व्याख्यात्मक दस्तावेज।", highlight: "यूनेस्को 1997" },
      { title: "🌐 हानगुल की श्रेष्ठता", body: "ब्रिटिश भाषाविद Geoffrey Sampson ने हानगुल को 'मानव इतिहास की सबसे महान बौद्धिक उपलब्धि' कहा। 24 अक्षरों से 11,172 अक्षरांश व्यक्त होते हैं।", highlight: "11,172 अक्षरांश अभिव्यक्तियाँ" },
    ],
    rank: [
      { title: "🏆 लड़के #1 · दोयुन", body: "2026 में सबसे अधिक दिया गया लड़के का नाम। उज्ज्वल प्रकाश (दो) और समृद्धि (युन) का सामंजस्य।", highlight: "도윤 · 道潤" },
      { title: "🌸 लड़कियाँ #1 · सेओयुन", body: "2026 में सबसे लोकप्रिय लड़की का नाम। शुभता (सेओ) और समृद्धि (युन) वाला नाम।", highlight: "서윤 · 瑞潤" },
      { title: "📈 ट्रेंड कीवर्ड", body: "2026 में नाम ट्रेंड: 'युन·जुन·हा·सेओ' सर्वाधिक उपयोग किए गए अक्षरांश। उज्ज्वल और खुले नामों को प्राथमिकता।", highlight: "युन · जुन · हा · सेओ" },
      { title: "🔤 शुद्ध कोरियाई नामों का पुनरुद्धार", body: "हानेउल (आकाश), गाओन, बोम (वसंत), नुरी जैसे शुद्ध कोरियाई नाम 2026 में लगातार बढ़ रहे हैं।", highlight: "हानेउल · गाओन · बोम" },
    ],
    culture: [
      { title: "कोरियाई नामों की संरचना", body: "आमतौर पर 1 उपनाम + 2 नाम अक्षर = कुल 3। भाई-बहनों के बीच साझा पीढ़ी अक्षर शामिल करने की परंपरा है।", highlight: "1 उपनाम + 2 नाम" },
      { title: "हांजा संस्कृति", body: "80% से अधिक कोरियाई नामों की उत्पत्ति हांजा से है। एक ही नाम में अलग-अलग हांजा से अर्थ भिन्न हो सकता है।", highlight: "漢字 आधारित" },
      { title: "विदेशियों के लिए कोरियाई नाम", body: "मूल नाम की ध्वनि, अर्थ और भाव का विश्लेषण करके कोरियाई में पुनर्डिज़ाइन करते हैं। केवल ध्वन्यानुवाद नहीं — असली कोरियाई नाम।", highlight: "ध्वन्यानुवाद → अर्थ → सृजन" },
      { title: "नाम और पहली छाप", body: "कोरिया में नाम का पहली छाप पर बड़ा प्रभाव पड़ता है। उच्चारण की शक्ति, हांजा का अर्थ और स्ट्रोक काउंट सभी पर विचार किया जाता है।", highlight: "नाम = पहली छाप" },
    ],
    tips: [
      { title: "पुकारने में आसान नाम", body: "2-अक्षर वाले नाम सबसे आसान होते हैं। बहुत अधिक अंतिम व्यंजन भारी लग सकते हैं; खुले अक्षरांश की सिफारिश की जाती है।", highlight: "2 अक्षर · खुले अक्षरांश" },
      { title: "भविष्य के बारे में सोचें", body: "बचपन और वयस्कता दोनों में उपयुक्त नाम आदर्श है। बहुत बचकाने या किसी युग से जुड़े नाम से बचें।", highlight: "जीवन भर का नाम" },
      { title: "बहुभाषी उच्चारण जाँचें", body: "वैश्विक युग में निर्णय से पहले अंग्रेजी और चीनी में नाम का उच्चारण जाँचना उचित है।", highlight: "अंग्रेजी · चीनी · जापानी" },
      { title: "परिवार के साथ निर्णय लें", body: "अकेले चुनने की बजाय, परिवार के साथ कई उम्मीदवारों को ज़ोर से पुकारकर निर्णय लेने की सिफारिश है।", highlight: "3 उम्मीदवारों की तुलना" },
    ],
  },
};

const INFO_CARDS = INFO_CARDS_BY_LANG.ko;

const SUGGEST_CAT: Record<string, { label: string; id: CatId }> = {
  "child":             { label: "반려동물 이름도 만들어 보세요!", id: "pet" },
  "pet":               { label: "아이 이름도 설계해 보세요!", id: "child" },
  "foreign_to_korean": { label: "아이 이름도 설계해 보세요!", id: "child" },
  "korean_to_foreign": { label: "나의 한국 이름도 만들어 보세요!", id: "korean-name" },
  "self":              { label: "반려동물 이름도 만들어 보세요!", id: "pet" },
};

// ── 단청 문양 SVG 배경 ────────────────────────────────────
function DanchingBg() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      <defs>
        <pattern id="dp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 3L77 40L40 77L3 40Z" fill="none" stroke="#1B2A5E" strokeWidth="0.7" opacity="0.055"/>
          <path d="M40 18L62 40L40 62L18 40Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.04"/>
          <circle cx="40" cy="3"  r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="77" cy="40" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="40" cy="77" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="3"  cy="40" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="40" cy="40" r="2" fill="#C9A84C" opacity="0.035"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dp)"/>
    </svg>
  );
}

// ── 전통 매듭 구분선 ──────────────────────────────────────
function KnotDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
      <svg width="260" height="20" viewBox="0 0 260 20" aria-hidden="true">
        <line x1="0" y1="10" x2="108" y2="10" stroke="#E8E8E8" strokeWidth="1"/>
        <path d="M112 10L130 2L148 10L130 18Z" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.55"/>
        <circle cx="130" cy="10" r="2.5" fill="#C9A84C" opacity="0.45"/>
        <line x1="152" y1="10" x2="260" y2="10" stroke="#E8E8E8" strokeWidth="1"/>
      </svg>
    </div>
  );
}

// ── 이름 카드 (라이트 테마) ───────────────────────────────
function NameCard({ card, accent }: { card: AnyCard; accent: string }) {
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
function BigNameCard({ card, accent, bg, lang }: { card: AnyCard; accent: string; bg: string; lang: Lang }) {
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  let name = "", hanja = "", meaning = "", story = "", badge = "", roman = "";
  if (card.type === "korean-name") {
    const c = card as KoreanNameCard;
    name = c.koreanName; hanja = c.hanja; meaning = c.meaning; story = c.story;
    badge = `${c.flag} ${c.nationality}`; roman = c.roman ?? "";
  } else if (card.type === "child") {
    const c = card as ChildCard;
    name = `${c.surname}${c.name}`; hanja = c.fullHanja; meaning = c.meaning; story = c.story; badge = c.roman;
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

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const speak = (text: string, lg: string, onEnd?: () => void) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lg; u.rate = 0.82;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
    };
    // 이름 2번(ko-KR) → 뜻 현지 언어
    const meaningLang: Record<Lang, string> = {
      ko:"ko-KR", en:"en-US", ja:"ja-JP", zh:"zh-CN",
      es:"es-ES", fr:"fr-FR", ru:"ru-RU", ar:"ar-SA", hi:"hi-IN",
    };
    speak(name, "ko-KR", () =>
      speak(name, "ko-KR", () =>
        speak(meaning, meaningLang[lang] ?? "ko-KR")
      )
    );
  };

  return (
    <div
      className="lg-big-name-card"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, #1B2A5E 100%)`, border: `1px solid ${accent}22` }}
    >
      {/* 상단 그라디언트 바 */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, #1B2A5E 0%, ${accent} 100%)`, zIndex: 2 }} />
      {/* 단청 문양 오버레이 */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04 }} aria-hidden="true">
        <DanchingBg />
      </div>
      <div className="lg-big-name-card-inner">
        {/* 왼쪽: 큰 이름 */}
        <div className="lg-big-name-left">
          <div style={{ fontSize: 10, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>
            {badge}
          </div>
          <div style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, color: "#FFFFFF", fontFamily: serif, letterSpacing: "0.12em", lineHeight: 1 }}>
            {name}
          </div>
          {roman && (
            <div style={{ fontSize: 13, color: `${accent}CC`, fontWeight: 600, letterSpacing: "0.1em", marginTop: 10 }}>
              {roman}
            </div>
          )}
          {(roman || card.type === "korean-name") && (
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

// ── 고객 후기 데이터 (카테고리별) ────────────────────────
type ReviewEntry = { name: string; flag: string; content: string; koreanName?: string };

const REVIEWS_BY_CAT: Record<CatId, ReviewEntry[]> = {
  "korean-name": [
    { name: "Emma", flag: "🇺🇸", koreanName: "이하늘", content: "2026년 이하늘이라는 한국이름이 생겼어요. 고마워요 윙크네이밍!" },
    { name: "Yuki", flag: "🇯🇵", koreanName: "박서연", content: "2026년 박서연이라는 한국이름이 생겼어요. 한국 친구들이 너무 좋아해요!" },
    { name: "Lucas", flag: "🇧🇷", koreanName: "강도윤", content: "2026년 강도윤이 되었습니다. 나의 부캐릭터는 이제 한국인이에요!" },
    { name: "Jake", flag: "🇺🇸", koreanName: "수지", content: "태권도 사범님께서 승급 기념으로 한국이름을 만들어 주셨다. 그렇게 알게 된 윙크 네이밍. 난 정말 운이 좋다!" },
    { name: "Anna", flag: "🇩🇪", koreanName: "선희", content: "한국에 도착해서 가장 먼저 한 것이 한국 이름 만들기였다. 덕분에 즐겁고 의미있는 여행을 했다. 친구들에게 윙크네이밍을 추천하고 있다!" },
  ],
  "child": [
    { name: "김지현", flag: "🇰🇷", content: "2026년 딸 이름 서윤이로 지었어요. 음양오행까지 고려해줘서 믿음이 갔어요!" },
    { name: "박민준", flag: "🇰🇷", content: "2026년 아들 도현이 이름 여기서 결정했어요. 사주까지 맞춰줘서 감사해요!" },
  ],
  "pet": [
    { name: "Sophie", flag: "🇫🇷", content: "2026년 반려견에게 사랑이라는 이름을 지어줬어요. 너무 예쁜 이름이에요!" },
    { name: "Wang Lei", flag: "🇨🇳", content: "2026년 고양이 이름을 하늘이로 지었어요. 한국어로 sky라는 뜻이래요!" },
  ],
  "foreign": [
    { name: "이서연", flag: "🇰🇷", content: "2026년 활동명으로 Luna라는 이름을 받았어요. 해외 SNS에서 반응이 좋아요!" },
    { name: "최도윤", flag: "🇰🇷", content: "2026년 영어이름 Ethan을 만들었어요. 발음도 좋고 의미도 마음에 들어요!" },
  ],
  "goods": [
    { name: "Maria", flag: "🇪🇸", content: "2026년 도장까지 주문했어요. 한국 전통 매듭 목걸이 너무 예뻐요!" },
    { name: "Tanaka", flag: "🇯🇵", content: "2026년 이름카드 QR코드 보여줬더니 친구들이 신기해했어요!" },
  ],
};

const REVIEW_CONTENT_BY_LANG: Record<Lang, Record<CatId, string[]>> = {
  ko: {
    "korean-name": ["2026년 이하늘이라는 한국이름이 생겼어요. 고마워요 윙크네이밍!", "2026년 박서연이라는 한국이름이 생겼어요. 한국 친구들이 너무 좋아해요!", "2026년 강도윤이 되었습니다. 나의 부캐릭터는 이제 한국인이에요!", "태권도 사범님께서 승급 기념으로 한국이름을 만들어 주셨다. 그렇게 알게 된 윙크 네이밍. 난 정말 운이 좋다!", "한국에 도착해서 가장 먼저 한 것이 한국 이름 만들기였다. 덕분에 즐겁고 의미있는 여행을 했다. 친구들에게 윙크네이밍을 추천하고 있다!"],
    "child": ["2026년 딸 이름 서윤이로 지었어요. 음양오행까지 고려해줘서 믿음이 갔어요!", "2026년 아들 도현이 이름 여기서 결정했어요. 사주까지 맞춰줘서 감사해요!"],
    "pet": ["2026년 반려견에게 사랑이라는 이름을 지어줬어요. 너무 예쁜 이름이에요!", "2026년 고양이 이름을 하늘이로 지었어요. 한국어로 sky라는 뜻이래요!"],
    "foreign": ["2026년 활동명으로 Luna라는 이름을 받았어요. 해외 SNS에서 반응이 좋아요!", "2026년 영어이름 Ethan을 만들었어요. 발음도 좋고 의미도 마음에 들어요!"],
    "goods": ["2026년 도장까지 주문했어요. 한국 전통 매듭 목걸이 너무 예뻐요!", "2026년 이름카드 QR코드 보여줬더니 친구들이 신기해했어요!"],
  },
  en: {
    "korean-name": ["In 2026 I got my Korean name, Lee Haneul. Thank you Wink Naming!", "In 2026 I got Park Seoyeon as my Korean name. My Korean friends absolutely love it!", "In 2026 I became Kang Doyun. My alter ego is now officially Korean!", "My taekwondo master gave me a Korean name to celebrate my belt promotion. That's how I found Wink Naming. I'm so lucky!", "The first thing I did when I arrived in Korea was get a Korean name. It made my trip so joyful and meaningful. I'm recommending Wink Naming to all my friends!"],
    "child": ["In 2026 I named my daughter Seoyun. I trusted them because they considered yin-yang and the five elements!", "In 2026 I decided on the name Dohyun for my son here. Thank you for considering his saju too!"],
    "pet": ["In 2026 I named my dog Sarangi (Love). Such a beautiful name!", "In 2026 I named my cat Haneul. They told me it means 'sky' in Korean!"],
    "foreign": ["In 2026 I got the stage name Luna. The response on overseas social media has been amazing!", "In 2026 I created the English name Ethan. I love both the pronunciation and the meaning!"],
    "goods": ["In 2026 I even ordered a stamp. The Korean traditional knot necklace is so beautiful!", "In 2026 when I showed the name card QR code, my friends were so amazed!"],
  },
  ja: {
    "korean-name": ["2026年に「이하늘」という韓国名ができました。ありがとうWinkNaming！", "2026年に「박서연」という韓国名をもらいました。韓国の友達に大好評です！", "2026年に「강도윤」になりました。私の副キャラはもう韓国人です！", "テコンドーの師範が昇段記念に韓国名を作ってくれました。それがWinkNamingとの出会い。本当にラッキーです！", "韓国に着いてまず最初にしたことは韓国名を作ることでした。おかげで楽しく意味ある旅ができました。友達にもWinkNamingを勧めています！"],
    "child": ["2026年に娘の名前を서윤にしました。陰陽五行まで考えてくれて安心でした！", "2026年に息子の도현という名前をここで決めました。四柱まで合わせてくれてありがとうございます！"],
    "pet": ["2026年に愛犬に사랑（愛）という名前をつけました。とても素敵な名前です！", "2026年に猫の名前を하늘にしました。韓国語で空という意味だそうです！"],
    "foreign": ["2026年に芸名としてLunaという名前をもらいました。海外SNSでの反応がいいです！", "2026年に英語名Ethanを作りました。発音も意味も気に入っています！"],
    "goods": ["2026年には印鑑まで注文しました。韓国伝統の結びのネックレスがとても素敵です！", "2026年にネームカードのQRコードを見せたら友達がびっくりしていました！"],
  },
  zh: {
    "korean-name": ["2026年我有了「이하늘」这个韩国名字，谢谢WinkNaming！", "2026年我的韩国名字是「박서연」，韩国朋友们都非常喜欢！", "2026年我成了「강도윤」，我的副角色现在是韩国人了！", "跆拳道教练为了庆祝我晋级给我取了韩国名字，就这样认识了WinkNaming，我真的太幸运了！", "到达韩国后做的第一件事就是取韩国名字。因此拥有了愉快而有意义的旅行，现在正在向朋友们推荐WinkNaming！"],
    "child": ["2026年给女儿取名서윤。连阴阳五行都考虑到了，让我非常放心！", "2026年在这里决定了儿子도현的名字。连四柱都考虑进去了，真的很感谢！"],
    "pet": ["2026年给爱犬取了사랑（爱）这个名字，真的是个很美的名字！", "2026年给猫咪取名하늘，听说韩语里是天空的意思！"],
    "foreign": ["2026年获得了Luna这个艺名，在海外社交媒体上反响很好！", "2026年创建了英文名Ethan，发音和含义都很喜欢！"],
    "goods": ["2026年还订购了印章，韩国传统结绳项链太漂亮了！", "2026年展示名片QR码时，朋友们都惊叹不已！"],
  },
  es: {
    "korean-name": ["¡En 2026 obtuve mi nombre coreano, Lee Haneul. Gracias Wink Naming!", "¡En 2026 obtuve Park Seoyeon como mi nombre coreano. A mis amigos coreanos les encanta!", "¡En 2026 me convertí en Kang Doyun. Mi alter ego ahora es oficialmente coreano!", "¡Mi maestro de taekwondo me hizo un nombre coreano para celebrar mi cinturón. Así conocí Wink Naming. ¡Qué suerte tengo!", "¡Lo primero que hice al llegar a Corea fue crear un nombre coreano. Gracias a eso tuve un viaje tan alegre y significativo. Estoy recomendando Wink Naming a todos mis amigos!"],
    "child": ["¡En 2026 nombré a mi hija Seoyun. Confiaba en ellos porque consideraron el yin-yang y los cinco elementos!", "¡En 2026 decidí el nombre Dohyun para mi hijo aquí. Gracias por considerar su saju también!"],
    "pet": ["¡En 2026 le puse a mi perro el nombre Sarangi (Amor). ¡Es un nombre tan bonito!", "¡En 2026 le puse a mi gato el nombre Haneul. Me dijeron que significa 'cielo' en coreano!"],
    "foreign": ["¡En 2026 obtuve el nombre artístico Luna. ¡La respuesta en las redes sociales internacionales ha sido increíble!", "¡En 2026 creé el nombre inglés Ethan. Me encanta tanto la pronunciación como el significado!"],
    "goods": ["¡En 2026 incluso pedí un sello. ¡El collar de nudo tradicional coreano es tan hermoso!", "¡En 2026 cuando mostré el código QR de la tarjeta de nombre, mis amigos quedaron asombrados!"],
  },
  fr: {
    "korean-name": ["En 2026, j'ai obtenu mon prénom coréen, Lee Haneul. Merci Wink Naming !", "En 2026, j'ai obtenu Park Seoyeon comme prénom coréen. Mes amis coréens adorent !", "En 2026, je suis devenu Kang Doyun. Mon alter ego est maintenant officiellement coréen !", "Mon maître de taekwondo m'a créé un prénom coréen pour célébrer ma ceinture. C'est ainsi que j'ai découvert Wink Naming. Quelle chance !", "La première chose que j'ai faite en arrivant en Corée était de créer un prénom coréen. Cela a rendu mon voyage si joyeux et significatif. Je recommande Wink Naming à tous mes amis !"],
    "child": ["En 2026, j'ai nommé ma fille Seoyun. J'avais confiance car ils ont considéré le yin-yang et les cinq éléments !", "En 2026, j'ai décidé du prénom Dohyun pour mon fils ici. Merci d'avoir considéré son saju aussi !"],
    "pet": ["En 2026, j'ai donné à mon chien le prénom Sarangi (Amour). C'est un si beau prénom !", "En 2026, j'ai nommé mon chat Haneul. On m'a dit que ça signifie 'ciel' en coréen !"],
    "foreign": ["En 2026, j'ai obtenu le nom de scène Luna. La réponse sur les réseaux sociaux internationaux a été incroyable !", "En 2026, j'ai créé le prénom anglais Ethan. J'adore la prononciation et la signification !"],
    "goods": ["En 2026, j'ai même commandé un sceau. Le collier de nœud traditionnel coréen est si beau !", "En 2026, quand j'ai montré le code QR de la carte de nom, mes amis étaient stupéfaits !"],
  },
  ru: {
    "korean-name": ["В 2026 году у меня появилось корейское имя Lee Haneul. Спасибо Wink Naming!", "В 2026 году моим корейским именем стало Park Seoyeon. Мои корейские друзья в восторге!", "В 2026 году я стал Kang Doyun. Теперь мой альтер эго официально кореец!", "Мой тренер по тхэквондо создал мне корейское имя в честь повышения пояса. Так я узнал о Wink Naming. Мне так повезло!", "Первое, что я сделала в Корее — создала корейское имя. Это сделало поездку такой радостной и значимой. Рекомендую Wink Naming всем друзьям!"],
    "child": ["В 2026 году я назвала дочь Сеюн. Я доверяла им, потому что они учли инь-ян и пять элементов!", "В 2026 году я выбрала здесь имя Духён для сына. Спасибо, что учли его саджу!"],
    "pet": ["В 2026 году я дала собаке имя Саранги (Любовь). Такое красивое имя!", "В 2026 году я назвала кошку Ханыль. Говорят, это значит 'небо' по-корейски!"],
    "foreign": ["В 2026 году я получила сценическое имя Luna. Реакция в международных социальных сетях потрясающая!", "В 2026 году я создала английское имя Ethan. Мне нравится и произношение, и значение!"],
    "goods": ["В 2026 году я даже заказала печать. Корейское традиционное ожерелье с узлом такое красивое!", "В 2026 году, когда я показала QR-код именной карточки, друзья были поражены!"],
  },
  ar: {
    "korean-name": ["في عام 2026 حصلت على اسمي الكوري Lee Haneul. شكراً Wink Naming!", "في عام 2026 أصبح اسمي الكوري Park Seoyeon. أصدقائي الكوريون يحبونه كثيراً!", "في عام 2026 أصبحت Kang Doyun. شخصيتي البديلة الآن رسمياً كورية!", "أعطاني أستاذ التايكوندو اسماً كورياً احتفالاً بترقيتي. هكذا عرفت Wink Naming. ما أحظاني!", "أول ما فعلته عند وصولي لكوريا كان الحصول على اسم كوري. جعل ذلك رحلتي ممتعة وذات معنى. أنصح الجميع بـ Wink Naming!"],
    "child": ["في عام 2026 سميت ابنتي Seoyun. وثقت بهم لأنهم أخذوا في الاعتبار اليين واليانغ والعناصر الخمسة!", "في عام 2026 اخترت هنا اسم Dohyun لابني. شكراً لمراعاة ساجو ابني أيضاً!"],
    "pet": ["في عام 2026 أعطيت كلبي اسم Sarangi (حب). اسم جميل جداً!", "في عام 2026 سميت قطتي Haneul. قالوا لي إنها تعني 'السماء' بالكورية!"],
    "foreign": ["في عام 2026 حصلت على اسم فني Luna. الاستجابة على وسائل التواصل الاجتماعي الدولية رائعة!", "في عام 2026 أنشأت الاسم الإنجليزي Ethan. أحب النطق والمعنى!"],
    "goods": ["في عام 2026 طلبت حتى ختماً. عقد العقدة الكورية التقليدية جميل جداً!", "في عام 2026 عندما أريت رمز QR لبطاقة الاسم، أُذهل أصدقائي!"],
  },
  hi: {
    "korean-name": ["2026 में मुझे Lee Haneul कोरियाई नाम मिला। धन्यवाद Wink Naming!", "2026 में Park Seoyeon मेरा कोरियाई नाम बना। मेरे कोरियाई दोस्तों को बहुत पसंद है!", "2026 में मैं Kang Doyun बन गया। मेरा अल्टर ईगो अब आधिकारिक रूप से कोरियाई है!", "मेरे ताइक्वांडो गुरु ने बेल्ट प्रमोशन के उपलक्ष्य में कोरियाई नाम बनाया। इस तरह Wink Naming से परिचय हुआ। मैं कितना भाग्यशाली हूँ!", "कोरिया पहुँचकर सबसे पहला काम था कोरियाई नाम बनवाना। इससे यात्रा बहुत आनंदमय और अर्थपूर्ण बनी। सभी मित्रों को Wink Naming की सिफारिश कर रही हूँ!"],
    "child": ["2026 में बेटी का नाम Seoyun रखा। यिन-यांग और पाँच तत्वों पर विचार करने से विश्वास हुआ!", "2026 में यहाँ बेटे के लिए Dohyun नाम तय किया। साजू का भी ध्यान रखने के लिए शुक्रिया!"],
    "pet": ["2026 में कुत्ते को Sarangi (प्यार) नाम दिया। कितना सुंदर नाम है!", "2026 में बिल्ली का नाम Haneul रखा। बताया कि कोरियाई में 'आकाश' का अर्थ है!"],
    "foreign": ["2026 में स्टेज नाम Luna मिला। अंतर्राष्ट्रीय सोशल मीडिया पर बहुत अच्छी प्रतिक्रिया है!", "2026 में अंग्रेज़ी नाम Ethan बनाया। उच्चारण और अर्थ दोनों पसंद हैं!"],
    "goods": ["2026 में मुहर भी मँगवाई। कोरियाई पारंपरिक गाँठ का हार इतना सुंदर है!", "2026 में नाम कार्ड QR कोड दिखाया तो दोस्त हैरान रह गए!"],
  },
};

function getReviews(lang: Lang, catId: CatId): ReviewEntry[] {
  const base = REVIEWS_BY_CAT[catId];
  const contents = (REVIEW_CONTENT_BY_LANG[lang] ?? REVIEW_CONTENT_BY_LANG.ko)[catId] ?? [];
  return base.map((r, i) => ({ ...r, content: contents[i] ?? r.content }));
}

// ── 고객 후기 섹션 (카테고리 탭) ────────────────────────
function ReviewsSection({ copy, lang }: { copy: HomeCopy; lang: Lang }) {
  const [activeTab, setActiveTab] = useState<CatId>("korean-name");
  const [fadeKey, setFadeKey] = useState(0);
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  const CAT_TAB_LABELS: Record<CatId, string> = {
    "korean-name": copy.cats["korean-name"].label,
    "child":        copy.cats["child"].label,
    "pet":          copy.cats["pet"].label,
    "foreign":      copy.cats["foreign"].label,
    "goods":        copy.cats["goods"].label,
  };

  const reviews = getReviews(lang, activeTab);

  return (
    <section style={{ background: "#FAFAF8", padding: "72px 0" }}>
      <div className="lg-section">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            REVIEWS · 고객 후기
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(22px,2.6vw,34px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {copy.reviewsTitle}
          </h2>
        </div>

        {/* 카테고리 탭 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          {CATS.map(c => (
            <button
              key={c.id}
              className={`lg-reviews-tab${activeTab === c.id ? " active" : ""}`}
              onClick={() => { setActiveTab(c.id as CatId); setFadeKey(k => k + 1); }}
            >
              {c.emoji} {CAT_TAB_LABELS[c.id as CatId]}
            </button>
          ))}
        </div>

        {/* 후기 카드 그리드 */}
        <div key={fadeKey} className="lg-reviews-grid" style={{ animation: "lgFadeIn 0.35s ease" }}>
          {reviews.map((r, i) => {
            // 본문 속 한국 이름 골드 강조
            const highlightContent = (text: string, kname?: string) => {
              if (!kname) return <>{text}</>;
              const parts = text.split(kname);
              return <>{parts.map((p, j) => j < parts.length - 1 ? <>{p}<strong style={{ color: "#C9A84C", fontStyle: "normal", fontWeight: 800 }}>{kname}</strong></> : p)}</>;
            };
            return (
            <div key={i} className="lg-review-grid-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{r.flag}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1B2A5E" }}>{r.name}</span>
              </div>
              <div style={{ flex: 1, fontSize: 18, color: "#333333", lineHeight: 1.8, fontStyle: "italic", marginBottom: 18 }}>
                &ldquo;{highlightContent(r.content, r.koreanName)}&rdquo;
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 16, color: "#C9A84C", letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FFF", background: "#1B2A5E", borderRadius: 20, padding: "3px 10px" }}>2026</div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── 마퀴 자막 (56px 네이비) ──────────────────────────────
function MarqueeBand({ lang }: { lang: Lang }) {
  const segments = MARQUEE_BY_LANG[lang] ?? MARQUEE_BY_LANG.ko;
  return (
    <div style={{ overflow: "hidden", background: "#1B2A5E", height: 56, display: "flex", alignItems: "center" }}>
      <div className="marquee-track" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.05em", padding: "0 48px", flexShrink: 0 }}>
            {segments.map((seg, j) => (
              <span key={j} style={{ color: seg.color }}>{seg.text}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 참고 정보 섹션 ─────────────────────────────────────────
function InfoSection({ copy, lang }: { copy: HomeCopy; lang: Lang }) {
  const [activeTab, setActiveTab] = useState<InfoTabId>("rank");
  const tabs = INFO_TABS_BY_LANG[lang] ?? INFO_TABS_BY_LANG.ko;
  const cards = (INFO_CARDS_BY_LANG[lang] ?? INFO_CARDS_BY_LANG.ko)[activeTab];
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  return (
    <section className="lg-info-section">
      <div className="lg-section">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            REFERENCE · 참고 자료
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {copy.infoTitle}
            <span style={{ fontSize: "0.42em", color: "#AAA", marginLeft: 10, fontWeight: 600, verticalAlign: "middle" }}>{copy.infoHanja}</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`lg-info-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id as InfoTabId)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="lg-info-grid">
          {cards.map(c => (
            <div key={c.title} className="lg-info-card">
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1B2A5E", marginBottom: 12, fontFamily: serif, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: "#555555", lineHeight: 1.85, marginBottom: 16 }}>{c.body}</div>
              {c.highlight && (
                <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "4px 12px" }}>
                  {c.highlight}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── 재방문 배너 ───────────────────────────────────────────
type ReturnInfo = { visitCount: number; lastNameKr: string | null; lastCategory: string | null };

function ReturnBanner({
  info, onClose, onCatSelect, router,
}: {
  info: ReturnInfo;
  onClose: () => void;
  onCatSelect: (id: CatId) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { visitCount, lastNameKr, lastCategory } = info;
  const suggest = lastCategory ? SUGGEST_CAT[lastCategory] : null;

  const base: React.CSSProperties = {
    padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
    borderBottom: "1px solid #E8E8E8", animation: "lgSlideDown 0.3s ease",
  };
  const closeBtn: React.CSSProperties = { flexShrink: 0, background: "none", border: "none", color: "#BBB", cursor: "pointer", fontSize: 20, lineHeight: 1 };
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  if (visitCount >= 5) {
    return (
      <div style={{ ...base, background: "rgba(201,168,76,0.07)", borderBottom: "1px solid rgba(201,168,76,0.18)" }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🎁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3, fontFamily: serif }}>단골 고객님께 특별 혜택을 드립니다</div>
          <div style={{ fontSize: 13, color: "#555" }}>{visitCount}번 찾아주셨군요! 도장·굿즈 주문 시 <strong style={{ color: "#C4845A" }}>10% 할인</strong>을 드립니다.{lastNameKr && ` '${lastNameKr}'을 도장에 새겨보는 건 어떨까요?`}</div>
        </div>
        <button onClick={() => router.push("/ko/order")} style={{ flexShrink: 0, background: "#1B2A5E", color: "#C9A84C", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>굿즈 보기 →</button>
        <button onClick={onClose} style={closeBtn}>×</button>
      </div>
    );
  }
  if (visitCount >= 3 && lastNameKr) {
    return (
      <div style={{ ...base, background: "rgba(27,42,94,0.04)" }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>✨</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3 }}>지난번에 만드신 &lsquo;{lastNameKr}&rsquo; 기억하시나요?</div>
          <div style={{ fontSize: 13, color: "#555" }}>{suggest ? suggest.label : "다른 이름도 설계해 보세요!"}</div>
        </div>
        {suggest && (
          <button onClick={() => { onCatSelect(suggest.id); onClose(); }} style={{ flexShrink: 0, background: "rgba(201,168,76,0.1)", color: "#1B2A5E", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>바로 시작 →</button>
        )}
        <button onClick={onClose} style={closeBtn}>×</button>
      </div>
    );
  }
  return (
    <div style={{ ...base, background: "rgba(106,174,143,0.06)", borderBottom: "1px solid rgba(106,174,143,0.15)" }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>😊</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3 }}>다시 방문해 주셨군요! 반갑습니다</div>
        <div style={{ fontSize: 13, color: "#555" }}>{lastNameKr ? `지난번에 '${lastNameKr}'을 설계하셨죠. 이번엔 어떤 이름을 만들어 볼까요?` : "이번엔 어떤 이름을 설계해 볼까요?"}</div>
      </div>
      <button onClick={onClose} style={closeBtn}>×</button>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ko");
  const [selectedId, setSelectedId] = useState<CatId>("korean-name");
  const [cardIdx, setCardIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [returnInfo, setReturnInfo] = useState<ReturnInfo | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && LANGS.includes(saved as Lang)) setLang(saved as Lang);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const email = localStorage.getItem("wink-guest-email");
      if (!email) return;
      const sessionKey = "wink-visit-counted";
      const alreadyCounted = sessionStorage.getItem(sessionKey);
      fetch("/api/guest-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, countVisit: !alreadyCounted }),
      })
        .then(r => r.json())
        .then(data => {
          if (!data.ok) return;
          if (!alreadyCounted) sessionStorage.setItem(sessionKey, "1");
          const vc: number = data.visitCount ?? 1;
          if (vc < 2) return;
          setReturnInfo({ visitCount: vc, lastNameKr: data.lastNameKr ?? null, lastCategory: data.lastCategory ?? null });
          setShowBanner(true);
        })
        .catch(() => {});
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const len = ALL_CARDS[selectedId].length;
      setCardIdx(i => (i + 1) % len);
      setAnimKey(k => k + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [selectedId, lang]);

  const handleCatSelect = (id: CatId) => {
    setSelectedId(id);
    setCardIdx(0);
    setAnimKey(k => k + 1);
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
  const card = cards[cardIdx];
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
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(145deg,#C0392B,#922b21)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: "0 4px 12px rgba(192,57,43,0.3)", flexShrink: 0 }}>W</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1B2A5E", lineHeight: 1.1, fontFamily: serif }}>윙크 네이밍</div>
            <div style={{ fontSize: 9, color: "#AAA", letterSpacing: "0.14em" }}>WINK NAMING</div>
          </div>
        </button>
        <button onClick={() => setShowLangPicker(true)} style={{ background: "rgba(27,42,94,0.07)", border: "1px solid rgba(27,42,94,0.16)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#1B2A5E", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontFamily: sans }}>
          🌐 {lang.toUpperCase()}
        </button>
      </header>

      {/* ── 재방문 배너 ── */}
      {showBanner && returnInfo && (
        <ReturnBanner info={returnInfo} onClose={() => setShowBanner(false)} onCatSelect={handleCatSelect} router={router} />
      )}

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
              <span>{copy.later} {price.symbol}{price.amount}</span>
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
            <BigNameCard card={card} accent={theme.accent} bg={theme.bg} lang={lang} />
          </div>
          {/* 슬라이드 도트 */}
          <div style={{ display: "flex", gap: 5, marginTop: 14, justifyContent: "center" }}>
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); }}
                aria-label={`예시 ${i + 1}`}
                style={{ height: 4, borderRadius: 2, border: "none", cursor: "pointer", padding: 0, background: i === cardIdx ? "#C9A84C" : "rgba(0,0,0,0.14)", width: i === cardIdx ? 14 : 5, transition: "all 0.3s" }}
              />
            ))}
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
                  ? `${copy.noLogin} · ${copy.later} ${price.symbol}${price.amount}`
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const card = c as KoreanNameCard;
                            if (!window.speechSynthesis) return;
                            window.speechSynthesis.cancel();
                            const speak = (text: string, lang: string, onEnd?: () => void) => {
                              const u = new SpeechSynthesisUtterance(text);
                              u.lang = lang;
                              u.rate = 0.85;
                              if (onEnd) u.onend = onEnd;
                              window.speechSynthesis.speak(u);
                            };
                            speak(card.koreanName, "ko-KR", () =>
                              speak(card.koreanName, "ko-KR", () =>
                                speak(card.meaning, "ko-KR")
                              )
                            );
                          }}
                          style={{ background: "none", border: "1.5px solid #C9A84C55", borderRadius: "50%", width: 26, height: 26, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#C9A84C" }}
                          title="이름 듣기"
                          aria-label="이름 읽어주기"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                          </svg>
                        </button>
                      </div>
                      {(c as KoreanNameCard).roman && (
                        <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 600, marginTop: 2, letterSpacing: "0.05em" }}>{(c as KoreanNameCard).roman}</div>
                      )}
                    </>
                  )}
                  {c.type === "child" && (
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as ChildCard).surname}{(c as ChildCard).name}</div>
                  )}
                  {c.type === "pet" && (
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as PetCard).name}</div>
                  )}
                  {c.type === "foreign" && (
                    <>
                      <div style={{ fontSize: 12, color: "#AAA", marginBottom: 3 }}>{(c as ForeignCard).koreanName} →</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1B2A5E" }}>{(c as ForeignCard).foreignName}</div>
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
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "28px 24px", width: "min(320px,90vw)", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(27,42,94,0.14)", border: "1px solid #E8E8E8" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1B2A5E", marginBottom: 18, fontFamily: serif }}>언어 선택 · Language</div>
            {LANGS.map(l => (
              <button key={l} onClick={() => handleLangSelect(l)} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", borderRadius: 12, marginBottom: 6, border: lang === l ? "2px solid #1B2A5E" : "1px solid #E8E8E8", background: lang === l ? "rgba(27,42,94,0.05)" : "transparent", cursor: "pointer", fontSize: 15, color: "#1B2A5E", fontWeight: lang === l ? 700 : 500, fontFamily: sans }}>
                {LANG_LABELS[l]}
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
      `}</style>
    </div>
  );
}
