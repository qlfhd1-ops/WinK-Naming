"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import type { BriefPayload } from "@/lib/naming-engine";

type ValidCategory =
  | "child"
  | "self"
  | "brand"
  | "pet"
  | "stage"
  | "korean_to_foreign"
  | "foreign_to_korean";

const VALID_CATEGORIES: ValidCategory[] = [
  "child",
  "self",
  "brand",
  "pet",
  "stage",
  "korean_to_foreign",
  "foreign_to_korean",
];

function isValidCategory(value: string): value is ValidCategory {
  return VALID_CATEGORIES.includes(value as ValidCategory);
}

// ── Chip preset data ─────────────────────────────────────────

const CHILD_ORDER_CHIPS: Record<AppLang, string[]> = {
  ko: ["첫째", "둘째", "셋째", "넷째", "다섯째", "조카"],
  en: ["1st child", "2nd child", "3rd child", "4th child", "5th child", "Nephew/Niece"],
  ja: ["第一子", "第二子", "第三子", "第四子", "第五子", "甥/姪"],
  zh: ["长子/女", "次子/女", "三子/女", "四子/女", "五子/女", "侄子/女"],
  es: ["1er hijo", "2do hijo", "3er hijo", "4to hijo", "5to hijo", "Sobrino/a"],
  ru: ["1-й ребёнок", "2-й ребёнок", "3-й ребёнок", "4-й ребёнок", "5-й ребёнок", "Племянник/ца"],
  fr: ["1er enfant", "2e enfant", "3e enfant", "4e enfant", "5e enfant", "Neveu/Nièce"],
  ar: ["الطفل الأول", "الطفل الثاني", "الطفل الثالث", "الطفل الرابع", "الطفل الخامس", "ابن/بنت الأخ"],
  hi: ["पहला बच्चा", "दूसरा बच्चा", "तीसरा बच्चा", "चौथा बच्चा", "पाँचवाँ बच्चा", "भतीजा/भतीजी"],
};

const COUNTRY_OPTIONS: Record<AppLang, Array<{ value: string; label: string }>> = {
  ko: [
    { value: "한국", label: "🇰🇷 한국" },
    { value: "미국/영어권", label: "🇺🇸 미국 / 영어권" },
    { value: "일본", label: "🇯🇵 일본" },
    { value: "중국", label: "🇨🇳 중국" },
    { value: "유럽", label: "🌍 유럽" },
    { value: "한국+글로벌", label: "🌐 한국 + 글로벌" },
    { value: "기타", label: "기타" },
  ],
  en: [
    { value: "Korea", label: "🇰🇷 Korea" },
    { value: "USA/English", label: "🇺🇸 USA / English-speaking" },
    { value: "Japan", label: "🇯🇵 Japan" },
    { value: "China", label: "🇨🇳 China" },
    { value: "Europe", label: "🌍 Europe" },
    { value: "Korea+Global", label: "🌐 Korea + Global" },
    { value: "Other", label: "Other" },
  ],
  ja: [
    { value: "韓国", label: "🇰🇷 韓国" },
    { value: "米国/英語圏", label: "🇺🇸 米国 / 英語圏" },
    { value: "日本", label: "🇯🇵 日本" },
    { value: "中国", label: "🇨🇳 中国" },
    { value: "ヨーロッパ", label: "🌍 ヨーロッパ" },
    { value: "韓国+グローバル", label: "🌐 韓国 + グローバル" },
    { value: "その他", label: "その他" },
  ],
  zh: [
    { value: "韩国", label: "🇰🇷 韩国" },
    { value: "美国/英语区", label: "🇺🇸 美国 / 英语区" },
    { value: "日本", label: "🇯🇵 日本" },
    { value: "中国", label: "🇨🇳 中国" },
    { value: "欧洲", label: "🌍 欧洲" },
    { value: "韩国+全球", label: "🌐 韩国 + 全球" },
    { value: "其他", label: "其他" },
  ],
  es: [
    { value: "Corea", label: "🇰🇷 Corea" },
    { value: "EE.UU./Inglés", label: "🇺🇸 EE.UU. / Inglés" },
    { value: "Japón", label: "🇯🇵 Japón" },
    { value: "China", label: "🇨🇳 China" },
    { value: "Europa", label: "🌍 Europa" },
    { value: "Corea+Global", label: "🌐 Corea + Global" },
    { value: "Otro", label: "Otro" },
  ],
  ru: [
    { value: "Корея", label: "🇰🇷 Корея" },
    { value: "США/Английский", label: "🇺🇸 США / Английский" },
    { value: "Япония", label: "🇯🇵 Япония" },
    { value: "Китай", label: "🇨🇳 Китай" },
    { value: "Европа", label: "🌍 Европа" },
    { value: "Корея+Глобальный", label: "🌐 Корея + Глобальный" },
    { value: "Другое", label: "Другое" },
  ],
  fr: [
    { value: "Corée", label: "🇰🇷 Corée" },
    { value: "USA/Anglais", label: "🇺🇸 USA / Anglophone" },
    { value: "Japon", label: "🇯🇵 Japon" },
    { value: "Chine", label: "🇨🇳 Chine" },
    { value: "Europe", label: "🌍 Europe" },
    { value: "Corée+Global", label: "🌐 Corée + Global" },
    { value: "Autre", label: "Autre" },
  ],
  ar: [
    { value: "كوريا", label: "🇰🇷 كوريا" },
    { value: "الولايات المتحدة/الإنجليزية", label: "🇺🇸 أمريكا / الإنجليزية" },
    { value: "اليابان", label: "🇯🇵 اليابان" },
    { value: "الصين", label: "🇨🇳 الصين" },
    { value: "أوروبا", label: "🌍 أوروبا" },
    { value: "كوريا+عالمي", label: "🌐 كوريا + عالمي" },
    { value: "أخرى", label: "أخرى" },
  ],
  hi: [
    { value: "कोरिया", label: "🇰🇷 कोरिया" },
    { value: "अमेरिका/अंग्रेज़ी", label: "🇺🇸 अमेरिका / अंग्रेज़ी" },
    { value: "जापान", label: "🇯🇵 जापान" },
    { value: "चीन", label: "🇨🇳 चीन" },
    { value: "यूरोप", label: "🌍 यूरोप" },
    { value: "कोरिया+वैश्विक", label: "🌐 कोरिया + वैश्विक" },
    { value: "अन्य", label: "अन्य" },
  ],
};

const SCRIPT_CHIPS: Record<AppLang, string[]> = {
  ko: ["순수 한글", "한글 + 한자", "해외 발음 쉬운", "브랜드형 표기", "자유"],
  en: ["Pure Hangeul", "Hangeul + Hanja", "Globally pronounceable", "Brand-style", "Flexible"],
  ja: ["純ハングル", "ハングル + 漢字", "海外発音対応", "ブランド表記", "自由"],
  zh: ["纯韩文", "韩文 + 汉字", "适合国际发音", "品牌风格", "自由"],
  es: ["Solo Hangeul", "Hangeul + Hanja", "Pronunciación global", "Estilo marca", "Flexible"],
  ru: ["Чистый Хангыль", "Хангыль + Ханча", "Глобальное произношение", "Брендовый стиль", "Свободно"],
  fr: ["Hangeul pur", "Hangeul + Hanja", "Prononciation mondiale", "Style marque", "Libre"],
  ar: ["هانغول فقط", "هانغول + هانجا", "نطق عالمي", "أسلوب العلامة التجارية", "حر"],
  hi: ["केवल हंगुल", "हंगुल + हंजा", "वैश्विक उच्चारण", "ब्रांड शैली", "स्वतंत्र"],
};

const PURPOSE_CHIPS: Record<AppLang, Record<ValidCategory, string[]>> = {
  ko: {
    self: ["새로운 출발과 변화를 위한 이름", "나의 정체성을 온전히 담은 이름", "오래 불러도 나답게 느껴지는 이름", "사람들이 기억하고 좋아하는 이름", "삶의 전환점을 기념하는 이름"],
    child: ["건강하고 행복하게 살아가길", "많은 사람들에게 사랑받길", "나라를 빛내는 큰 인물이 되길", "부모 형제간 끈끈한 연을 맺고 행복하길", "지혜롭고 총명하게 자라길", "따뜻한 마음을 가진 사람이 되길"],
    brand: ["처음 들어도 신뢰가 가는 이름", "글로벌 시장에서도 통하는 이름", "확장성과 기억성이 좋은 이름", "업종 특성이 자연스럽게 느껴지는 이름"],
    pet: ["매일 불러도 입에 잘 붙는 이름", "사랑스럽고 정이 담기는 이름", "귀엽지만 세련된 이름"],
    stage: ["한 번 들으면 기억되는 이름", "개성과 존재감이 느껴지는 이름", "검색에 잘 잡히는 이름"],
    korean_to_foreign: ["현지에서 자연스럽게 발음되는 이름", "한국 이름의 의미를 살린 이름", "기억하기 쉬운 이름"],
    foreign_to_korean: ["원래 이름의 느낌을 살린 이름", "한국인이 자연스럽게 부를 수 있는 이름", "세련되고 기억에 남는 이름"],
  },
  en: {
    self: ["A name for a fresh start", "A name that fully reflects my identity", "A name that feels like me over the years", "A name people remember and love", "A name to mark a life turning point"],
    child: ["To grow healthy and happy", "To be loved by many", "To become a great person", "To have strong family bonds", "To grow wise and bright", "To have a warm and kind heart"],
    brand: ["Trustworthy at first hearing", "Works in the global market", "Memorable and scalable", "Naturally reflects the industry"],
    pet: ["Easy to say every day", "Lovable and full of warmth", "Cute yet refined"],
    stage: ["Memorable after one hearing", "Feels unique and present", "Easy to find in search"],
    korean_to_foreign: ["Naturally pronounced locally", "Preserves the Korean name's meaning", "Easy to remember"],
    foreign_to_korean: ["Keeps the feel of the original", "Easy for Koreans to call", "Refined and memorable"],
  },
  ja: {
    self: ["新しい出発のための名前", "自分らしさが込められた名前", "長く呼ばれても自分らしい名前", "覚えられ愛される名前", "人生の転換点を記念する名前"],
    child: ["健康で幸せに育ってほしい", "多くの人に愛されてほしい", "大きな人物になってほしい", "家族の絆を大切に幸せに", "賢く聡明に育ってほしい", "温かい心を持った人になってほしい"],
    brand: ["初めて聞いても信頼できる名前", "グローバル市場でも通じる名前", "拡張性と記憶性の高い名前", "業種の特性が自然に感じられる名前"],
    pet: ["毎日呼んでも馴染む名前", "愛らしく情が込もる名前", "可愛いけど洗練された名前"],
    stage: ["一度聞いたら覚える名前", "個性と存在感を感じる名前", "検索しやすい名前"],
    korean_to_foreign: ["現地で自然に発音される名前", "韓国名の意味を活かした名前", "覚えやすい名前"],
    foreign_to_korean: ["元の名前の感じを活かした名前", "韓国人が自然に呼べる名前", "洗練されて記憶に残る名前"],
  },
  zh: {
    self: ["新出发与改变的名字", "完全承载我身份的名字", "叫了多年仍然像自己的名字", "让人记住并喜爱的名字", "纪念人生转折点的名字"],
    child: ["健康幸福地成长", "受到众多人的喜爱", "成为造福社会的大人物", "家庭成员间联系紧密幸福", "聪明伶俐地成长", "成为心地善良的人"],
    brand: ["初次听到就信任的名字", "在全球市场也能通用的名字", "延展性强且易记的名字", "自然体现行业特色的名字"],
    pet: ["每天叫也顺口的名字", "可爱温情的名字", "萌但有品位的名字"],
    stage: ["听一遍就记住的名字", "有个性存在感的名字", "容易被搜索到的名字"],
    korean_to_foreign: ["在当地发音自然的名字", "保留韩国名字含义的名字", "容易记住的名字"],
    foreign_to_korean: ["保留原名感觉的名字", "韩国人可以自然称呼的名字", "精致且难忘的名字"],
  },
  es: {
    self: ["Un nombre para un nuevo comienzo", "Un nombre que refleje mi identidad", "Un nombre que siempre se sienta mío", "Un nombre que la gente recuerde", "Un nombre para un punto de inflexión"],
    child: ["Que crezca sano y feliz", "Que sea amado por muchos", "Que se convierta en una gran persona", "Que tenga fuertes lazos familiares", "Que crezca sabio y brillante", "Que tenga un corazón cálido"],
    brand: ["Confiable al primer oído", "Funciona en el mercado global", "Memorable y escalable", "Refleja el sector naturalmente"],
    pet: ["Fácil de decir cada día", "Adorable y lleno de cariño", "Tierno pero refinado"],
    stage: ["Memorable a la primera escucha", "Único y con presencia", "Fácil de encontrar en búsqueda"],
    korean_to_foreign: ["Pronunciado naturalmente en destino", "Conserva el significado del nombre coreano", "Fácil de recordar"],
    foreign_to_korean: ["Mantiene el sentir del original", "Fácil para los coreanos", "Refinado y memorable"],
  },
  ru: {
    self: ["Имя для нового начала", "Имя, отражающее мою личность", "Имя, которое всегда звучит как моё", "Имя, которое помнят и любят", "Имя для памяти жизненного перелома"],
    child: ["Расти здоровым и счастливым", "Быть любимым многими", "Стать великим человеком", "Иметь крепкие семейные узы", "Расти мудрым и светлым", "Иметь тёплое и доброе сердце"],
    brand: ["Вызывает доверие с первого звучания", "Работает на глобальном рынке", "Запоминаемое и масштабируемое", "Естественно отражает отрасль"],
    pet: ["Легко произносить каждый день", "Любимое и полное теплоты", "Милое, но изысканное"],
    stage: ["Запоминается с первого раза", "Уникальное с присутствием", "Легко найти в поиске"],
    korean_to_foreign: ["Естественно произносится на месте", "Сохраняет значение корейского имени", "Легко запомнить"],
    foreign_to_korean: ["Сохраняет ощущение оригинала", "Легко для корейцев", "Изысканное и незабываемое"],
  },
  fr: {
    self: ["Un nom pour un nouveau départ", "Un nom qui reflète mon identité", "Un nom qui me ressemble toujours", "Un nom que les gens retiennent", "Un nom pour marquer un tournant"],
    child: ["Grandir en bonne santé et heureux", "Être aimé de beaucoup", "Devenir une grande personne", "Avoir de forts liens familiaux", "Grandir sage et brillant", "Avoir un cœur chaleureux"],
    brand: ["Fiable dès la première écoute", "Fonctionne sur le marché mondial", "Mémorable et évolutif", "Reflète naturellement le secteur"],
    pet: ["Facile à appeler chaque jour", "Adorable et plein de chaleur", "Mignon mais raffiné"],
    stage: ["Mémorable dès la première écoute", "Unique avec une présence", "Facile à trouver en recherche"],
    korean_to_foreign: ["Prononcé naturellement sur place", "Conserve le sens du nom coréen", "Facile à retenir"],
    foreign_to_korean: ["Garde le sentiment de l'original", "Facile pour les Coréens", "Raffiné et mémorable"],
  },
  ar: {
    self: ["اسم لبداية جديدة", "اسم يعكس هويتي بالكامل", "اسم يظل يعبر عني دائماً", "اسم يتذكره الناس ويحبونه", "اسم لتذكر منعطف الحياة"],
    child: ["أن ينمو بصحة وسعادة", "أن يحبه الكثيرون", "أن يصبح شخصاً عظيماً", "أن تكون له روابط عائلية قوية", "أن ينمو حكيماً ومشرقاً", "أن يكون ذا قلب دافئ طيب"],
    brand: ["موثوق من أول سماع", "يعمل في السوق العالمي", "لا يُنسى وقابل للتوسع", "يعكس القطاع بشكل طبيعي"],
    pet: ["سهل النطق كل يوم", "محبوب ومليء بالدفء", "لطيف ولكن راقٍ"],
    stage: ["لا يُنسى من أول سماع", "فريد وحاضر", "سهل الإيجاد في البحث"],
    korean_to_foreign: ["يُنطق بشكل طبيعي محلياً", "يحافظ على معنى الاسم الكوري", "سهل التذكر"],
    foreign_to_korean: ["يحافظ على إحساس الأصل", "سهل على الكوريين", "راقٍ ولا يُنسى"],
  },
  hi: {
    self: ["नई शुरुआत के लिए नाम", "मेरी पहचान को पूरी तरह दर्शाने वाला नाम", "हमेशा मेरा लगने वाला नाम", "जिसे लोग याद रखें और पसंद करें", "जीवन के मोड़ को चिह्नित करने वाला नाम"],
    child: ["स्वस्थ और खुश रहे", "बहुत से लोगों का प्यार पाए", "महान व्यक्ति बने", "मजबूत पारिवारिक संबंध हों", "बुद्धिमान और प्रतिभाशाली बने", "दयालु और गर्मजोशी भरा दिल हो"],
    brand: ["पहली सुनवाई में विश्वसनीय", "वैश्विक बाजार में काम करे", "यादगार और विस्तारयोग्य", "उद्योग को स्वाभाविक रूप से दर्शाए"],
    pet: ["रोज़ बुलाना आसान हो", "प्यारा और गर्मजोशी भरा", "मनमोहक लेकिन परिष्कृत"],
    stage: ["एक बार सुनकर याद रहे", "अनूठा और उपस्थिति वाला", "खोज में आसानी से मिले"],
    korean_to_foreign: ["स्थानीय रूप से स्वाभाविक उच्चारण", "कोरियाई नाम का अर्थ संरक्षित", "याद रखना आसान"],
    foreign_to_korean: ["मूल नाम की अनुभूति बनाए रखे", "कोरियाई लोगों के लिए आसान", "परिष्कृत और यादगार"],
  },
};

