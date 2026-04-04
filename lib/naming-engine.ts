import { runNameFilters, type RiskLevel } from "@/lib/name-filters";

export type BriefPayload = {
  category: string;
  targetName: string;
  familyName: string;
  purpose: string;
  styleKeywords: string;
  avoidKeywords: string;
  targetCountry: string;
  preferredScript: string;
  memo: string;
  gender?: "남자" | "여자" | "중성";
  birthDate?: string;   // YYYY-MM-DD, required for child
  birthTime?: string;   // HH:MM, optional for child
  childOrder?: string;  // 첫째 | 둘째 | 셋째 | 넷째 | 다섯째 | 조카
  needsGlobalPronunciation: boolean;
  needsStampPackage: boolean;
  needsDoorplatePackage: boolean;
  needsGiftCardPackage: boolean;
  needsLogoPackage?: boolean;
  lang: "ko" | "en" | "ja" | "zh" | "es" | "ru" | "fr" | "ar" | "hi";
};

export type NameCandidate = {
  id: string;
  name: string;
  english: string;
  chinese: string;
  chinesePinyin: string;
  japaneseKana: string;
  japaneseReading: string;
  meaning: string;
  story: string;
  fitReason: string;
  teasingRisk: RiskLevel;
  similarityRisk: RiskLevel;
  pronunciationRisk: RiskLevel;
  brandRisk?: RiskLevel;
  caution: string;
  score: number;
};

type TrackType = "safe" | "refined" | "creative";
type CategoryType =
  | "baby"
  | "me"
  | "rename"
  | "activity"
  | "brand"
  | "pet"
  | "global";

type IntentProfile = {
  soft: boolean;
  warm: boolean;
  premium: boolean;
  stable: boolean;
  unique: boolean;
  global: boolean;
  modern: boolean;
  bright: boolean;
  trust: boolean;
  calm: boolean;
  elegant: boolean;
  short: boolean;
  dayMood: boolean;
  nightMood: boolean;
};

type SyllablePool = {
  first: string[];
  second: string[];
  third?: string[];
};

type GeneratedSeed = {
  name: string;
  track: TrackType;
  tags: string[];
};

type LocalizedName = {
  english: string;
  chinese: string;
  chinesePinyin: string;
  japaneseKana: string;
  japaneseReading: string;
};

const HARD_BANNED_NAMES = new Set([
  "이안",
  "시온",
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
]);

const SOFT_COMMON_NAMES = new Set([
  "다온",
  "유나",
  "아린",
  "라온",
  "온유",
]);

const CURATED_FALLBACKS: Record<CategoryType, Record<TrackType, string[]>> = {
  baby: {
    safe: ["세린", "나엘", "다엘"],
    refined: ["아엘", "라엘", "루아"],
    creative: ["시엘", "에일로", "소레인"],
  },
  me: {
    safe: ["세린", "로안", "서연"],
    refined: ["아벤", "마엘", "아린서"],
    creative: ["아셀", "리브온", "소레인"],
  },
  rename: {
    safe: ["세린", "로안", "서연"],
    refined: ["아벤", "마엘", "아린서"],
    creative: ["아셀", "리브온", "소레인"],
  },
  activity: {
    safe: ["라엘", "시엘", "루온"],
    refined: ["아셀", "엘리안", "로미엘"],
    creative: ["소레인", "레비안", "벨로아"],
  },
  brand: {
    safe: ["루멘", "세르온", "노아룸"],
    refined: ["노벨로", "베리온", "아르엘"],
    creative: ["아르벤", "벨로안", "모비엘"],
  },
  pet: {
    safe: ["나엘", "아엘", "루니"],
    refined: ["라엘", "아도르", "모아"],
    creative: ["솔비아", "리브온", "보니엘"],
  },
  global: {
    safe: ["로안", "나엘", "리아온"],
    refined: ["엘리안", "아벤", "로미엘"],
    creative: ["에일로", "레비안", "베로안"],
  },
};

