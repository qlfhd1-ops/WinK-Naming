"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { type AppLang, isSupportedLang } from "@/lib/lang-config";

const BRAND_NAME = "윙크 네이밍";

// ─── 6 categories ────────────────────────────────────────
type CategoryKey =
  | "child"
  | "self"
  | "brand"
  | "pet"
  | "stage"
  | "korean_to_foreign"
  | "foreign_to_korean";

const CATEGORY_ORDER: CategoryKey[] = [
  "child",
  "self",
  "brand",
  "pet",
  "stage",
  "korean_to_foreign",
  "foreign_to_korean",
];

const COPY = {
  ko: {
    chip: `${BRAND_NAME} Category`,
    title: "누구에게 이름을 설계하시겠어요?",
    sub: "이름은 생성이 아니라 설계입니다. 목적과 맥락에 맞는 이름 경험을 선택해주세요.",
    introTitle: `${BRAND_NAME}은 대상에 따라 다르게 이름을 설계합니다!`,
    introBody1:
      "아이 이름, 개명, 브랜드, 반려동물, 활동명, 한국이름↔외국이름 등 모두 설계기준이 다릅니다.",
    introBody2:
      "로그인을 하시면 월 1회 무료 작명 서비스를 이용할 수 있습니다.",
    pill1: "월 1회 무료 설계",
    pill2: "3개 이름 동시 추천",
    pill3: "이름 선물카드 증정",
    loginPrompt: "로그인하고 무료로 이름을 설계받으세요",
    loginBtn: "로그인",
    sectionTitle: "설계 대상을 선택해 주세요",
    sectionDesc: "지금 가장 필요한 이름 설계 대상을 선택해 다음 단계로 이동합니다.",
    startButton: "이 대상으로 시작하기",
    backHome: "처음으로",
    directOrderTitle: "이미 좋은 이름을 선물 받으셨군요.",
    directOrderBody: "그럼 도장과 문패는 필요하지 않으세요? 기존 이름으로 바로 제작 주문할 수 있습니다.",
    directOrderBtn: "도장 · 문패 바로 주문 →",
    cards: {
      child: {
        title: "아이 이름",
        desc: "평생 불릴 이름 설계",
        detail: "성씨 음운 조화, 한자 오행 획수, 놀림감 필터를 모두 반영해 아이에게 평생의 선물이 될 이름을 설계합니다.",
        tag: "출생 작명",
      },
      self: {
        title: "나에게 / 개명",
        desc: "새로운 나를 위한 이름 설계",
        detail: "삶의 전환점, 새 출발, 정체성 변화를 원하는 분을 위한 개명 설계입니다. 성씨 조화와 새 이름의 인상을 함께 반영합니다.",
        tag: "본인 개명",
      },
      brand: {
        title: "브랜드명",
        desc: "상호·서비스·채널을 위한 이름",
        detail: "첫인상, 신뢰감, 확장성, 상표 중복 리스크까지 함께 고려한 브랜드 이름을 설계합니다.",
        tag: "상호 / 서비스명",
      },
      pet: {
        title: "반려동물 이름",
        desc: "매일 다정하게 부를 이름",
        detail: "부르기 편하고 애정이 자연스럽게 담기는 반려 이름을 설계합니다.",
        tag: "반려 이름",
      },
      stage: {
        title: "활동명 / 예명",
        desc: "기억되고 불리기 좋은 이름",
        detail: "개성, 호감도, 기억성, 검색성을 함께 고려한 활동명과 예명을 설계합니다.",
        tag: "크리에이터 / 예명",
      },
      korean_to_foreign: {
        title: "한국이름 → 외국이름",
        desc: "한국 이름을 해외에서 자연스럽게",
        detail: "한국 이름의 발음·의미를 영어·중문·일어 등 외국어권에서 자연스럽게 쓸 수 있도록 변환·설계합니다.",
        tag: "이름 변환",
      },
      foreign_to_korean: {
        title: "외국이름 → 한국이름",
        desc: "외국 이름을 한국어로 자연스럽게",
        detail: "외국 이름의 발음과 뉘앙스를 살리면서 한국어로 자연스럽게 표기하거나 새 이름으로 설계합니다.",
        tag: "이름 변환",
      },
    },
  },
  en: {
    chip: `${BRAND_NAME} Category`,
    title: "Who is this name for?",
    sub: "A name is not just generated — it is designed for purpose and context.",
    introTitle: "Wink designs differently by target",
    introBody1:
      "Child names, brands, pets, stage names, and name translations all require different standards. Wink applies phonetic harmony, five elements stroke analysis, and teasing/pronunciation filters differently by target.",
    introBody2:
      "Choose your target, then describe purpose and direction in the next step and review results for free.",
    pill1: "1 free design/month",
    pill2: "3 names at once",
    pill3: "Name gift card included",
    loginPrompt: "Sign in to design names for free",
    loginBtn: "Sign In",
    sectionTitle: "Choose your design target",
    sectionDesc: "Select the target that best fits your current naming needs.",
    startButton: "Start with this target",
    backHome: "Back to Home",
    directOrderTitle: "Already have a name?",
    directOrderBody: "Order a stamp or door plate directly with your existing name — no naming session needed.",
    directOrderBtn: "Order Stamp · Door Plate →",
    cards: {
      child: {
        title: "Child Name",
        desc: "A name for a lifetime",
        detail: "Designed with family name phonetic harmony, five element stroke balance, and teasing filters — a lifelong gift.",
        tag: "Baby Naming",
      },
      self: {
        title: "For Myself / Rename",
        desc: "A new name for a new chapter",
        detail: "Designed for those at a turning point — a fresh start, identity shift, or legal name change. Balances family name harmony with the impression you want to carry forward.",
        tag: "Personal Rename",
      },
      brand: {
        title: "Brand Name",
        desc: "For business, service, or channel",
        detail: "Designed with first impression, trust, expandability, and trademark risk in mind.",
        tag: "Business / Service",
      },
      pet: {
        title: "Pet Name",
        desc: "A warm name for everyday calling",
        detail: "Designed to be easy to call and naturally filled with affection.",
        tag: "Pet Naming",
      },
      stage: {
        title: "Stage / Screen Name",
        desc: "A memorable name to be called",
        detail: "Designed balancing individuality, memorability, and searchability.",
        tag: "Creator / Alias",
      },
      korean_to_foreign: {
        title: "Korean Name → Foreign Name",
        desc: "Make a Korean name work abroad",
        detail: "Converts a Korean name into natural English, Chinese, Japanese, or other language equivalents.",
        tag: "Name Translation",
      },
      foreign_to_korean: {
        title: "Foreign Name → Korean Name",
        desc: "Make a foreign name work in Korean",
        detail: "Preserves the nuance and sound of a foreign name while creating a natural Korean equivalent.",
        tag: "Name Translation",
      },
    },
  },
  zh: {
    chip: `${BRAND_NAME} Category`,
    title: "您想为谁设计名字？",
    sub: "名字不是简单生成，而是根据目的与场景进行设计。",
    introTitle: "Wink 会根据对象采用不同设计标准",
    introBody1:
      "孩子名字、品牌名、宠物名、活动名以及名字转换，标准各不相同。Wink 会按对象分别应用音韵和谐、五行笔画分析及嘲笑·发音过滤。",
    introBody2:
      "先选择设计对象，下一步再输入目的与方向，并可先免费查看结果。",
    pill1: "每月1次免费设计",
    pill2: "3个名字同时推荐",
    pill3: "附赠名字礼品卡",
    loginPrompt: "登录后免费获得名字设计",
    loginBtn: "登录",
    sectionTitle: "请选择设计对象",
    sectionDesc: "选择最符合您当前命名需求的对象后继续下一步。",
    startButton: "以此对象开始",
    backHome: "返回首页",
    directOrderTitle: "已有名字？",
    directOrderBody: "无需命名流程，直接用现有名字订购印章或门牌。",
    directOrderBtn: "直接订购印章 · 门牌 →",
    cards: {
      child: {
        title: "孩子姓名",
        desc: "终生陪伴的名字设计",
        detail: "综合姓氏音韵和谐、五行笔画平衡与嘲笑过滤，为孩子设计一份终生礼物。",
        tag: "新生儿命名",
      },
      self: {
        title: "为自己 / 改名",
        desc: "新章节，新名字",
        detail: "适合处于人生转折点的您——新的开始、身份转变或法律改名。兼顾姓氏和谐与您希望呈现的印象。",
        tag: "本人改名",
      },
      brand: {
        title: "品牌名",
        desc: "适用于商号、服务、频道",
        detail: "兼顾第一印象、信任感、延展性与商标风险的品牌名设计。",
        tag: "商号 / 服务名",
      },
      pet: {
        title: "宠物名",
        desc: "每天都能温柔呼唤的名字",
        detail: "设计一个叫起来顺口、自然带有感情的名字。",
        tag: "宠物命名",
      },
      stage: {
        title: "艺名 / 活动名",
        desc: "容易被记住与称呼",
        detail: "兼顾个性、好感度与可搜索性的活动名设计。",
        tag: "创作者 / 艺名",
      },
      korean_to_foreign: {
        title: "韩语 → 外语",
        desc: "让韩国名字在海外自然流通",
        detail: "将韩国名字转换为英语、中文、日语等外语环境中自然可用的形式。",
        tag: "名字转换",
      },
      foreign_to_korean: {
        title: "外语 → 韩语",
        desc: "让外国名字在韩国自然流通",
        detail: "保留外国名字的发音与韵味，转换为自然的韩语表记或重新设计。",
        tag: "名字转换",
      },
    },
  },
  ja: {
    chip: `${BRAND_NAME} Category`,
    title: "誰のための名前を設計しますか？",
    sub: "名前は生成ではなく、目的と文脈に合わせた設計です。",
    introTitle: "Wink は対象ごとに異なる基準で設計します",
    introBody1:
      "子どもの名前、ブランド名、ペット名、活動名、名前の変換はすべて基準が異なります。Wink は音韻調和・五行画数分析・からかい発音フィルターを対象別に適用します。",
    introBody2:
      "まず対象を選び、次の段階で目的と方向性を入力して、結果を無料で先に確認できます。",
    pill1: "月1回無料設計",
    pill2: "3つの名前を同時提案",
    pill3: "名前ギフトカード付き",
    loginPrompt: "ログインして無料で名前をデザイン",
    loginBtn: "ログイン",
    sectionTitle: "設計対象を選択してください",
    sectionDesc: "現在もっとも必要な名前設計の対象を選んで次へ進みます。",
    startButton: "この対象で始める",
    backHome: "最初へ",
    directOrderTitle: "すでに名前をお持ちですか？",
    directOrderBody: "ネーミング不要。お手元の名前で印鑑・表札をすぐに注文できます。",
    directOrderBtn: "印鑑 · 表札を直接注文 →",
    cards: {
      child: {
        title: "子どもの名前",
        desc: "一生呼ばれる名前の設計",
        detail: "姓との音韻調和・五行画数バランス・からかいフィルターを反映した、生涯の贈り物となる名前を設計します。",
        tag: "出生ネーミング",
      },
      self: {
        title: "自分のために / 改名",
        desc: "新しい自分のための名前",
        detail: "人生の転換点、新たな出発、アイデンティティの変化を望む方のための改名設計です。姓との調和と新しい印象を反映します。",
        tag: "本人改名",
      },
      brand: {
        title: "ブランド名",
        desc: "屋号・サービス・チャンネルの名前",
        detail: "第一印象・信頼感・拡張性・商標リスクを総合的に考慮したブランド名設計。",
        tag: "屋号 / サービス名",
      },
      pet: {
        title: "ペットの名前",
        desc: "毎日やさしく呼べる名前",
        detail: "呼びやすく、愛情が自然にこもる名前を設計します。",
        tag: "ペットの名前",
      },
      stage: {
        title: "活動名 / 芸名",
        desc: "記憶され呼ばれやすい名前",
        detail: "個性・好感度・記憶性・検索性のバランスを見ながら設計します。",
        tag: "クリエイター / 芸名",
      },
      korean_to_foreign: {
        title: "韓国語 → 外国語",
        desc: "韓国の名前を海外でも自然に",
        detail: "韓国の名前を英語・中国語・日本語など他言語圏で自然に使える形に変換・設計します。",
        tag: "名前の変換",
      },
      foreign_to_korean: {
        title: "外国語 → 韓国語",
        desc: "外国の名前を韓国語で自然に",
        detail: "外国の名前の発音とニュアンスを活かしながら、韓国語で自然な名前に変換・設計します。",
        tag: "名前の変換",
      },
    },
  },
  es: {
    chip: `${BRAND_NAME} Category`,
    title: "¿Para quién diseñamos el nombre?",
    sub: "Un nombre no se genera — se diseña con propósito y contexto.",
    introTitle: "Wink diseña de forma diferente según el destinatario",
    introBody1:
      "Los nombres para bebés, marcas, mascotas, nombres artísticos y traducciones de nombres requieren criterios distintos. Wink aplica armonía fonética, análisis de trazos de los cinco elementos y filtros de pronunciación de forma diferente según el destinatario.",
    introBody2:
      "Elige tu destinatario, luego describe el propósito y la dirección en el siguiente paso y revisa los resultados gratis.",
    pill1: "1 diseño gratis/mes",
    pill2: "3 nombres a la vez",
    pill3: "Tarjeta regalo incluida",
    loginPrompt: "Inicia sesión para diseñar nombres gratis",
    loginBtn: "Iniciar sesión",
    sectionTitle: "Elige tu destinatario de diseño",
    sectionDesc: "Selecciona el destinatario que mejor se adapte a tus necesidades actuales.",
    startButton: "Empezar con este destinatario",
    backHome: "Volver al inicio",
    directOrderTitle: "¿Ya tienes un nombre?",
    directOrderBody: "Pide un sello o placa de puerta directamente con tu nombre existente — sin necesidad de sesión de naming.",
    directOrderBtn: "Pedir Sello · Placa →",
    cards: {
      child: {
        title: "Nombre de bebé",
        desc: "Un nombre para toda la vida",
        detail: "Diseñado con armonía fonética del apellido, equilibrio de trazos de los cinco elementos y filtros de burlas — un regalo para toda la vida.",
        tag: "Nombre de bebé",
      },
      self: {
        title: "Para mí / Cambio de nombre",
        desc: "Un nuevo nombre para un nuevo capítulo",
        detail: "Para quienes están en un punto de inflexión — un nuevo comienzo, cambio de identidad o cambio de nombre legal. Equilibra la armonía con el apellido y la impresión que deseas proyectar.",
        tag: "Cambio personal",
      },
      brand: {
        title: "Nombre de marca",
        desc: "Para negocio, servicio o canal",
        detail: "Diseñado con primera impresión, confianza, escalabilidad y riesgo de marca registrada en mente.",
        tag: "Negocio / Servicio",
      },
      pet: {
        title: "Nombre de mascota",
        desc: "Un nombre cálido para llamar cada día",
        detail: "Diseñado para ser fácil de llamar y naturalmente lleno de cariño.",
        tag: "Nombre de mascota",
      },
      stage: {
        title: "Nombre artístico",
        desc: "Un nombre memorable para ser llamado",
        detail: "Diseñado equilibrando individualidad, memorabilidad y capacidad de búsqueda.",
        tag: "Creador / Alias",
      },
      korean_to_foreign: {
        title: "Coreano → Extranjero",
        desc: "Haz que un nombre coreano funcione en el extranjero",
        detail: "Convierte un nombre coreano en equivalentes naturales en inglés, chino, japonés u otros idiomas.",
        tag: "Traducción de nombre",
      },
      foreign_to_korean: {
        title: "Extranjero → Coreano",
        desc: "Haz que un nombre extranjero funcione en coreano",
        detail: "Preserva el matiz y sonido de un nombre extranjero creando un equivalente coreano natural.",
        tag: "Traducción de nombre",
      },
    },
  },
  ru: {
    chip: `${BRAND_NAME} Category`,
    title: "Для кого мы создаём имя?",
    sub: "Имя не генерируется — оно разрабатывается с учётом цели и контекста.",
    introTitle: "Wink проектирует по-разному в зависимости от объекта",
    introBody1:
      "Имена для детей, брендов, питомцев, псевдонимы и перевод имён требуют разных стандартов. Wink применяет фонетическую гармонию, анализ черт пяти элементов и фильтры произношения по-разному в зависимости от объекта.",
    introBody2:
      "Выберите объект, затем опишите цель и направление на следующем шаге и ознакомьтесь с результатами бесплатно.",
    pill1: "1 бесплатный дизайн/мес",
    pill2: "3 имени одновременно",
    pill3: "Подарочная карточка включена",
    loginPrompt: "Войдите для бесплатного дизайна",
    loginBtn: "Войти",
    sectionTitle: "Выберите объект дизайна",
    sectionDesc: "Выберите объект, наиболее соответствующий вашим текущим потребностям.",
    startButton: "Начать с этим объектом",
    backHome: "На главную",
    directOrderTitle: "У вас уже есть имя?",
    directOrderBody: "Закажите печать или именную табличку с существующим именем — без необходимости сессии именования.",
    directOrderBtn: "Заказать печать · Табличку →",
    cards: {
      child: {
        title: "Имя ребёнка",
        desc: "Имя на всю жизнь",
        detail: "Разработано с фонетической гармонией фамилии, балансом черт пяти элементов и фильтрами насмешек — подарок на всю жизнь.",
        tag: "Детское имя",
      },
      self: {
        title: "Для себя / Смена имени",
        desc: "Новое имя для нового этапа",
        detail: "Для тех, кто находится на переломном этапе — новое начало, смена идентичности или юридическая смена имени.",
        tag: "Личная смена имени",
      },
      brand: {
        title: "Название бренда",
        desc: "Для бизнеса, услуги или канала",
        detail: "Разработано с учётом первого впечатления, доверия, расширяемости и рисков товарного знака.",
        tag: "Бизнес / Услуга",
      },
      pet: {
        title: "Кличка питомца",
        desc: "Тёплое имя для ежедневного зова",
        detail: "Разработано для лёгкого произношения и естественной теплоты.",
        tag: "Кличка",
      },
      stage: {
        title: "Псевдоним",
        desc: "Запоминающееся имя",
        detail: "Разработано с балансом индивидуальности, запоминаемости и поисковой доступности.",
        tag: "Псевдоним",
      },
      korean_to_foreign: {
        title: "Корейский → Иностранный",
        desc: "Корейское имя для зарубежного использования",
        detail: "Преобразует корейское имя в естественные эквиваленты на английском, китайском, японском и других языках.",
        tag: "Перевод имени",
      },
      foreign_to_korean: {
        title: "Иностранный → Корейский",
        desc: "Иностранное имя по-корейски",
        detail: "Сохраняет нюансы и звучание иностранного имени, создавая естественный корейский эквивалент.",
        tag: "Перевод имени",
      },
    },
  },
  fr: {
    chip: `${BRAND_NAME} Category`,
    title: "Pour qui concevons-nous ce nom ?",
    sub: "Un nom ne se génère pas — il se conçoit avec un but et un contexte.",
    introTitle: "Wink conçoit différemment selon le destinataire",
    introBody1:
      "Les prénoms d'enfants, noms de marques, noms de mascottes, noms de scène et traductions de noms requièrent des critères différents. Wink applique l'harmonie phonétique, l'analyse des traits des cinq éléments et les filtres de prononciation différemment selon le destinataire.",
    introBody2:
      "Choisissez votre destinataire, décrivez le but et la direction à l'étape suivante, et consultez les résultats gratuitement.",
    pill1: "1 design gratuit/mois",
    pill2: "3 noms simultanément",
    pill3: "Carte cadeau offerte",
    loginPrompt: "Connectez-vous pour concevoir gratuitement",
    loginBtn: "Se connecter",
    sectionTitle: "Choisissez votre destinataire",
    sectionDesc: "Sélectionnez le destinataire qui correspond le mieux à vos besoins actuels.",
    startButton: "Commencer avec ce destinataire",
    backHome: "Retour à l'accueil",
    directOrderTitle: "Vous avez déjà un nom ?",
    directOrderBody: "Commandez un tampon ou une plaque directement avec votre nom existant — sans session de naming.",
    directOrderBtn: "Commander Tampon · Plaque →",
    cards: {
      child: {
        title: "Prénom d'enfant",
        desc: "Un nom pour toute la vie",
        detail: "Conçu avec l'harmonie phonétique du nom de famille, l'équilibre des traits des cinq éléments et des filtres de moquerie — un cadeau pour la vie.",
        tag: "Prénom de naissance",
      },
      self: {
        title: "Pour moi / Changement de nom",
        desc: "Un nouveau nom pour un nouveau chapitre",
        detail: "Pour ceux à un tournant — un nouveau départ, changement d'identité ou changement de nom légal.",
        tag: "Changement personnel",
      },
      brand: {
        title: "Nom de marque",
        desc: "Pour entreprise, service ou chaîne",
        detail: "Conçu en tenant compte de la première impression, de la confiance, de l'évolutivité et des risques de marque déposée.",
        tag: "Entreprise / Service",
      },
      pet: {
        title: "Nom d'animal",
        desc: "Un nom chaleureux pour chaque jour",
        detail: "Conçu pour être facile à appeler et naturellement plein d'affection.",
        tag: "Nom d'animal",
      },
      stage: {
        title: "Nom de scène",
        desc: "Un nom mémorable",
        detail: "Conçu en équilibrant individualité, mémorabilité et facilité de recherche.",
        tag: "Créateur / Alias",
      },
      korean_to_foreign: {
        title: "Coréen → Étranger",
        desc: "Utiliser un nom coréen à l'étranger",
        detail: "Convertit un nom coréen en équivalents naturels en anglais, chinois, japonais ou d'autres langues.",
        tag: "Traduction de nom",
      },
      foreign_to_korean: {
        title: "Étranger → Coréen",
        desc: "Utiliser un nom étranger en coréen",
        detail: "Préserve la nuance et le son d'un nom étranger tout en créant un équivalent coréen naturel.",
        tag: "Traduction de nom",
      },
    },
  },
  ar: {
    chip: `${BRAND_NAME} Category`,
    title: "لمن نصمم هذا الاسم؟",
    sub: "الاسم لا يُولَّد — بل يُصمَّم بغرض وسياق.",
    introTitle: "تصمم Wink بشكل مختلف حسب الغرض",
    introBody1:
      "أسماء الأطفال والعلامات التجارية والحيوانات الأليفة والأسماء الفنية وترجمة الأسماء تتطلب معايير مختلفة. تطبق Wink الانسجام الصوتي وتحليل سمات العناصر الخمسة وفلاتر النطق بشكل مختلف حسب الغرض.",
    introBody2:
      "اختر غرضك، ثم صف الهدف والاتجاه في الخطوة التالية وراجع النتائج مجاناً.",
    pill1: "تصميم مجاني 1/شهر",
    pill2: "3 أسماء دفعة واحدة",
    pill3: "بطاقة هدية مرفقة",
    loginPrompt: "سجّل دخولك لتصميم الأسماء مجاناً",
    loginBtn: "تسجيل الدخول",
    sectionTitle: "اختر غرض التصميم",
    sectionDesc: "اختر الغرض الأنسب لاحتياجاتك الحالية.",
    startButton: "ابدأ بهذا الغرض",
    backHome: "العودة للرئيسية",
    directOrderTitle: "هل لديك اسم بالفعل؟",
    directOrderBody: "اطلب ختماً أو لوحة باباً مباشرة باسمك الحالي — دون الحاجة إلى جلسة تسمية.",
    directOrderBtn: "اطلب الختم · اللوحة ←",
    cards: {
      child: {
        title: "اسم الطفل",
        desc: "اسم مدى الحياة",
        detail: "مصمم مع الانسجام الصوتي للقب، وتوازن سمات العناصر الخمسة، وفلاتر السخرية — هدية مدى الحياة.",
        tag: "تسمية الطفل",
      },
      self: {
        title: "لنفسي / تغيير الاسم",
        desc: "اسم جديد لفصل جديد",
        detail: "لمن يمر بنقطة تحول — بداية جديدة أو تغيير هوية أو تغيير قانوني للاسم.",
        tag: "تغيير شخصي",
      },
      brand: {
        title: "اسم العلامة التجارية",
        desc: "للأعمال أو الخدمات أو القنوات",
        detail: "مصمم مع مراعاة الانطباع الأول والثقة وقابلية التوسع ومخاطر العلامة التجارية.",
        tag: "أعمال / خدمة",
      },
      pet: {
        title: "اسم الحيوان الأليف",
        desc: "اسم دافئ للنداء اليومي",
        detail: "مصمم ليكون سهل النطق ومليئاً بالمحبة بشكل طبيعي.",
        tag: "اسم الحيوان",
      },
      stage: {
        title: "الاسم الفني",
        desc: "اسم لا يُنسى",
        detail: "مصمم بتوازن بين الفردية وسهولة التذكر وإمكانية البحث.",
        tag: "فنان / مبدع",
      },
      korean_to_foreign: {
        title: "كوري → أجنبي",
        desc: "استخدام الاسم الكوري في الخارج",
        detail: "يحول الاسم الكوري إلى مكافئات طبيعية بالإنجليزية والصينية واليابانية وغيرها.",
        tag: "ترجمة الاسم",
      },
      foreign_to_korean: {
        title: "أجنبي → كوري",
        desc: "استخدام الاسم الأجنبي بالكورية",
        detail: "يحافظ على نغمة وظلال الاسم الأجنبي مع إنشاء مكافئ كوري طبيعي.",
        tag: "ترجمة الاسم",
      },
    },
  },
  hi: {
    chip: `${BRAND_NAME} Category`,
    title: "यह नाम किसके लिए डिज़ाइन करें?",
    sub: "नाम सिर्फ बनाया नहीं जाता — इसे उद्देश्य और संदर्भ के साथ डिज़ाइन किया जाता है।",
    introTitle: "Wink लक्ष्य के अनुसार अलग तरह से डिज़ाइन करता है",
    introBody1:
      "बच्चों के नाम, ब्रांड, पालतू जानवर, स्टेज नाम और नाम अनुवाद सभी के लिए अलग मानक हैं। Wink ध्वन्यात्मक सामंजस्य, पंचतत्व विश्लेषण और उच्चारण फ़िल्टर को लक्ष्य के अनुसार अलग-अलग लागू करता है।",
    introBody2:
      "अपना लक्ष्य चुनें, फिर अगले चरण में उद्देश्य और दिशा बताएं और परिणाम मुफ्त में देखें।",
    pill1: "मुफ्त 1 डिज़ाइन/माह",
    pill2: "एक साथ 3 नाम",
    pill3: "नाम गिफ्ट कार्ड शामिल",
    loginPrompt: "लॉगिन करें और मुफ्त नाम डिज़ाइन पाएं",
    loginBtn: "लॉगिन",
    sectionTitle: "डिज़ाइन लक्ष्य चुनें",
    sectionDesc: "अपनी वर्तमान जरूरतों के अनुसार सबसे उपयुक्त लक्ष्य चुनें।",
    startButton: "इस लक्ष्य से शुरू करें",
    backHome: "होम पर वापस",
    directOrderTitle: "क्या आपके पास पहले से नाम है?",
    directOrderBody: "अपने मौजूदा नाम से सीधे स्टाम्प या दरवाज़े की पट्टिका ऑर्डर करें — नामकरण सत्र की जरूरत नहीं।",
    directOrderBtn: "स्टाम्प · पट्टिका ऑर्डर करें →",
    cards: {
      child: {
        title: "बच्चे का नाम",
        desc: "जीवनभर के लिए नाम",
        detail: "उपनाम के ध्वन्यात्मक सामंजस्य, पंचतत्व संतुलन और उपहास फ़िल्टर के साथ डिज़ाइन किया गया।",
        tag: "नवजात नामकरण",
      },
      self: {
        title: "अपने लिए / नाम बदलना",
        desc: "नए अध्याय के लिए नया नाम",
        detail: "जीवन के मोड़ पर खड़े लोगों के लिए — नई शुरुआत, पहचान बदलना या कानूनी नाम परिवर्तन।",
        tag: "व्यक्तिगत नाम परिवर्तन",
      },
      brand: {
        title: "ब्रांड नाम",
        desc: "व्यवसाय, सेवा या चैनल के लिए",
        detail: "पहली छाप, विश्वास, विस्तारयोग्यता और ट्रेडमार्क जोखिम को ध्यान में रखकर डिज़ाइन किया गया।",
        tag: "व्यवसाय / सेवा",
      },
      pet: {
        title: "पालतू जानवर का नाम",
        desc: "रोज़ाना प्यार से बुलाने का नाम",
        detail: "बुलाने में आसान और स्वाभाविक रूप से स्नेह से भरे नाम के लिए डिज़ाइन किया गया।",
        tag: "पालतू नामकरण",
      },
      stage: {
        title: "स्टेज / कला नाम",
        desc: "याद रहने वाला नाम",
        detail: "व्यक्तित्व, याददाश्त और खोज क्षमता को संतुलित करते हुए डिज़ाइन किया गया।",
        tag: "क्रिएटर / उपनाम",
      },
      korean_to_foreign: {
        title: "कोरियाई → विदेशी",
        desc: "कोरियाई नाम को विदेश में उपयोगी बनाएं",
        detail: "कोरियाई नाम को अंग्रेजी, चीनी, जापानी या अन्य भाषाओं में प्राकृतिक समकक्ष में बदलता है।",
        tag: "नाम अनुवाद",
      },
      foreign_to_korean: {
        title: "विदेशी → कोरियाई",
        desc: "विदेशी नाम को कोरियाई में उपयोगी बनाएं",
        detail: "विदेशी नाम की ध्वनि और बारीकियों को बनाए रखते हुए प्राकृतिक कोरियाई समकक्ष बनाता है।",
        tag: "नाम अनुवाद",
      },
    },
  },
} as const;

