/**
 * saju.ts
 * 생년월일 기반 사주팔자(四柱八字) 천간지지 오행 계산
 *
 * ■ 4기둥: 年柱·月柱·日柱·時柱
 * ■ 천간(天干) 오행: 甲乙→木 | 丙丁→火 | 戊己→土 | 庚辛→金 | 壬癸→水
 * ■ 지지(地支) 오행: 子亥→水 | 寅卯→木 | 午巳→火 | 申酉→金 | 辰戌丑未→土
 * ■ 월주: 절기(節氣) 월건법 — 立春 기준 연도 전환
 * ■ 일주: 율리우스 적일(JDN) 기반 60갑자 순환
 *         검증 기준: 1970-01-01 = JDN 2440588 = 庚午(경오)일
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

// 시간(0-23시) → 지지 (2시간 단위)
const HOUR_BRANCH: Record<number, EarthlyBranch> = {
  23: "子", 0: "子", 1: "丑", 2: "丑",
  3: "寅", 4: "寅", 5: "卯", 6: "卯",
  7: "辰", 8: "辰", 9: "巳", 10: "巳",
  11: "午", 12: "午", 13: "未", 14: "未",
  15: "申", 16: "申", 17: "酉", 18: "酉",
  19: "戌", 20: "戌", 21: "亥", 22: "亥",
};

export type SajuResult = {
  // 年柱
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  yearElement: Element;
  yearBranchElement: Element;
  // 月柱
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  monthElement: Element;
  monthBranchElement: Element;
  // 日柱
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  dayElement: Element;
  dayBranchElement: Element;
  // 時柱 (선택)
  hourStem?: HeavenlyStem;
  hourBranch?: EarthlyBranch;
  hourElement?: Element;
  hourBranchElement?: Element;
  // 분석
  lacking: Element[];
  dominant: Element[];
  summary: string;
  namingHint: string;
};

// ── 연주(年柱) ────────────────────────────────────────────────────────────────

function getYearStem(year: number): HeavenlyStem {
  return STEMS[((year - 4) % 10 + 10) % 10];
}

function getYearBranch(year: number): EarthlyBranch {
  return BRANCHES[((year - 4) % 12 + 12) % 12];
}

// ── 일주(日柱) — 율리우스 적일(JDN) 기반 ────────────────────────────────────
// 율리우스 적일 계산 (그레고리력 기준)
// 검증: gregorianToJDN(1970,1,1) = 2440588, gregorianToJDN(1900,1,1) = 2415021

function gregorianToJDN(y: number, m: number, d: number): number {
  const a  = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d
    + Math.floor((153 * mm + 2) / 5)
    + 365 * yy
    + Math.floor(yy / 4)
    - Math.floor(yy / 100)
    + Math.floor(yy / 400)
    - 32045
  );
}

// 1970-01-01 = JDN 2440588 = 庚午(stemIdx=6, branchIdx=6)
// stem:   (JDN + 8) % 10  →  (2440588 + 8) % 10 = 6 (庚) ✓
// branch: (JDN + 2) % 12  →  (2440588 + 2) % 12 = 6 (午) ✓

function getDayPillar(y: number, m: number, d: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const jdn       = gregorianToJDN(y, m, d);
  const stemIdx   = ((jdn + 8) % 10 + 10) % 10;
  const branchIdx = ((jdn + 2) % 12 + 12) % 12;
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx] };
}

// ── 월주(月柱) — 절기(節氣) 월건법 ──────────────────────────────────────────
// 절기 경계: [양력 월, 양력 일, 寅月(offset=0) 기준 월 오프셋]
// offset 0=寅月(正月), 1=卯月, ..., 10=子月, 11=丑月
// 소한(1/6) 이전(1/1~1/5)은 전년 子月 연속 → 초기값 offset=10

const SOLAR_TERMS: [number, number, number][] = [
  [1,  6, 11], // 小寒  ~1/6  → 丑月
  [2,  4,  0], // 立春  ~2/4  → 寅月
  [3,  6,  1], // 驚蟄  ~3/6  → 卯月
  [4,  5,  2], // 清明  ~4/5  → 辰月
  [5,  6,  3], // 立夏  ~5/6  → 巳月
  [6,  6,  4], // 芒種  ~6/6  → 午月
  [7,  7,  5], // 小暑  ~7/7  → 未月
  [8,  7,  6], // 立秋  ~8/7  → 申月
  [9,  8,  7], // 白露  ~9/8  → 酉月
  [10, 8,  8], // 寒露 ~10/8  → 戌月
  [11, 7,  9], // 立冬 ~11/7  → 亥月
  [12, 7, 10], // 大雪 ~12/7  → 子月
];

function getMonthOffset(month: number, day: number): number {
  let offset = 10; // 1/1~1/5는 子月 (전년 大雪 이후)
  for (const [m, d, o] of SOLAR_TERMS) {
    if (month > m || (month === m && day >= d)) {
      offset = o;
    }
  }
  return offset;
}

function getMonthPillar(
  year: number,
  month: number,
  day: number,
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // 立春(2/4) 이전이면 월간 계산 기준 연도를 전년으로 (사주 연도는 立春 기준)
  const refYear     = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  const yearStemIdx = STEMS.indexOf(getYearStem(refYear));

  // 寅月 기준 月干 시작값
  // 甲·己년→丙(2), 乙·庚년→戊(4), 丙·辛년→庚(6), 丁·壬년→壬(8), 戊·癸년→甲(0)
  const yinStemBase = ((yearStemIdx % 5) * 2 + 2) % 10;
  const offset      = getMonthOffset(month, day);
  const stemIdx     = (yinStemBase + offset) % 10;
  const branchIdx   = (2 + offset) % 12; // 寅=2, 卯=3, 辰=4, ...

  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx] };
}

// ── 시주(時柱) ────────────────────────────────────────────────────────────────

function getHourPillar(
  dayStemIdx: number,
  hour: number,
): { stem: HeavenlyStem; branch: EarthlyBranch } | null {
  const branch = HOUR_BRANCH[hour];
  if (!branch) return null;

  const branchIdx = BRANCHES.indexOf(branch);

  // 子時 기준 時干 시작값
  // 甲·己일→甲(0), 乙·庚일→丙(2), 丙·辛일→戊(4), 丁·壬일→庚(6), 戊·癸일→壬(8)
  const ziStemBase = ((dayStemIdx % 5) * 2) % 10;
  const stemIdx    = (ziStemBase + branchIdx) % 10;

  return { stem: STEMS[stemIdx], branch };
}

// ── 메인 calcSaju ──────────────────────────────────────────────────────────────

export function calcSaju(birthDate: string, birthTime?: string): SajuResult | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

  const year  = parseInt(birthDate.slice(0, 4), 10);
  const month = parseInt(birthDate.slice(5, 7), 10);
  const day   = parseInt(birthDate.slice(8, 10), 10);
  if (isNaN(year) || year < 1900 || year > 2100) return null;

  // 年柱
  const yearStem          = getYearStem(year);
  const yearBranch        = getYearBranch(year);
  const yearElement       = STEM_ELEMENT[yearStem];
  const yearBranchElement = BRANCH_ELEMENT[yearBranch];

  // 月柱
  const { stem: monthStem, branch: monthBranch } = getMonthPillar(year, month, day);
  const monthElement       = STEM_ELEMENT[monthStem];
  const monthBranchElement = BRANCH_ELEMENT[monthBranch];

  // 日柱
  const { stem: dayStem, branch: dayBranch } = getDayPillar(year, month, day);
  const dayElement       = STEM_ELEMENT[dayStem];
  const dayBranchElement = BRANCH_ELEMENT[dayBranch];

  // 時柱
  let hourStem: HeavenlyStem | undefined;
  let hourBranch: EarthlyBranch | undefined;
  let hourElement: Element | undefined;
  let hourBranchElement: Element | undefined;

  if (birthTime && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    const hour       = parseInt(birthTime.split(":")[0], 10);
    const dayStemIdx = STEMS.indexOf(dayStem);
    const hourResult = getHourPillar(dayStemIdx, hour);
    if (hourResult) {
      hourStem          = hourResult.stem;
      hourBranch        = hourResult.branch;
      hourElement       = STEM_ELEMENT[hourStem];
      hourBranchElement = BRANCH_ELEMENT[hourBranch];
    }
  }

  // 오행 집계 (6~8자)
  const elementCounts: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  elementCounts[yearElement]++;
  elementCounts[yearBranchElement]++;
  elementCounts[monthElement]++;
  elementCounts[monthBranchElement]++;
  elementCounts[dayElement]++;
  elementCounts[dayBranchElement]++;
  if (hourElement)       elementCounts[hourElement]++;
  if (hourBranchElement) elementCounts[hourBranchElement]++;

  const allElements: Element[] = ["木", "火", "土", "金", "水"];
  const lacking  = allElements.filter(e => elementCounts[e] === 0);
  const dominant = allElements.filter(e => elementCounts[e] >= 3);

  // 기둥 한글 표기 헬퍼
  function ko(s: HeavenlyStem, b: EarthlyBranch) {
    return `${STEM_KO[s]}${BRANCH_KO[b].split("(")[0]}`;
  }

  const summary = [
    `年柱 ${ko(yearStem, yearBranch)}(${yearElement}·${yearBranchElement})`,
    `月柱 ${ko(monthStem, monthBranch)}(${monthElement}·${monthBranchElement})`,
    `日柱 ${ko(dayStem, dayBranch)}(${dayElement}·${dayBranchElement})`,
    hourStem && hourBranch
      ? `時柱 ${ko(hourStem, hourBranch)}(${hourElement}·${hourBranchElement})`
      : "時柱 미상",
    lacking.length > 0 ? `/ 부족 오행: ${lacking.join(" ")}` : "/ 오행 균형",
  ].join(" ");

  let namingHint: string;
  if (lacking.length > 0) {
    namingHint = `이름에 ${lacking.join("·")} 오행 한자를 보완하면 균형을 맞출 수 있습니다.`;
  } else if (dominant.length > 0) {
    namingHint = `${dominant.join("·")} 오행이 강하니, 이름에는 상생 오행이나 균형 오행을 선택하세요.`;
  } else {
    namingHint = "사주 오행이 고르게 분포되어 있어 이름 선택 자유도가 높습니다.";
  }

  return {
    yearStem,  yearBranch,  yearElement,  yearBranchElement,
    monthStem, monthBranch, monthElement, monthBranchElement,
    dayStem,   dayBranch,   dayElement,   dayBranchElement,
    hourStem,  hourBranch,  hourElement,  hourBranchElement,
    lacking, dominant, summary, namingHint,
  };
}

/**
 * 사주 정보를 AI 프롬프트용 텍스트로 변환
 */
