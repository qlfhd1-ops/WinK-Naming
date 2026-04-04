export type Lang = "ko" | "en" | "ja" | "zh" | "es";

export const LANG_STORAGE_KEY = "wink.naming.preferred-lang";

const SUPPORTED_LANGS: Lang[] = ["ko", "en", "ja", "zh", "es"];

type Dictionary = {
  common: {
    appName: string;
    welcome: string;
    next: string;
    back: string;
    start: string;
    retry: string;
    close: string;
    save: string;
    cancel: string;
    loading: string;
  };
  home: {
    chip: string;
    title: string;
    subtitle: string;
    description: string;
    chooseLanguage: string;
    continueWithSaved: string;
  };
  category: {
    title: string;
    subtitle: string;
    baby: string;
    me: string;
    activity: string;
    brand: string;
    pet: string;
    global: string;
  };
  design: {
    title: string;
    subtitle: string;
    selectedTarget: string;
    purpose: string;
    style: string;
    avoid: string;
    memo: string;
    familyName: string;
    country: string;
    script: string;
    startDesign: string;
  };
  result: {
    title: string;
    subtitle: string;
    resultTitle: string;
    resultIntro: string;
    packageTitle: string;
    packageIntro: string;
  };
};

const DICTIONARY: Record<Lang, Dictionary> = {
  ko: {
    common: {
      appName: "윙크 네이밍",
      welcome: "환영합니다",
      next: "다음",
      back: "이전",
      start: "시작",
      retry: "다시 시도",
      close: "닫기",
      save: "저장",
      cancel: "취소",
      loading: "불러오는 중",
    },
    home: {
      chip: "윙크 네이밍",
      title: "삶의 가치를 높이는 이름을 설계합니다",
      subtitle: "We design names that elevate the value of life.",
      description:
        "이름은 단순 생성이 아니라 성씨, 의미, 발음, 표기, 인상, 장기 사용성까지 함께 고려해 설계하는 일입니다.",
      chooseLanguage: "언어를 선택해 주세요",
      continueWithSaved: "이전 언어로 계속하기",
    },
    category: {
      title: "누구에게 이름을 설계하시겠어요?",
      subtitle: "목적과 맥락에 따라 설계 기준이 달라집니다.",
      baby: "우리 아이에게",
      me: "나에게",
      activity: "활동명",
      brand: "브랜드",
      pet: "반려동물",
      global: "글로벌 이름",
    },
    design: {
      title: "이름 설계 브리프",
      subtitle: "입력하신 내용을 바탕으로 감정, 목적, 사용 맥락까지 함께 읽고 설계합니다.",
      selectedTarget: "선택한 설계 대상",
      purpose: "이름의 목적",
      style: "원하는 분위기",
      avoid: "피하고 싶은 느낌",
      memo: "추가 메모",
      familyName: "성(선택)",
      country: "주 사용 국가 / 언어권",
      script: "원하는 표기 방향",
      startDesign: "이름 설계 시작",
    },
    result: {
      title: "이름 설계 보고서",
      subtitle: "입력하신 목적과 성씨 조화를 함께 검토해 정리한 결과입니다.",
      resultTitle: "윙크 작명 결과",
      resultIntro: "입력한 설계를 바탕으로 이름 후보와 해설을 함께 정리했습니다.",
      packageTitle: "패키지 선택",
      packageIntro: "결과가 마음에 드는 경우에만 선택하실 수 있습니다.",
    },
  },

  en: {
    common: {
      appName: "윙크 네이밍",
      welcome: "Welcome",
      next: "Next",
      back: "Back",
      start: "Start",
      retry: "Retry",
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading",
    },
    home: {
      chip: "윙크 네이밍",
      title: "We design names that elevate the value of life.",
      subtitle: "Premium naming beyond simple generation.",
      description:
        "A name is designed through surname harmony, meaning, pronunciation, writing, impression, and long-term usability.",
      chooseLanguage: "Choose your language",
      continueWithSaved: "Continue with saved language",
    },
    category: {
      title: "Who is this name for?",
      subtitle: "Naming criteria change depending on purpose and context.",
      baby: "For My Child",
      me: "For Me",
      activity: "Stage Name",
      brand: "Brand",
      pet: "Pet",
      global: "Global Name",
    },
    design: {
      title: "Naming Design Brief",
      subtitle: "We read your emotion, goal, and real usage context together.",
      selectedTarget: "Selected Target",
      purpose: "Purpose",
      style: "Preferred Mood",
      avoid: "What to Avoid",
      memo: "Additional Note",
      familyName: "Family Name",
      country: "Primary Country / Market",
      script: "Preferred Script",
      startDesign: "Start Name Design",
    },
    result: {
      title: "Naming Design Report",
      subtitle: "A result reviewed with your purpose and surname harmony together.",
      resultTitle: "윙크 네이밍 Result",
      resultIntro: "We organized name options and commentary based on your design input.",
      packageTitle: "Package Selection",
      packageIntro: "Choose only if you like the result.",
    },
  },

  ja: {
    common: {
      appName: "윙크 네이밍",
      welcome: "ようこそ",
      next: "次へ",
      back: "戻る",
      start: "開始",
      retry: "再試行",
      close: "閉じる",
      save: "保存",
      cancel: "キャンセル",
      loading: "読み込み中",
    },
    home: {
      chip: "윙크 네이밍",
      title: "人生の価値を高める名前を設計します",
      subtitle: "Premium naming beyond simple generation.",
      description:
        "名前は単純生成ではなく、姓との調和、意味、発音、表記、印象、長期使用性まで含めて設計します。",
      chooseLanguage: "言語を選択してください",
      continueWithSaved: "前の言語で続ける",
    },
    category: {
      title: "誰のための名前を設計しますか？",
      subtitle: "目的と文脈によって設計基準は変わります。",
      baby: "わが子へ",
      me: "自分へ",
      activity: "活動名",
      brand: "ブランド",
      pet: "ペット",
      global: "グローバル名",
    },
    design: {
      title: "ネーミング設計ブリーフ",
      subtitle: "入力内容をもとに感情、目的、使用文脈まで一緒に読み取って設計します。",
      selectedTarget: "選択した対象",
      purpose: "名前の目的",
      style: "希望する雰囲気",
      avoid: "避けたい印象",
      memo: "追加メモ",
      familyName: "姓（任意）",
      country: "主な使用国 / 言語圏",
      script: "希望する表記方向",
      startDesign: "名前設計を開始",
    },
    result: {
      title: "ネーミング設計レポート",
      subtitle: "入力目的と姓との調和を一緒に検討した結果です。",
      resultTitle: "Wink 命名結果",
      resultIntro: "入力内容をもとに候補名と解説を整理しました。",
      packageTitle: "パッケージ選択",
      packageIntro: "結果が気に入った場合のみ選択できます。",
    },
  },

  zh: {
    common: {
      appName: "윙크 네이밍",
      welcome: "欢迎",
      next: "下一步",
      back: "返回",
      start: "开始",
      retry: "重试",
      close: "关闭",
      save: "保存",
      cancel: "取消",
      loading: "加载中",
    },
    home: {
      chip: "윙크 네이밍",
      title: "我们设计能够提升人生价值的名字",
      subtitle: "Premium naming beyond simple generation.",
      description:
        "名字不是简单生成，而是综合姓氏协调、含义、发音、写法、印象与长期使用性进行设计。",
      chooseLanguage: "请选择语言",
      continueWithSaved: "使用上次语言继续",
    },
    category: {
      title: "您想为谁设计名字？",
      subtitle: "根据用途和场景，命名标准会不同。",
      baby: "送给孩子",
      me: "送给自己",
      activity: "活动名",
      brand: "品牌",
      pet: "宠物",
      global: "全球名字",
    },
    design: {
      title: "命名设计简报",
      subtitle: "我们会结合您的情感、目的与使用场景一起设计。",
      selectedTarget: "已选择对象",
      purpose: "命名目的",
      style: "期望氛围",
      avoid: "希望避免",
      memo: "补充说明",
      familyName: "姓氏（可选）",
      country: "主要国家 / 语言市场",
      script: "希望的书写方向",
      startDesign: "开始命名设计",
    },
    result: {
      title: "命名设计报告",
      subtitle: "这是结合您的目的与姓氏协调整理出的结果。",
      resultTitle: "Wink 命名结果",
      resultIntro: "我们根据您的输入整理了名字候选和说明。",
      packageTitle: "配套选择",
      packageIntro: "仅在您喜欢结果时再选择。",
    },
  },

  es: {
    common: {
      appName: "윙크 네이밍",
      welcome: "Bienvenido",
      next: "Siguiente",
      back: "Atrás",
      start: "Comenzar",
      retry: "Reintentar",
      close: "Cerrar",
      save: "Guardar",
      cancel: "Cancelar",
      loading: "Cargando",
    },
    home: {
      chip: "윙크 네이밍",
      title: "Diseñamos nombres que elevan el valor de la vida",
      subtitle: "Premium naming beyond simple generation.",
      description:
        "Un nombre no se genera sin más: se diseña considerando armonía con el apellido, significado, pronunciación, escritura, impresión y uso a largo plazo.",
      chooseLanguage: "Seleccione su idioma",
      continueWithSaved: "Continuar con el idioma guardado",
    },
    category: {
      title: "¿Para quién quiere diseñar el nombre?",
      subtitle: "Los criterios cambian según el propósito y el contexto.",
      baby: "Para mi bebé",
      me: "Para mí",
      activity: "Nombre artístico",
      brand: "Marca",
      pet: "Mascota",
      global: "Nombre global",
    },
    design: {
      title: "Brief de diseño del nombre",
      subtitle: "Diseñamos considerando emoción, propósito y contexto de uso.",
      selectedTarget: "Objetivo seleccionado",
      purpose: "Propósito",
      style: "Ambiente deseado",
      avoid: "Evitar",
      memo: "Nota adicional",
      familyName: "Apellido (opcional)",
      country: "País / mercado principal",
      script: "Dirección de escritura",
      startDesign: "Comenzar diseño",
    },
    result: {
      title: "Reporte de diseño del nombre",
      subtitle: "Resultado revisado junto con su propósito y armonía con el apellido.",
      resultTitle: "Resultado de 윙크 네이밍",
      resultIntro: "Organizamos candidatos y explicación según su brief.",
      packageTitle: "Selección de paquetes",
      packageIntro: "Elija solo si le gusta el resultado.",
    },
  },
};

export function isSupportedLang(value: string): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang);
}

export function getDictionary(lang: string): Dictionary {
  return DICTIONARY[isSupportedLang(lang) ? lang : "ko"];
}

export function getCountryHint(lang: string): string {
  switch (lang) {
    case "en":
      return "US";
    case "ja":
      return "JP";
    case "zh":
      return "CN";
    case "es":
      return "ES";
    case "ko":
    default:
      return "KR";
  }
}