type UiCopy = (typeof COPY)[keyof typeof COPY];

const CATEGORY_ACCENT: Record<
  CategoryKey,
  {
    emoji: string;
    color: string;
    darkBg: string;
    lightBg: string;
    border: string;
    topBar: string;
  }
> = {
  child: {
    emoji: "🌱",
    color: "#5BA4D4",
    darkBg: "linear-gradient(170deg, rgba(91,164,212,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(219,239,255,0.98) 0%, rgba(245,251,255,0.96) 100%)",
    border: "rgba(91,164,212,0.45)",
    topBar: "linear-gradient(90deg, #5BA4D4, #7FC0E8)",
  },
  self: {
    emoji: "🪷",
    color: "#5BB0A8",
    darkBg: "linear-gradient(170deg, rgba(91,176,168,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(210,244,242,0.98) 0%, rgba(238,252,250,0.96) 100%)",
    border: "rgba(91,176,168,0.45)",
    topBar: "linear-gradient(90deg, #5BB0A8, #80CCB8)",
  },
  brand: {
    emoji: "✦",
    color: "#9B7FE0",
    darkBg: "linear-gradient(170deg, rgba(155,127,224,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(240,234,255,0.98) 0%, rgba(250,247,255,0.96) 100%)",
    border: "rgba(155,127,224,0.45)",
    topBar: "linear-gradient(90deg, #9B7FE0, #B89FF0)",
  },
  pet: {
    emoji: "🐾",
    color: "#5DC08A",
    darkBg: "linear-gradient(170deg, rgba(93,192,138,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(220,248,235,0.98) 0%, rgba(242,252,246,0.96) 100%)",
    border: "rgba(93,192,138,0.45)",
    topBar: "linear-gradient(90deg, #5DC08A, #82D4A8)",
  },
  stage: {
    emoji: "🎭",
    color: "#E09B4A",
    darkBg: "linear-gradient(170deg, rgba(224,155,74,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(255,241,218,0.98) 0%, rgba(255,250,240,0.96) 100%)",
    border: "rgba(224,155,74,0.45)",
    topBar: "linear-gradient(90deg, #E09B4A, #F0B870)",
  },
  korean_to_foreign: {
    emoji: "🌏",
    color: "#E06A6A",
    darkBg: "linear-gradient(170deg, rgba(224,106,106,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(255,228,228,0.98) 0%, rgba(255,244,244,0.96) 100%)",
    border: "rgba(224,106,106,0.45)",
    topBar: "linear-gradient(90deg, #E06A6A, #F09090)",
  },
  foreign_to_korean: {
    emoji: "🌸",
    color: "#C9A84C",
    darkBg: "linear-gradient(170deg, rgba(201,168,76,0.18) 0%, rgba(8,18,48,0.94) 60%)",
    lightBg: "linear-gradient(170deg, rgba(255,245,210,0.98) 0%, rgba(255,251,235,0.96) 100%)",
    border: "rgba(201,168,76,0.45)",
    topBar: "linear-gradient(90deg, #C9A84C, #E8C870)",
  },
};

