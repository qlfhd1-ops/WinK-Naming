/**
 * saju.ts
 * 생년월일 기반 사주(四柱) 천간지지 오행 계산
 *
 * ■ 천간(天干) 오행
 *   甲乙 → 木 | 丙丁 → 火 | 戊己 → 土 | 庚辛 → 金 | 壬癸 → 水
 *
 * ■ 지지(地支) 오행
 *   子亥 → 水 | 寅卯 → 木 | 午巳 → 火 | 申酉 → 金 | 辰戌丑未 → 土
 *
 * ■ 시주(時柱)는 태어난 시간(시각)으로 계산 — 선택값
 */

import type { Element } from "./hanja-analysis";

export type HeavenlyStem =
  | "甲" | "乙" | "丙" | "丁" | "戊"
  | "己" | "庚" | "辛" | "壬" | "癸";

export type EarthlyBranch =
  | "子" | "丑" | "寅" | "卯" | "辰" | "巳"
  | "午" | "未" | "申" | "酉" | "戌" | "亥";

const STEMS: HeavenlyStem[] = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES: EarthlyBranch[] = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

export const STEM_ELEMENT: Record<HeavenlyStem, Element> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

export const BRANCH_ELEMENT: Record<EarthlyBranch, Element> = {
  子: "水", 亥: "水",
  寅: "木", 卯: "木",
  巳: "火", 午: "火",
  辰: "土", 戌: "土", 丑: "土", 未: "土",
  申: "金", 酉: "金",
};

export const STEM_KO: Record<HeavenlyStem, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};

export const BRANCH_KO: Record<EarthlyBranch, string> = {
  子: "자(쥐)", 丑: "축(소)",  寅: "인(호랑이)", 卯: "묘(토끼)",
  辰: "진(용)",  巳: "사(뱀)", 午: "오(말)",      未: "미(양)",
  申: "신(원숭이)", 酉: "유(닭)", 戌: "술(개)",   亥: "해(돼지)",
};

// 시간(0-23시) → 지지
const HOUR_BRANCH: Record<number, EarthlyBranch> = {
  23: "子", 0: "子", 1: "丑", 2: "丑",
  3: "寅", 4: "寅", 5: "卯", 6: "卯",
  7: "辰", 8: "辰", 9: "巳", 10: "巳",
  11: "午", 12: "午", 13: "未", 14: "未",
  15: "申", 16: "申", 17: "酉", 18: "酉",
  19: "戌", 20: "戌", 21: "亥", 22: "亥",
};

export type SajuResult = {
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  yearElement: Element;        // 천간 오행 (주 오행)
  yearBranchElement: Element;  // 지지 오행
  hourBranch?: EarthlyBranch;
  hourElement?: Element;
  lacking: Element[];          // 부족한 오행 (5개 중 없는 것)
  dominant: Element[];         // 강한 오행 (2회 이상)
  summary: string;             // "갑자년 (木水) — 木 부족"
  namingHint: string;          // 이름 설계에 활용할 힌트
};

/** 연도 → 천간 */
function getYearStem(year: number): HeavenlyStem {
  return STEMS[((year - 4) % 10 + 10) % 10];
}

/** 연도 → 지지 */
function getYearBranch(year: number): EarthlyBranch {
  return BRANCHES[((year - 4) % 12 + 12) % 12];
}

/**
 * 생년월일/시간으로 사주 오행 분석
 * @param birthDate "YYYY-MM-DD" 형식
 * @param birthTime "HH:MM" 형식 (선택)
 */
export function calcSaju(birthDate: string, birthTime?: string): SajuResult | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

  const year = parseInt(birthDate.slice(0, 4), 10);
  if (isNaN(year) || year < 1900 || year > 2100) return null;

  const yearStem = getYearStem(year);
  const yearBranch = getYearBranch(year);
  const yearElement = STEM_ELEMENT[yearStem];
  const yearBranchElement = BRANCH_ELEMENT[yearBranch];

  // 시주 계산
  let hourBranch: EarthlyBranch | undefined;
  let hourElement: Element | undefined;
  if (birthTime && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    const hour = parseInt(birthTime.split(":")[0], 10);
    hourBranch = HOUR_BRANCH[hour];
    hourElement = hourBranch ? BRANCH_ELEMENT[hourBranch] : undefined;
  }

  // 보유 오행 집계
  const elementCounts: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  elementCounts[yearElement]++;
  elementCounts[yearBranchElement]++;
  if (hourElement) elementCounts[hourElement]++;

  const allElements: Element[] = ["木", "火", "土", "金", "水"];
  const lacking = allElements.filter(e => elementCounts[e] === 0);
  const dominant = allElements.filter(e => elementCounts[e] >= 2);

  const stemKo = STEM_KO[yearStem];
  const branchKo = BRANCH_KO[yearBranch];

  let namingHint = "";
  if (lacking.length > 0) {
    namingHint = `이름에 ${lacking.map(e => e).join("·")} 오행 한자를 보완하면 균형을 맞출 수 있습니다.`;
  } else if (dominant.length > 0) {
    namingHint = `${dominant.join("·")} 오행이 강하니, 이름에는 다른 오행으로 균형을 맞추거나 상생 오행을 선택하세요.`;
  } else {
    namingHint = "사주 오행이 고르게 분포되어 있어 이름 선택 자유도가 높습니다.";
  }

  const summary = `${stemKo}${branchKo.split("(")[0]}년생 — 천간 ${yearElement}(${stemKo}), 지지 ${yearBranchElement}${hourElement ? `, 시주 ${hourElement}` : ""}${lacking.length > 0 ? ` / 부족 오행: ${lacking.join(" ")}` : " / 오행 균형"}`;

  return {
    yearStem,
    yearBranch,
    yearElement,
    yearBranchElement,
    hourBranch,
    hourElement,
    lacking,
    dominant,
    summary,
    namingHint,
  };
}

/**
 * 사주 정보를 AI 프롬프트용 텍스트로 변환
 */
export function sajuToPromptText(saju: SajuResult): string {
  const lines: string[] = [
    `[사주 오행 분석]`,
    `• ${saju.summary}`,
    `• 작명 가이드: ${saju.namingHint}`,
  ];

  if (saju.lacking.length > 0) {
    lines.push(`• 이름 한자에 우선 반영할 오행: ${saju.lacking.join(", ")} (부족 오행 보완)`);
  }

  return lines.join("\n");
}
