import { type Lang } from "./lang";

export type GuideStep = { icon: string; title: string; desc: string };

export type GuideCopy = { badge: string; title: string; steps: [GuideStep, GuideStep, GuideStep]; cta: string };

export const GUIDE_BY_LANG: Record<Lang, GuideCopy> = {
  ko: {
    badge: "이용 방법",
    title: "3단계로 완성하는 나의 이름",
    steps: [
      { icon: "✨", title: "이름 생성", desc: "카테고리를 선택하면 AI가 이름 3개를 제안합니다" },
      { icon: "💛", title: "이름 선택", desc: "마음에 드는 이름 1개를 선택하세요" },
      { icon: "🪪", title: "이름카드 받기", desc: "선택한 이름으로 이름카드를 만들고 다운로드하세요" },
    ],
    cta: "지금 이름 만들기 →",
  },
  en: {
    badge: "How It Works",
    title: "Your Name in 3 Simple Steps",
    steps: [
      { icon: "✨", title: "Generate Names", desc: "Pick a category and AI suggests 3 names" },
      { icon: "💛", title: "Choose Your Name", desc: "Select the one you like best" },
      { icon: "🪪", title: "Get Your Name Card", desc: "Create and download your name card" },
    ],
    cta: "Create Your Name →",
  },
  ja: {
    badge: "ご利用方法",
    title: "3ステップで完成するあなたの名前",
    steps: [
      { icon: "✨", title: "名前生成", desc: "カテゴリーを選ぶとAIが名前を3つ提案します" },
      { icon: "💛", title: "名前を選択", desc: "気に入った名前を1つ選んでください" },
      { icon: "🪪", title: "ネームカードを受け取る", desc: "選んだ名前でネームカードを作成・ダウンロードできます" },
    ],
    cta: "今すぐ名前を作る →",
  },
  zh: {
    badge: "使用方法",
    title: "3步完成您的专属名字",
    steps: [
      { icon: "✨", title: "生成名字", desc: "选择分类后，AI 会推荐3个名字" },
      { icon: "💛", title: "选择名字", desc: "选出您最喜欢的一个名字" },
      { icon: "🪪", title: "获取名字卡", desc: "为所选名字生成并下载名字卡" },
    ],
    cta: "立即创建名字 →",
  },
  es: {
    badge: "Cómo Funciona",
    title: "Tu Nombre en 3 Simples Pasos",
    steps: [
      { icon: "✨", title: "Genera Nombres", desc: "Elige una categoría y la IA sugiere 3 nombres" },
      { icon: "💛", title: "Elige tu Nombre", desc: "Selecciona el que más te guste" },
      { icon: "🪪", title: "Recibe tu Tarjeta de Nombre", desc: "Crea y descarga la tarjeta de tu nombre" },
    ],
    cta: "Crea tu Nombre →",
  },
  ru: {
    badge: "Как Это Работает",
    title: "Ваше Имя за 3 Простых Шага",
    steps: [
      { icon: "✨", title: "Создание имён", desc: "Выберите категорию — ИИ предложит 3 имени" },
      { icon: "💛", title: "Выбор имени", desc: "Выберите имя, которое вам больше нравится" },
      { icon: "🪪", title: "Получите именную карточку", desc: "Создайте и скачайте карточку с выбранным именем" },
    ],
    cta: "Создать имя →",
  },
  fr: {
    badge: "Comment Ça Marche",
    title: "Votre Nom en 3 Étapes Simples",
    steps: [
      { icon: "✨", title: "Génération de noms", desc: "Choisissez une catégorie, l'IA propose 3 noms" },
      { icon: "💛", title: "Choisissez votre nom", desc: "Sélectionnez celui que vous préférez" },
      { icon: "🪪", title: "Recevez votre carte de nom", desc: "Créez et téléchargez la carte de votre nom" },
    ],
    cta: "Créer votre nom →",
  },
  ar: {
    badge: "كيف يعمل",
    title: "اسمك في 3 خطوات بسيطة",
    steps: [
      { icon: "✨", title: "توليد الأسماء", desc: "اختر فئة ليقترح الذكاء الاصطناعي 3 أسماء" },
      { icon: "💛", title: "اختر اسمك", desc: "اختر الاسم الذي يعجبك أكثر" },
      { icon: "🪪", title: "احصل على بطاقة اسمك", desc: "أنشئ وحمّل بطاقة الاسم الذي اخترته" },
    ],
    cta: "أنشئ اسمك →",
  },
  hi: {
    badge: "यह कैसे काम करता है",
    title: "3 आसान चरणों में आपका नाम",
    steps: [
      { icon: "✨", title: "नाम जनरेट करें", desc: "एक श्रेणी चुनें, AI 3 नाम सुझाएगा" },
      { icon: "💛", title: "अपना नाम चुनें", desc: "जो नाम आपको सबसे अच्छा लगे उसे चुनें" },
      { icon: "🪪", title: "अपना नेम कार्ड प्राप्त करें", desc: "चुने गए नाम के लिए नेम कार्ड बनाएं और डाउनलोड करें" },
    ],
    cta: "अभी अपना नाम बनाएं →",
  },
};