function TrustPill({ text }: { text: string }) {
  return <div className="wink-score-pill">{text}</div>;
}

function CategoryCard({
  categoryKey, tag, title, desc, detail, buttonText, onClick, isLight,
}: {
  categoryKey: CategoryKey; tag: string; title: string; desc: string; detail: string;
  buttonText: string; onClick: () => void; isLight: boolean;
}) {
  const accent = CATEGORY_ACCENT[categoryKey];
  const textMain = isLight ? "#1a1a2e" : "#f0f4ff";
  const textSub = isLight ? "#4a3a20" : "rgba(200,215,240,0.85)";
  const textBody = isLight ? "#5a4a30" : "rgba(180,196,225,0.82)";

  return (
    <article
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${accent.border}`,
        background: isLight ? accent.lightBg : accent.darkBg,
        boxShadow: isLight
          ? `0 4px 20px ${accent.color}22`
          : `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 ${accent.color}22`,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: accent.topBar, flexShrink: 0 }} />

      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Icon + badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              background: `${accent.color}22`,
              border: `1px solid ${accent.color}44`,
              flexShrink: 0,
            }}
          >
            {accent.emoji}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: `${accent.color}20`,
              border: `1px solid ${accent.color}55`,
              color: accent.color,
              lineHeight: 1,
            }}
          >
            {tag}
          </div>
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: textMain, marginBottom: 6, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: textSub, marginBottom: 10 }}>
          {desc}
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.75, color: textBody, marginBottom: 20, flex: 1 }}>
          {detail}
        </div>

        <button
          type="button"
          onClick={onClick}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.02em",
            background: accent.topBar,
            color: "#fff",
            boxShadow: `0 4px 14px ${accent.color}44`,
            transition: "opacity 0.15s",
          }}
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}

function getLangCopy(lang: string): UiCopy {
  if (lang in COPY) return COPY[lang as keyof typeof COPY];
  return COPY.ko;
}

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = getLangCopy(rawLang);
  const [isLight, setIsLight] = useState(false);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<CategoryKey | null>(null);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    try {
      const sb = createClient();
      sb.auth.getUser().then(({ data }) => {
        setUserId(data?.user?.id ?? null);
      });
    } catch {
      setUserId(null);
    }
  }, []);

  const cards = useMemo(
    () => CATEGORY_ORDER.map((key) => ({ key, ...ui.cards[key] })),
    [ui]
  );

  const handleSelect = (key: CategoryKey) => {
    if (!userId) {
      setPendingCategory(key);
      setLoginModalOpen(true);
      return;
    }
    router.push(`/${lang}/design?type=${key}`);
  };

  const closeModal = () => {
    setLoginModalOpen(false);
    setPendingCategory(null);
  };

  const proceedWithoutLogin = () => {
    const key = pendingCategory;
    closeModal();
    if (key) router.push(`/${lang}/design?type=${key}`);
  };

  return (
    <>
    {/* 로그인 유도 모달 */}
    {loginModalOpen && (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 16px",
        }}
        onClick={closeModal}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 360,
            borderRadius: 20, padding: "32px 28px",
            background: isLight ? "#fff" : "linear-gradient(160deg,#0e1a3d,#0a1228)",
            border: "1px solid rgba(201,168,76,0.25)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.3 }}>
            로그인이 필요한 서비스입니다
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.75 }}>
            로그인하시면 월 1회 무료 작명 서비스를<br/>이용하실 수 있습니다.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                const next = pendingCategory ? `/${lang}/design?type=${pendingCategory}` : `/${lang}/category`;
                router.push(`/${lang}/login?provider=kakao&next=${encodeURIComponent(next)}`);
              }}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#FEE500", color: "#191919",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              🟡 카카오로 로그인
            </button>
            <button
              type="button"
              onClick={() => {
                const next = pendingCategory ? `/${lang}/design?type=${pendingCategory}` : `/${lang}/category`;
                router.push(`/${lang}/login?next=${encodeURIComponent(next)}`);
              }}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12,
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                border: "1px solid var(--line-strong)",
                background: isLight ? "#1B2A5E" : "rgba(27,42,94,0.9)", color: "#fff",
              }}
            >
              📧 이메일로 로그인
            </button>
            <button
              type="button"
              onClick={closeModal}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 12,
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                border: "none", background: "transparent",
                color: "var(--text-dim)",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    )}

    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        <section className="wink-panel" style={{ marginTop: 24, marginBottom: 20 }}>
          <div
            className="wink-section-title"
            style={{
              marginBottom: 12,
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            {ui.introTitle}
          </div>
          <div className="wink-result-text" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{ui.introBody1}</div>
          <div className="wink-result-text" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{ui.introBody2}</div>
          {!userId && (
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={() => router.push(`/${lang}/login?next=${encodeURIComponent(`/${lang}/category`)}`)}
                style={{
                  padding: "12px 28px", borderRadius: 50, border: "none",
                  cursor: "pointer", fontSize: 15, fontWeight: 600,
                  background: "#1B2A5E", color: "#fff",
                }}
              >
                {ui.loginBtn ?? "로그인하고 무료로 시작하기"}
              </button>
            </div>
          )}
          <div className="wink-actions" style={{ marginTop: 16 }}>
            <TrustPill text={ui.pill1} />
            <TrustPill text={ui.pill2} />
            <TrustPill text={ui.pill3} />
          </div>
        </section>

        <section className="wink-form-section">
          <div className="wink-section-head">
            <h2 className="wink-section-title">{ui.sectionTitle}</h2>
            <p className="wink-section-desc">{ui.sectionDesc}</p>
          </div>
          <div className="wink-language-grid">
            {cards.map((card) => (
              <CategoryCard
                key={card.key}
                categoryKey={card.key}
                tag={card.tag}
                title={card.title}
                desc={card.desc}
                detail={card.detail}
                buttonText={ui.startButton}
                onClick={() => handleSelect(card.key)}
                isLight={isLight}
              />
            ))}
          </div>
        </section>

        {/* Direct order entry point */}
        <section
          style={{
            marginTop: 36,
            padding: "24px 22px",
            borderRadius: 16,
            border: "1px solid var(--line-gold)",
            background: isLight
              ? "linear-gradient(160deg, rgba(255,249,230,0.98), rgba(255,244,215,0.96))"
              : "linear-gradient(160deg, rgba(201,168,76,0.07), rgba(11,22,52,0.7))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "1px solid var(--line-gold)",
              color: "var(--gold-main)",
              marginBottom: 4,
              width: "fit-content",
            }}
          >
            Direct Order
          </div>
          <div className="wink-card-title" style={{ fontSize: 18 }}>
            {ui.directOrderTitle}
          </div>
          <div className="wink-result-text" style={{ opacity: 0.82 }}>
            {ui.directOrderBody}
          </div>
          <div>
            <button
              type="button"
              className="wink-primary-btn"
              onClick={() => router.push(`/${lang}/order`)}
              style={{ marginTop: 4 }}
            >
              {ui.directOrderBtn}
            </button>
          </div>
        </section>

        <div className="wink-actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}`)}
          >
            {ui.backHome}
          </button>
        </div>
      </div>
    </main>
    </>
  );
}