const HANGUL_TO_ROMAN: Record<string, string> = {
  세: "Se",
  나: "Na",
  다: "Da",
  라: "Ra",
  로: "Ro",
  루: "Ru",
  레: "Re",
  리: "Ri",
  마: "Ma",
  모: "Mo",
  미: "Mi",
  벨: "Bel",
  베: "Be",
  비: "Bi",
  보: "Bo",
  서: "Seo",
  소: "So",
  시: "Si",
  아: "A",
  에: "Ae",
  엘: "El",
  온: "On",
  오: "O",
  우: "U",
  유: "Yu",
  윤: "Yun",
  연: "Yeon",
  원: "Won",
  린: "Rin",
  솔: "Sol",
  셀: "Sel",
  안: "An",
  율: "Yul",
  담: "Dam",
  준: "Jun",
  빈: "Bin",
  벤: "Ben",
  니: "Ni",
  누: "Nu",
  도: "Do",
  일: "Il",
  르: "Reu",
  별: "Byeol",
  룸: "Rum",
};

const HANGUL_TO_KATAKANA: Record<string, string> = {
  세: "セ",
  나: "ナ",
  다: "ダ",
  라: "ラ",
  로: "ロ",
  루: "ル",
  레: "レ",
  리: "リ",
  마: "マ",
  모: "モ",
  미: "ミ",
  벨: "ベル",
  베: "ベ",
  비: "ビ",
  보: "ボ",
  서: "ソ",
  소: "ソ",
  시: "シ",
  아: "ア",
  에: "エ",
  엘: "エル",
  온: "オン",
  오: "オ",
  우: "ウ",
  유: "ユ",
  윤: "ユン",
  연: "ヨン",
  원: "ウォン",
  린: "リン",
  솔: "ソル",
  셀: "セル",
  안: "アン",
  율: "ユル",
  담: "ダム",
  준: "ジュン",
  빈: "ビン",
  벤: "ベン",
  니: "ニ",
  누: "ヌ",
  도: "ド",
  일: "イル",
  르: "ル",
  별: "ビョル",
  룸: "ルム",
};

function normalizeCategory(value: string): CategoryType {
  if (
    value === "baby" ||
    value === "me" ||
    value === "rename" ||
    value === "activity" ||
    value === "brand" ||
    value === "pet" ||
    value === "global"
  ) {
    return value;
  }
  // UI category → engine category mapping
  if (value === "child") return "baby";
  if (value === "self") return "me";
  if (value === "stage") return "activity";
  if (value === "korean_to_foreign" || value === "foreign_to_korean") return "global";
  return "baby";
}

