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
    { cat: "korean-name", type: "korean-name", originalName: "Emma", nationality: "미국 · USA", flag: "🇺🇸", koreanName: "이하늘", hanja: "李夏訥", meaning: "하늘처럼 넓고 자유로운 영혼", story: "Emma의 부드럽고 밝은 음감을 살려 '하늘'로 연결했습니다. 여름 하늘처럼 넓고 자유로운 삶을 바라는 이름입니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Michael", nationality: "영국 · UK", flag: "🇬🇧", koreanName: "강도윤", hanja: "姜道潤", meaning: "바른 길로 윤택하게", story: "Michael의 '신의 뜻을 따르는' 의미에서 '도윤(道潤)' — 바른 길을 따라 풍요롭게 — 로 설계했습니다." },
    { cat: "korean-name", type: "korean-name", originalName: "Yuki", nationality: "일본 · Japan", flag: "🇯🇵", koreanName: "박서연", hanja: "朴瑞蓮", meaning: "상서로운 연꽃처럼 아름답게", story: "雪(유키·눈)의 순수함을 '서연(瑞蓮)' — 상서로운 연꽃 — 으로 승화시켰습니다. 한국적 감성을 가득 담은 이름입니다." },
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

const MARQUEE_TEXT: Record<CatId, string> = {
  "korean-name": "🏆 2026 남자이름 1위 도윤 ✦ 2위 도현 ✦ 3위 하준 ✦ 4위 서준 ✦ 5위 이준 ✦  🌸 여자이름 1위 서윤 ✦ 2위 하린 ✦ 3위 하윤 ✦ 4위 아린 ✦ 5위 서아 ✦  🇰🇷 당신의 한국 이름을 설계합니다 ✦",
  "child":        "✨ 2026 아기이름 트렌드 ✦ 남아: 도윤 하준 서준 시우 주원 ✦ 여아: 서윤 하린 하윤 아린 서아 ✦ 순우리말: 하늘 가온 봄 누리 ✦ 오행 균형 + 성씨 조화 필수 ✦",
  "pet":          "🐾 인기 반려동물 이름 ✦ 강아지: 초코 코코 뭉치 보리 ✦ 고양이: 나비 야옹 솜이 루나 ✦ 한국 고유어: 진주 두부 이슬 하늘 ✦ 부르기 쉽고 귀여운 이름으로 ✦",
  "foreign":      "🌍 한국이름 → 외국이름 변환 ✦ 이민준 → James Lee (영어) ✦ 김소연 → Céline Kim (프랑스어) ✦ 박서준 → Haojun Park (중국어) ✦ 정유진 → Eugenia Jung (스페인어) ✦",
  "goods":        "🏮 도장·굿즈 직접 픽업 가능 ✦ 부산 광안리점 ✦ 부산 해운대점 ✦ 이름 설계 후 연계 주문 시 10% 할인 ✦ 목인·흑단·자수정 도장 ✦ 한국문양 버킷햇·텀블러·마그네틱 ✦",
};

const INFO_TABS = [
  { id: "rank",    label: "📊 인기순위" },
  { id: "saju",    label: "☯ 성명학·사주" },
  { id: "sejong",  label: "👑 세종대왕·한글" },
  { id: "culture", label: "🌍 한국이름문화" },
  { id: "tips",    label: "💡 이름선택팁" },
] as const;
type InfoTabId = typeof INFO_TABS[number]["id"];

const INFO_CARDS: Record<InfoTabId, { title: string; body: string; highlight?: string }[]> = {
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
};

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

// ── 마퀴 자막 (56px 네이비) ──────────────────────────────
function MarqueeBand({ catId }: { catId: CatId }) {
  const text = MARQUEE_TEXT[catId];
  return (
    <div style={{ overflow: "hidden", background: "#1B2A5E", height: 56, display: "flex", alignItems: "center" }}>
      <div className="marquee-track" key={catId} style={{ display: "flex", whiteSpace: "nowrap" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ fontSize: 17, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.05em", padding: "0 48px", flexShrink: 0 }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 참고 정보 섹션 ─────────────────────────────────────────
function InfoSection({ copy }: { copy: HomeCopy }) {
  const [activeTab, setActiveTab] = useState<InfoTabId>("rank");
  const cards = INFO_CARDS[activeTab];
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
          {INFO_TABS.map(t => (
            <button
              key={t.id}
              className={`lg-info-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
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
  }, [selectedId]);

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
  const cards = ALL_CARDS[selectedId];
  const card = cards[cardIdx];
  const theme = THEME[selectedId];
  const copy = (HOME_COPY[lang] ?? HOME_COPY.ko) as HomeCopy;
  const catCopy = copy.cats[selectedId as CatId];
  const price = PRICE_MAP[lang];
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";
  const sans = "var(--font-noto-sans-kr,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif)";

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAF8", fontFamily: sans, color: "#111111", overflowX: "hidden" }}>

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

        {/* 오른쪽: 영상 플레이어 */}
        <div className="lg-hero-right">
          <div style={{ fontSize: 11, color: "#AAAAAA", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            {cat.emoji} {catCopy.label} · 이름 설계 프리뷰
          </div>

          {/* ── 영상 플레이어 컨테이너 (PC 16:9 / 모바일 9:16) ──
              나중에 이 자리를 <video> 또는 <iframe>으로 교체하세요.
              예) <video src="/videos/naming-intro.mp4" controls className="lg-video-player" />
                  <iframe src="https://youtube.com/embed/..." className="lg-video-player" />
          */}
          <div className="lg-video-player">
            {/* 배경 그라디언트 */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #060e22 0%, #1B2A5E 55%, #0c1830 100%)" }} aria-hidden="true" />

            {/* 단청 문양 오버레이 */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.055 }} aria-hidden="true">
              <DanchingBg />
            </div>

            {/* 중앙: 재생 버튼 + Coming Soon 오버레이 */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, zIndex: 2 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" aria-label="재생" role="img">
                  <path d="M8 5v14l11-7z" fill="rgba(255,255,255,0.65)" />
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>Coming Soon</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", letterSpacing: "0.04em" }}>이름 설계 영상</div>
              </div>
            </div>

            {/* PIP 네임카드 (우하단) */}
            <div
              className="lg-pip-wrapper"
              key={`${selectedId}-${animKey}`}
              style={{ animation: "lgFadeIn 0.4s ease" }}
            >
              <div className="lg-pip-card">
                <NameCard card={card} accent={theme.accent} />
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 8, justifyContent: "center" }}>
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); }}
                    aria-label={`예시 ${i + 1}`}
                    style={{ height: 4, borderRadius: 2, border: "none", cursor: "pointer", padding: 0, background: i === cardIdx ? "#C9A84C" : "rgba(255,255,255,0.35)", width: i === cardIdx ? 14 : 5, transition: "all 0.3s" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 마퀴 자막 ── */}
      <MarqueeBand catId={selectedId} />

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
              {cat.desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {cat.points.map(p => (
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
                  : <span>이름 설계 후 연계 주문 시 <strong style={{ color: theme.accent }}>10% 할인</strong></span>
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
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1B2A5E", fontFamily: serif, letterSpacing: 2 }}>{(c as KoreanNameCard).koreanName}</div>
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
      <InfoSection copy={copy} />

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