const STYLE_CHIPS: Record<AppLang, Record<ValidCategory, string[]>> = {
  ko: {
    self: ["단단한", "부드러운", "세련된", "따뜻한", "깊은", "밝은", "독립적인", "오래 가는", "자연스러운"],
    child: ["맑은", "단정한", "부드러운", "따뜻한", "세련된", "힘 있는", "밝은", "오래 가는"],
    brand: ["신뢰감 있는", "고급스러운", "글로벌한", "또렷한", "확장 가능한", "감각적인"],
    pet: ["사랑스러운", "귀여운", "부드러운", "밝은", "세련된"],
    stage: ["선명한", "감각적인", "유니크한", "기억되는", "세련된"],
    korean_to_foreign: ["원음에 가까운", "의미 살린", "발음 쉬운", "기억에 남는"],
    foreign_to_korean: ["원음에 가까운", "부드러운", "세련된", "기억에 남는"],
  },
  en: {
    self: ["Strong", "Gentle", "Refined", "Warm", "Deep", "Bright", "Independent", "Timeless", "Natural"],
    child: ["Clear", "Neat", "Gentle", "Warm", "Elegant", "Powerful", "Bright", "Timeless"],
    brand: ["Trustworthy", "Premium", "Global", "Distinct", "Scalable", "Sophisticated"],
    pet: ["Adorable", "Cute", "Gentle", "Bright", "Refined"],
    stage: ["Vivid", "Sophisticated", "Unique", "Memorable", "Refined"],
    korean_to_foreign: ["Close to original", "Meaning-preserving", "Easy to pronounce", "Memorable"],
    foreign_to_korean: ["Close to original", "Gentle", "Refined", "Memorable"],
  },
  ja: {
    self: ["力強い", "柔らかい", "洗練された", "温かい", "深い", "明るい", "自立した", "長く続く", "自然な"],
    child: ["清らかな", "端正な", "柔らかい", "温かい", "洗練された", "力強い", "明るい", "長く続く"],
    brand: ["信頼感ある", "高級な", "グローバルな", "鮮明な", "拡張可能な", "洗練された"],
    pet: ["愛らしい", "かわいい", "柔らかい", "明るい", "洗練された"],
    stage: ["鮮明な", "洗練された", "ユニークな", "記憶に残る", "洗練された"],
    korean_to_foreign: ["原音に近い", "意味を活かす", "発音しやすい", "記憶に残る"],
    foreign_to_korean: ["原音に近い", "柔らかい", "洗練された", "記憶に残る"],
  },
  zh: {
    self: ["坚定的", "柔和的", "精致的", "温暖的", "深沉的", "明亮的", "独立的", "经久耐用的", "自然的"],
    child: ["清澈的", "端正的", "柔和的", "温暖的", "精致的", "有力的", "明亮的", "经久耐用的"],
    brand: ["有信赖感的", "高端的", "国际化的", "清晰的", "可延展的", "有品位的"],
    pet: ["可爱的", "萌的", "柔和的", "明亮的", "精致的"],
    stage: ["鲜明的", "有品位的", "独特的", "难忘的", "精致的"],
    korean_to_foreign: ["接近原音的", "保留意义的", "发音容易的", "令人难忘的"],
    foreign_to_korean: ["接近原音的", "柔和的", "精致的", "令人难忘的"],
  },
  es: {
    self: ["Fuerte", "Suave", "Refinado", "Cálido", "Profundo", "Brillante", "Independiente", "Atemporal", "Natural"],
    child: ["Claro", "Elegante", "Suave", "Cálido", "Refinado", "Poderoso", "Brillante", "Atemporal"],
    brand: ["Confiable", "Premium", "Global", "Distinto", "Escalable", "Sofisticado"],
    pet: ["Adorable", "Tierno", "Suave", "Brillante", "Refinado"],
    stage: ["Vívido", "Sofisticado", "Único", "Memorable", "Refinado"],
    korean_to_foreign: ["Cercano al original", "Con significado", "Fácil de pronunciar", "Memorable"],
    foreign_to_korean: ["Cercano al original", "Suave", "Refinado", "Memorable"],
  },
  ru: {
    self: ["Сильный", "Мягкий", "Изысканный", "Тёплый", "Глубокий", "Яркий", "Независимый", "Вечный", "Естественный"],
    child: ["Чистый", "Аккуратный", "Мягкий", "Тёплый", "Элегантный", "Сильный", "Яркий", "Вечный"],
    brand: ["Вызывающий доверие", "Премиум", "Глобальный", "Чёткий", "Масштабируемый", "Изысканный"],
    pet: ["Очаровательный", "Милый", "Мягкий", "Яркий", "Изысканный"],
    stage: ["Яркий", "Изысканный", "Уникальный", "Запоминаемый", "Утончённый"],
    korean_to_foreign: ["Близкий к оригиналу", "Со значением", "Лёгкий в произношении", "Запоминаемый"],
    foreign_to_korean: ["Близкий к оригиналу", "Мягкий", "Изысканный", "Запоминаемый"],
  },
  fr: {
    self: ["Fort", "Doux", "Raffiné", "Chaleureux", "Profond", "Lumineux", "Indépendant", "Intemporel", "Naturel"],
    child: ["Clair", "Élégant", "Doux", "Chaleureux", "Raffiné", "Puissant", "Lumineux", "Intemporel"],
    brand: ["Fiable", "Premium", "Global", "Distinct", "Évolutif", "Sophistiqué"],
    pet: ["Adorable", "Mignon", "Doux", "Lumineux", "Raffiné"],
    stage: ["Vif", "Sophistiqué", "Unique", "Mémorable", "Raffiné"],
    korean_to_foreign: ["Proche de l'original", "Porteur de sens", "Facile à prononcer", "Mémorable"],
    foreign_to_korean: ["Proche de l'original", "Doux", "Raffiné", "Mémorable"],
  },
  ar: {
    self: ["قوي", "ناعم", "راقٍ", "دافئ", "عميق", "مشرق", "مستقل", "خالد", "طبيعي"],
    child: ["صافٍ", "أنيق", "ناعم", "دافئ", "رقيق", "قوي", "مشرق", "خالد"],
    brand: ["موثوق", "فاخر", "عالمي", "واضح", "قابل للتوسع", "متطور"],
    pet: ["رائع", "لطيف", "ناعم", "مشرق", "راقٍ"],
    stage: ["واضح", "متطور", "فريد", "لا يُنسى", "راقٍ"],
    korean_to_foreign: ["قريب من الأصل", "يحمل المعنى", "سهل النطق", "لا يُنسى"],
    foreign_to_korean: ["قريب من الأصل", "ناعم", "راقٍ", "لا يُنسى"],
  },
  hi: {
    self: ["मजबूत", "कोमल", "परिष्कृत", "गर्मजोशी भरा", "गहरा", "चमकीला", "स्वतंत्र", "शाश्वत", "स्वाभाविक"],
    child: ["स्पष्ट", "सुव्यवस्थित", "कोमल", "गर्मजोशी भरा", "सुरुचिपूर्ण", "शक्तिशाली", "चमकीला", "शाश्वत"],
    brand: ["विश्वसनीय", "प्रीमियम", "वैश्विक", "स्पष्ट", "विस्तारयोग्य", "परिष्कृत"],
    pet: ["आकर्षक", "प्यारा", "कोमल", "चमकीला", "परिष्कृत"],
    stage: ["ज्वलंत", "परिष्कृत", "अनूठा", "यादगार", "सुरुचिपूर्ण"],
    korean_to_foreign: ["मूल के करीब", "अर्थ संरक्षित", "उच्चारण में आसान", "यादगार"],
    foreign_to_korean: ["मूल के करीब", "कोमल", "परिष्कृत", "यादगार"],
  },
};

const AVOID_CHIPS: Record<AppLang, Record<ValidCategory, string[]>> = {
  ko: {
    self: ["너무 흔한", "촌스러운", "유행만 타는", "이전 이름과 너무 비슷한", "발음 꼬이는", "부르기 어색한"],
    child: ["너무 흔한", "장난스러운", "촌스러운", "놀림감 있는", "유행만 타는", "발음 꼬이는"],
    brand: ["너무 설명적인", "촌스러운", "상표 충돌 우려", "발음 어려운", "흔한"],
    pet: ["너무 흔한", "발음 꼬이는", "과한 장난스러움"],
    stage: ["검색 어려운", "너무 흔한", "발음 꼬이는", "유치한"],
    korean_to_foreign: ["원래 이름과 너무 다른", "발음 어색한", "부정적 뉘앙스"],
    foreign_to_korean: ["발음 어색한", "이상하게 들리는", "원래 이름과 너무 다른"],
  },
  en: {
    self: ["Too common", "Outdated", "Too trendy", "Too similar to previous name", "Tongue-twisting", "Awkward to say"],
    child: ["Too common", "Playful", "Outdated", "Easy to mock", "Too trendy", "Tongue-twisting"],
    brand: ["Too descriptive", "Outdated", "Trademark conflict risk", "Hard to pronounce", "Generic"],
    pet: ["Too common", "Tongue-twisting", "Overly silly"],
    stage: ["Hard to search", "Too common", "Tongue-twisting", "Childish"],
    korean_to_foreign: ["Too different from original", "Awkward pronunciation", "Negative connotation"],
    foreign_to_korean: ["Awkward pronunciation", "Sounds strange", "Too different from original"],
  },
  ja: {
    self: ["ありきたりすぎる", "古くさい", "流行りだけ", "前の名前に似すぎる", "発音しにくい", "呼びにくい"],
    child: ["ありきたりすぎる", "ふざけた感じ", "古くさい", "からかわれやすい", "流行りだけ", "発音しにくい"],
    brand: ["説明的すぎる", "古くさい", "商標リスク", "発音しにくい", "ありきたり"],
    pet: ["ありきたりすぎる", "発音しにくい", "ふざけすぎる"],
    stage: ["検索しにくい", "ありきたりすぎる", "発音しにくい", "幼稚"],
    korean_to_foreign: ["元の名前と違いすぎる", "発音が不自然", "マイナスのニュアンス"],
    foreign_to_korean: ["発音が不自然", "変に聞こえる", "元の名前と違いすぎる"],
  },
  zh: {
    self: ["太普通", "土气", "只是流行", "和之前名字太像", "发音绕口", "叫起来别扭"],
    child: ["太普通", "轻浮", "土气", "容易被嘲笑", "只是流行", "发音绕口"],
    brand: ["太说明性", "土气", "商标冲突风险", "发音困难", "普通"],
    pet: ["太普通", "发音绕口", "过于搞笑"],
    stage: ["难以搜索", "太普通", "发音绕口", "幼稚"],
    korean_to_foreign: ["和原名差太多", "发音别扭", "有负面含义"],
    foreign_to_korean: ["发音别扭", "听起来奇怪", "和原名差太多"],
  },
  es: {
    self: ["Demasiado común", "Anticuado", "Demasiado de moda", "Muy similar al nombre anterior", "Trabalenguas", "Incómodo de decir"],
    child: ["Demasiado común", "Juguetón", "Anticuado", "Fácil de burlar", "Demasiado de moda", "Trabalenguas"],
    brand: ["Demasiado descriptivo", "Anticuado", "Riesgo de marca", "Difícil de pronunciar", "Genérico"],
    pet: ["Demasiado común", "Trabalenguas", "Demasiado tonto"],
    stage: ["Difícil de buscar", "Demasiado común", "Trabalenguas", "Infantil"],
    korean_to_foreign: ["Demasiado diferente del original", "Pronunciación incómoda", "Connotación negativa"],
    foreign_to_korean: ["Pronunciación incómoda", "Suena extraño", "Demasiado diferente del original"],
  },
  ru: {
    self: ["Слишком распространённое", "Устаревшее", "Слишком модное", "Слишком похоже на прежнее", "Труднопроизносимое", "Неудобное для произношения"],
    child: ["Слишком распространённое", "Игривое", "Устаревшее", "Легко поддаётся насмешкам", "Слишком модное", "Труднопроизносимое"],
    brand: ["Слишком описательное", "Устаревшее", "Риск товарного знака", "Трудно произносить", "Типичное"],
    pet: ["Слишком распространённое", "Труднопроизносимое", "Слишком смешное"],
    stage: ["Трудно найти в поиске", "Слишком распространённое", "Труднопроизносимое", "Детское"],
    korean_to_foreign: ["Слишком отличается от оригинала", "Неудобное произношение", "Негативный оттенок"],
    foreign_to_korean: ["Неудобное произношение", "Звучит странно", "Слишком отличается от оригинала"],
  },
  fr: {
    self: ["Trop commun", "Démodé", "Trop tendance", "Trop similaire au précédent", "Casse-langue", "Gênant à dire"],
    child: ["Trop commun", "Farceur", "Démodé", "Facile à moquer", "Trop tendance", "Casse-langue"],
    brand: ["Trop descriptif", "Démodé", "Risque de marque", "Difficile à prononcer", "Générique"],
    pet: ["Trop commun", "Casse-langue", "Trop bête"],
    stage: ["Difficile à rechercher", "Trop commun", "Casse-langue", "Enfantin"],
    korean_to_foreign: ["Trop différent de l'original", "Prononciation gênante", "Connotation négative"],
    foreign_to_korean: ["Prononciation gênante", "Sonne étrange", "Trop différent de l'original"],
  },
  ar: {
    self: ["شائع جداً", "قديم الطراز", "عصري جداً", "مشابه للاسم السابق كثيراً", "صعب النطق", "محرج قوله"],
    child: ["شائع جداً", "مرح بشكل مفرط", "قديم الطراز", "سهل السخرية منه", "عصري جداً", "صعب النطق"],
    brand: ["وصفي جداً", "قديم الطراز", "خطر التعارض مع العلامة التجارية", "صعب النطق", "عام"],
    pet: ["شائع جداً", "صعب النطق", "مضحك بشكل مفرط"],
    stage: ["صعب البحث عنه", "شائع جداً", "صعب النطق", "طفولي"],
    korean_to_foreign: ["مختلف كثيراً عن الأصل", "نطق محرج", "دلالة سلبية"],
    foreign_to_korean: ["نطق محرج", "يبدو غريباً", "مختلف كثيراً عن الأصل"],
  },
  hi: {
    self: ["बहुत सामान्य", "पुराने ज़माने का", "बहुत ट्रेंडी", "पिछले नाम से बहुत मिलता-जुलता", "जीभ फिसलाने वाला", "बोलने में असहज"],
    child: ["बहुत सामान्य", "चुलबुला", "पुराने ज़माने का", "मज़ाक का पात्र बनने वाला", "बहुत ट्रेंडी", "जीभ फिसलाने वाला"],
    brand: ["बहुत वर्णनात्मक", "पुराने ज़माने का", "ट्रेडमार्क जोखिम", "उच्चारण कठिन", "सामान्य"],
    pet: ["बहुत सामान्य", "जीभ फिसलाने वाला", "अत्यधिक मज़ाकिया"],
    stage: ["खोजने में कठिन", "बहुत सामान्य", "जीभ फिसलाने वाला", "बचकाना"],
    korean_to_foreign: ["मूल से बहुत अलग", "उच्चारण असहज", "नकारात्मक अर्थ"],
    foreign_to_korean: ["उच्चारण असहज", "अजीब लगता है", "मूल से बहुत अलग"],
  },
};

// ── Sub-components ────────────────────────────────────────────

