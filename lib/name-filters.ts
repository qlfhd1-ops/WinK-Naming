export type RiskLevel = "low" | "medium" | "high";

type NameFilterInput = {
  name: string;
  category: string;
  avoidKeywords?: string;
  memo?: string;
  targetCountry?: string;
  purpose?: string;
};

type FilterPenaltySet = {
  teasing: number;
  similarity: number;
  pronunciation: number;
  brand: number;
};

type FilterResult = {
  penalties: FilterPenaltySet;
  teasingRisk: RiskLevel;
  similarityRisk: RiskLevel;
  pronunciationRisk: RiskLevel;
  brandRisk: RiskLevel;
  reasons: string[];
};

const COMMON_NAME_PATTERNS = [
  "시온",
  "이안",
  "도윤",
  "서윤",
  "수아",
  "민준",
  "지우",
  "지안",
  "리안",
  "윤슬",
  "하린",
  "서준",
  "하준",
  "다온",
  "유나",
  "아린",
  "라온",
  "온유",
];

const TEASING_SOUND_PATTERNS = [
  "놀",
  "똥",
  "뚱",
  "멍",
  "빵",
  "짱",
  "엉",
  "왕",
  "봉",
  "흔",
  "촌",
  "쭈",
  "쪼",
  "삐",
];

const HARD_PRONUNCIATION_PATTERNS = [
  "슷",
  "븐",
  "륵",
  "쯔",
  "쁠",
  "옹옹",
  "린린",
  "슬슬",
  "온온",
];

const BRAND_GENERIC_WORDS = [
  "shop",
  "store",
  "mall",
  "market",
  "brand",
  "lab",
  "studio",
  "service",
  "solution",
  "tech",
  "global",
];