function compactText(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function getIntentProfile(brief: BriefPayload): IntentProfile {
  const text = compactText([
    brief.purpose,
    brief.styleKeywords,
    brief.avoidKeywords,
    brief.targetCountry,
    brief.preferredScript,
    brief.memo,
  ]);

  return {
    soft: includesAny(text, ["부드", "soft", "gentle", "온화", "유연"]),
    warm: includesAny(text, ["따뜻", "warm", "다정", "포근", "온기"]),
    premium: includesAny(text, ["고급", "premium", "luxury", "세련", "품격", "elegant"]),
    stable: includesAny(text, ["안정", "steady", "stable", "오래", "질리지", "편안"]),
    unique: includesAny(text, ["독창", "unique", "rare", "희소", "특별", "차별"]),
    global: includesAny(text, ["글로벌", "global", "해외", "영문", "international"]),
    modern: includesAny(text, ["모던", "modern", "트렌디", "깔끔", "sharp"]),
    bright: includesAny(text, ["맑", "밝", "shine", "light", "clear"]),
    trust: includesAny(text, ["신뢰", "trust", "단정", "professional", "안정감"]),
    calm: includesAny(text, ["차분", "calm", "담백", "조용", "잔잔"]),
    elegant: includesAny(text, ["우아", "elegant", "품위", "세련", "고급"]),
    short: includesAny(text, ["짧", "간결", "simple", "short"]),
    dayMood: includesAny(text, ["낮의 결", "햇살", "맑고 단정", "설계 무드: 낮"]),
    nightMood: includesAny(text, ["밤의 결", "별빛", "깊고 고급", "설계 무드: 밤"]),
  };
}

function hasBatchim(char: string) {
  if (!char) return false;
  const code = char.charCodeAt(0) - 44032;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}

function getSurnamePenalty(familyName: string, name: string) {
  const family = familyName.trim();
  if (!family) return 0;

  const last = family[family.length - 1];
  const first = name[0];
  const full = `${family}${name}`;

  let penalty = 0;

  if (last === first) penalty += 8;
  if (/(.)\1/.test(full)) penalty += 3;
  if (full.includes("슬슬") || full.includes("온온") || full.includes("린린")) penalty += 5;
  if (family.length === 1 && family === first) penalty += 4;
  if (hasBatchim(last) && hasBatchim(first)) penalty += 2;
  if (full.length >= 4 && full.slice(1, 3) === full.slice(2, 4)) penalty += 2;

  return penalty;
}

function getSurnameBonus(familyName: string, name: string) {
  const family = familyName.trim();
  if (!family) return 0;

  const last = family[family.length - 1];
  const first = name[0];

  let bonus = 0;

  if (hasBatchim(last) && !hasBatchim(first)) bonus += 2;
  if (!hasBatchim(last) && hasBatchim(first)) bonus += 1;
  if (name.length <= 3) bonus += 1;

  return bonus;
}

function getCommonPenalty(name: string) {
  if (HARD_BANNED_NAMES.has(name)) return 100;
  if (SOFT_COMMON_NAMES.has(name)) return 7;
  return 0;
}

function splitHangulBlocks(name: string) {
  return Array.from(name);
}

function toEnglishName(name: string) {
  return splitHangulBlocks(name)
    .map((block) => HANGUL_TO_ROMAN[block] || block)
    .join("");
}

function toJapaneseName(name: string) {
  return splitHangulBlocks(name)
    .map((block) => HANGUL_TO_KATAKANA[block] || block)
    .join("");
}

function toChineseName(name: string) {
  return splitHangulBlocks(name)
    .map((block) => {
      switch (block) {
        case "세":
          return "世";
        case "나":
          return "娜";
        case "다":
          return "多";
        case "라":
          return "拉";
        case "로":
          return "罗";
        case "루":
          return "露";
        case "레":
          return "蕾";
        case "리":
          return "莉";
        case "마":
          return "玛";
        case "모":
          return "莫";
        case "미":
          return "美";
        case "벨":
          return "贝尔";
        case "베":
          return "贝";
        case "비":
          return "薇";
        case "보":
          return "宝";
        case "서":
          return "书";
        case "소":
          return "索";
        case "시":
          return "诗";
        case "아":
          return "雅";
        case "에":
          return "艾";
        case "엘":
          return "艾尔";
        case "온":
          return "温";
        case "안":
          return "安";
        case "연":
          return "妍";
        case "린":
          return "琳";
        case "솔":
          return "率";
        case "셀":
          return "瑟";
        case "벤":
          return "本";
        case "율":
          return "律";
        case "담":
          return "潭";
        case "준":
          return "俊";
        case "빈":
          return "彬";
        case "니":
          return "妮";
        case "누":
          return "努";
        case "도":
          return "多";
        case "일":
          return "一";
        case "르":
          return "尔";
        case "별":
          return "星";
        case "룸":
          return "룸";
        default:
          return block;
      }
    })
    .join("");
}

function toChinesePinyin(name: string) {
  return splitHangulBlocks(name)
    .map((block) => {
      switch (block) {
        case "세":
          return "Shì";
        case "나":
          return "Nà";
        case "다":
          return "Duō";
        case "라":
          return "Lā";
        case "로":
          return "Luó";
        case "루":
          return "Lù";
        case "레":
          return "Lěi";
        case "리":
          return "Lì";
        case "마":
          return "Mǎ";
        case "모":
          return "Mò";
        case "미":
          return "Měi";
        case "벨":
          return "Bèi Ěr";
        case "베":
          return "Bèi";
        case "비":
          return "Wēi";
        case "보":
          return "Bǎo";
        case "서":
          return "Shū";
        case "소":
          return "Suǒ";
        case "시":
          return "Shī";
        case "아":
          return "Yǎ";
        case "에":
          return "Ài";
        case "엘":
          return "Ài Ěr";
        case "온":
          return "Wēn";
        case "안":
          return "Ān";
        case "연":
          return "Yán";
        case "린":
          return "Lín";
        case "솔":
          return "Suǒ";
        case "셀":
          return "Sè";
        case "벤":
          return "Běn";
        case "율":
          return "Lǜ";
        case "담":
          return "Tán";
        case "준":
          return "Jùn";
        case "빈":
          return "Bīn";
        case "니":
          return "Nī";
        case "누":
          return "Nǔ";
        case "도":
          return "Duō";
        case "일":
          return "Yī";
        case "르":
          return "Ěr";
        case "별":
          return "Xīng";
        default:
          return block;
      }
    })
    .join(" ");
}

function getLocalizedName(name: string): LocalizedName {
  return {
    english: toEnglishName(name),
    chinese: toChineseName(name),
    chinesePinyin: toChinesePinyin(name),
    japaneseKana: toJapaneseName(name),
    japaneseReading: toEnglishName(name),
  };
}

function getTrackPools(
  category: CategoryType,
  track: TrackType,
  intent: IntentProfile
): SyllablePool {
  const softFirst = ["나", "다", "라", "루", "아", "에"];
  const premiumFirst = ["세", "라", "로", "마", "벨", "엘"];
  const modernFirst = ["시", "소", "아", "로", "레", "비"];
  const brightSecond = ["엘", "온", "안", "유", "연", "아"];
  const stableSecond = ["린", "안", "온", "담", "연", "율"];
  const distinctSecond = ["셀", "벤", "솔", "로", "비", "온"];

  const base: SyllablePool =
    track === "safe"
      ? {
          first: intent.soft || category === "baby" || category === "pet" ? softFirst : ["세", "나", "로", "다", "라", "서"],
          second: intent.stable || intent.trust ? stableSecond : ["린", "온", "안", "연", "엘", "유"],
        }
      : track === "refined"
      ? {
          first: premiumFirst,
          second: intent.premium || intent.elegant ? ["엘", "안", "린", "연", "온", "벤"] : ["엘", "안", "연", "온", "로", "린"],
          third: intent.global || category === "global" || category === "brand" ? ["안", "온", "엘", "로"] : undefined,
        }
      : {
          first: intent.unique || intent.modern ? modernFirst : ["시", "소", "비", "레", "루", "아"],
          second: distinctSecond,
          third: category === "activity" || category === "brand" || category === "global" ? ["안", "엘", "온", "아"] : undefined,
        };

  if (category === "brand") {
    if (track === "safe") return { first: ["루", "세", "노", "베"], second: ["멘", "온", "룸", "연"] };
    if (track === "refined") return { first: ["노", "베", "아", "엘"], second: ["벨", "리", "르", "벤"], third: ["로", "온", "엘"] };
    return { first: ["아", "벨", "모", "로"], second: ["르", "비", "로", "아"], third: ["벤", "안", "엘"] };
  }

  if (category === "activity") {
    if (track === "safe") return { first: ["라", "시", "루", "로"], second: ["엘", "온", "아", "유"] };
    if (track === "refined") return { first: ["아", "엘", "레", "비"], second: ["셀", "리", "온", "안"], third: ["엘", "온"] };
    return { first: ["소", "레", "비", "벨"], second: ["레", "비", "로", "온"], third: ["안", "엘", "아"] };
  }

  if (category === "global") {
    if (track === "safe") return { first: ["로", "나", "루", "아"], second: ["안", "엘", "온", "연"] };
    if (track === "refined") return { first: ["엘", "아", "로", "미"], second: ["리", "벤", "엘", "온"], third: ["안", "엘"] };
    return { first: ["에", "레", "베", "소"], second: ["일", "비", "로", "레"], third: ["로", "안", "엘"] };
  }

  return base;
}

function composeNames(
  pool: SyllablePool,
  track: TrackType,
  category: CategoryType,
  intent: IntentProfile
) {
  const names: string[] = [];

  for (const first of pool.first) {
    for (const second of pool.second) {
      const two = `${first}${second}`;
      if (two.length >= 2 && two.length <= 4) {
        names.push(two);
      }

      if (pool.third) {
        for (const third of pool.third) {
          const three = `${first}${second}${third}`;
          if (three.length >= 3 && three.length <= 6) {
            names.push(three);
          }
        }
      }
    }
  }

  if (track === "safe" && intent.short) {
    return names.filter((name) => name.length <= 2);
  }

  if (category === "baby" || category === "pet") {
    return names.filter((name) => name.length <= 3);
  }

  return names;
}

function getGeneratedSeeds(category: CategoryType, intent: IntentProfile): GeneratedSeed[] {
  const seeds: GeneratedSeed[] = [];

  (["safe", "refined", "creative"] as TrackType[]).forEach((track) => {
    const pool = getTrackPools(category, track, intent);
    const names = composeNames(pool, track, category, intent);

    names.forEach((name) => {
      const tags =
        track === "safe"
          ? ["stable", "trust", intent.soft ? "soft" : "clean"]
          : track === "refined"
          ? ["premium", "flow", intent.global ? "global" : "elegant"]
          : ["rare", "distinct", intent.modern ? "modern" : "mood"];

      seeds.push({
        name,
        track,
        tags,
      });
    });

    CURATED_FALLBACKS[category][track].forEach((name) => {
      seeds.push({
        name,
        track,
        tags:
          track === "safe"
            ? ["stable", "trust"]
            : track === "refined"
            ? ["premium", "flow"]
            : ["rare", "distinct"],
      });
    });
  });

  const map = new Map<string, GeneratedSeed>();
  seeds.forEach((seed) => {
    if (!map.has(seed.name)) map.set(seed.name, seed);
  });

  return Array.from(map.values());
}

function getTrackBase(track: TrackType) {
  if (track === "safe") return 90;
  if (track === "refined") return 92;
  return 88;
}

function getIntentBonus(seed: GeneratedSeed, intent: IntentProfile) {
  let bonus = 0;

  if (intent.soft && seed.tags.includes("soft")) bonus += 4;
  if (intent.warm && seed.tags.includes("soft")) bonus += 3;
  if (intent.premium && seed.tags.includes("premium")) bonus += 5;
  if (intent.stable && seed.tags.includes("stable")) bonus += 4;
  if (intent.unique && seed.tags.includes("rare")) bonus += 6;
  if (intent.global && seed.tags.includes("global")) bonus += 5;
  if (intent.modern && seed.tags.includes("modern")) bonus += 4;
  if (intent.bright && (seed.name.includes("엘") || seed.name.includes("온"))) bonus += 2;
  if (intent.trust && seed.tags.includes("trust")) bonus += 4;
  if (intent.calm && (seed.name.includes("린") || seed.name.includes("연"))) bonus += 2;
  if (intent.elegant && seed.tags.includes("elegant")) bonus += 4;
  if (intent.short && seed.name.length <= 2) bonus += 3;
  if (intent.dayMood && (seed.name.includes("온") || seed.name.includes("엘"))) bonus += 2;
  if (intent.nightMood && (seed.name.includes("벨") || seed.name.includes("레") || seed.name.includes("엘"))) bonus += 2;

  return bonus;
}

function buildMeaning(seed: GeneratedSeed, brief: BriefPayload, track: TrackType) {
  const category = normalizeCategory(brief.category);

  if (category === "brand") {
    if (track === "safe") return "업종 적합성과 신뢰 인상을 우선해 설계한 브랜드 이름";
    if (track === "refined") return "고급감과 확장성을 함께 고려한 브랜드 이름";
    return "흔한 브랜드 패턴을 피하면서도 실제 사용성을 유지한 브랜드 이름";
  }

  if (category === "global") {
    if (track === "safe") return "여러 언어권에서 무리 없이 통할 수 있도록 안정성을 우선한 이름";
    if (track === "refined") return "국제적 인상과 세련된 표기를 함께 고려한 이름";
    return "글로벌 사용성을 유지하면서도 차별화된 인상을 살린 이름";
  }

  if (track === "safe") return "성씨 조화와 장기 사용성을 우선해 설계한 이름";
  if (track === "refined") return "입력하신 분위기를 품격 있게 반영한 이름";
  return "흔한 패턴을 피하면서도 실제 사용에서 무리 없도록 설계한 이름";
}

function buildStory(seed: GeneratedSeed, brief: BriefPayload, track: TrackType, surnamePenalty: number) {
  const family = brief.familyName.trim();
  const category = normalizeCategory(brief.category);
  const moodText = brief.memo.includes("밤의 결")
    ? "깊고 여운 있는 감정선"
    : brief.memo.includes("낮의 결")
    ? "맑고 단정한 감정선"
    : "고객님이 요청하신 감정선";

  if (category === "baby") {
    return `${seed.name}은(는) 아이가 자라며 오래 불려도 질리지 않도록 부드러운 인상과 생활 속 호칭감을 함께 본 이름입니다. ${moodText}을 살리되 과한 유행형 느낌은 줄였고,${family ? ` '${family}${seed.name}'으로 이어지는 흐름도 함께 검토했습니다.` : " 실제로 가족이 부를 때의 안정감도 함께 고려했습니다."}`;
  }

  if (category === "brand") {
    return `${seed.name}은(는) 브랜드가 처음 들렸을 때의 신뢰감과 이후 확장 가능성을 함께 고려해 설계한 이름입니다. 설명적이기만 한 상호보다 인상과 기억에 남는 결을 더 중요하게 보았고,${surnamePenalty <= 2 ? " 발음 리듬도 비교적 안정적으로 정리했습니다." : " 리듬감과 발음 안정성도 함께 조정했습니다."}`;
  }

  if (category === "activity") {
    return `${seed.name}은(는) 한 번 들었을 때 기억에 남으면서도 실제로 불리기 부담스럽지 않도록 설계한 활동명 방향입니다. ${moodText}을 반영하면서도 검색성과 호칭감을 함께 고려해 과한 장식성을 줄였습니다.`;
  }

  if (category === "global") {
    return `${seed.name}은(는) 한국어 기준의 자연스러움을 잃지 않으면서도 해외 언어권에서의 발음 부담을 줄이도록 설계한 이름입니다. 철자와 소리의 단정함을 우선 보되, 너무 평범해 보이지 않도록 인상도 함께 조정했습니다.`;
  }

  if (category === "pet") {
    return `${seed.name}은(는) 매일 다정하게 부르기 쉬운 리듬과 애정 표현의 자연스러움을 함께 고려한 이름입니다. 귀여움만 앞세우기보다 입에 잘 붙고 오래 불러도 질리지 않는 방향으로 설계했습니다.`;
  }

  if (track === "safe") {
    return `${seed.name}은(는) 현재의 삶과 앞으로의 방향 사이에서 가장 무리 없이 이어질 수 있도록 안정감을 중심으로 설계한 이름입니다. ${moodText}을 살리면서도 과하게 장식적이지 않게 조율했고,${family ? ` '${family}${seed.name}'의 연결감도 함께 점검했습니다.` : " 실제로 불렸을 때의 안정감도 함께 고려했습니다."}`;
  }

  if (track === "refined") {
    return `${seed.name}은(는) 입력하신 분위기와 인상을 품격 있게 정리한 이름입니다. 너무 흔하지 않으면서도 낯설지 않도록 균형을 맞췄고, 발음과 표기의 단정함까지 함께 고려했습니다.`;
  }

  return `${seed.name}은(는) 준비된 이름을 꺼낸 결과가 아니라, 고객님이 적어주신 방향을 바탕으로 보다 차별화된 결을 살려 설계한 이름입니다. 희소성을 살리되 실제 사용에서 과하게 튀지 않도록 리듬을 정리했습니다.`;
}

function buildFitReason(
  seed: GeneratedSeed,
  brief: BriefPayload,
  track: TrackType,
  filterReasons: string[],
  surnamePenalty: number
) {
  const family = brief.familyName.trim();

  if (track === "safe") {
    return family && surnamePenalty <= 2
      ? `입력하신 목적과 성씨 흐름을 기준으로 가장 무리 없이 오래 사용할 수 있는 방향입니다. '${family}${seed.name}'으로 불렸을 때의 안정감이 비교적 좋습니다.`
      : `입력하신 목적과 실제 사용성을 기준으로 가장 안정적으로 추천드릴 수 있는 방향입니다. 첫인상과 장기 사용성의 균형이 좋습니다.`;
  }

  if (track === "refined") {
    return `입력하신 분위기와 감정선을 가장 정제된 방식으로 반영한 안입니다. 고급감은 살리되 과한 인위성은 줄인 방향이라 윙크네이밍의 중간축에 가장 가깝습니다.`;
  }

  if (filterReasons.length > 0) {
    return `고객님이 원하신 차별성과 설렘을 가장 강하게 반영한 방향입니다. ${filterReasons[0]}`;
  }

  return `고객님이 적어주신 바람과 회피 조건을 바탕으로, 흔한 패턴을 넘어서면서도 실제 사용이 가능한 선 안에서 가장 개성 있게 정리한 안입니다.`;
}

function buildCaution(
  seed: GeneratedSeed,
  brief: BriefPayload,
  surnamePenalty: number,
  commonPenalty: number,
  filterReasons: string[]
) {
  const notes: string[] = [];

  if (brief.familyName.trim() && surnamePenalty >= 5) {
    notes.push(`성과 함께 부를 때 '${brief.familyName}${seed.name}'의 리듬이 다소 무겁게 느껴질 수 있으니 직접 여러 번 소리 내어 확인해 보시는 것이 좋습니다.`);
  }

  if (commonPenalty >= 7 && commonPenalty < 100) {
    notes.push("익숙한 이름 인상이 일부 남아 있을 수 있어, 희소성을 더 원하시면 세련형 또는 창의형 안을 함께 비교해 보시는 것을 권합니다.");
  }

  if (normalizeCategory(brief.category) === "brand") {
    notes.push("브랜드명으로 확정하기 전에는 상표, 도메인, 동종 업계 사용 여부를 최종 확인해 주세요.");
  } else if (normalizeCategory(brief.category) === "global") {
    notes.push("해외 실사용 전에는 목표 언어권 화자에게 실제 발음과 인상을 한 번 더 확인해 보시는 것이 좋습니다.");
  } else {
    notes.push("실사용 전 가족 또는 가까운 주변에서 여러 번 불러보며 호칭감과 인상을 최종 확인해 보세요.");
  }

  if (filterReasons.length > 1) {
    notes.push(filterReasons[1]);
  }

  return unique(notes).join(" ");
}

function evaluateSeed(seed: GeneratedSeed, brief: BriefPayload, intent: IntentProfile): NameCandidate | null {
  const commonPenalty = getCommonPenalty(seed.name);
  if (commonPenalty >= 100) return null;

  const surnamePenalty = getSurnamePenalty(brief.familyName, seed.name);
  const surnameBonus = getSurnameBonus(brief.familyName, seed.name);

  const filter = runNameFilters({
    name: seed.name,
    category: brief.category,
    avoidKeywords: brief.avoidKeywords,
    memo: brief.memo,
    targetCountry: brief.targetCountry,
    purpose: brief.purpose,
  });

  const filterPenalty =
    filter.penalties.teasing +
    filter.penalties.similarity +
    filter.penalties.pronunciation +
    (normalizeCategory(brief.category) === "brand" ? filter.penalties.brand : 0);

  const score = Math.max(
    72,
    Math.min(
      98,
      getTrackBase(seed.track) +
        getIntentBonus(seed, intent) +
        surnameBonus -
        surnamePenalty -
        commonPenalty -
        filterPenalty
    )
  );

  const localized = getLocalizedName(seed.name);

  return {
    id: `${seed.name}-${seed.track}-v4`,
    name: seed.name,
    english: localized.english,
    chinese: localized.chinese,
    chinesePinyin: localized.chinesePinyin,
    japaneseKana: localized.japaneseKana,
    japaneseReading: localized.japaneseReading,
    meaning: buildMeaning(seed, brief, seed.track),
    story: buildStory(seed, brief, seed.track, surnamePenalty),
    fitReason: buildFitReason(seed, brief, seed.track, filter.reasons, surnamePenalty),
    teasingRisk: filter.teasingRisk,
    similarityRisk: filter.similarityRisk,
    pronunciationRisk: filter.pronunciationRisk,
    brandRisk: normalizeCategory(brief.category) === "brand" ? filter.brandRisk : undefined,
    caution: buildCaution(seed, brief, surnamePenalty, commonPenalty, filter.reasons),
    score,
  };
}

function getJamoSet(name: string) {
  return new Set(Array.from(name));
}

function getNameSimilarity(a: string, b: string) {
  if (a === b) return 1;

  const aSet = getJamoSet(a);
  const bSet = getJamoSet(b);

  let intersection = 0;
  for (const ch of aSet) {
    if (bSet.has(ch)) intersection += 1;
  }

  const union = new Set([...aSet, ...bSet]).size || 1;
  const jaccard = intersection / union;

  const prefixBonus = a[0] === b[0] ? 0.18 : 0;
  const suffixBonus = a[a.length - 1] === b[b.length - 1] ? 0.14 : 0;
  const lengthBonus = Math.abs(a.length - b.length) === 0 ? 0.08 : 0;

  return Math.min(1, jaccard + prefixBonus + suffixBonus + lengthBonus);
}

function isTooSimilarToPicked(candidate: NameCandidate, picked: NameCandidate[]) {
  return picked.some((item) => getNameSimilarity(candidate.name, item.name) >= 0.68);
}

function pickBestCandidate(
  candidates: NameCandidate[],
  track: TrackType,
  picked: NameCandidate[]
) {
  const sameTrack = candidates
    .filter((item) => item.id.includes(`-${track}-`))
    .sort((a, b) => b.score - a.score);

  const diverse = sameTrack.find((item) => !isTooSimilarToPicked(item, picked));
  if (diverse) return diverse;

  return sameTrack[0];
}

export function generateNameCandidates(brief: BriefPayload): NameCandidate[] {
  const category = normalizeCategory(brief.category);
  const intent = getIntentProfile(brief);

  const seeds = getGeneratedSeeds(category, intent);
  const candidates = seeds
    .map((seed) => evaluateSeed(seed, brief, intent))
    .filter((item): item is NameCandidate => Boolean(item))
    .sort((a, b) => b.score - a.score);

  const picked: NameCandidate[] = [];

  const safe = pickBestCandidate(candidates, "safe", picked);
  if (safe) picked.push(safe);

  const refined = pickBestCandidate(candidates, "refined", picked);
  if (refined && !picked.some((item) => item.name === refined.name)) picked.push(refined);

  const creative = pickBestCandidate(candidates, "creative", picked);
  if (creative && !picked.some((item) => item.name === creative.name)) picked.push(creative);

  if (picked.length < 3) {
    for (const candidate of candidates) {
      if (picked.some((item) => item.name === candidate.name)) continue;
      if (isTooSimilarToPicked(candidate, picked)) continue;
      picked.push(candidate);
      if (picked.length === 3) break;
    }
  }

  if (picked.length < 3) {
    for (const candidate of candidates) {
      if (picked.some((item) => item.name === candidate.name)) continue;
      picked.push(candidate);
      if (picked.length === 3) break;
    }
  }

  return picked;
}