export function sajuToPromptText(saju: SajuResult): string {
  function ko(s: HeavenlyStem, b: EarthlyBranch) {
    return `${STEM_KO[s]}${BRANCH_KO[b].split("(")[0]}`;
  }

  const pillars = [
    `年柱 ${ko(saju.yearStem, saju.yearBranch)}(${saju.yearElement}·${saju.yearBranchElement})`,
    `月柱 ${ko(saju.monthStem, saju.monthBranch)}(${saju.monthElement}·${saju.monthBranchElement})`,
    `日柱 ${ko(saju.dayStem, saju.dayBranch)}(${saju.dayElement}·${saju.dayBranchElement})`,
    saju.hourStem && saju.hourBranch
      ? `時柱 ${ko(saju.hourStem, saju.hourBranch)}(${saju.hourElement}·${saju.hourBranchElement})`
      : "時柱 미상",
  ];

  const lines: string[] = [
    "[사주팔자 분석]",
    `• ${pillars.join(" / ")}`,
    `• 작명 가이드: ${saju.namingHint}`,
  ];

  if (saju.lacking.length > 0) {
    lines.push(`• 우선 반영 오행: ${saju.lacking.join(", ")} (부족 오행 보완)`);
  }
  if (saju.dominant.length > 0) {
    lines.push(`• 강한 오행: ${saju.dominant.join(", ")} (균형 고려)`);
  }

  return lines.join("\n");
}