function ChipGroup({
  chips,
  selected,
  onToggle,
  single = false,
}: {
  chips: string[];
  selected: string[];
  onToggle: (chip: string) => void;
  single?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {chips.map((chip) => {
        const active = selected.includes(chip);
        return (
          <button
            key={chip}
            type="button"
            onClick={() => onToggle(chip)}
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              border: active
                ? "1px solid var(--gold-main)"
                : "1px solid var(--line-strong)",
              background: active ? "var(--gold-soft)" : "transparent",
              color: active ? "var(--gold-main)" : "var(--text-soft)",
              transition: "all 0.18s ease",
            }}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}


function PremiumPill({ text }: { text: string }) {
  return <div className="wink-score-pill">{text}</div>;
}

// ── COPY ─────────────────────────────────────────────────────

const COPY = {
  ko: {
    chip: "윙크 네이밍 Atelier",
    title: "이름 설계 브리프",
    sub: "윙크네이밍은 이름을 단순 생성하지 않습니다. 성씨, 의미, 발음, 표기, 인상, 사용 맥락을 함께 읽고 설계합니다.",
    required: "이름의 목적과 원하는 분위기는 반드시 입력해 주세요.",
    requiredBirth: "아이 이름 작명 시 생년월일은 필수입니다.",
    back: "이전 단계",
    start: "이름 설계 시작",
    selectedCategory: "선택한 설계 대상",
    philosophyTitle: "윙크네이밍의 설계 원칙",
    philosophy1: "좋은 이름은 예쁘기만 한 이름이 아니라, 성씨와 함께 불렸을 때 자연스럽고 오래 가는 이름이어야 합니다.",
    philosophy2: "의미, 발음, 표기, 인상은 따로 보지 않습니다. 실제 삶에서 함께 쓰였을 때의 조화를 우선합니다.",
    philosophy3: "고객님이 입력한 마음과 목적을 읽고, 준비된 흔한 이름보다 지금 필요한 이름을 설계합니다.",
    brandPhilosophyTitle: "Wink Brand Naming 설계 원칙",
    brandPhilosophy1: "브랜드명은 사람의 이름이 아닙니다. 사업의 가치, 도전의 방향, 성공의 원칙이 응축된 이름입니다. 단 하나의 단어로 시장에 첫인상을 만들고, 고객의 기억에 남아야 합니다.",
    brandPhilosophy2: "준비된 흔한 이름은 추천하지 않습니다. 이 사업만을 위해 처음부터 설계된 맞춤형 이름을 제공합니다. 시장 내 중복 이름, 상표 충돌 위험이 있는 이름은 배제합니다.",
    brandPhilosophy3: "브랜드명 하나가 고객의 첫인상을 결정하고, 시장에서의 위치를 만들며, 오랫동안 기억됩니다. 윙크는 그 이름의 시작을 함께합니다.",
    moodTitle: "설계 무드 선택",
    moodSub: "낮과 밤의 감정 결을 선택해 주세요. 설계 톤과 이름 해석 문장에 반영됩니다.",
    moodDay: "낮의 결",
    moodDayDesc: "맑고 단정하며 햇살 같은 안정감",
    moodNight: "밤의 결",
    moodNightDesc: "깊고 고급스러우며 별빛 같은 여운",
    premiumTitle: "프리미엄 설계 기준",
    premium1: "결과 먼저 무료 확인",
    premium2: "패키지는 마음에 들 때만 선택",
    premium3: "흔한 이름보다 맞는 이름 우선",
    sections: {
      target: "설계 대상 이해",
      targetDesc: "어떤 이름을 누구를 위해 설계하는지 먼저 명확히 정리합니다.",
      birth: "생년월일 및 태어난 시간",
      birthDesc: "명리학과 작명 철학에 따라 생년월일과 태어난 시간을 반영합니다. 시간은 선택 사항입니다.",
      core: "핵심 설계 정보",
      coreDesc: "이름의 목적과 원하는 분위기, 피하고 싶은 느낌을 중심으로 해석합니다.",
      usage: "사용 맥락 정보",
      usageDesc: "어느 국가와 언어권에서, 어떤 표기 방향으로 사용할지 반영합니다.",
      context: "깊이 있는 추가 메모",
      contextDesc: "형제자매 돌림자, 피하고 싶은 이름 예시, 담고 싶은 특별한 뜻 등 작명가가 반드시 알아야 할 내용을 남겨 주세요.",
    },
    fields: {
      targetName: "이름을 받을 대상",
      targetNamePh: "예: 첫 아이, 개명할 본인, 유튜브 활동명, 브랜드 런칭용",
      childOrder: "아이 순서",
      familyName: "성(선택)",
      familyNamePh: "예: 김, 이, 박, 최",
      birthDate: "생년월일 (필수)",
      birthTime: "태어난 시간 (선택)",
      purpose: "이름의 목적",
      purposePh: "왜 이 이름이 필요한지, 어떤 삶과 맥락에서 쓰일 이름인지 구체적으로 적어 주세요.",
      styleKeywords: "원하는 분위기",
      styleKeywordsPh: "예: 맑은, 세련된, 따뜻한, 신뢰감 있는, 오래 가는, 글로벌한",
      avoidKeywords: "피하고 싶은 느낌",
      avoidKeywordsPh: "예: 흔한, 촌스러운, 장난스러운, 너무 유행 같은, 놀림감 있는",
      targetCountry: "주 사용 국가 / 언어권",
      preferredScript: "원하는 표기 방향",
      memo: "추가 메모",
      memoPh: "담고 싶은 마음, 피하고 싶은 사례, 형제자매/기존 브랜드와의 균형, 글로벌 사용 우려 등을 자유롭게 적어 주세요.",
      memoHintTitle: "💡 돌림자 안내",
      memoHintBody: "형제자매 이름에 돌림자가 있다면 꼭 기입해 주세요. 예: 첫째 오태현, 둘째 오도현 → 돌림자 '현' → '현'이 들어간 이름으로 설계합니다.",
      genderLabel: "성별",
      genderFemale: "👧 여자",
      genderMale: "👦 남자",
      genderNeutral: "✨ 중성",
    },
    orTypeFree: "또는 직접 입력",
  },
  en: {
    chip: "윙크 네이밍 Atelier",
    title: "Name Design Brief",
    sub: "윙크 네이밍 doesn't simply generate names. We read and design meaning, pronunciation, spelling, impression, and usage context together.",
    required: "Purpose and desired mood are required.",
    requiredBirth: "Date of birth is required for child naming.",
    back: "Back",
    start: "Start Name Design",
    selectedCategory: "Selected design target",
    philosophyTitle: "윙크 네이밍 Design Principles",
    philosophy1: "A good name is not just beautiful — it must feel natural and lasting when called together with the family name.",
    philosophy2: "Meaning, pronunciation, spelling, and impression are not viewed separately. Harmony in real-life use comes first.",
    philosophy3: "We read the purpose and heart you've entered, and design the name you need now — not a common preset.",
    brandPhilosophyTitle: "Wink Brand Naming Principles",
    brandPhilosophy1: "A brand name is not a person's name. It is a name that condenses the value of a business, the direction of a challenge, and the principles of success. It must create a first impression in the market and remain in customers' memories.",
    brandPhilosophy2: "We do not recommend common preset names. We provide a custom name designed from scratch for this business alone, excluding duplicate and trademark-risk names.",
    brandPhilosophy3: "A single brand name determines the customer's first impression, shapes your market position, and is remembered for years. Wink is with you from the very beginning.",
    moodTitle: "Design Mood",
    moodSub: "Choose the emotional tone. It will be reflected in the design and interpretation.",
    moodDay: "Daylight",
    moodDayDesc: "Clear, crisp, and warm like sunlight",
    moodNight: "Nightfall",
    moodNightDesc: "Deep, refined, and lingering like starlight",
    premiumTitle: "Premium Design Standards",
    premium1: "Review results first for free",
    premium2: "Choose package only if satisfied",
    premium3: "Best-fit name over common names",
    sections: {
      target: "Design Target",
      targetDesc: "Clarify who and what the name is being designed for.",
      birth: "Date & Time of Birth",
      birthDesc: "Reflects date and time of birth per naming philosophy. Time is optional.",
      core: "Core Design Information",
      coreDesc: "Interpreted around purpose, desired mood, and things to avoid.",
      usage: "Usage Context",
      usageDesc: "Reflects which country, language region, and writing style the name will be used in.",
      context: "Additional Notes",
      contextDesc: "Leave anything the designer must know — feelings, concerns, examples, family name balance.",
    },
    fields: {
      targetName: "Who is this name for",
      targetNamePh: "e.g. first child, myself for renaming, YouTube channel, brand launch",
      childOrder: "Birth order",
      familyName: "Family name (optional)",
      familyNamePh: "e.g. Kim, Lee, Park",
      birthDate: "Date of birth (required)",
      birthTime: "Time of birth (optional)",
      purpose: "Purpose of the name",
      purposePh: "Why is this name needed? What life context will it be used in?",
      styleKeywords: "Desired mood",
      styleKeywordsPh: "e.g. clear, refined, warm, trustworthy, timeless, global",
      avoidKeywords: "Impressions to avoid",
      avoidKeywordsPh: "e.g. too common, tacky, playful, trendy, mocking",
      targetCountry: "Primary country / language region",
      preferredScript: "Preferred writing style",
      memo: "Additional notes",
      memoPh: "Feelings to include, examples to avoid, sibling/brand balance, global use concerns — write freely.",
      memoHintTitle: "💡 Generation Name Guide",
      memoHintBody: "If siblings share a generational character, please note it. e.g. First child: Oh Tae-hyun, Second: Oh Do-hyun → shared character '현' → design names containing '현'.",
      genderLabel: "Gender",
      genderFemale: "👧 Female",
      genderMale: "👦 Male",
      genderNeutral: "✨ Neutral",
    },
    orTypeFree: "Or type freely",
  },
  ja: {
    chip: "윙크 네이밍 Atelier",
    title: "ネーミング設計ブリーフ",
    sub: "윙크 네이밍は名前を単に生成しません。姓との調和、意味、発音、表記、印象、使用文脈を合わせて読み設計します。",
    required: "目的と希望する雰囲気は必ずご入力ください。",
    requiredBirth: "お子様の命名には生年月日が必須です。",
    back: "前へ",
    start: "名前設計を開始",
    selectedCategory: "選択した設計対象",
    philosophyTitle: "윙크 네이밍の設計原則",
    philosophy1: "良い名前は美しいだけでなく、姓と一緒に呼ばれたとき自然で長く使える名前でなければなりません。",
    philosophy2: "意味・発音・表記・印象は別々に見ません。実際の生活で使われる際の調和を優先します。",
    philosophy3: "入力いただいた想いと目的を読み取り、既存の一般的な名前ではなく、今必要な名前を設計します。",
    brandPhilosophyTitle: "Wink ブランドネーミング原則",
    brandPhilosophy1: "ブランド名は人の名前ではありません。事業の価値、挑戦の方向、成功の原則が凝縮された名前です。市場に第一印象を作り、顧客の記憶に残らなければなりません。",
    brandPhilosophy2: "既存の一般的な名前は推薦しません。この事業のためだけに最初から設計したオーダーメイドの名前を提供します。",
    brandPhilosophy3: "一つのブランド名が顧客の第一印象を決め、市場での位置を作り、長く記憶されます。Winkはその名前の始まりをともにします。",
    moodTitle: "設計ムード選択",
    moodSub: "昼と夜の感情のトーンを選んでください。設計と解釈文に反映されます。",
    moodDay: "昼の結",
    moodDayDesc: "清らかで整然とした、日差しのような安定感",
    moodNight: "夜の結",
    moodNightDesc: "深く上品で、星明りのような余韻",
    premiumTitle: "プレミアム設計基準",
    premium1: "結果を先に無料確認",
    premium2: "気に入ったときだけパッケージ選択",
    premium3: "一般的な名前より最適な名前優先",
    sections: {
      target: "設計対象の理解",
      targetDesc: "どんな名前を誰のために設計するかを明確にします。",
      birth: "生年月日・生まれた時刻",
      birthDesc: "命名哲学に基づき生年月日と時刻を反映します。時刻は任意です。",
      core: "核心設計情報",
      coreDesc: "目的・希望する雰囲気・避けたいイメージを中心に解釈します。",
      usage: "使用文脈情報",
      usageDesc: "どの国・言語圏で、どの表記方向で使うかを反映します。",
      context: "詳細メモ",
      contextDesc: "世代字、避けたい名前例、込めたい特別な意味など必ずお書きください。",
    },
    fields: {
      targetName: "名前を受ける対象",
      targetNamePh: "例：第一子、改名する本人、YouTubeチャンネル名",
      childOrder: "子どもの順番",
      familyName: "姓（任意）",
      familyNamePh: "例：田中、山田、鈴木",
      birthDate: "生年月日（必須）",
      birthTime: "生まれた時刻（任意）",
      purpose: "名前の目的",
      purposePh: "なぜこの名前が必要か、どんな場面で使われるかを具体的にご記入ください。",
      styleKeywords: "希望する雰囲気",
      styleKeywordsPh: "例：清らか、洗練された、温かい、信頼感、長く使える、グローバルな",
      avoidKeywords: "避けたいイメージ",
      avoidKeywordsPh: "例：ありきたり、野暮ったい、ふざけた、流行りすぎ、からかわれやすい",
      targetCountry: "主な使用国・言語圏",
      preferredScript: "希望する表記方向",
      memo: "追加メモ",
      memoPh: "込めたい想い、避けたい事例、兄弟姉妹との均衡、グローバル使用の懸念など自由にご記入ください。",
      memoHintTitle: "💡 世代字について",
      memoHintBody: "兄弟姉妹に共通の世代字がある場合はご記入ください。例：長男：オ・テヒョン、次男：オ・ドヒョン → 世代字「ヒョン」 → 「ヒョン」を含む名前を設計します。",
      genderLabel: "性別",
      genderFemale: "👧 女の子",
      genderMale: "👦 男の子",
      genderNeutral: "✨ 中性",
    },
    orTypeFree: "または直接入力",
  },
  zh: {
    chip: "윙크 네이밍 Atelier",
    title: "名字设计简报",
    sub: "윙크 네이밍 不是简单生成名字。我们综合阅读并设计姓氏音韵、含义、发音、书写、印象和使用语境。",
    required: "名字的目的和希望的风格为必填项。",
    requiredBirth: "为孩子取名时，出生日期为必填项。",
    back: "上一步",
    start: "开始名字设计",
    selectedCategory: "所选设计对象",
    philosophyTitle: "윙크 네이밍 设计原则",
    philosophy1: "好名字不仅仅好听，和姓氏一起被称呼时也要自然流畅、经久耐用。",
    philosophy2: "含义、发音、书写、印象不分开看。以实际生活中使用时的和谐感为优先。",
    philosophy3: "读懂您输入的心意与目的，设计出您现在需要的名字——而非现成的普通名字。",
    brandPhilosophyTitle: "Wink 品牌命名原则",
    brandPhilosophy1: "品牌名不是人名。它是凝聚了事业价值、挑战方向和成功原则的名字，须在市场留下第一印象并留存于客户记忆。",
    brandPhilosophy2: "我们不推荐现成的普通名字，而是专为该事业从零开始设计的定制名字，排除市场重复及商标冲突风险。",
    brandPhilosophy3: "一个品牌名决定客户的第一印象，塑造市场定位，并被长久铭记。Wink 与您共同开启这一切。",
    moodTitle: "设计氛围选择",
    moodSub: "请选择昼夜的情感基调，将反映在设计风格与名字解读中。",
    moodDay: "白昼之感",
    moodDayDesc: "清澈整洁，如阳光般的安定感",
    moodNight: "夜晚之感",
    moodNightDesc: "深邃高雅，如星光般的余韵",
    premiumTitle: "高端设计标准",
    premium1: "结果先免费查看",
    premium2: "满意后再选套餐",
    premium3: "最合适的名字优先于普通名字",
    sections: {
      target: "了解设计对象",
      targetDesc: "先明确为谁设计什么样的名字。",
      birth: "出生日期与时间",
      birthDesc: "根据命名哲学反映出生日期和时间。时间为选填。",
      core: "核心设计信息",
      coreDesc: "围绕目的、希望的风格和想避免的感觉进行解读。",
      usage: "使用语境信息",
      usageDesc: "反映在哪个国家、语言环境及书写方向下使用。",
      context: "深度附加备注",
      contextDesc: "请留下命名师必须了解的内容，如字辈、避讳示例、特别含义等。",
    },
    fields: {
      targetName: "取名对象",
      targetNamePh: "例：第一个孩子、本人改名、YouTube频道名、品牌发布",
      childOrder: "孩子排行",
      familyName: "姓氏（选填）",
      familyNamePh: "例：金、李、朴、崔",
      birthDate: "出生日期（必填）",
      birthTime: "出生时间（选填）",
      purpose: "名字的目的",
      purposePh: "为何需要这个名字？将在怎样的生活场景中使用？请具体描述。",
      styleKeywords: "希望的风格",
      styleKeywordsPh: "例：清澈、精致、温暖、有信赖感、经久耐用、国际化",
      avoidKeywords: "想避免的感觉",
      avoidKeywordsPh: "例：太普通、土气、轻浮、过于流行、容易被嘲笑",
      targetCountry: "主要使用国家/语言区",
      preferredScript: "希望的书写方向",
      memo: "附加备注",
      memoPh: "想融入的心意、想避免的案例、与兄弟姐妹/现有品牌的平衡、全球使用顾虑等，请自由填写。",
      memoHintTitle: "💡 字辈说明",
      memoHintBody: "如兄弟姐妹名字中有共同字辈，请务必注明。例：长子 吴泰贤，次子 吴道贤 → 字辈'贤' → 设计含'贤'的名字。",
      genderLabel: "性别",
      genderFemale: "👧 女",
      genderMale: "👦 男",
      genderNeutral: "✨ 中性",
    },
    orTypeFree: "或直接输入",
  },
  es: {
    chip: "윙크 네이밍 Atelier",
    title: "Brief de Diseño de Nombre",
    sub: "윙크 네이밍 no genera nombres simplemente. Leemos y diseñamos juntos significado, pronunciación, escritura, impresión y contexto de uso.",
    required: "El propósito y el estilo deseado son obligatorios.",
    requiredBirth: "La fecha de nacimiento es obligatoria para nombres de bebé.",
    back: "Atrás",
    start: "Iniciar diseño de nombre",
    selectedCategory: "Objetivo de diseño seleccionado",
    philosophyTitle: "Principios de diseño de 윙크 네이밍",
    philosophy1: "Un buen nombre no es solo bonito — debe sonar natural y duradero cuando se pronuncia junto con el apellido.",
    philosophy2: "Significado, pronunciación, escritura e impresión no se ven por separado. La armonía en el uso real es lo primero.",
    philosophy3: "Leemos el propósito y el corazón que has introducido, y diseñamos el nombre que necesitas ahora, no uno común predefinido.",
    brandPhilosophyTitle: "Principios de marca 윙크 네이밍",
    brandPhilosophy1: "Un nombre de marca no es un nombre de persona. Es un nombre que condensa el valor del negocio, la dirección del desafío y los principios del éxito.",
    brandPhilosophy2: "No recomendamos nombres comunes predefinidos. Ofrecemos un nombre personalizado diseñado desde cero solo para este negocio.",
    brandPhilosophy3: "Un solo nombre de marca determina la primera impresión, forma tu posición en el mercado y se recuerda durante años. Wink está contigo desde el principio.",
    moodTitle: "Estado de ánimo del diseño",
    moodSub: "Elige el tono emocional. Se reflejará en el diseño e interpretación.",
    moodDay: "Luz del día",
    moodDayDesc: "Claro, ordenado y cálido como la luz del sol",
    moodNight: "Luz de noche",
    moodNightDesc: "Profundo, refinado y evocador como la luz de las estrellas",
    premiumTitle: "Estándares de diseño premium",
    premium1: "Revisa los resultados gratis primero",
    premium2: "Elige el paquete solo si te gusta",
    premium3: "El nombre más adecuado sobre el más común",
    sections: {
      target: "Comprensión del objetivo",
      targetDesc: "Aclaremos para quién y qué nombre se está diseñando.",
      birth: "Fecha y hora de nacimiento",
      birthDesc: "Refleja la fecha y hora de nacimiento según la filosofía de nombres. La hora es opcional.",
      core: "Información esencial de diseño",
      coreDesc: "Interpretado en torno al propósito, estado de ánimo deseado y cosas a evitar.",
      usage: "Contexto de uso",
      usageDesc: "Refleja en qué país, región lingüística y estilo de escritura se usará el nombre.",
      context: "Notas adicionales",
      contextDesc: "Deja lo que el diseñador debe saber: sentimientos, preocupaciones, ejemplos, equilibrio familiar.",
    },
    fields: {
      targetName: "¿Para quién es este nombre?",
      targetNamePh: "ej. primer hijo, yo mismo para renombrar, canal de YouTube, lanzamiento de marca",
      childOrder: "Orden de nacimiento",
      familyName: "Apellido (opcional)",
      familyNamePh: "ej. García, López, Martínez",
      birthDate: "Fecha de nacimiento (obligatoria)",
      birthTime: "Hora de nacimiento (opcional)",
      purpose: "Propósito del nombre",
      purposePh: "¿Por qué se necesita este nombre? ¿En qué contexto de vida se usará?",
      styleKeywords: "Estilo deseado",
      styleKeywordsPh: "ej. claro, refinado, cálido, confiable, atemporal, global",
      avoidKeywords: "Impresiones a evitar",
      avoidKeywordsPh: "ej. demasiado común, anticuado, juguetón, muy de moda, burlesco",
      targetCountry: "País principal / región lingüística",
      preferredScript: "Estilo de escritura preferido",
      memo: "Notas adicionales",
      memoPh: "Sentimientos a incluir, ejemplos a evitar, equilibrio con hermanos o marca existente, preocupaciones de uso global.",
      memoHintTitle: "💡 Guía de nombre generacional",
      memoHintBody: "Si los hermanos comparten un carácter generacional, anótalo. ej. Primero: Oh Tae-hyun, Segundo: Oh Do-hyun → carácter '현' → diseñar nombres que contengan '현'.",
      genderLabel: "Género",
      genderFemale: "👧 Femenino",
      genderMale: "👦 Masculino",
      genderNeutral: "✨ Neutro",
    },
    orTypeFree: "O escribe libremente",
  },
  ru: {
    chip: "윙크 네이밍 Atelier",
    title: "Бриф по разработке имени",
    sub: "윙크 네이밍 не просто генерирует имена. Мы читаем и проектируем значение, произношение, написание, впечатление и контекст использования вместе.",
    required: "Цель и желаемый стиль обязательны.",
    requiredBirth: "Дата рождения обязательна для имени ребёнка.",
    back: "Назад",
    start: "Начать разработку имени",
    selectedCategory: "Выбранный объект проектирования",
    philosophyTitle: "Принципы проектирования 윙크 네이밍",
    philosophy1: "Хорошее имя не просто красивое — оно должно звучать естественно и долговечно в сочетании с фамилией.",
    philosophy2: "Значение, произношение, написание и впечатление рассматриваются вместе. Гармония в реальном использовании — на первом месте.",
    philosophy3: "Мы читаем цель и душу, которые вы вложили, и проектируем нужное вам имя — не обычный шаблон.",
    brandPhilosophyTitle: "Принципы брендового именования Wink",
    brandPhilosophy1: "Название бренда — это не имя человека. Это название, концентрирующее ценность бизнеса, направление вызова и принципы успеха.",
    brandPhilosophy2: "Мы не рекомендуем типовые имена. Предоставляем уникальное название, разработанное с нуля специально для вашего бизнеса.",
    brandPhilosophy3: "Одно название бренда определяет первое впечатление, формирует рыночную позицию и запоминается надолго. Wink — с вами с самого начала.",
    moodTitle: "Настроение дизайна",
    moodSub: "Выберите эмоциональный тон. Он отразится в дизайне и интерпретации.",
    moodDay: "Дневной свет",
    moodDayDesc: "Ясный, чёткий и тёплый, как солнечный свет",
    moodNight: "Ночной свет",
    moodNightDesc: "Глубокий, изысканный и волнующий, как звёздный свет",
    premiumTitle: "Стандарты премиум-дизайна",
    premium1: "Сначала просмотрите результаты бесплатно",
    premium2: "Выберите пакет только если понравится",
    premium3: "Подходящее имя важнее распространённого",
    sections: {
      target: "Понимание объекта",
      targetDesc: "Уточним, для кого и какое имя разрабатывается.",
      birth: "Дата и время рождения",
      birthDesc: "Отражает дату и время рождения согласно философии именования. Время необязательно.",
      core: "Основная информация для дизайна",
      coreDesc: "Интерпретируется вокруг цели, желаемого стиля и того, чего следует избегать.",
      usage: "Контекст использования",
      usageDesc: "Отражает страну, языковой регион и стиль написания для использования имени.",
      context: "Дополнительные заметки",
      contextDesc: "Оставьте всё, что должен знать дизайнер — чувства, опасения, примеры, семейный баланс.",
    },
    fields: {
      targetName: "Для кого это имя?",
      targetNamePh: "напр. первый ребёнок, я сам для переименования, YouTube-канал, запуск бренда",
      childOrder: "Порядок рождения",
      familyName: "Фамилия (необязательно)",
      familyNamePh: "напр. Иванов, Петров, Сидоров",
      birthDate: "Дата рождения (обязательно)",
      birthTime: "Время рождения (необязательно)",
      purpose: "Цель имени",
      purposePh: "Зачем нужно это имя? В каком жизненном контексте оно будет использоваться?",
      styleKeywords: "Желаемый стиль",
      styleKeywordsPh: "напр. ясный, изысканный, тёплый, надёжный, вечный, глобальный",
      avoidKeywords: "Впечатления для избегания",
      avoidKeywordsPh: "напр. слишком распространённый, устаревший, игривый, очень модный, насмешливый",
      targetCountry: "Основная страна / языковой регион",
      preferredScript: "Предпочтительный стиль написания",
      memo: "Дополнительные заметки",
      memoPh: "Чувства для включения, примеры для избегания, баланс с братьями/сёстрами или существующим брендом, опасения глобального использования.",
      memoHintTitle: "💡 Руководство по поколенным именам",
      memoHintBody: "Если братья и сёстры разделяют поколенный иероглиф, укажите это. напр. Первый: О Тхэ-хён, Второй: О До-хён → общий иероглиф '현' → проектировать имена, содержащие '현'.",
      genderLabel: "Пол",
      genderFemale: "👧 Женский",
      genderMale: "👦 Мужской",
      genderNeutral: "✨ Нейтральный",
    },
    orTypeFree: "Или введите вручную",
  },
  fr: {
    chip: "윙크 네이밍 Atelier",
    title: "Brief de Conception de Nom",
    sub: "윙크 네이밍 ne génère pas simplement des noms. Nous lisons et concevons ensemble sens, prononciation, orthographe, impression et contexte d'utilisation.",
    required: "Le but et le style souhaité sont obligatoires.",
    requiredBirth: "La date de naissance est obligatoire pour les prénoms d'enfants.",
    back: "Retour",
    start: "Commencer la conception",
    selectedCategory: "Destinataire de conception sélectionné",
    philosophyTitle: "Principes de conception 윙크 네이밍",
    philosophy1: "Un bon nom n'est pas seulement beau — il doit sonner naturel et durable lorsqu'il est prononcé avec le nom de famille.",
    philosophy2: "Sens, prononciation, orthographe et impression ne sont pas vus séparément. L'harmonie dans l'usage réel passe en premier.",
    philosophy3: "Nous lisons le but et le cœur que vous avez saisi, et concevons le nom dont vous avez besoin maintenant — pas un préréglage courant.",
    brandPhilosophyTitle: "Principes de marque 윙크 네이밍",
    brandPhilosophy1: "Un nom de marque n'est pas un nom de personne. C'est un nom qui condense la valeur d'une entreprise, la direction d'un défi et les principes du succès.",
    brandPhilosophy2: "Nous ne recommandons pas de noms préréglés courants. Nous fournissons un nom personnalisé conçu de zéro pour cette seule entreprise.",
    brandPhilosophy3: "Un seul nom de marque détermine la première impression, façonne votre position sur le marché et est retenu pendant des années. Wink est avec vous dès le début.",
    moodTitle: "Ambiance de conception",
    moodSub: "Choisissez le ton émotionnel. Il se reflétera dans la conception et l'interprétation.",
    moodDay: "Lumière du jour",
    moodDayDesc: "Clair, net et chaud comme la lumière du soleil",
    moodNight: "Lumière nocturne",
    moodNightDesc: "Profond, raffiné et évocateur comme la lumière des étoiles",
    premiumTitle: "Standards de conception premium",
    premium1: "Consulter les résultats gratuitement d'abord",
    premium2: "Choisir le package seulement si satisfait",
    premium3: "Le nom le plus adapté avant le plus courant",
    sections: {
      target: "Compréhension du destinataire",
      targetDesc: "Précisons pour qui et quel nom est conçu.",
      birth: "Date et heure de naissance",
      birthDesc: "Reflète la date et l'heure de naissance selon la philosophie des noms. L'heure est optionnelle.",
      core: "Informations essentielles de conception",
      coreDesc: "Interprété autour du but, de l'ambiance souhaitée et des choses à éviter.",
      usage: "Contexte d'utilisation",
      usageDesc: "Reflète dans quel pays, région linguistique et style d'écriture le nom sera utilisé.",
      context: "Notes supplémentaires",
      contextDesc: "Laissez ce que le concepteur doit savoir : sentiments, préoccupations, exemples, équilibre familial.",
    },
    fields: {
      targetName: "Pour qui est ce nom ?",
      targetNamePh: "ex. premier enfant, moi-même pour renommer, chaîne YouTube, lancement de marque",
      childOrder: "Ordre de naissance",
      familyName: "Nom de famille (optionnel)",
      familyNamePh: "ex. Martin, Dupont, Leblanc",
      birthDate: "Date de naissance (obligatoire)",
      birthTime: "Heure de naissance (optionnelle)",
      purpose: "But du nom",
      purposePh: "Pourquoi ce nom est-il nécessaire ? Dans quel contexte de vie sera-t-il utilisé ?",
      styleKeywords: "Style souhaité",
      styleKeywordsPh: "ex. clair, raffiné, chaleureux, fiable, intemporel, global",
      avoidKeywords: "Impressions à éviter",
      avoidKeywordsPh: "ex. trop commun, démodé, farceur, trop tendance, moqueur",
      targetCountry: "Pays principal / région linguistique",
      preferredScript: "Style d'écriture préféré",
      memo: "Notes supplémentaires",
      memoPh: "Sentiments à inclure, exemples à éviter, équilibre avec frères/sœurs ou marque existante, préoccupations d'usage global.",
      memoHintTitle: "💡 Guide des prénoms générationnels",
      memoHintBody: "Si les frères et sœurs partagent un caractère générationnel, notez-le. ex. Premier : Oh Tae-hyun, Deuxième : Oh Do-hyun → caractère '현' → concevoir des noms contenant '현'.",
      genderLabel: "Genre",
      genderFemale: "👧 Féminin",
      genderMale: "👦 Masculin",
      genderNeutral: "✨ Neutre",
    },
    orTypeFree: "Ou saisissez librement",
  },
  ar: {
    chip: "윙크 네이밍 Atelier",
    title: "موجز تصميم الاسم",
    sub: "لا تقوم 윙크 네이밍 بتوليد الأسماء فحسب. نحن نقرأ ونصمم المعنى والنطق والكتابة والانطباع وسياق الاستخدام معاً.",
    required: "الغرض والأسلوب المرغوب إلزاميان.",
    requiredBirth: "تاريخ الميلاد إلزامي لتسمية الأطفال.",
    back: "رجوع",
    start: "ابدأ تصميم الاسم",
    selectedCategory: "غرض التصميم المختار",
    philosophyTitle: "مبادئ تصميم 윙크 네이밍",
    philosophy1: "الاسم الجيد ليس جميلاً فحسب — بل يجب أن يبدو طبيعياً وراسخاً عند النطق به مع اللقب.",
    philosophy2: "المعنى والنطق والكتابة والانطباع لا تُرى بشكل منفصل. الانسجام في الاستخدام الفعلي هو الأولوية.",
    philosophy3: "نقرأ الغرض والقلب الذي أدخلته، ونصمم الاسم الذي تحتاجه الآن — لا نموذجاً شائعاً مسبقاً.",
    brandPhilosophyTitle: "مبادئ تسمية علامة Wink التجارية",
    brandPhilosophy1: "اسم العلامة التجارية ليس اسم شخص. إنه اسم يُكثِّف قيمة العمل واتجاه التحدي ومبادئ النجاح.",
    brandPhilosophy2: "لا نوصي بالأسماء الشائعة المعدّة مسبقاً. نقدم اسماً مخصصاً مصمماً من الصفر لهذا العمل وحده.",
    brandPhilosophy3: "اسم العلامة التجارية الواحد يحدد الانطباع الأول ويشكل موقعك في السوق ويُتذكر لسنوات. Wink معك من البداية.",
    moodTitle: "مزاج التصميم",
    moodSub: "اختر النبرة العاطفية. ستنعكس في التصميم والتفسير.",
    moodDay: "ضوء النهار",
    moodDayDesc: "صافٍ وواضح ودافئ كضوء الشمس",
    moodNight: "ضوء الليل",
    moodNightDesc: "عميق وراقٍ وعاطفي كضوء النجوم",
    premiumTitle: "معايير التصميم المتميز",
    premium1: "راجع النتائج مجاناً أولاً",
    premium2: "اختر الحزمة فقط إذا أعجبتك",
    premium3: "الاسم الأنسب قبل الأكثر شيوعاً",
    sections: {
      target: "فهم الغرض",
      targetDesc: "لنوضح لمن وما هو الاسم الذي يتم تصميمه.",
      birth: "تاريخ ووقت الميلاد",
      birthDesc: "يعكس تاريخ ووقت الميلاد وفق فلسفة التسمية. الوقت اختياري.",
      core: "معلومات التصميم الأساسية",
      coreDesc: "يُفسَّر حول الغرض والمزاج المرغوب والأمور الواجب تجنبها.",
      usage: "سياق الاستخدام",
      usageDesc: "يعكس البلد والمنطقة اللغوية وأسلوب الكتابة الذي سيُستخدم فيه الاسم.",
      context: "ملاحظات إضافية",
      contextDesc: "اترك ما يجب على المصمم معرفته: المشاعر والمخاوف والأمثلة والتوازن العائلي.",
    },
    fields: {
      targetName: "هذا الاسم لمن؟",
      targetNamePh: "مثل: الطفل الأول، لنفسي لإعادة التسمية، قناة يوتيوب، إطلاق علامة تجارية",
      childOrder: "ترتيب الولادة",
      familyName: "اللقب (اختياري)",
      familyNamePh: "مثل: محمد، أحمد، علي",
      birthDate: "تاريخ الميلاد (إلزامي)",
      birthTime: "وقت الميلاد (اختياري)",
      purpose: "غرض الاسم",
      purposePh: "لماذا هذا الاسم ضروري؟ في أي سياق حياتي سيُستخدم؟",
      styleKeywords: "الأسلوب المرغوب",
      styleKeywordsPh: "مثل: صافٍ، راقٍ، دافئ، موثوق، خالد، عالمي",
      avoidKeywords: "الانطباعات الواجب تجنبها",
      avoidKeywordsPh: "مثل: شائع جداً، قديم، مرح، عصري جداً، ساخر",
      targetCountry: "البلد الرئيسي / المنطقة اللغوية",
      preferredScript: "أسلوب الكتابة المفضل",
      memo: "ملاحظات إضافية",
      memoPh: "المشاعر المراد تضمينها، الأمثلة الواجب تجنبها، التوازن مع الأشقاء أو العلامة الحالية، مخاوف الاستخدام العالمي.",
      memoHintTitle: "💡 دليل الأسماء الجيلية",
      memoHintBody: "إذا كان الأشقاء يشتركون في حرف جيلي، يرجى الإشارة إليه. مثل: الأول: أو تاي-هيون، الثاني: أو دو-هيون → الحرف المشترك '현' → تصميم أسماء تحتوي على '현'.",
      genderLabel: "الجنس",
      genderFemale: "👧 أنثى",
      genderMale: "👦 ذكر",
      genderNeutral: "✨ محايد",
    },
    orTypeFree: "أو اكتب بحرية",
  },
  hi: {
    chip: "윙크 네이밍 Atelier",
    title: "नाम डिज़ाइन ब्रीफ",
    sub: "윙크 네이밍 सिर्फ नाम नहीं बनाता। हम अर्थ, उच्चारण, लेखन, प्रभाव और उपयोग संदर्भ को एक साथ पढ़कर डिज़ाइन करते हैं।",
    required: "उद्देश्य और वांछित शैली अनिवार्य है।",
    requiredBirth: "बच्चे के नाम के लिए जन्म तिथि अनिवार्य है।",
    back: "वापस",
    start: "नाम डिज़ाइन शुरू करें",
    selectedCategory: "चुना हुआ डिज़ाइन लक्ष्य",
    philosophyTitle: "윙크 네이밍 के डिज़ाइन सिद्धांत",
    philosophy1: "एक अच्छा नाम सिर्फ सुंदर नहीं होता — उपनाम के साथ बोले जाने पर यह स्वाभाविक और स्थायी महसूस होना चाहिए।",
    philosophy2: "अर्थ, उच्चारण, लेखन और प्रभाव को अलग-अलग नहीं देखा जाता। वास्तविक उपयोग में सामंजस्य सर्वोपरि है।",
    philosophy3: "हम आपके द्वारा दर्ज किए गए उद्देश्य और भावना को पढ़ते हैं, और अभी ज़रूरी नाम डिज़ाइन करते हैं — सामान्य प्रीसेट नहीं।",
    brandPhilosophyTitle: "Wink ब्रांड नामकरण सिद्धांत",
    brandPhilosophy1: "ब्रांड नाम किसी व्यक्ति का नाम नहीं है। यह व्यापार के मूल्य, चुनौती की दिशा और सफलता के सिद्धांतों को संकुचित करने वाला नाम है।",
    brandPhilosophy2: "हम सामान्य प्रीसेट नाम नहीं सुझाते। हम इस व्यवसाय के लिए शुरू से डिज़ाइन किया गया कस्टम नाम प्रदान करते हैं।",
    brandPhilosophy3: "एक ब्रांड नाम पहली छाप निर्धारित करता है, बाज़ार में आपकी स्थिति बनाता है और वर्षों तक याद किया जाता है। Wink शुरू से आपके साथ है।",
    moodTitle: "डिज़ाइन मूड",
    moodSub: "भावनात्मक टोन चुनें। यह डिज़ाइन और व्याख्या में परिलक्षित होगी।",
    moodDay: "दिन का प्रकाश",
    moodDayDesc: "सूर्य के प्रकाश जैसा स्पष्ट, सुव्यवस्थित और गर्म",
    moodNight: "रात का प्रकाश",
    moodNightDesc: "तारों की रोशनी जैसा गहरा, परिष्कृत और भावपूर्ण",
    premiumTitle: "प्रीमियम डिज़ाइन मानक",
    premium1: "पहले मुफ्त में परिणाम देखें",
    premium2: "पसंद आने पर ही पैकेज चुनें",
    premium3: "सामान्य नाम से बेहतर उपयुक्त नाम",
    sections: {
      target: "लक्ष्य की समझ",
      targetDesc: "स्पष्ट करें कि किसके लिए और कौन सा नाम डिज़ाइन किया जा रहा है।",
      birth: "जन्म तिथि और समय",
      birthDesc: "नामकरण दर्शन के अनुसार जन्म तिथि और समय को दर्शाता है। समय वैकल्पिक है।",
      core: "मुख्य डिज़ाइन जानकारी",
      coreDesc: "उद्देश्य, वांछित मूड और बचाई जाने वाली चीजों के आधार पर व्याख्या की गई।",
      usage: "उपयोग संदर्भ",
      usageDesc: "नाम किस देश, भाषा क्षेत्र और लेखन शैली में उपयोग होगा यह दर्शाता है।",
      context: "अतिरिक्त नोट्स",
      contextDesc: "डिज़ाइनर को जो जानना चाहिए वो छोड़ें — भावनाएं, चिंताएं, उदाहरण, पारिवारिक संतुलन।",
    },
    fields: {
      targetName: "यह नाम किसके लिए है?",
      targetNamePh: "जैसे: पहला बच्चा, खुद के लिए नाम बदलना, YouTube चैनल, ब्रांड लॉन्च",
      childOrder: "जन्म क्रम",
      familyName: "उपनाम (वैकल्पिक)",
      familyNamePh: "जैसे: शर्मा, गुप्ता, सिंह",
      birthDate: "जन्म तिथि (अनिवार्य)",
      birthTime: "जन्म समय (वैकल्पिक)",
      purpose: "नाम का उद्देश्य",
      purposePh: "यह नाम क्यों ज़रूरी है? किस जीवन संदर्भ में इसका उपयोग होगा?",
      styleKeywords: "वांछित शैली",
      styleKeywordsPh: "जैसे: स्पष्ट, परिष्कृत, गर्म, विश्वसनीय, शाश्वत, वैश्विक",
      avoidKeywords: "बचाई जाने वाली छवियां",
      avoidKeywordsPh: "जैसे: बहुत सामान्य, पुराना, चुलबुला, बहुत ट्रेंडी, उपहासपात्र",
      targetCountry: "मुख्य देश / भाषा क्षेत्र",
      preferredScript: "पसंदीदा लेखन शैली",
      memo: "अतिरिक्त नोट्स",
      memoPh: "शामिल करने की भावनाएं, बचाने के उदाहरण, भाई-बहन या मौजूदा ब्रांड के साथ संतुलन, वैश्विक उपयोग की चिंताएं।",
      memoHintTitle: "💡 पीढ़ीगत नाम गाइड",
      memoHintBody: "यदि भाई-बहन एक पीढ़ीगत अक्षर साझा करते हैं, तो उसे नोट करें। जैसे: पहला: ओ ताए-ह्योन, दूसरा: ओ डो-ह्योन → साझा अक्षर '현' → '현' वाले नाम डिज़ाइन करें।",
      genderLabel: "लिंग",
      genderFemale: "👧 महिला",
      genderMale: "👦 पुरुष",
      genderNeutral: "✨ तटस्थ",
    },
    orTypeFree: "या स्वतंत्र रूप से लिखें",
  },
} as const;

// ── Category map (per language) ──────────────────────────────

type CategoryInfo = {
  label: string; badge: string; headline: string; desc: string; points: readonly string[];
  targetHint: string; purposeHint: string; styleHint: string; avoidHint: string; memoHint: string;
};

const CATEGORY_MAP: Record<AppLang, Record<ValidCategory, CategoryInfo>> = {
  ko: {
    self: {
      label: "나에게 / 개명", badge: "본인 개명", headline: "새로운 나를 위한 이름을 설계합니다",
      desc: "삶의 전환점에서 나답게 불릴 이름을 설계합니다. 성씨 조화와 이름이 주는 인상을 함께 고려합니다.",
      points: ["정체성 반영", "성씨 조화", "개명 적합성", "삶의 전환점"],
      targetHint: "예: 본인 개명, 새 출발을 위한 이름 설계",
      purposeHint: "예: 더 나다운 이름을 갖고 싶다, 새 출발을 기념하는 이름, 오래 불러도 나를 표현하는 이름",
      styleHint: "예: 단단한, 부드러운, 세련된, 따뜻한, 깊은, 오래 가는",
      avoidHint: "예: 너무 흔한, 이전 이름과 비슷한, 촌스러운, 유행만 타는, 발음 꼬이는",
      memoHint: "현재 이름과 바꾸고 싶은 이유, 담고 싶은 의미나 한자, 성씨와의 음운 조화 우선 여부, 법적 개명 고려 여부",
    },
    child: {
      label: "아이 이름", badge: "출생 작명", headline: "평생 불릴 이름을 설계합니다",
      desc: "오래 불러도 질리지 않고, 사랑받으며 자랄 수 있는 이름을 설계합니다.",
      points: ["평생 사용성", "놀림감 방지", "성씨 조화", "가족의 바람"],
      targetHint: "예: 첫 아이, 둘째 딸, 태어날 아기 이름",
      purposeHint: "예: 밝고 바르게 자라길 바라는 마음, 사랑받고 안정적인 삶의 기운을 담고 싶은 이름",
      styleHint: "예: 맑은, 단정한, 부드러운, 세련된, 따뜻한, 오래 가는",
      avoidHint: "예: 너무 흔한, 장난스러운, 촌스러운, 놀림감 있는, 과한 유행형",
      memoHint: "부모가 담고 싶은 의미, 형제자매 이름과 돌림자, 피하고 싶은 이름 예시, 성씨와의 조화 우선 여부",
    },
    brand: {
      label: "브랜드명", badge: "상호 / 서비스명", headline: "첫인상과 신뢰, 확장성을 함께 보는 이름",
      desc: "상호와 서비스명, 채널명까지 확장 가능한 브랜드 이름을 설계합니다.",
      points: ["업종 적합성", "신뢰감", "확장성", "중복 리스크"],
      targetHint: "예: 네이밍 서비스, 카페 브랜드, 사주앱, 유튜브 채널명",
      purposeHint: "예: 처음 들어도 믿음이 가고, 향후 서비스 확장에도 어울리는 이름",
      styleHint: "예: 신뢰감 있는, 고급스러운, 또렷한, 글로벌한, 확장 가능한",
      avoidHint: "예: 너무 설명적인, 촌스러운, 상표 충돌 우려, 발음 어려운, 흔한",
      memoHint: "업종, 핵심 고객층, 담고 싶은 의미, 경쟁사 대비 차별점, 향후 확장 방향, 피하고 싶은 브랜드 사례",
    },
    pet: {
      label: "반려동물 이름", badge: "반려 이름", headline: "매일 애정 있게 부를 이름을 설계합니다",
      desc: "부르기 편하고 정이 자연스럽게 담기는 반려 이름을 설계합니다.",
      points: ["부르기 편함", "애정 표현", "발음 귀여움", "유치함 방지"],
      targetHint: "예: 강아지 이름, 고양이 이름, 새 반려동물 이름",
      purposeHint: "예: 매일 불러도 입에 잘 붙고, 사랑스럽지만 질리지 않는 이름",
      styleHint: "예: 사랑스러운, 부드러운, 밝은, 귀엽지만 세련된",
      avoidHint: "예: 너무 흔한, 발음 꼬이는, 과한 장난스러움, 유행만 타는",
      memoHint: "반려동물의 성격, 품종, 첫인상, 자주 부를 애칭 톤, 보호자가 원하는 느낌",
    },
    stage: {
      label: "활동명 / 예명", badge: "크리에이터 / 예명", headline: "기억되고 불리기 좋은 이름을 설계합니다",
      desc: "개성과 호감도, 기억성을 함께 고려한 활동명과 예명을 설계합니다.",
      points: ["기억성", "검색성", "캐릭터성", "발음성"],
      targetHint: "예: 유튜브 활동명, 예명, 닉네임, 작가명",
      purposeHint: "예: 한 번 들으면 기억되고, 과하지 않지만 존재감 있는 활동명",
      styleHint: "예: 선명한, 감각적인, 세련된, 기억되는, 유니크한",
      avoidHint: "예: 검색 어려운, 너무 흔한, 발음 꼬이는, 유치한, 과장된",
      memoHint: "활동 플랫폼, 타깃 연령, 장르, 말투/캐릭터, 글로벌 노출 여부, 기존 닉네임 이력",
    },
    korean_to_foreign: {
      label: "한국어 → 외국어 변환", badge: "이름 변환 · 한→외", headline: "한국 이름을 해외에서 자연스럽게 씁니다",
      desc: "한국 이름의 발음·의미를 영어·중문·일어 등에서 자연스럽게 통용될 수 있도록 변환·설계합니다.",
      points: ["현지 발음 자연스러움", "의미 보존", "문화권 오해 방지", "표기 안정성"],
      targetHint: "예: 해외에서 쓸 한국 이름, 영어/중국어/일어 이름",
      purposeHint: "예: 한국 이름의 발음과 의미를 살리면서 현지에서 자연스럽게 쓸 수 있는 이름",
      styleHint: "예: 원음에 가까운, 의미 살린, 발음 쉬운, 기억에 남는, 국제적인",
      avoidHint: "예: 원래 이름과 너무 다른, 발음 어색한, 부정적 뉘앙스, 특정 국가에서 이상하게 들리는",
      memoHint: "원본 한국 이름, 우선 국가/언어권, 현지 발음 우선 여부, 표기 선호, 문화적 주의점",
    },
    foreign_to_korean: {
      label: "외국어 → 한국어 변환", badge: "이름 변환 · 외→한", headline: "외국 이름을 한국어로 자연스럽게 씁니다",
      desc: "외국 이름의 발음·뉘앙스를 살리면서 한국어로 자연스럽게 표기하거나 새 이름으로 설계합니다.",
      points: ["원음 근접성", "한국어 자연스러움", "뉘앙스 보존", "놀림감 방지"],
      targetHint: "예: 한국어로 쓸 외국 이름, 외국인용 한국 이름",
      purposeHint: "예: 원래 이름의 발음과 느낌을 살리면서 한국인이 자연스럽게 부를 수 있는 이름",
      styleHint: "예: 원음에 가까운, 부드러운, 세련된, 기억에 남는",
      avoidHint: "예: 발음 어색한, 이상하게 들리는, 원래 이름과 너무 다른, 유치한",
      memoHint: "원본 외국 이름, 이름의 유래/뜻, 주 사용 맥락, 선호하는 표기 스타일",
    },
  },
  en: {
    self: {
      label: "For Myself / Rename", badge: "Personal Rename", headline: "Designing a name for the new you",
      desc: "We design a name that feels like you at a life turning point, considering family name harmony and impression.",
      points: ["Identity reflection", "Family name harmony", "Rename suitability", "Life turning point"],
      targetHint: "e.g. personal rename, name design for a fresh start",
      purposeHint: "e.g. a name more true to me, a name to mark a new beginning, a name that expresses me over time",
      styleHint: "e.g. strong, gentle, refined, warm, deep, timeless",
      avoidHint: "e.g. too common, similar to old name, outdated, too trendy, tongue-twisting",
      memoHint: "Reason to change, meaning or hanja to include, phonetic harmony with family name, legal rename consideration",
    },
    child: {
      label: "Child Name", badge: "Baby Naming", headline: "Designing a name for a lifetime",
      desc: "We design a name that will never grow old, loved, and grown into over a lifetime.",
      points: ["Lifelong usability", "Teasing prevention", "Family name harmony", "Family's wishes"],
      targetHint: "e.g. first child, second daughter, baby's name",
      purposeHint: "e.g. a name to grow bright and right, a name carrying love and stable life energy",
      styleHint: "e.g. clear, neat, gentle, elegant, warm, timeless",
      avoidHint: "e.g. too common, playful, outdated, easy to mock, too trendy",
      memoHint: "Meaning parents want to include, sibling generational character, names to avoid, family name harmony priority",
    },
    brand: {
      label: "Brand Name", badge: "Business / Service", headline: "A name that balances first impression, trust, and scalability",
      desc: "We design brand names expandable to business, service, and channel.",
      points: ["Industry fit", "Trustworthiness", "Scalability", "Duplication risk"],
      targetHint: "e.g. naming service, café brand, horoscope app, YouTube channel",
      purposeHint: "e.g. trustworthy at first hearing, suitable for future service expansion",
      styleHint: "e.g. trustworthy, premium, distinct, global, scalable",
      avoidHint: "e.g. too descriptive, outdated, trademark conflict, hard to pronounce, generic",
      memoHint: "Industry, target audience, meaning to include, differentiation from competitors, expansion direction, brand examples to avoid",
    },
    pet: {
      label: "Pet Name", badge: "Pet Naming", headline: "Designing a name to call with love every day",
      desc: "We design a pet name that is easy to call and naturally full of warmth.",
      points: ["Easy to call", "Expression of affection", "Cute pronunciation", "Avoids childishness"],
      targetHint: "e.g. dog name, cat name, new pet name",
      purposeHint: "e.g. a name that rolls off the tongue daily, lovable but not tiring",
      styleHint: "e.g. adorable, gentle, bright, cute but refined",
      avoidHint: "e.g. too common, tongue-twisting, overly silly, too trendy",
      memoHint: "Pet's personality, breed, first impression, tone of nickname to use, what the owner wants",
    },
    stage: {
      label: "Stage / Screen Name", badge: "Creator / Alias", headline: "Designing a name to be remembered and called",
      desc: "We design stage names and aliases balancing individuality, likability, and memorability.",
      points: ["Memorability", "Searchability", "Character", "Pronunciation"],
      targetHint: "e.g. YouTube name, alias, nickname, pen name",
      purposeHint: "e.g. memorable on first hearing, not excessive but with presence",
      styleHint: "e.g. vivid, sophisticated, refined, memorable, unique",
      avoidHint: "e.g. hard to search, too common, tongue-twisting, childish, exaggerated",
      memoHint: "Platform, target age, genre, speech style/character, global exposure, past nickname history",
    },
    korean_to_foreign: {
      label: "Korean → Foreign", badge: "Name Translation · K→F", headline: "Using a Korean name naturally abroad",
      desc: "We convert and design Korean names to work naturally in English, Chinese, Japanese and other languages.",
      points: ["Natural local pronunciation", "Meaning preservation", "Cultural misunderstanding prevention", "Spelling stability"],
      targetHint: "e.g. Korean name for abroad, English/Chinese/Japanese name",
      purposeHint: "e.g. a name that preserves Korean sound and meaning while feeling natural locally",
      styleHint: "e.g. close to original, meaning-preserving, easy to pronounce, memorable, international",
      avoidHint: "e.g. too different from original, awkward pronunciation, negative connotation, strange in specific countries",
      memoHint: "Original Korean name, priority country/language region, local pronunciation priority, spelling preference, cultural notes",
    },
    foreign_to_korean: {
      label: "Foreign → Korean", badge: "Name Translation · F→K", headline: "Using a foreign name naturally in Korean",
      desc: "We convert and design foreign names into natural Korean while preserving pronunciation and nuance.",
      points: ["Closeness to original", "Korean naturalness", "Nuance preservation", "Teasing prevention"],
      targetHint: "e.g. foreign name for Korean use, Korean name for foreigners",
      purposeHint: "e.g. a name that Koreans can call naturally while preserving the feel of the original",
      styleHint: "e.g. close to original, gentle, refined, memorable",
      avoidHint: "e.g. awkward pronunciation, sounds strange, too different from original, childish",
      memoHint: "Original foreign name, origin/meaning, primary usage context, preferred spelling style",
    },
  },
  ja: {
    self: {
      label: "自分のために / 改名", badge: "本人改名", headline: "新しい自分のための名前を設計します",
      desc: "人生の転換点で自分らしく呼ばれる名前を設計します。姓の調和と名前が与える印象を一緒に考慮します。",
      points: ["アイデンティティ反映", "姓との調和", "改名適合性", "人生の転換点"],
      targetHint: "例：本人改名、新しい出発のための名前設計",
      purposeHint: "例：もっと自分らしい名前が欲しい、新しい出発を記念する名前、長く呼ばれても自分を表す名前",
      styleHint: "例：力強い、柔らかい、洗練された、温かい、深い、長く続く",
      avoidHint: "例：ありきたりすぎる、前の名前に似すぎる、古くさい、流行りだけ、発音しにくい",
      memoHint: "現在の名前を変えたい理由、込めたい意味や漢字、姓との音韻調和優先、法的改名の検討",
    },
    child: {
      label: "子どもの名前", badge: "出生ネーミング", headline: "一生呼ばれる名前を設計します",
      desc: "長く呼んでも飽きず、愛されながら育てる名前を設計します。",
      points: ["生涯使用性", "からかい防止", "姓との調和", "家族の願い"],
      targetHint: "例：第一子、次女、生まれてくる赤ちゃんの名前",
      purposeHint: "例：明るく正しく育ってほしい気持ち、愛され安定した人生の気運を込めたい名前",
      styleHint: "例：清らか、端正、柔らかい、洗練された、温かい、長く続く",
      avoidHint: "例：ありきたりすぎる、ふざけた感じ、古くさい、からかわれやすい、流行りすぎ",
      memoHint: "親が込めたい意味、兄弟姉妹の名前と世代字、避けたい名前例、姓との調和優先",
    },
    brand: {
      label: "ブランド名", badge: "屋号 / サービス名", headline: "第一印象・信頼・拡張性を同時に見る名前",
      desc: "屋号・サービス名・チャンネル名まで拡張できるブランド名を設計します。",
      points: ["業種適合性", "信頼感", "拡張性", "重複リスク"],
      targetHint: "例：ネーミングサービス、カフェブランド、占いアプリ、YouTubeチャンネル名",
      purposeHint: "例：初めて聞いても信頼でき、将来のサービス拡張にも合う名前",
      styleHint: "例：信頼感ある、高級な、鮮明な、グローバルな、拡張可能な",
      avoidHint: "例：説明的すぎる、古くさい、商標リスク、発音しにくい、ありきたり",
      memoHint: "業種、主な顧客層、込めたい意味、競合との差別化、今後の展開方向、避けたいブランド事例",
    },
    pet: {
      label: "ペットの名前", badge: "ペットの名前", headline: "毎日愛情込めて呼べる名前を設計します",
      desc: "呼びやすく、愛情が自然にこもるペットの名前を設計します。",
      points: ["呼びやすさ", "愛情表現", "発音のかわいさ", "幼稚さ防止"],
      targetHint: "例：犬の名前、猫の名前、新しいペットの名前",
      purposeHint: "例：毎日呼んでも口に馴染み、愛らしいけど飽きない名前",
      styleHint: "例：愛らしい、柔らかい、明るい、かわいいけど洗練された",
      avoidHint: "例：ありきたりすぎる、発音しにくい、ふざけすぎ、流行りだけ",
      memoHint: "ペットの性格・品種・第一印象、よく使う愛称のトーン、飼い主の希望",
    },
    stage: {
      label: "活動名 / 芸名", badge: "クリエイター / 芸名", headline: "記憶され呼ばれやすい名前を設計します",
      desc: "個性・好感度・記憶性を合わせた活動名と芸名を設計します。",
      points: ["記憶性", "検索性", "キャラクター性", "発音性"],
      targetHint: "例：YouTube活動名、芸名、ニックネーム、作家名",
      purposeHint: "例：一度聞いたら覚え、過剰でなく存在感ある活動名",
      styleHint: "例：鮮明、洗練された、記憶に残る、ユニークな",
      avoidHint: "例：検索しにくい、ありきたり、発音しにくい、幼稚、誇張した",
      memoHint: "活動プラットフォーム、ターゲット年齢、ジャンル、話し方/キャラクター、グローバル露出、既存ニックネーム歴",
    },
    korean_to_foreign: {
      label: "韓国語 → 外国語変換", badge: "名前変換 · 韓→外", headline: "韓国の名前を海外で自然に使います",
      desc: "韓国の名前の発音・意味を英語・中文・日本語等で自然に通用するよう変換・設計します。",
      points: ["現地発音の自然さ", "意味保存", "文化圏誤解防止", "表記安定性"],
      targetHint: "例：海外で使う韓国名、英語/中国語/日本語の名前",
      purposeHint: "例：韓国名の発音と意味を活かしながら現地で自然に使える名前",
      styleHint: "例：原音に近い、意味を活かす、発音しやすい、記憶に残る、国際的",
      avoidHint: "例：元の名前と違いすぎる、発音が不自然、ネガティブなニュアンス、特定国で変に聞こえる",
      memoHint: "元の韓国名、優先国・言語圏、現地発音優先の有無、表記の好み、文化的注意点",
    },
    foreign_to_korean: {
      label: "外国語 → 韓国語変換", badge: "名前変換 · 外→韓", headline: "外国の名前を韓国語で自然に使います",
      desc: "外国の名前の発音・ニュアンスを活かしながら韓国語で自然に表記または新しく設計します。",
      points: ["原音近接性", "韓国語の自然さ", "ニュアンス保存", "からかい防止"],
      targetHint: "例：韓国語で使う外国名、外国人向けの韓国名",
      purposeHint: "例：元の名前の発音と感じを活かしながら韓国人が自然に呼べる名前",
      styleHint: "例：原音に近い、柔らかい、洗練された、記憶に残る",
      avoidHint: "例：発音が不自然、変に聞こえる、元の名前と違いすぎる、幼稚",
      memoHint: "元の外国名、名前の由来/意味、主な使用文脈、好む表記スタイル",
    },
  },
  zh: {
    self: {
      label: "为自己 / 改名", badge: "本人改名", headline: "为新的自己设计名字",
      desc: "在人生转折点设计一个自然称呼自己的名字，综合考虑姓氏和谐与名字给人的印象。",
      points: ["身份认同反映", "姓氏和谐", "改名适合性", "人生转折点"],
      targetHint: "例：本人改名，为新出发设计的名字",
      purposeHint: "例：想要一个更像自己的名字，纪念新出发的名字，叫了多年仍能表达自我的名字",
      styleHint: "例：坚定、柔和、精致、温暖、深沉、经久耐用",
      avoidHint: "例：太普通、和旧名字太像、土气、只是流行、发音绕口",
      memoHint: "想改名的理由、想融入的含义或汉字、是否优先考虑与姓氏的音韵协调、是否考虑法律改名",
    },
    child: {
      label: "孩子名字", badge: "新生儿命名", headline: "设计一生被称呼的名字",
      desc: "设计一个叫多久都不厌倦、受人喜爱、可以茁壮成长的名字。",
      points: ["终生使用性", "防止嘲笑", "姓氏和谐", "家人心愿"],
      targetHint: "例：第一个孩子、第二个女儿、即将出生的婴儿名字",
      purposeHint: "例：希望孩子明朗正直成长的心意，想融入爱与稳定生活气运的名字",
      styleHint: "例：清澈、端正、柔和、精致、温暖、经久耐用",
      avoidHint: "例：太普通、轻浮、土气、容易被嘲笑、过于流行",
      memoHint: "父母想融入的含义、兄弟姐妹名字与字辈、想避免的名字示例、是否优先与姓氏协调",
    },
    brand: {
      label: "品牌名", badge: "商号 / 服务名", headline: "综合考虑第一印象、信赖感与延展性的名字",
      desc: "设计可延展至商号、服务名、频道名的品牌名。",
      points: ["行业适合性", "信赖感", "延展性", "重复风险"],
      targetHint: "例：命名服务、咖啡品牌、算命App、YouTube频道名",
      purposeHint: "例：初次听到就信任，且适合未来服务扩展的名字",
      styleHint: "例：有信赖感的、高端的、清晰的、国际化的、可延展的",
      avoidHint: "例：太说明性、土气、商标冲突风险、发音困难、普通",
      memoHint: "行业、核心客群、想融入的含义、与竞品的差异化、未来扩展方向、想避免的品牌案例",
    },
    pet: {
      label: "宠物名字", badge: "宠物命名", headline: "设计每天充满爱意呼唤的名字",
      desc: "设计一个顺口且自然充满感情的宠物名字。",
      points: ["顺口好叫", "表达爱意", "发音可爱", "防止幼稚"],
      targetHint: "例：狗的名字、猫的名字、新宠物的名字",
      purposeHint: "例：每天叫也顺口，可爱但不会厌倦的名字",
      styleHint: "例：可爱的、柔和的、明亮的、萌但有品位的",
      avoidHint: "例：太普通、发音绕口、过于搞笑、只是流行",
      memoHint: "宠物的性格、品种、第一印象、常用昵称风格、主人希望的感觉",
    },
    stage: {
      label: "活动名 / 艺名", badge: "创作者 / 艺名", headline: "设计容易被记住和称呼的名字",
      desc: "设计综合考虑个性、好感度与记忆性的活动名和艺名。",
      points: ["记忆性", "可搜索性", "角色性", "发音性"],
      targetHint: "例：YouTube活动名、艺名、昵称、笔名",
      purposeHint: "例：听一遍就记住，不过于张扬但有存在感的活动名",
      styleHint: "例：鲜明的、有品位的、洗练的、难忘的、独特的",
      avoidHint: "例：难以搜索、太普通、发音绕口、幼稚、夸张",
      memoHint: "活动平台、目标年龄、类型、说话风格/角色、全球曝光情况、既有昵称历史",
    },
    korean_to_foreign: {
      label: "韩语 → 外语转换", badge: "名字转换 · 韩→外", headline: "让韩国名字在海外自然使用",
      desc: "将韩国名字的发音和意义转换设计为在英语、中文、日语等场景中可自然通用的名字。",
      points: ["当地发音自然度", "意义保留", "防文化误解", "书写稳定性"],
      targetHint: "例：海外使用的韩国名字、英语/中文/日语名字",
      purposeHint: "例：在保留韩国名字发音和意义的同时，在当地也能自然使用的名字",
      styleHint: "例：接近原音、保留意义、发音容易、令人难忘、国际化",
      avoidHint: "例：和原名差太多、发音别扭、有负面含义、在特定国家听起来奇怪",
      memoHint: "原韩国名字、优先国家/语言区、是否优先当地发音、书写偏好、文化注意点",
    },
    foreign_to_korean: {
      label: "外语 → 韩语转换", badge: "名字转换 · 外→韩", headline: "让外国名字在韩语中自然使用",
      desc: "在保留外国名字发音和韵味的同时，以韩语自然表记或重新设计。",
      points: ["接近原音", "韩语自然度", "韵味保留", "防止嘲笑"],
      targetHint: "例：以韩语使用的外国名字、外国人用的韩国名字",
      purposeHint: "例：在保留原名发音和感觉的同时，韩国人可以自然称呼的名字",
      styleHint: "例：接近原音的、柔和的、精致的、令人难忘的",
      avoidHint: "例：发音别扭、听起来奇怪、和原名差太多、幼稚",
      memoHint: "原外国名字、名字的由来/含义、主要使用场景、偏好的书写风格",
    },
  },
  es: {
    self: {
      label: "Para mí / Cambio de nombre", badge: "Cambio personal", headline: "Diseñando un nombre para el nuevo tú",
      desc: "Diseñamos un nombre que se sienta como tú en un punto de inflexión, considerando armonía de apellido e impresión.",
      points: ["Reflejo de identidad", "Armonía con apellido", "Idoneidad para cambio", "Punto de inflexión"],
      targetHint: "ej. cambio de nombre personal, diseño para nuevo comienzo",
      purposeHint: "ej. un nombre más fiel a mí, un nombre para marcar un nuevo comienzo, que me exprese con el tiempo",
      styleHint: "ej. fuerte, suave, refinado, cálido, profundo, atemporal",
      avoidHint: "ej. demasiado común, similar al anterior, anticuado, muy de moda, trabalenguas",
      memoHint: "Razón para cambiar, significado o hanja a incluir, prioridad de armonía fonética, consideración de cambio legal",
    },
    child: {
      label: "Nombre de bebé", badge: "Nombre de bebé", headline: "Diseñando un nombre para toda la vida",
      desc: "Diseñamos un nombre que nunca envejece, amado y con el que crecer.",
      points: ["Usabilidad de por vida", "Prevención de burlas", "Armonía con apellido", "Deseos de la familia"],
      targetHint: "ej. primer hijo, segunda hija, nombre del bebé",
      purposeHint: "ej. crecer brillante y correcto, un nombre con energía de amor y vida estable",
      styleHint: "ej. claro, elegante, suave, refinado, cálido, atemporal",
      avoidHint: "ej. demasiado común, juguetón, anticuado, fácil de burlar, muy de moda",
      memoHint: "Significado que los padres quieren incluir, carácter generacional entre hermanos, nombres a evitar, prioridad de armonía familiar",
    },
    brand: {
      label: "Nombre de marca", badge: "Negocio / Servicio", headline: "Un nombre con primera impresión, confianza y escalabilidad",
      desc: "Diseñamos nombres de marca expandibles a negocio, servicio y canal.",
      points: ["Adecuación al sector", "Confiabilidad", "Escalabilidad", "Riesgo de duplicación"],
      targetHint: "ej. servicio de naming, marca de café, app de horóscopo, canal de YouTube",
      purposeHint: "ej. confiable al primer oído, adecuado para expansión futura del servicio",
      styleHint: "ej. confiable, premium, distinto, global, escalable",
      avoidHint: "ej. demasiado descriptivo, anticuado, conflicto de marca, difícil de pronunciar, genérico",
      memoHint: "Sector, audiencia objetivo, significado a incluir, diferenciación de competidores, dirección de expansión, ejemplos de marcas a evitar",
    },
    pet: {
      label: "Nombre de mascota", badge: "Nombre de mascota", headline: "Diseñando un nombre para llamar con amor cada día",
      desc: "Diseñamos un nombre de mascota fácil de llamar y naturalmente lleno de cariño.",
      points: ["Facilidad de llamado", "Expresión de afecto", "Pronunciación adorable", "Evita lo infantil"],
      targetHint: "ej. nombre de perro, nombre de gato, nombre de nueva mascota",
      purposeHint: "ej. que fluya cada día, adorable pero no cansativo",
      styleHint: "ej. adorable, suave, brillante, tierno pero refinado",
      avoidHint: "ej. demasiado común, trabalenguas, muy tonto, muy de moda",
      memoHint: "Personalidad, raza, primera impresión de la mascota, tono de apodo a usar, lo que el dueño quiere",
    },
    stage: {
      label: "Nombre artístico", badge: "Creador / Alias", headline: "Diseñando un nombre para ser recordado y llamado",
      desc: "Diseñamos nombres artísticos y alias equilibrando individualidad, simpatía y memorabilidad.",
      points: ["Memorabilidad", "Buscabilidad", "Carácter", "Pronunciación"],
      targetHint: "ej. nombre de YouTube, alias, apodo, nombre de autor",
      purposeHint: "ej. memorable al primer oído, no excesivo pero con presencia",
      styleHint: "ej. vívido, sofisticado, refinado, memorable, único",
      avoidHint: "ej. difícil de buscar, demasiado común, trabalenguas, infantil, exagerado",
      memoHint: "Plataforma, edad objetivo, género, estilo de habla/carácter, exposición global, historial de apodos anteriores",
    },
    korean_to_foreign: {
      label: "Coreano → Extranjero", badge: "Traducción · C→E", headline: "Usando un nombre coreano naturalmente en el extranjero",
      desc: "Convertimos y diseñamos nombres coreanos para funcionar naturalmente en inglés, chino, japonés y otros idiomas.",
      points: ["Pronunciación local natural", "Preservación de significado", "Prevención de malentendidos culturales", "Estabilidad ortográfica"],
      targetHint: "ej. nombre coreano para el extranjero, nombre en inglés/chino/japonés",
      purposeHint: "ej. preserva el sonido y significado coreano mientras suena natural localmente",
      styleHint: "ej. cercano al original, con significado, fácil de pronunciar, memorable, internacional",
      avoidHint: "ej. demasiado diferente del original, pronunciación incómoda, connotación negativa, extraño en ciertos países",
      memoHint: "Nombre coreano original, país/región prioritario, prioridad de pronunciación local, preferencia ortográfica, notas culturales",
    },
    foreign_to_korean: {
      label: "Extranjero → Coreano", badge: "Traducción · E→C", headline: "Usando un nombre extranjero naturalmente en coreano",
      desc: "Convertimos y diseñamos nombres extranjeros en coreano natural preservando pronunciación y matiz.",
      points: ["Cercanía al original", "Naturalidad coreana", "Preservación de matiz", "Prevención de burlas"],
      targetHint: "ej. nombre extranjero para uso coreano, nombre coreano para extranjeros",
      purposeHint: "ej. que los coreanos puedan llamar naturalmente preservando el sentir del original",
      styleHint: "ej. cercano al original, suave, refinado, memorable",
      avoidHint: "ej. pronunciación incómoda, suena extraño, demasiado diferente del original, infantil",
      memoHint: "Nombre extranjero original, origen/significado, contexto de uso principal, estilo ortográfico preferido",
    },
  },
  ru: {
    self: {
      label: "Для себя / Смена имени", badge: "Личная смена", headline: "Разрабатываем имя для нового вас",
      desc: "Разрабатываем имя, которое звучит как вы в переломный момент, с учётом гармонии фамилии и впечатления.",
      points: ["Отражение личности", "Гармония с фамилией", "Пригодность для смены", "Жизненный перелом"],
      targetHint: "напр. личная смена имени, дизайн для нового начала",
      purposeHint: "напр. имя, более точно отражающее меня, имя для нового начала, выражающее меня со временем",
      styleHint: "напр. сильный, мягкий, изысканный, тёплый, глубокий, вечный",
      avoidHint: "напр. слишком распространённое, похожее на старое, устаревшее, слишком модное, труднопроизносимое",
      memoHint: "Причина смены, значение или иероглиф для включения, приоритет фонетической гармонии с фамилией, правовое рассмотрение",
    },
    child: {
      label: "Имя ребёнка", badge: "Детское имя", headline: "Разрабатываем имя на всю жизнь",
      desc: "Разрабатываем имя, которое не устаревает, любимое и выросшее со временем.",
      points: ["Долгосрочное использование", "Предотвращение насмешек", "Гармония с фамилией", "Пожелания семьи"],
      targetHint: "напр. первый ребёнок, вторая дочь, имя малыша",
      purposeHint: "напр. расти ярким и правильным, имя с энергией любви и стабильной жизни",
      styleHint: "напр. чистый, аккуратный, мягкий, элегантный, тёплый, вечный",
      avoidHint: "напр. слишком распространённое, игривое, устаревшее, лёгкое для насмешек, слишком модное",
      memoHint: "Значение для включения родителями, поколенный иероглиф сиблингов, имена для избегания, приоритет гармонии с фамилией",
    },
    brand: {
      label: "Название бренда", badge: "Бизнес / Услуга", headline: "Имя, объединяющее первое впечатление, доверие и масштабируемость",
      desc: "Разрабатываем названия брендов, расширяемые для бизнеса, услуг и каналов.",
      points: ["Соответствие отрасли", "Надёжность", "Масштабируемость", "Риск дублирования"],
      targetHint: "напр. сервис именования, бренд кафе, приложение гороскопа, YouTube-канал",
      purposeHint: "напр. вызывает доверие с первого звучания, подходит для будущего расширения сервиса",
      styleHint: "напр. надёжный, премиум, чёткий, глобальный, масштабируемый",
      avoidHint: "напр. слишком описательный, устаревший, риск товарного знака, трудно произносить, типичный",
      memoHint: "Отрасль, целевая аудитория, значение для включения, дифференциация от конкурентов, направление расширения, примеры брендов для избегания",
    },
    pet: {
      label: "Кличка питомца", badge: "Кличка", headline: "Разрабатываем имя для ежедневного любящего зова",
      desc: "Разрабатываем кличку питомца, которую легко произносить и которая естественно полна теплоты.",
      points: ["Лёгкость произношения", "Выражение привязанности", "Милость произношения", "Избегание детскости"],
      targetHint: "напр. имя собаки, имя кошки, имя нового питомца",
      purposeHint: "напр. естественное каждый день, любимое, но не надоедающее",
      styleHint: "напр. очаровательный, мягкий, яркий, милый, но изысканный",
      avoidHint: "напр. слишком распространённое, труднопроизносимое, слишком глупое, слишком модное",
      memoHint: "Характер питомца, порода, первое впечатление, тон прозвища, пожелания хозяина",
    },
    stage: {
      label: "Псевдоним", badge: "Псевдоним", headline: "Разрабатываем имя для запоминания и зова",
      desc: "Разрабатываем сценические имена и псевдонимы с балансом индивидуальности, симпатии и запоминаемости.",
      points: ["Запоминаемость", "Поисковая доступность", "Характер", "Произношение"],
      targetHint: "напр. YouTube-имя, псевдоним, никнейм, авторское имя",
      purposeHint: "напр. запоминается с первого раза, не чрезмерное, но с присутствием",
      styleHint: "напр. яркий, изысканный, утончённый, запоминаемый, уникальный",
      avoidHint: "напр. трудно найти в поиске, слишком распространённое, труднопроизносимое, детское, преувеличенное",
      memoHint: "Платформа, целевой возраст, жанр, стиль речи/характер, глобальное присутствие, история прошлых никнеймов",
    },
    korean_to_foreign: {
      label: "Корейский → Иностранный", badge: "Перевод · К→И", headline: "Используем корейское имя естественно за рубежом",
      desc: "Преобразуем и разрабатываем корейские имена для естественного использования на английском, китайском, японском и других языках.",
      points: ["Естественное местное произношение", "Сохранение значения", "Предотвращение культурных недоразумений", "Стабильность написания"],
      targetHint: "напр. корейское имя для зарубежья, имя на английском/китайском/японском",
      purposeHint: "напр. сохраняет корейский звук и значение, ощущаясь естественно на месте",
      styleHint: "напр. близкое к оригиналу, со значением, лёгкое в произношении, запоминаемое, международное",
      avoidHint: "напр. слишком отличается от оригинала, неудобное произношение, негативный оттенок, странное в некоторых странах",
      memoHint: "Оригинальное корейское имя, приоритетная страна/языковой регион, приоритет местного произношения, предпочтение написания, культурные заметки",
    },
    foreign_to_korean: {
      label: "Иностранный → Корейский", badge: "Перевод · И→К", headline: "Используем иностранное имя естественно по-корейски",
      desc: "Преобразуем и разрабатываем иностранные имена в естественный корейский, сохраняя произношение и нюансы.",
      points: ["Близость к оригиналу", "Корейская естественность", "Сохранение нюансов", "Предотвращение насмешек"],
      targetHint: "напр. иностранное имя для корейского использования, корейское имя для иностранцев",
      purposeHint: "напр. корейцы могут называть естественно, сохраняя ощущение оригинала",
      styleHint: "напр. близкое к оригиналу, мягкое, изысканное, запоминаемое",
      avoidHint: "напр. неудобное произношение, звучит странно, слишком отличается от оригинала, детское",
      memoHint: "Оригинальное иностранное имя, происхождение/значение, основной контекст использования, предпочтительный стиль написания",
    },
  },
  fr: {
    self: {
      label: "Pour moi / Changement de nom", badge: "Changement personnel", headline: "Concevoir un nom pour le nouveau vous",
      desc: "Nous concevons un nom qui vous ressemble à un tournant de vie, en tenant compte de l'harmonie du nom de famille et de l'impression.",
      points: ["Reflet d'identité", "Harmonie avec le nom de famille", "Adéquation au changement", "Tournant de vie"],
      targetHint: "ex. changement de nom personnel, conception pour nouveau départ",
      purposeHint: "ex. un nom plus fidèle à moi, marquer un nouveau départ, m'exprimer avec le temps",
      styleHint: "ex. fort, doux, raffiné, chaleureux, profond, intemporel",
      avoidHint: "ex. trop commun, similaire au précédent, démodé, trop tendance, casse-langue",
      memoHint: "Raison du changement, sens ou hanja à inclure, priorité d'harmonie phonétique, considération légale",
    },
    child: {
      label: "Prénom d'enfant", badge: "Prénom de naissance", headline: "Concevoir un prénom pour toute la vie",
      desc: "Nous concevons un prénom qui ne vieillit pas, aimé et avec lequel grandir.",
      points: ["Utilisabilité à vie", "Prévention des moqueries", "Harmonie avec le nom de famille", "Vœux de la famille"],
      targetHint: "ex. premier enfant, deuxième fille, prénom du bébé",
      purposeHint: "ex. grandir brillant et droit, un prénom avec énergie d'amour et de vie stable",
      styleHint: "ex. clair, élégant, doux, raffiné, chaleureux, intemporel",
      avoidHint: "ex. trop commun, farceur, démodé, facile à moquer, trop tendance",
      memoHint: "Sens que les parents veulent inclure, caractère générationnel des frères/sœurs, prénoms à éviter, priorité d'harmonie avec le nom de famille",
    },
    brand: {
      label: "Nom de marque", badge: "Entreprise / Service", headline: "Un nom alliant première impression, confiance et évolutivité",
      desc: "Nous concevons des noms de marque extensibles à l'entreprise, au service et au canal.",
      points: ["Adéquation au secteur", "Fiabilité", "Évolutivité", "Risque de duplication"],
      targetHint: "ex. service de naming, marque de café, app d'horoscope, chaîne YouTube",
      purposeHint: "ex. fiable dès la première écoute, adapté à l'expansion future du service",
      styleHint: "ex. fiable, premium, distinct, global, évolutif",
      avoidHint: "ex. trop descriptif, démodé, risque de marque déposée, difficile à prononcer, générique",
      memoHint: "Secteur, audience cible, sens à inclure, différenciation des concurrents, direction d'expansion, exemples de marques à éviter",
    },
    pet: {
      label: "Nom d'animal", badge: "Nom d'animal", headline: "Concevoir un nom à appeler avec amour chaque jour",
      desc: "Nous concevons un nom d'animal facile à appeler et naturellement plein de chaleur.",
      points: ["Facilité d'appel", "Expression d'affection", "Prononciation adorable", "Évite l'infantilisme"],
      targetHint: "ex. nom de chien, nom de chat, nom de nouvel animal",
      purposeHint: "ex. coule naturellement chaque jour, adorable mais pas lassant",
      styleHint: "ex. adorable, doux, lumineux, mignon mais raffiné",
      avoidHint: "ex. trop commun, casse-langue, trop bête, trop tendance",
      memoHint: "Personnalité, race, première impression de l'animal, ton de surnom à utiliser, ce que le propriétaire souhaite",
    },
    stage: {
      label: "Nom de scène", badge: "Créateur / Alias", headline: "Concevoir un nom pour être mémorisé et appelé",
      desc: "Nous concevons des noms de scène et alias équilibrant individualité, sympathie et mémorabilité.",
      points: ["Mémorabilité", "Facilité de recherche", "Caractère", "Prononciation"],
      targetHint: "ex. nom YouTube, alias, surnom, nom d'auteur",
      purposeHint: "ex. mémorable dès la première écoute, pas excessif mais avec présence",
      styleHint: "ex. vif, sophistiqué, raffiné, mémorable, unique",
      avoidHint: "ex. difficile à rechercher, trop commun, casse-langue, enfantin, exagéré",
      memoHint: "Plateforme, âge cible, genre, style de parole/personnage, exposition globale, historique de pseudonymes",
    },
    korean_to_foreign: {
      label: "Coréen → Étranger", badge: "Traduction · C→E", headline: "Utiliser un nom coréen naturellement à l'étranger",
      desc: "Nous convertissons et concevons des noms coréens pour fonctionner naturellement en anglais, chinois, japonais et autres langues.",
      points: ["Prononciation locale naturelle", "Préservation du sens", "Prévention des malentendus culturels", "Stabilité orthographique"],
      targetHint: "ex. nom coréen pour l'étranger, nom en anglais/chinois/japonais",
      purposeHint: "ex. préserve le son et le sens coréen tout en paraissant naturel localement",
      styleHint: "ex. proche de l'original, porteur de sens, facile à prononcer, mémorable, international",
      avoidHint: "ex. trop différent de l'original, prononciation gênante, connotation négative, étrange dans certains pays",
      memoHint: "Nom coréen original, pays/région prioritaire, priorité de prononciation locale, préférence orthographique, notes culturelles",
    },
    foreign_to_korean: {
      label: "Étranger → Coréen", badge: "Traduction · E→C", headline: "Utiliser un nom étranger naturellement en coréen",
      desc: "Nous convertissons et concevons des noms étrangers en coréen naturel en préservant prononciation et nuance.",
      points: ["Proximité de l'original", "Naturalité coréenne", "Préservation de la nuance", "Prévention des moqueries"],
      targetHint: "ex. nom étranger pour usage coréen, nom coréen pour étrangers",
      purposeHint: "ex. que les Coréens puissent appeler naturellement en préservant le sentiment de l'original",
      styleHint: "ex. proche de l'original, doux, raffiné, mémorable",
      avoidHint: "ex. prononciation gênante, sonne étrange, trop différent de l'original, enfantin",
      memoHint: "Nom étranger original, origine/sens, contexte d'utilisation principal, style orthographique préféré",
    },
  },
  ar: {
    self: {
      label: "لنفسي / تغيير الاسم", badge: "تغيير شخصي", headline: "تصميم اسم للنسخة الجديدة منك",
      desc: "نصمم اسماً يشعرك أنه أنت في منعطف الحياة، مع مراعاة انسجام اللقب والانطباع.",
      points: ["انعكاس الهوية", "انسجام مع اللقب", "ملاءمة التغيير", "منعطف الحياة"],
      targetHint: "مثل: تغيير اسم شخصي، تصميم لبداية جديدة",
      purposeHint: "مثل: اسم أكثر تعبيراً عني، اسم لتأسيس بداية جديدة، اسم يعبر عني مع الوقت",
      styleHint: "مثل: قوي، ناعم، راقٍ، دافئ، عميق، خالد",
      avoidHint: "مثل: شائع جداً، مشابه للسابق، قديم، عصري جداً، صعب النطق",
      memoHint: "سبب التغيير، المعنى أو الحرف الصيني للتضمين، أولوية الانسجام الصوتي مع اللقب، الاعتبار القانوني",
    },
    child: {
      label: "اسم الطفل", badge: "تسمية الطفل", headline: "تصميم اسم مدى الحياة",
      desc: "نصمم اسماً لا يتقادم، محبوباً ومناسباً للنمو.",
      points: ["قابلية الاستخدام مدى الحياة", "منع السخرية", "انسجام مع اللقب", "أمنيات العائلة"],
      targetHint: "مثل: الطفل الأول، الابنة الثانية، اسم المولود",
      purposeHint: "مثل: ينمو مشرقاً وصادقاً، اسم يحمل طاقة الحب والحياة المستقرة",
      styleHint: "مثل: صافٍ، أنيق، ناعم، رقيق، دافئ، خالد",
      avoidHint: "مثل: شائع جداً، مرح، قديم، سهل السخرية منه، عصري جداً",
      memoHint: "المعنى الذي يريد الوالدان تضمينه، الحرف الجيلي للأشقاء، الأسماء الواجب تجنبها، أولوية الانسجام مع اللقب",
    },
    brand: {
      label: "اسم العلامة التجارية", badge: "أعمال / خدمة", headline: "اسم يجمع الانطباع الأول والثقة وقابلية التوسع",
      desc: "نصمم أسماء علامات تجارية قابلة للتوسع لأعمال وخدمات وقنوات.",
      points: ["ملاءمة القطاع", "الموثوقية", "قابلية التوسع", "مخاطر التكرار"],
      targetHint: "مثل: خدمة تسمية، علامة مقهى، تطبيق أبراج، قناة يوتيوب",
      purposeHint: "مثل: موثوق من أول سماع، مناسب للتوسع المستقبلي للخدمة",
      styleHint: "مثل: موثوق، فاخر، واضح، عالمي، قابل للتوسع",
      avoidHint: "مثل: وصفي جداً، قديم، خطر العلامة التجارية، صعب النطق، عام",
      memoHint: "القطاع، الجمهور المستهدف، المعنى للتضمين، التمييز عن المنافسين، اتجاه التوسع، أمثلة العلامات التجارية الواجب تجنبها",
    },
    pet: {
      label: "اسم الحيوان الأليف", badge: "اسم الحيوان", headline: "تصميم اسم للنداء بمحبة كل يوم",
      desc: "نصمم اسم حيوان أليف سهل النداء ومليء بالدفء بشكل طبيعي.",
      points: ["سهولة النداء", "التعبير عن المحبة", "نطق لطيف", "تجنب الطفولية"],
      targetHint: "مثل: اسم كلب، اسم قطة، اسم حيوان أليف جديد",
      purposeHint: "مثل: يجري بسلاسة كل يوم، محبوب لكن غير ممل",
      styleHint: "مثل: رائع، ناعم، مشرق، لطيف لكن راقٍ",
      avoidHint: "مثل: شائع جداً، صعب النطق، مضحك جداً، عصري جداً",
      memoHint: "شخصية الحيوان وسلالته وانطباعه الأول، نبرة اللقب المستخدم، ما يريده المالك",
    },
    stage: {
      label: "الاسم الفني", badge: "فنان / مبدع", headline: "تصميم اسم للتذكر والنداء",
      desc: "نصمم أسماء فنية وألقاباً بتوازن بين الفردية والمحبوبية وسهولة التذكر.",
      points: ["سهولة التذكر", "إمكانية البحث", "الشخصية", "النطق"],
      targetHint: "مثل: اسم يوتيوب، لقب، اسم مستعار، اسم مؤلف",
      purposeHint: "مثل: لا يُنسى من أول سماع، غير مبالغ فيه لكن حاضر",
      styleHint: "مثل: واضح، متطور، راقٍ، لا يُنسى، فريد",
      avoidHint: "مثل: صعب البحث عنه، شائع جداً، صعب النطق، طفولي، مبالغ فيه",
      memoHint: "المنصة، الفئة العمرية المستهدفة، النوع، أسلوب الكلام/الشخصية، الانتشار العالمي، تاريخ الأسماء المستعارة السابقة",
    },
    korean_to_foreign: {
      label: "كوري → أجنبي", badge: "ترجمة · ك→أ", headline: "استخدام الاسم الكوري بشكل طبيعي في الخارج",
      desc: "نحول ونصمم الأسماء الكورية لتعمل بشكل طبيعي بالإنجليزية والصينية واليابانية وغيرها.",
      points: ["نطق محلي طبيعي", "الحفاظ على المعنى", "منع سوء الفهم الثقافي", "استقرار الكتابة"],
      targetHint: "مثل: الاسم الكوري للخارج، اسم بالإنجليزية/الصينية/اليابانية",
      purposeHint: "مثل: يحافظ على الصوت والمعنى الكوري مع الشعور بالطبيعية محلياً",
      styleHint: "مثل: قريب من الأصل، يحمل معنى، سهل النطق، لا يُنسى، دولي",
      avoidHint: "مثل: مختلف كثيراً عن الأصل، نطق محرج، دلالة سلبية، غريب في بعض الدول",
      memoHint: "الاسم الكوري الأصلي، الدولة/المنطقة اللغوية ذات الأولوية، أولوية النطق المحلي، تفضيل الكتابة، ملاحظات ثقافية",
    },
    foreign_to_korean: {
      label: "أجنبي → كوري", badge: "ترجمة · أ→ك", headline: "استخدام الاسم الأجنبي بشكل طبيعي بالكورية",
      desc: "نحول ونصمم الأسماء الأجنبية إلى كورية طبيعية مع الحفاظ على النطق والظلال.",
      points: ["القرب من الأصل", "الطبيعية الكورية", "الحفاظ على الظلال", "منع السخرية"],
      targetHint: "مثل: اسم أجنبي للاستخدام الكوري، اسم كوري للأجانب",
      purposeHint: "مثل: يمكن للكوريين النداء بشكل طبيعي مع الحفاظ على إحساس الأصل",
      styleHint: "مثل: قريب من الأصل، ناعم، راقٍ، لا يُنسى",
      avoidHint: "مثل: نطق محرج، يبدو غريباً، مختلف كثيراً عن الأصل، طفولي",
      memoHint: "الاسم الأجنبي الأصلي، الأصل/المعنى، السياق الرئيسي للاستخدام، أسلوب الكتابة المفضل",
    },
  },
  hi: {
    self: {
      label: "अपने लिए / नाम बदलना", badge: "व्यक्तिगत नाम परिवर्तन", headline: "नए आप के लिए नाम डिज़ाइन करना",
      desc: "जीवन के मोड़ पर आपके जैसा महसूस होने वाला नाम डिज़ाइन करते हैं, उपनाम सामंजस्य और प्रभाव को ध्यान में रखते हुए।",
      points: ["पहचान का प्रतिबिंब", "उपनाम सामंजस्य", "नाम परिवर्तन उपयुक्तता", "जीवन का मोड़"],
      targetHint: "जैसे: व्यक्तिगत नाम परिवर्तन, नई शुरुआत के लिए नाम डिज़ाइन",
      purposeHint: "जैसे: मेरे जैसा अधिक सच्चा नाम, नई शुरुआत को चिह्नित करने वाला नाम, समय के साथ मुझे व्यक्त करने वाला",
      styleHint: "जैसे: मजबूत, कोमल, परिष्कृत, गर्म, गहरा, शाश्वत",
      avoidHint: "जैसे: बहुत सामान्य, पुराने नाम से मिलता-जुलता, पुराना, बहुत ट्रेंडी, जीभ फिसलाने वाला",
      memoHint: "नाम बदलने का कारण, शामिल करने का अर्थ या हंजा, उपनाम के साथ ध्वन्यात्मक सामंजस्य की प्राथमिकता, कानूनी विचार",
    },
    child: {
      label: "बच्चे का नाम", badge: "नवजात नामकरण", headline: "जीवनभर के लिए नाम डिज़ाइन करना",
      desc: "ऐसा नाम डिज़ाइन करते हैं जो कभी पुराना न पड़े, प्यारा हो और बढ़ता रहे।",
      points: ["आजीवन उपयोगिता", "उपहास रोकथाम", "उपनाम सामंजस्य", "परिवार की इच्छाएं"],
      targetHint: "जैसे: पहला बच्चा, दूसरी बेटी, नवजात का नाम",
      purposeHint: "जैसे: उज्जवल और सही तरीके से बढ़े, प्यार और स्थिर जीवन ऊर्जा वाला नाम",
      styleHint: "जैसे: स्पष्ट, सुव्यवस्थित, कोमल, सुरुचिपूर्ण, गर्म, शाश्वत",
      avoidHint: "जैसे: बहुत सामान्य, चुलबुला, पुराना, उपहास के लिए आसान, बहुत ट्रेंडी",
      memoHint: "माता-पिता शामिल करना चाहते अर्थ, भाई-बहन का पीढ़ीगत अक्षर, बचाने के नाम, उपनाम सामंजस्य प्राथमिकता",
    },
    brand: {
      label: "ब्रांड नाम", badge: "व्यवसाय / सेवा", headline: "पहली छाप, विश्वास और विस्तारयोग्यता को संतुलित करने वाला नाम",
      desc: "व्यवसाय, सेवा और चैनल में विस्तार योग्य ब्रांड नाम डिज़ाइन करते हैं।",
      points: ["उद्योग उपयुक्तता", "विश्वसनीयता", "विस्तारयोग्यता", "दोहराव का जोखिम"],
      targetHint: "जैसे: नामकरण सेवा, कैफे ब्रांड, ज्योतिष ऐप, YouTube चैनल",
      purposeHint: "जैसे: पहली सुनवाई में विश्वसनीय, भविष्य की सेवा विस्तार के लिए उपयुक्त",
      styleHint: "जैसे: विश्वसनीय, प्रीमियम, स्पष्ट, वैश्विक, विस्तारयोग्य",
      avoidHint: "जैसे: बहुत वर्णनात्मक, पुराना, ट्रेडमार्क जोखिम, उच्चारण कठिन, सामान्य",
      memoHint: "उद्योग, लक्षित दर्शक, शामिल करने का अर्थ, प्रतिस्पर्धियों से अंतर, विस्तार दिशा, बचाने के ब्रांड उदाहरण",
    },
    pet: {
      label: "पालतू जानवर का नाम", badge: "पालतू नामकरण", headline: "हर दिन प्यार से बुलाने के लिए नाम डिज़ाइन करना",
      desc: "पालतू जानवर का नाम डिज़ाइन करते हैं जो बुलाने में आसान और स्वाभाविक रूप से गर्मजोशी से भरा हो।",
      points: ["बुलाने में आसानी", "स्नेह अभिव्यक्ति", "प्यारा उच्चारण", "बचकानेपन से बचाव"],
      targetHint: "जैसे: कुत्ते का नाम, बिल्ली का नाम, नए पालतू जानवर का नाम",
      purposeHint: "जैसे: रोज़ाना स्वाभाविक रूप से बहे, प्यारा लेकिन न थकाने वाला",
      styleHint: "जैसे: आकर्षक, कोमल, चमकीला, प्यारा लेकिन परिष्कृत",
      avoidHint: "जैसे: बहुत सामान्य, जीभ फिसलाने वाला, बहुत मूर्खतापूर्ण, बहुत ट्रेंडी",
      memoHint: "पालतू जानवर का व्यक्तित्व, नस्ल, पहली छाप, उपनाम का स्वर, मालिक की इच्छा",
    },
    stage: {
      label: "स्टेज / कला नाम", badge: "क्रिएटर / उपनाम", headline: "याद रखने और बुलाने के लिए नाम डिज़ाइन करना",
      desc: "व्यक्तित्व, पसंद और यादगारता को संतुलित करते हुए स्टेज नाम और उपनाम डिज़ाइन करते हैं।",
      points: ["यादगारता", "खोज क्षमता", "चरित्र", "उच्चारण"],
      targetHint: "जैसे: YouTube नाम, उपनाम, निकनेम, लेखक का नाम",
      purposeHint: "जैसे: पहली सुनवाई में यादगार, अतिरिक्त नहीं लेकिन उपस्थिति के साथ",
      styleHint: "जैसे: ज्वलंत, परिष्कृत, सुरुचिपूर्ण, यादगार, अनूठा",
      avoidHint: "जैसे: खोजने में कठिन, बहुत सामान्य, जीभ फिसलाने वाला, बचकाना, अतिरंजित",
      memoHint: "प्लेटफॉर्म, लक्षित आयु, शैली, बोलने का ढंग/चरित्र, वैश्विक प्रदर्शन, पिछले उपनाम इतिहास",
    },
    korean_to_foreign: {
      label: "कोरियाई → विदेशी", badge: "नाम अनुवाद · क→व", headline: "विदेश में कोरियाई नाम का स्वाभाविक उपयोग",
      desc: "कोरियाई नामों को अंग्रेजी, चीनी, जापानी और अन्य भाषाओं में स्वाभाविक रूप से काम करने के लिए परिवर्तित और डिज़ाइन करते हैं।",
      points: ["स्थानीय उच्चारण की स्वाभाविकता", "अर्थ संरक्षण", "सांस्कृतिक गलतफहमी रोकथाम", "वर्तनी स्थिरता"],
      targetHint: "जैसे: विदेश के लिए कोरियाई नाम, अंग्रेजी/चीनी/जापानी नाम",
      purposeHint: "जैसे: कोरियाई ध्वनि और अर्थ को बनाए रखते हुए स्थानीय रूप से स्वाभाविक",
      styleHint: "जैसे: मूल के करीब, अर्थ संरक्षित, उच्चारण में आसान, यादगार, अंतरराष्ट्रीय",
      avoidHint: "जैसे: मूल से बहुत अलग, उच्चारण असहज, नकारात्मक अर्थ, कुछ देशों में अजीब",
      memoHint: "मूल कोरियाई नाम, प्राथमिकता देश/भाषा क्षेत्र, स्थानीय उच्चारण प्राथमिकता, वर्तनी वरीयता, सांस्कृतिक नोट्स",
    },
    foreign_to_korean: {
      label: "विदेशी → कोरियाई", badge: "नाम अनुवाद · व→क", headline: "कोरियाई में विदेशी नाम का स्वाभाविक उपयोग",
      desc: "उच्चारण और बारीकियों को संरक्षित करते हुए विदेशी नामों को प्राकृतिक कोरियाई में परिवर्तित और डिज़ाइन करते हैं।",
      points: ["मूल के करीब", "कोरियाई स्वाभाविकता", "बारीकी संरक्षण", "उपहास रोकथाम"],
      targetHint: "जैसे: कोरियाई उपयोग के लिए विदेशी नाम, विदेशियों के लिए कोरियाई नाम",
      purposeHint: "जैसे: कोरियाई लोग स्वाभाविक रूप से बुला सकें, मूल का अहसास बनाए रखते हुए",
      styleHint: "जैसे: मूल के करीब, कोमल, परिष्कृत, यादगार",
      avoidHint: "जैसे: उच्चारण असहज, अजीब लगता है, मूल से बहुत अलग, बचकाना",
      memoHint: "मूल विदेशी नाम, उत्पत्ति/अर्थ, मुख्य उपयोग संदर्भ, पसंदीदा वर्तनी शैली",
    },
  },
};

// ── Main Page ─────────────────────────────────────────────────

export default function DesignPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];

  const rawType = searchParams.get("type") || searchParams.get("category") || "child";
  const category: ValidCategory = isValidCategory(rawType) ? rawType : "child";
  const isChild = category === "child";
  const isBrand = category === "brand";
  const isKTF = category === "korean_to_foreign";
  const isFTK = category === "foreign_to_korean";
  const showGender = category === "child" || category === "stage" || category === "self";

  const [error, setError] = useState("");
  const [isLight, setIsLight] = useState(false);
  const [needsLogo, setNeedsLogo] = useState(false);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/${lang}/login?next=${encodeURIComponent(`/${lang}/design?type=${category}`)}`);
      }
    });
  }, [lang, category, router]);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Child-specific
  const [gender, setGender] = useState<"남자" | "여자" | "중성" | "">("");
  const [childOrder, setChildOrder] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");

  // Multi-chip selections
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedAvoids, setSelectedAvoids] = useState<string[]>([]);
  const [selectedScript, setSelectedScript] = useState("");

  // Korean→Foreign / Foreign→Korean 전용 상태
  const [ktfName, setKtfName] = useState("");
  const [ktfMethod, setKtfMethod] = useState("");
  const [ktfLang, setKtfLang] = useState("");
  const [ktfMood, setKtfMood] = useState("");
  const [ktfMemo, setKtfMemo] = useState("");
  const [ftkName, setFtkName] = useState("");
  const [ftkMethod, setFtkMethod] = useState("");
  const [ftkMood, setFtkMood] = useState("");
  const [ftkMemo, setFtkMemo] = useState("");

  // Free text fields (used as fallback / additional)
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentDone, setConsentDone] = useState(false);

  const [form, setForm] = useState<BriefPayload>({
    category,
    targetName: "",
    familyName: "",
    purpose: "",
    styleKeywords: "",
    avoidKeywords: "",
    targetCountry: COUNTRY_OPTIONS[lang][0].value,
    preferredScript: "",
    memo: "",
    needsGlobalPronunciation: true,
    needsStampPackage: false,
    needsDoorplatePackage: false,
    needsGiftCardPackage: true,
    lang: lang as BriefPayload["lang"],
  });

  const heroBackground = isLight
    ? "linear-gradient(180deg, rgba(255,249,235,0.98) 0%, rgba(255,244,220,0.96) 100%)"
    : "radial-gradient(circle at top left, rgba(103, 125, 255, 0.2), transparent 24%), linear-gradient(180deg, rgba(7, 17, 43, 0.97) 0%, rgba(4, 10, 30, 0.99) 100%)";

  const updateField = <K extends keyof BriefPayload>(key: K, value: BriefPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value, category, lang }));
  };

  const toggleChip = (
    list: string[],
    setList: (v: string[]) => void,
    chip: string
  ) => {
    setList(list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Build purpose from chips + free text
    const purposeParts = [...selectedPurposes];
    if (form.purpose.trim()) purposeParts.push(form.purpose.trim());
    const purposeFinal = purposeParts.join(", ");

    const styleParts = [...selectedStyles];
    if (form.styleKeywords.trim()) styleParts.push(form.styleKeywords.trim());
    const styleFinal = styleParts.join(", ");

    const avoidParts = [...selectedAvoids];
    if (form.avoidKeywords.trim()) avoidParts.push(form.avoidKeywords.trim());
    const avoidFinal = avoidParts.join(", ");

    if (!purposeFinal || !styleFinal) {
      setError(ui.required);
      return;
    }
    if (isChild && !birthDate) {
      setError(ui.requiredBirth);
      return;
    }

    const scriptFinal = selectedScript || form.preferredScript.trim();

    const payload: BriefPayload = {
      ...form,
      category,
      lang,
      needsLogoPackage: isBrand ? needsLogo : false,
      targetName: isChild && childOrder ? `${childOrder} (${form.targetName.trim()})` : form.targetName.trim(),
      familyName: form.familyName.trim(),
      purpose: purposeFinal,
      styleKeywords: styleFinal,
      avoidKeywords: avoidFinal,
      targetCountry: form.targetCountry,
      preferredScript: scriptFinal,
      birthDate: birthDate || undefined,
      birthTime: birthTime || undefined,
      gender: (gender || undefined) as BriefPayload["gender"],
      childOrder: childOrder || undefined,
      memo: form.memo.trim(),
    };

    setError("");
    sessionStorage.setItem("winkNamingBrief", JSON.stringify(payload));
    router.push(`/${lang}/result`);
  };

  // ── KTF / FTK 전용 submit ──────────────────────────────
  const handleKTFSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ktfName.trim()) { setError(lang === "ko" ? "한국 이름을 입력해 주세요." : "Please enter your Korean name."); return; }
    const payload: BriefPayload = {
      ...form,
      category: "korean_to_foreign",
      lang: lang as BriefPayload["lang"],
      targetName: ktfName.trim(),
      familyName: "",
      purpose: [ktfMethod, ktfLang].filter(Boolean).join(", ") || "발음 유사 변환",
      styleKeywords: ktfMood || "자연스러운",
      avoidKeywords: "",
      targetCountry: ktfLang || "미국/영어권",
      preferredScript: "로마자",
      memo: ktfMemo.trim(),
    };
    setError("");
    sessionStorage.setItem("winkNamingBrief", JSON.stringify(payload));
    router.push(`/${lang}/result`);
  };

  const handleFTKSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ftkName.trim()) { setError(lang === "ko" ? "이름을 입력해 주세요." : "Please enter a name."); return; }
    const payload: BriefPayload = {
      ...form,
      category: "foreign_to_korean",
      lang: lang as BriefPayload["lang"],
      targetName: ftkName.trim(),
      familyName: "",
      purpose: ftkMethod || "발음대로",
      styleKeywords: ftkMood || "자연스러운",
      avoidKeywords: "",
      targetCountry: "한국",
      preferredScript: "한글",
      memo: ftkMemo.trim(),
    };
    setError("");
    sessionStorage.setItem("winkNamingBrief", JSON.stringify(payload));
    router.push(`/${lang}/result`);
  };

  const categoryMap = CATEGORY_MAP[lang];
  const catUi = categoryMap[category];

  // ── KTF 전용 폼 상수 ──────────────────────────────────
  const KTF_METHODS = lang === "ko"
    ? ["발음 유사 변환 (사운드 기반)", "의미/분위기 기반 새 이름", "혼합 (발음+의미)"]
    : ["Sound-based conversion", "Meaning/mood based new name", "Mixed (sound + meaning)"];
  const KTF_LANGS = lang === "ko"
    ? ["영어권", "중화권", "일본", "프랑스", "스페인", "기타"]
    : ["English", "Chinese", "Japanese", "French", "Spanish", "Other"];
  const KTF_MOODS = lang === "ko"
    ? ["세련된", "친근한", "강한", "우아한", "현대적", "클래식"]
    : ["Sophisticated", "Friendly", "Strong", "Elegant", "Modern", "Classic"];

  const FTK_METHODS = lang === "ko"
    ? ["발음대로 (석호필 스타일)", "순수 한글 이름 (하늘, 새벽)", "한국 배우/셀럽 느낌"]
    : ["By pronunciation (Korean-style)", "Pure Korean name (Haneul, Saebyeok)", "Korean celebrity style"];
  const FTK_MOODS = lang === "ko"
    ? ["활발한", "조용한", "카리스마", "따뜻한", "지적인", "예술적"]
    : ["Energetic", "Calm", "Charismatic", "Warm", "Intellectual", "Artistic"];

  // ── 한국이름 → 외국이름 전용 폼 ─────────────────────────
  if (isKTF) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <section className="wink-panel" style={{ marginBottom: 24, padding: "28px 24px", background: heroBackground }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(201,168,76,0.75)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
              {lang === "ko" ? "한국이름 → 외국이름" : "Korean Name → Foreign Name"}
            </div>
            <h1 className="wink-title" style={{ marginBottom: 8 }}>
              {lang === "ko" ? "해외에서 통하는 이름으로" : "Find Your Global Name"}
            </h1>
            <p className="wink-sub">
              {lang === "ko"
                ? "한국 이름의 발음·의미를 기반으로 해외에서 자연스럽게 불릴 수 있는 이름을 3가지 방향으로 설계합니다."
                : "We design 3 versions of your Korean name that feel natural abroad — based on sound, meaning, or both."}
            </p>
          </section>
          <form onSubmit={handleKTFSubmit} className="wink-form">
            {error && <div style={{ color: "#e05c5c", fontSize: 14, padding: "10px 0" }}>{error}</div>}

            {/* ① 한국 이름 입력 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "① 나의 한국 이름" : "① Your Korean Name"}</h2>
              </div>
              <input
                className="wink-input"
                value={ktfName}
                onChange={(e) => setKtfName(e.target.value)}
                placeholder={lang === "ko" ? "예: 이인홍, 김민준" : "e.g. Lee In-hong, Kim Min-jun"}
                required
              />
            </section>

            {/* ② 변환 방식 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "② 변환 방식" : "② Conversion Style"}</h2>
              </div>
              <ChipGroup chips={KTF_METHODS} selected={ktfMethod ? [ktfMethod] : []} onToggle={(c) => setKtfMethod(ktfMethod === c ? "" : c)} single />
            </section>

            {/* ③ 원하는 언어권 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "③ 원하는 언어권" : "③ Target Language"}</h2>
              </div>
              <ChipGroup chips={KTF_LANGS} selected={ktfLang ? [ktfLang] : []} onToggle={(c) => setKtfLang(ktfLang === c ? "" : c)} single />
            </section>

            {/* ④ 분위기 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "④ 원하는 분위기" : "④ Desired Mood"}</h2>
              </div>
              <ChipGroup chips={KTF_MOODS} selected={ktfMood ? [ktfMood] : []} onToggle={(c) => setKtfMood(ktfMood === c ? "" : c)} single />
            </section>

            {/* ⑤ 추가 요청사항 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "⑤ 추가 요청사항" : "⑤ Additional Notes"}</h2>
              </div>
              <textarea
                className="wink-textarea"
                rows={3}
                value={ktfMemo}
                onChange={(e) => setKtfMemo(e.target.value)}
                placeholder={lang === "ko" ? "특별히 원하는 느낌이나 피하고 싶은 이름 스타일이 있으면 적어 주세요." : "Any special requests or styles to avoid?"}
              />
            </section>

            <div className="wink-actions" style={{ marginTop: 16 }}>
              <button type="button" className="wink-secondary-btn" onClick={() => router.push(`/${lang}/category`)}>{ui.back}</button>
              <button type="submit" className="wink-primary-btn">{ui.start}</button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // ── 외국이름 → 한국이름 전용 폼 ─────────────────────────
  if (isFTK) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <section className="wink-panel" style={{ marginBottom: 24, padding: "28px 24px", background: heroBackground }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(201,168,76,0.75)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
              {lang === "ko" ? "외국이름 → 한국이름" : "Foreign Name → Korean Name"}
            </div>
            <h1 className="wink-title" style={{ marginBottom: 8 }}>
              {lang === "ko" ? "한글로 불릴 나만의 이름" : "Your Name, in Korean"}
            </h1>
            <p className="wink-sub">
              {lang === "ko"
                ? "외국 이름의 발음과 뉘앙스를 살리면서, 한글로 자연스럽게 불릴 수 있는 이름 3가지를 설계합니다."
                : "We design 3 Korean names that capture the sound and feel of your foreign name."}
            </p>
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", fontSize: 13, color: "var(--gold-main)", lineHeight: 1.7 }}>
              {lang === "ko"
                ? "✦ 한글로 표기하면 어떻게 될까요? 이름마다 「한글의 위대함」을 느낄 수 있는 표기도 함께 안내합니다."
                : "✦ See how beautifully your name looks in Hangul — the Korean script known for its elegance and logic."}
            </div>
          </section>
          <form onSubmit={handleFTKSubmit} className="wink-form">
            {error && <div style={{ color: "#e05c5c", fontSize: 14, padding: "10px 0" }}>{error}</div>}

            {/* ① 이름 입력 (풀네임, 성씨 없음) */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "① 이름 입력 (풀네임)" : "① Your Full Name"}</h2>
                <p className="wink-section-desc">
                  {lang === "ko" ? "성씨를 포함한 풀네임을 입력해 주세요." : "Please enter your full name (first and last)."}
                </p>
              </div>
              <input
                className="wink-input"
                value={ftkName}
                onChange={(e) => setFtkName(e.target.value)}
                placeholder={lang === "ko" ? "예: Michael Scofield, Emma, Pierre" : "e.g. Michael Scofield, Emma, Pierre"}
                required
              />
            </section>

            {/* ② 변환 방식 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "② 변환 방식" : "② Conversion Style"}</h2>
              </div>
              <ChipGroup chips={FTK_METHODS} selected={ftkMethod ? [ftkMethod] : []} onToggle={(c) => setFtkMethod(ftkMethod === c ? "" : c)} single />
            </section>

            {/* ③ 성격/분위기 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "③ 성격 / 분위기" : "③ Personality / Mood"}</h2>
              </div>
              <ChipGroup chips={FTK_MOODS} selected={ftkMood ? [ftkMood] : []} onToggle={(c) => setFtkMood(ftkMood === c ? "" : c)} single />
            </section>

            {/* ④ 추가 요청사항 */}
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{lang === "ko" ? "④ 추가 요청사항" : "④ Additional Notes"}</h2>
              </div>
              <textarea
                className="wink-textarea"
                rows={3}
                value={ftkMemo}
                onChange={(e) => setFtkMemo(e.target.value)}
                placeholder={lang === "ko" ? "피하고 싶은 이름 스타일이나 특별한 요청이 있으면 적어 주세요." : "Any styles to avoid or special requests?"}
              />
            </section>

            <div className="wink-actions" style={{ marginTop: 16 }}>
              <button type="button" className="wink-secondary-btn" onClick={() => router.push(`/${lang}/category`)}>{ui.back}</button>
              <button type="submit" className="wink-primary-btn">{ui.start}</button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>

        {/* Hero panel */}
        <section
          className="wink-panel"
          style={{
            marginBottom: 24,
            padding: "30px 24px",
            background: heroBackground,
            border: isLight ? "1px solid rgba(160,120,60,0.22)" : "1px solid rgba(120, 160, 255, 0.16)",
            boxShadow: isLight ? "0 18px 50px rgba(80,55,20,0.12)" : "0 24px 80px rgba(0, 0, 0, 0.24)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid var(--line-gold)",
              color: "var(--gold-main)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {catUi.badge}
          </div>

          <h1 className="wink-title" style={{ marginBottom: 12 }}>
            {ui.title}
          </h1>
          <p className="wink-sub" style={{ marginBottom: 18 }}>
            {ui.sub}
          </p>

          <div
            className="wink-panel"
            style={{
              padding: 18,
              background: isLight ? "rgba(255,251,240,0.96)" : "rgba(6, 14, 36, 0.42)",
              border: isLight ? "1px solid rgba(160,120,60,0.18)" : "1px solid rgba(120, 160, 255, 0.12)",
            }}
          >
            <div className="wink-result-label" style={{ marginBottom: 8 }}>
              {ui.selectedCategory}
            </div>
            <div className="wink-section-title" style={{ marginBottom: 8, fontSize: 28 }}>
              {catUi.headline}
            </div>
            <div className="wink-result-text" style={{ marginBottom: 14 }}>
              {catUi.desc}
            </div>
            <div className="wink-actions" style={{ flexWrap: "wrap", gap: 10 }}>
              {catUi.points.map((point) => (
                <PremiumPill key={point} text={point} />
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section
          className="wink-panel"
          style={{
            marginBottom: 24,
            ...(isBrand && {
              border: isLight ? "1px solid rgba(155,127,224,0.30)" : "1px solid rgba(155,127,224,0.22)",
              background: isLight
                ? "linear-gradient(170deg, rgba(240,234,255,0.98), rgba(250,247,255,0.96))"
                : "linear-gradient(170deg, rgba(155,127,224,0.10) 0%, rgba(8,18,48,0.94) 60%)",
            }),
          }}
        >
          <div className="wink-section-head">
            <h2 className="wink-section-title">
              {isBrand ? ui.brandPhilosophyTitle : ui.philosophyTitle}
            </h2>
          </div>
          <div className="wink-form" style={{ gap: 12 }}>
            {isBrand ? (
              <>
                <div className="wink-result-text">{ui.brandPhilosophy1}</div>
                <div className="wink-result-text">{ui.brandPhilosophy2}</div>
                <div className="wink-result-text">{ui.brandPhilosophy3}</div>
              </>
            ) : (
              <>
                <div className="wink-result-text">{ui.philosophy1}</div>
                <div className="wink-result-text">{ui.philosophy2}</div>
                <div className="wink-result-text">{ui.philosophy3}</div>
              </>
            )}
          </div>
        </section>


        {/* ── 개인정보 동의 ── */}
        {!consentDone && (
          <section className="wink-panel" style={{ marginBottom: 24 }}>
            <div className="wink-section-title" style={{ marginBottom: 12 }}>
              {lang === "ko" ? "서비스 이용 동의" : lang === "ja" ? "利用規約への同意" : lang === "zh" ? "服务使用同意" : "Consent to Use Service"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "privacy", label: lang === "ko" ? "개인정보처리방침 동의 (필수)" : lang === "ja" ? "プライバシーポリシーへの同意（必須）" : lang === "zh" ? "个人信息处理方针同意（必填）" : "Privacy Policy Agreement (Required)", href: `/${lang}/privacy`, required: true, checked: consentPrivacy, set: setConsentPrivacy },
                { key: "terms", label: lang === "ko" ? "서비스 이용약관 동의 (필수)" : lang === "ja" ? "利用規約への同意（必須）" : lang === "zh" ? "服务条款同意（必填）" : "Terms of Service Agreement (Required)", href: `/${lang}/terms`, required: true, checked: consentTerms, set: setConsentTerms },
                { key: "marketing", label: lang === "ko" ? "마케팅 정보 수신 동의 (선택)" : lang === "ja" ? "マーケティング情報の受信（任意）" : lang === "zh" ? "营销信息接收同意（可选）" : "Marketing Communications (Optional)", href: null, required: false, checked: consentMarketing, set: setConsentMarketing },
              ].map(({ key, label, href, required, checked, set }) => (
                <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                    style={{ marginTop: 3, width: 18, height: 18, accentColor: "var(--gold-main)", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.6 }}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--gold-main)", textDecoration: "underline", marginRight: 4 }}>
                        {label}
                      </a>
                    ) : label}
                    {required && <span style={{ color: "#e05c5c", marginLeft: 4 }}>*</span>}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={!consentPrivacy || !consentTerms}
              onClick={() => setConsentDone(true)}
              style={{
                marginTop: 20,
                width: "100%",
                minHeight: 48,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: !consentPrivacy || !consentTerms ? "not-allowed" : "pointer",
                border: "none",
                background: !consentPrivacy || !consentTerms
                  ? "var(--line-strong)"
                  : "linear-gradient(135deg, var(--gold-main), #c9943a)",
                color: !consentPrivacy || !consentTerms ? "var(--text-dim)" : "#fff",
                transition: "all 0.2s ease",
              }}
            >
              {lang === "ko" ? "동의하고 이름 설계 시작하기" : lang === "ja" ? "同意して名前設計を始める" : lang === "zh" ? "同意并开始命名设计" : "Agree and Start Naming Design"}
            </button>
          </section>
        )}

        <form onSubmit={handleSubmit} className="wink-form" style={!consentDone ? { opacity: 0.3, pointerEvents: "none", userSelect: "none" } : {}}>

          {/* Section 1: Design target */}
          <section className="wink-form-section">
            <div className="wink-section-head">
              <h2 className="wink-section-title">{ui.sections.target}</h2>
              <p className="wink-section-desc">{ui.sections.targetDesc}</p>
            </div>

            <div className="wink-form-grid">
              {/* Gender selection — 사람 이름 카테고리만 표시 */}
              {showGender && (
                <div className="wink-field wink-field-full">
                  <label>{ui.fields.genderLabel}</label>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {(["여자", "남자", "중성"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(gender === g ? "" : g)}
                        style={{
                          flex: 1,
                          padding: "14px 0",
                          borderRadius: 14,
                          fontSize: 15,
                          fontWeight: gender === g ? 800 : 500,
                          cursor: "pointer",
                          border: gender === g ? "2px solid var(--gold-main)" : "1px solid var(--line-strong)",
                          background: gender === g ? "var(--gold-soft)" : "transparent",
                          color: gender === g ? "var(--gold-main)" : "var(--text-soft)",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {g === "여자" ? ui.fields.genderFemale : g === "남자" ? ui.fields.genderMale : ui.fields.genderNeutral}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Child order chips */}
              {isChild && (
                <div className="wink-field wink-field-full">
                  <label>{ui.fields.childOrder}</label>
                  <ChipGroup
                    chips={CHILD_ORDER_CHIPS[lang]}
                    selected={childOrder ? [childOrder] : []}
                    onToggle={(chip) => setChildOrder(childOrder === chip ? "" : chip)}
                    single
                  />
                </div>
              )}

              {/* Target name */}
              {!isChild && (
                <div className="wink-field">
                  <label>{ui.fields.targetName}</label>
                  <input
                    value={form.targetName}
                    onChange={(e) => updateField("targetName", e.target.value)}
                    placeholder={catUi.targetHint}
                    className="wink-input"
                  />
                </div>
              )}

              {/* Family name — 브랜드는 성씨 불필요 */}
              {!isBrand && (
                <div className="wink-field">
                  <label>{ui.fields.familyName}</label>
                  <input
                    value={form.familyName}
                    onChange={(e) => updateField("familyName", e.target.value)}
                    placeholder={ui.fields.familyNamePh}
                    className="wink-input"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Birth date/time (child only) */}
          {isChild && (
            <section className="wink-form-section">
              <div className="wink-section-head">
                <h2 className="wink-section-title">{ui.sections.birth}</h2>
                <p className="wink-section-desc">{ui.sections.birthDesc}</p>
              </div>
              <div className="wink-form-grid">
                <div className="wink-field">
                  <label>
                    {ui.fields.birthDate}
                    <span style={{ color: "var(--gold-main)", marginLeft: 4 }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="wink-input"
                    required={isChild}
                  />
                </div>
                <div className="wink-field">
                  <label>{ui.fields.birthTime}</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="wink-input"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Core design info */}
          <section className="wink-form-section">
            <div className="wink-section-head">
              <h2 className="wink-section-title">{ui.sections.core}</h2>
              <p className="wink-section-desc">{ui.sections.coreDesc}</p>
            </div>

            <div className="wink-form-grid">
              {/* Purpose chips + free text */}
              <div className="wink-field wink-field-full">
                <label>{ui.fields.purpose}</label>
                <ChipGroup
                  chips={PURPOSE_CHIPS[lang][category]}
                  selected={selectedPurposes}
                  onToggle={(chip) => toggleChip(selectedPurposes, setSelectedPurposes, chip)}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>{ui.orTypeFree}</div>
                <textarea
                  value={form.purpose}
                  onChange={(e) => updateField("purpose", e.target.value)}
                  placeholder={catUi.purposeHint}
                  className="wink-textarea"
                  rows={2}
                  style={{ marginTop: 6 }}
                />
              </div>

              {/* Style chips + free text */}
              <div className="wink-field">
                <label>{ui.fields.styleKeywords}</label>
                <ChipGroup
                  chips={STYLE_CHIPS[lang][category]}
                  selected={selectedStyles}
                  onToggle={(chip) => toggleChip(selectedStyles, setSelectedStyles, chip)}
                />
                <input
                  value={form.styleKeywords}
                  onChange={(e) => updateField("styleKeywords", e.target.value)}
                  placeholder={catUi.styleHint}
                  className="wink-input"
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* Avoid chips + free text */}
              <div className="wink-field">
                <label>{ui.fields.avoidKeywords}</label>
                <ChipGroup
                  chips={AVOID_CHIPS[lang][category]}
                  selected={selectedAvoids}
                  onToggle={(chip) => toggleChip(selectedAvoids, setSelectedAvoids, chip)}
                />
                <input
                  value={form.avoidKeywords}
                  onChange={(e) => updateField("avoidKeywords", e.target.value)}
                  placeholder={catUi.avoidHint}
                  className="wink-input"
                  style={{ marginTop: 8 }}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Usage context */}
          <section className="wink-form-section">
            <div className="wink-section-head">
              <h2 className="wink-section-title">{ui.sections.usage}</h2>
              <p className="wink-section-desc">{ui.sections.usageDesc}</p>
            </div>

            <div className="wink-form-grid">
              {/* Country dropdown */}
              <div className="wink-field">
                <label>{ui.fields.targetCountry}</label>
                <div className="wink-select-wrap" style={{ marginTop: 4 }}>
                  <select
                    className="wink-select"
                    value={form.targetCountry}
                    onChange={(e) => updateField("targetCountry", e.target.value)}
                    style={{ width: "100%", minHeight: 48, borderRadius: 12, paddingInline: 14 }}
                  >
                    {COUNTRY_OPTIONS[lang].map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Script chips */}
              <div className="wink-field">
                <label>{ui.fields.preferredScript}</label>
                <ChipGroup
                  chips={SCRIPT_CHIPS[lang]}
                  selected={selectedScript ? [selectedScript] : []}
                  onToggle={(chip) => setSelectedScript(selectedScript === chip ? "" : chip)}
                  single
                />
              </div>
            </div>
          </section>

          {/* Brand-only: AI 로고 패키지 추가 옵션 */}
          {isBrand && (
            <section className="wink-form-section" style={{
              border: needsLogo
                ? "1px solid rgba(155,127,224,0.55)"
                : undefined,
              background: needsLogo
                ? (isLight ? "linear-gradient(160deg,rgba(240,234,255,0.98),rgba(250,247,255,0.96))" : "linear-gradient(160deg,rgba(155,127,224,0.12),rgba(8,18,48,0.92))")
                : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                      padding: "4px 10px", borderRadius: 999,
                      background: "rgba(155,127,224,0.18)", color: "#9B7FE0",
                      border: "1px solid rgba(155,127,224,0.35)",
                    }}>
                      ADD-ON
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>+ ₩29,000</span>
                  </div>
                  <div className="wink-section-title" style={{ marginBottom: 6 }}>
                    AI 로고 패키지
                  </div>
                  <div className="wink-result-text" style={{ fontSize: 13.5, lineHeight: 1.8 }}>
                    브랜드명 확정 후 로고 심볼 · 컬러 팔레트 · 워터마크를 AI로 생성합니다.
                    SNS 프로필, 명함, 간판에 바로 사용 가능한 파일로 제공됩니다.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNeedsLogo((v) => !v)}
                  style={{
                    flexShrink: 0,
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: needsLogo ? "2px solid #9B7FE0" : "1px solid var(--line-strong)",
                    background: needsLogo ? "linear-gradient(135deg,#9B7FE0,#b89ff0)" : "transparent",
                    color: needsLogo ? "#fff" : "var(--text-soft)",
                    transition: "all 0.18s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {needsLogo ? "✓ 추가됨" : "추가하기"}
                </button>
              </div>
            </section>
          )}

          {/* Section 5: Additional memo */}
          <section className="wink-form-section">
            <div className="wink-section-head">
              <h2 className="wink-section-title">{ui.sections.context}</h2>
              <p className="wink-section-desc">{ui.sections.contextDesc}</p>
            </div>

            {/* 돌림자 hint box */}
            <div
              className="wink-panel"
              style={{
                marginBottom: 12,
                padding: "14px 16px",
                background: "var(--gold-soft)",
                border: "1px solid var(--line-gold)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--gold-main)", fontSize: 14 }}>
                {ui.fields.memoHintTitle}
              </div>
              <div className="wink-result-text" style={{ fontSize: 13, opacity: 0.85 }}>
                {ui.fields.memoHintBody}
              </div>
            </div>

            <div className="wink-field">
              <label>{ui.fields.memo}</label>
              <textarea
                value={form.memo}
                onChange={(e) => updateField("memo", e.target.value)}
                placeholder={catUi.memoHint}
                className="wink-textarea"
                rows={5}
              />
            </div>
          </section>

          {error ? <div className="wink-error-banner">{error}</div> : null}

          <div className="wink-actions wink-actions-between">
            <button type="button" className="wink-secondary-btn" onClick={() => router.back()}>
              {ui.back}
            </button>
            <button type="submit" className="wink-primary-btn">
              {ui.start}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
