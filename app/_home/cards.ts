import { type CatId } from "./categories";
import { type Lang } from "./lang";

export type BaseCard = { cat: CatId; type: string };

export type KoreanNameCard = BaseCard & {
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

export type ChildCard = BaseCard & {
  type: "child";
  surname: string;
  name: string;
  fullHanja: string;
  roman: string;
  meaning: string;
  story: string;
};

export type SelfCard = BaseCard & {
  type: "self";
  surname: string;
  name: string;
  fullHanja: string;
  roman: string;
  meaning: string;
  story: string;
};

export type StageCard = BaseCard & {
  type: "stage";
  stageName: string;
  roman: string;
  field: string;
  meaning: string;
  story: string;
};

export type PetCard = BaseCard & {
  type: "pet";
  name: string;
  english: string;
  animal: string;
  meaning: string;
  story: string;
};

export type ForeignCard = BaseCard & {
  type: "foreign";
  koreanName: string;
  foreignName: string;
  foreignLang: string;
  meaning: string;
  story: string;
};

export type GoodsCard = BaseCard & {
  type: "goods";
  visual: "hat" | "tumbler" | "magnet" | "stamp";
  productName: string;
  engravedName: string;
  material: string;
  price: string;
  tagline: string;
  desc: string;
};

export type AnyCard = KoreanNameCard | ChildCard | SelfCard | StageCard | PetCard | ForeignCard | GoodsCard;

export const ALL_CARDS: Record<CatId, AnyCard[]> = {
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
  "self": [
    { cat: "self", type: "self", surname: "이", name: "다온", fullHanja: "李茶溫", roman: "Lee Da-on", meaning: "따뜻하고 온화한 새로운 시작", story: "개명을 원하시는 분들을 위한 예시입니다. 기존 성씨를 유지하며 '다온(茶溫)' — 따뜻하고 온화한 — 새로운 인상으로 설계했습니다." },
    { cat: "self", type: "self", surname: "정", name: "유안", fullHanja: "鄭有安", roman: "Jeong Yu-an", meaning: "평안이 깃든 새로운 나", story: "삶의 전환점에서 평안과 안정을 바라며 '유안(有安)'으로 설계했습니다. 정(鄭) 성씨와의 음운 조화도 함께 고려했습니다." },
  ],
  "stage": [
    { cat: "stage", type: "stage", stageName: "루하", roman: "Ru-ha", field: "🎤 가수 · 배우", meaning: "물 흐르듯 자유롭고 세련된 존재감", story: "부르기 쉽고 국제적으로도 발음하기 좋은 음절 조합. 개성 있는 활동명으로 SNS·검색에도 유리하게 설계했습니다." },
    { cat: "stage", type: "stage", stageName: "이든", roman: "Eden", field: "🎬 크리에이터", meaning: "낙원처럼 편안하고 매력적인 이름", story: "영어 발음과도 자연스럽게 어울리는 크리에이터용 활동명. 기억하기 쉬우면서도 개성이 살아있습니다." },
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
export type KNTrans = { meaning: string; story: string };

export type GoodsTrans = { tagline: string; desc: string };

export type CardTransByCat = { "korean-name": KNTrans[]; "child": KNTrans[]; "self": KNTrans[]; "stage": KNTrans[]; "pet": KNTrans[]; "foreign": KNTrans[]; "goods": GoodsTrans[] };

export const CARD_TRANS_BY_LANG: Record<Lang, CardTransByCat> = {
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
    "self": [
      { meaning: "따뜻하고 온화한 새로운 시작", story: "개명을 원하시는 분들을 위한 예시입니다. 기존 성씨를 유지하며 '다온(茶溫)' — 따뜻하고 온화한 — 새로운 인상으로 설계했습니다." },
      { meaning: "평안이 깃든 새로운 나", story: "삶의 전환점에서 평안과 안정을 바라며 '유안(有安)'으로 설계했습니다. 정(鄭) 성씨와의 음운 조화도 함께 고려했습니다." },
    ],
    "stage": [
      { meaning: "물 흐르듯 자유롭고 세련된 존재감", story: "부르기 쉽고 국제적으로도 발음하기 좋은 음절 조합. 개성 있는 활동명으로 SNS·검색에도 유리하게 설계했습니다." },
      { meaning: "낙원처럼 편안하고 매력적인 이름", story: "영어 발음과도 자연스럽게 어울리는 크리에이터용 활동명. 기억하기 쉬우면서도 개성이 살아있습니다." },
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
    "self": [
      { meaning: "A warm and gentle new beginning", story: "An example for those seeking a legal name change. Keeping the original surname, we designed '다온 (茶溫)' — warm and gentle — for a fresh new impression." },
      { meaning: "A new self rooted in peace", story: "Designed as '유안 (有安)' for those wishing peace and stability at a turning point in life, while balancing phonetic harmony with the Jeong (鄭) surname." },
    ],
    "stage": [
      { meaning: "A free, refined presence flowing like water", story: "An easy-to-call syllable combination that also sounds natural internationally. Designed to be favorable for SNS and search as a distinctive stage name." },
      { meaning: "A comfortable, appealing name like paradise", story: "A creator's stage name that blends naturally with English pronunciation. Easy to remember while keeping a distinct personality." },
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
    "self": [
      { meaning: "温かく穏やかな新しい始まり", story: "改名をご希望の方のための例です。既存の姓を残しながら「다온（茶溫）」—温かく穏やかな—新しい印象で設計しました。" },
      { meaning: "安らぎの宿る新しい自分", story: "人生の転換点で平安と安定を願い「유안（有安）」を設計。鄭（チョン）姓との音韻調和も考慮しています。" },
    ],
    "stage": [
      { meaning: "水のように自由で洗練された存在感", story: "呼びやすく国際的にも発音しやすい音節の組み合わせ。個性的な活動名としてSNS·検索にも有利に設計しました。" },
      { meaning: "楽園のように心地よく魅力的な名前", story: "英語の発音とも自然に馴染むクリエイター向けの活動名。覚えやすく個性も感じられます。" },
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
    "self": [
      { meaning: "温暖而平和的新开始", story: "为希望改名的您提供的示例。保留原姓氏，设计出「다온（茶溫）」——温暖平和——的全新形象。" },
      { meaning: "安宁常驻的全新自我", story: "为在人生转折点渴望平安与稳定的您设计「유안（有安）」，同时兼顾与郑（鄭）姓的音韵和谐。" },
    ],
    "stage": [
      { meaning: "如水般自由洗练的存在感", story: "易于称呼、国际发音也顺畅的音节组合。作为个性化艺名，在社交媒体和搜索中也更具优势。" },
      { meaning: "如乐园般舒适迷人的名字", story: "与英语发音自然契合的创作者艺名。易于记忆同时不失个性。" },
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
    "self": [
      { meaning: "Un nuevo comienzo cálido y sereno", story: "Un ejemplo para quienes buscan un cambio de nombre. Manteniendo el apellido original, diseñamos '다온 (茶溫)' — cálido y sereno — para una nueva impresión." },
      { meaning: "Un nuevo yo arraigado en la paz", story: "Diseñado como '유안 (有安)' para quienes desean paz y estabilidad en un punto de inflexión, equilibrando la armonía fonética con el apellido Jeong (鄭)." },
    ],
    "stage": [
      { meaning: "Una presencia libre y refinada, fluida como el agua", story: "Una combinación de sílabas fácil de llamar y también natural en pronunciación internacional. Diseñado para ser favorable en redes sociales y búsquedas." },
      { meaning: "Un nombre cómodo y atractivo como el paraíso", story: "Un nombre artístico para creadores que combina naturalmente con la pronunciación en inglés. Fácil de recordar y lleno de personalidad." },
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
    "self": [
      { meaning: "Un nouveau départ chaleureux et serein", story: "Un exemple pour ceux qui souhaitent changer de nom. En conservant le nom de famille d'origine, nous avons conçu '다온 (茶溫)' — chaleureux et serein." },
      { meaning: "Un nouveau moi ancré dans la paix", story: "Conçu comme '유안 (有安)' pour ceux qui souhaitent la paix et la stabilité à un tournant de leur vie, en équilibrant l'harmonie phonétique avec le nom de famille Jeong (鄭)." },
    ],
    "stage": [
      { meaning: "Une présence libre et raffinée, fluide comme l'eau", story: "Une combinaison de syllabes facile à appeler et naturelle à prononcer à l'international. Conçu pour être favorable sur les réseaux sociaux et la recherche." },
      { meaning: "Un nom confortable et attrayant comme le paradis", story: "Un nom de scène pour créateurs qui se marie naturellement avec la prononciation anglaise. Facile à retenir tout en gardant une forte personnalité." },
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
    "self": [
      { meaning: "Тёплое и спокойное новое начало", story: "Пример для тех, кто хочет сменить имя. Сохранив исходную фамилию, мы создали «다온 (茶溫)» — тёплое и спокойное — для нового впечатления." },
      { meaning: "Новое я, укоренённое в спокойствии", story: "Создано как «유안 (有安)» для тех, кто желает мира и стабильности на переломном этапе жизни, с учётом гармонии с фамилией Чон (鄭)." },
    ],
    "stage": [
      { meaning: "Свободное, утончённое присутствие, текущее как вода", story: "Лёгкая для произношения комбинация слогов, звучащая естественно и на международном уровне. Создано для продвижения в соцсетях и поиске." },
      { meaning: "Комфортное, притягательное имя, как рай", story: "Сценическое имя для творческих людей, естественно сочетающееся с английским произношением. Легко запоминается и сохраняет индивидуальность." },
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
    "self": [
      { meaning: "بداية جديدة دافئة وهادئة", story: "مثال لمن يرغبون في تغيير الاسم. مع الحفاظ على اللقب الأصلي، صممنا «다온 (茶溫)» — دافئ وهادئ — لانطباع جديد." },
      { meaning: "ذات جديدة متجذرة في السلام", story: "صُمم «유안 (有安)» لمن يتمنون السلام والاستقرار في نقطة تحول بالحياة، مع مراعاة الانسجام الصوتي مع لقب Jeong (鄭)." },
    ],
    "stage": [
      { meaning: "حضور حر ورقيق يتدفق كالماء", story: "مزيج مقاطع سهل النداء وطبيعي النطق دولياً. صُمم ليكون مناسباً لمواقع التواصل والبحث كاسم فني مميز." },
      { meaning: "اسم مريح وجذاب كالجنة", story: "اسم فني للمبدعين يتناغم بشكل طبيعي مع النطق الإنجليزي. سهل التذكر ومليء بالشخصية." },
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
    "self": [
      { meaning: "गर्मजोशी भरी और शांत नई शुरुआत", story: "नाम बदलना चाहने वालों के लिए एक उदाहरण। मूल उपनाम बनाए रखते हुए, हमने '다온 (茶溫)' — गर्म और शांत — डिज़ाइन किया।" },
      { meaning: "शांति में निहित नया स्वरूप", story: "जीवन के मोड़ पर शांति और स्थिरता चाहने वालों के लिए '유안 (有安)' डिज़ाइन किया, साथ ही Jeong (鄭) उपनाम के साथ ध्वन्यात्मक सामंजस्य को भी ध्यान में रखा।" },
    ],
    "stage": [
      { meaning: "पानी की तरह स्वतंत्र और परिष्कृत उपस्थिति", story: "पुकारने में आसान और अंतरराष्ट्रीय स्तर पर भी स्वाभाविक उच्चारण वाला अक्षर संयोजन। सोशल मीडिया और खोज के लिए अनुकूल डिज़ाइन।" },
      { meaning: "स्वर्ग जैसा आरामदायक और आकर्षक नाम", story: "अंग्रेज़ी उच्चारण से स्वाभाविक रूप से मेल खाता क्रिएटर स्टेज नाम। याद रखने में आसान फिर भी व्यक्तित्व से भरपूर।" },
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

export function getCards(lang: Lang, catId: CatId): AnyCard[] {
  const base = ALL_CARDS[catId];
  const trans = (CARD_TRANS_BY_LANG[lang] ?? CARD_TRANS_BY_LANG.ko)[catId] as (KNTrans | GoodsTrans)[];
  return base.map((card, i) => ({ ...card, ...(trans[i] ?? {}) }));
}