function normalizeText(value?: string) {
  return (value || "").trim().toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function getTeasingPenalty(name: string) {
  let penalty = 0;
  const reasons: string[] = [];

  if (includesAny(name, TEASING_SOUND_PATTERNS)) {
    penalty += 5;
    reasons.push("일부 음절이 장난스럽거나 놀림감으로 확장될 여지가 있습니다.");
  }

  if (/(.)\1/.test(name)) {
    penalty += 2;
    reasons.push("동일 음절 반복이 강해 가벼운 인상을 줄 수 있습니다.");
  }

  if (name.length <= 1) {
    penalty += 4;
    reasons.push("이름 길이가 너무 짧아 별칭처럼 느껴질 수 있습니다.");
  }

  return { penalty, reasons };
}

function getSimilarityPenalty(name: string) {
  let penalty = 0;
  const reasons: string[] = [];

  if (COMMON_NAME_PATTERNS.includes(name)) {
    penalty += 8;
    reasons.push("최근 자주 보이는 익숙한 이름 계열과 매우 가깝습니다.");
  } else {
    const matched = COMMON_NAME_PATTERNS.find(
      (item) =>
        item !== name &&
        (item.startsWith(name[0]) || item.endsWith(name[name.length - 1])) &&
        Math.abs(item.length - name.length) <= 1
    );

    if (matched) {
      penalty += 4;
      reasons.push(`익숙한 이름 패턴('${matched}')과 인상이 다소 겹칠 수 있습니다.`);
    }
  }

  return { penalty, reasons };
}

function getPronunciationPenalty(name: string, targetCountry?: string) {
  let penalty = 0;
  const reasons: string[] = [];
  const country = normalizeText(targetCountry);

  if (includesAny(name, HARD_PRONUNCIATION_PATTERNS)) {
    penalty += 6;
    reasons.push("실제로 부를 때 리듬이 다소 꼬이거나 입에 잘 붙지 않을 수 있습니다.");
  }

  if (/(.)\1/.test(name)) {
    penalty += 2;
    reasons.push("반복음이 강해 또렷함보다 장난스러운 인상을 줄 수 있습니다.");
  }

  if (country && includesAny(country, ["미국", "영국", "global", "해외", "us", "uk"])) {
    if (name.includes("읍") || name.includes("흡") || name.includes("륵")) {
      penalty += 3;
      reasons.push("영문권에서 발음이 다소 어색하게 들릴 수 있습니다.");
    }
  }

  if (country && includesAny(country, ["일본", "japan", "jp"])) {
    if (name.includes("율") || name.includes("률")) {
      penalty += 2;
      reasons.push("일본어권에서 자연스럽게 옮기기 어려운 소리가 포함될 수 있습니다.");
    }
  }

  return { penalty, reasons };
}

function getBrandPenalty(name: string, category: string, purpose?: string, memo?: string) {
  let penalty = 0;
  const reasons: string[] = [];

  if (category !== "brand") {
    return { penalty, reasons };
  }

  const text = `${normalizeText(name)} ${normalizeText(purpose)} ${normalizeText(memo)}`;

  if (name.length <= 2) {
    penalty += 2;
    reasons.push("브랜드명으로는 의미 확장성이 다소 좁게 느껴질 수 있습니다.");
  }

  if (includesAny(text, BRAND_GENERIC_WORDS)) {
    penalty += 4;
    reasons.push("너무 일반적인 업종/서비스 표현으로 읽힐 가능성이 있습니다.");
  }

  if (/^[a-z0-9\s]+$/i.test(name)) {
    penalty += 2;
    reasons.push("영문 일반어처럼 보여 상표 검색 시 충돌 가능성을 추가 확인해야 합니다.");
  }

  return { penalty, reasons };
}

function getAvoidKeywordPenalty(name: string, avoidKeywords?: string) {
  const penalty: FilterPenaltySet = {
    teasing: 0,
    similarity: 0,
    pronunciation: 0,
    brand: 0,
  };

  const reasons: string[] = [];
  const avoid = normalizeText(avoidKeywords);

  if (!avoid) {
    return { penalty, reasons };
  }

  if (includesAny(avoid, ["흔한", "너무 흔한", "평범"])) {
    if (COMMON_NAME_PATTERNS.includes(name)) {
      penalty.similarity += 5;
      reasons.push("고객님이 피하고 싶다고 한 '흔한 느낌'과 가까운 이름일 수 있습니다.");
    }
  }

  if (includesAny(avoid, ["놀림", "장난", "유치"])) {
    const teasing = getTeasingPenalty(name);
    if (teasing.penalty > 0) {
      penalty.teasing += 3;
      reasons.push("고객님이 피하고 싶다고 한 장난스러운 느낌과 일부 맞닿을 수 있습니다.");
    }
  }

  if (includesAny(avoid, ["발음 어려운", "발음", "어려운"])) {
    const pronunciation = getPronunciationPenalty(name);
    if (pronunciation.penalty > 0) {
      penalty.pronunciation += 2;
      reasons.push("고객님이 피하고 싶다고 한 발음 부담 요소가 일부 있습니다.");
    }
  }

  if (includesAny(avoid, ["촌스러운", "올드한"])) {
    if (name.includes("자") || name.includes("숙") || name.includes("봉")) {
      penalty.similarity += 3;
      reasons.push("고객님이 피하고 싶은 오래된 인상과 연결될 가능성이 있습니다.");
    }
  }

  return { penalty, reasons };
}

export function runNameFilters(input: NameFilterInput): FilterResult {
  const name = normalizeText(input.name);
  const category = normalizeText(input.category);

  const teasing = getTeasingPenalty(name);
  const similarity = getSimilarityPenalty(name);
  const pronunciation = getPronunciationPenalty(name, input.targetCountry);
  const brand = getBrandPenalty(name, category, input.purpose, input.memo);
  const avoid = getAvoidKeywordPenalty(name, input.avoidKeywords);

  const penalties: FilterPenaltySet = {
    teasing: teasing.penalty + avoid.penalty.teasing,
    similarity: similarity.penalty + avoid.penalty.similarity,
    pronunciation: pronunciation.penalty + avoid.penalty.pronunciation,
    brand: brand.penalty + avoid.penalty.brand,
  };

  const reasons = [
    ...teasing.reasons,
    ...similarity.reasons,
    ...pronunciation.reasons,
    ...brand.reasons,
    ...avoid.reasons,
  ];

  return {
    penalties,
    teasingRisk: getRiskLevel(penalties.teasing),
    similarityRisk: getRiskLevel(penalties.similarity),
    pronunciationRisk: getRiskLevel(penalties.pronunciation),
    brandRisk: getRiskLevel(penalties.brand),
    reasons,
  };
}