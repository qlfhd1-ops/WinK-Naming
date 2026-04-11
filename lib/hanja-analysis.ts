/**
 * hanja-analysis.ts
 * 이름용 한자 분석 엔진 — 획수, 오행(자원오행 기준), 음양
 *
 * ■ 오행 분류 기준 (자원오행, 字源五行)
 *   木: 나무·식물 부수 (木 艹 竹 등)
 *   火: 불·빛·에너지 부수 (火 灬 日 등)
 *   土: 흙·산·땅 부수 (土 山 石 등)
 *   金: 금속·쇠·옥 부수 (金 钅 玉 등)
 *   水: 물·비·강 부수 (水 氵 雨 등)
 *
 * ■ 음양 기준: 획수 홀수 → 陽, 짝수 → 陰
 *
 * ■ 오행 상생: 木→火→土→金→水→木
 * ■ 오행 상극: 木→土, 火→金, 土→水, 金→木, 水→火
 */

export type Element = "木" | "火" | "土" | "金" | "水";
export type YinYang = "陽" | "陰";

export type HanjaInfo = {
  char: string;
  strokes: number;
  element: Element;
  yinyang: YinYang;
  meaning: string;
};

// ─── 오행 관계 ───────────────────────────────────────────────
export const GENERATING: Record<Element, Element> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};

export const OVERCOMING: Record<Element, Element> = {
  木: "土", 火: "金", 土: "水", 金: "木", 水: "火",
};

export const ELEMENT_KO: Record<Element, string> = {
  木: "목(木)", 火: "화(火)", 土: "토(土)", 金: "금(金)", 水: "수(水)",
};

// ─── 발음오행 (한국어 자음 기준) ─────────────────────────────
export const CONSONANT_ELEMENT: Record<string, Element> = {
  ㄱ: "木", ㅋ: "木",
  ㄴ: "火", ㄷ: "火", ㅌ: "火", ㄹ: "火",
  ㅇ: "土", ㅎ: "土",
  ㅅ: "金", ㅈ: "金", ㅊ: "金",
  ㅁ: "水", ㅂ: "水", ㅍ: "水",
};

// ─── 이름용 주요 한자 DB (~150자) ───────────────────────────
// strokes: 실제 획수 / element: 자원오행 / yinyang: 획수 홀짝 기준
const RAW_DB: Array<[string, number, Element, string]> = [
  // [한자, 획수, 오행, 뜻]

  // ── 木 계열 ──
  ["木",  4,  "木", "나무 목"],
  ["林",  8,  "木", "수풀 림"],
  ["松",  8,  "木", "소나무 송"],
  ["柳",  9,  "木", "버들 류"],
  ["桂", 10,  "木", "계수나무 계"],
  ["梓", 11,  "木", "가래나무 재"],
  ["楠", 13,  "木", "녹나무 남"],
  ["楓", 13,  "木", "단풍 풍"],
  ["榮", 14,  "木", "영화 영"],
  ["樹", 16,  "木", "나무 수"],
  ["棟", 12,  "木", "마룻대 동"],
  ["杰",  8,  "木", "뛰어날 걸"],
  ["根", 10,  "木", "뿌리 근"],
  ["格", 10,  "木", "격식 격"],
  ["植", 12,  "木", "심을 식"],
  ["樂", 15,  "木", "즐거울 락"],
  ["朴",  6,  "木", "순박할 박"],
  ["東",  8,  "木", "동녘 동"],
  ["桃", 10,  "木", "복숭아 도"],
  ["橋", 16,  "木", "다리 교"],
  ["仁",  4,  "木", "어질 인"],
  ["俊",  9,  "木", "준걸 준"],
  ["英",  8,  "木", "꽃부리 영"],
  ["豪", 14,  "木", "호걸 호"],
  ["强", 11,  "木", "강할 강"],
  ["健", 11,  "木", "굳셀 건"],
  ["文",  4,  "木", "글월 문"],
  ["和",  8,  "木", "화할 화"],
  ["人",  2,  "木", "사람 인"],
  ["春",  9,  "木", "봄 춘"],
  ["風",  9,  "木", "바람 풍"],
  ["花",  7,  "木", "꽃 화"],
  ["蓮", 13,  "木", "연꽃 련"],
  ["芝",  6,  "木", "지초 지"],
  ["蘭", 20,  "木", "난초 란"],
  ["菊", 11,  "木", "국화 국"],
  ["嫺", 14,  "木", "아름다울 한"],

  // ── 火 계열 ──
  ["火",  4,  "火", "불 화"],
  ["炎",  8,  "火", "불꽃 염"],
  ["炫",  9,  "火", "빛날 현"],
  ["炳",  9,  "火", "빛날 병"],
  ["熙", 13,  "火", "빛날 희"],
  ["煥", 13,  "火", "빛날 환"],
  ["燦", 17,  "火", "빛날 찬"],
  ["燮", 17,  "火", "고를 섭"],
  ["日",  4,  "火", "해 일"],
  ["旻",  8,  "火", "가을하늘 민"],
  ["昊",  8,  "火", "넓은 하늘 호"],
  ["旭",  6,  "火", "아침 햇빛 욱"],
  ["晨", 11,  "火", "새벽 신"],
  ["晉", 10,  "火", "나아갈 진"],
  ["晧", 11,  "火", "밝을 호"],
  ["曜", 18,  "火", "빛날 요"],
  ["燁", 16,  "火", "빛날 엽"],
  ["炅",  8,  "火", "빛날 경"],
  ["晶", 12,  "火", "밝을 정"],
  ["天",  4,  "火", "하늘 천"],
  ["大",  3,  "火", "클 대"],
  ["美",  9,  "火", "아름다울 미"],
  ["平",  5,  "火", "평평할 평"],
  ["忠",  8,  "火", "충성 충"],
  ["禮", 18,  "火", "예도 예"],
  ["勇",  9,  "火", "날랠 용"],
  ["志",  7,  "火", "뜻 지"],
  ["光",  6,  "火", "빛 광"],
  ["輝", 15,  "火", "빛날 휘"],
  ["赫", 14,  "火", "빛날 혁"],
  ["昱",  9,  "火", "빛날 욱"],
  ["翊", 11,  "火", "도울 익"],
  ["慧", 15,  "火", "슬기로울 혜"],
  ["夏", 10,  "火", "여름 하"],
  ["星",  9,  "火", "별 성"],
  ["明",  8,  "火", "밝을 명"],

  // ── 土 계열 ──
  ["土",  3,  "土", "흙 토"],
  ["基", 11,  "土", "터 기"],
  ["坤",  8,  "土", "땅 곤"],
  ["培", 11,  "土", "북돋울 배"],
  ["垠",  9,  "土", "언덕 은"],
  ["堯", 12,  "土", "높을 요"],
  ["城",  9,  "土", "성 성"],
  ["均",  7,  "土", "고를 균"],
  ["域", 11,  "土", "지경 역"],
  ["山",  3,  "土", "뫼 산"],
  ["岩",  8,  "土", "바위 암"],
  ["峻", 10,  "土", "높을 준"],
  ["嶽", 17,  "土", "큰 산 악"],
  ["石",  5,  "土", "돌 석"],
  ["埈", 10,  "土", "높을 준"],
  ["地",  6,  "土", "땅 지"],
  ["坦",  8,  "土", "평탄할 탄"],
  ["雄", 12,  "土", "수컷 웅"],
  ["宇",  6,  "土", "집 우"],
  ["宙",  8,  "土", "하늘 주"],
  ["宣",  9,  "土", "베풀 선"],
  ["宰", 10,  "土", "재상 재"],
  ["安",  6,  "土", "편안 안"],
  ["宜",  8,  "土", "마땅할 의"],
  ["信",  9,  "土", "믿을 신"],
  ["孝",  7,  "土", "효도 효"],
  ["道", 12,  "土", "길 도"],
  ["德", 15,  "土", "덕 덕"],
  ["惠", 12,  "土", "은혜 혜"],
  ["福", 13,  "土", "복 복"],
  ["壽", 14,  "土", "목숨 수"],

  // ── 金 계열 ──
  ["金",  8,  "金", "쇠 금"],
  ["銀", 14,  "金", "은 은"],
  ["鉉", 11,  "金", "솥귀 현"],
  ["鎭", 18,  "金", "진압할 진"],
  ["錦", 16,  "金", "비단 금"],
  ["銘", 14,  "金", "새길 명"],
  ["鍾", 17,  "金", "모일 종"],
  ["鐘", 20,  "金", "종 종"],
  ["珍",  9,  "金", "보배 진"],
  ["珠", 10,  "金", "구슬 주"],
  ["璃", 15,  "金", "유리 리"],
  ["琴", 12,  "金", "거문고 금"],
  ["玲",  9,  "金", "옥소리 령"],
  ["璇", 16,  "金", "아름다운 옥 선"],
  ["瑞", 13,  "金", "상서로울 서"],
  ["玟",  8,  "金", "옥돌 민"],
  ["義", 13,  "金", "옳을 의"],
  ["賢", 15,  "金", "어질 현"],
  ["武",  8,  "金", "굳셀 무"],
  ["秋",  9,  "金", "가을 추"],

  // ── 水 계열 ──
  ["水",  4,  "水", "물 수"],
  ["泳",  8,  "水", "헤엄칠 영"],
  ["洙",  9,  "水", "물이름 수"],
  ["海", 10,  "水", "바다 해"],
  ["浩", 10,  "水", "넓을 호"],
  ["泰", 10,  "水", "클 태"],
  ["洋",  9,  "水", "큰바다 양"],
  ["淸", 11,  "水", "맑을 청"],
  ["潤", 15,  "水", "윤택할 윤"],
  ["源", 13,  "水", "근원 원"],
  ["澤", 16,  "水", "못 택"],
  ["河",  8,  "水", "물 하"],
  ["漢", 14,  "水", "한수 한"],
  ["溫", 13,  "水", "따뜻할 온"],
  ["波",  8,  "水", "물결 파"],
  ["泫",  8,  "Water" as Element, "빛날 현"],
  ["渡", 12,  "水", "건널 도"],
  ["湖", 12,  "水", "호수 호"],
  ["智", 12,  "水", "지혜 지"],
  ["憲", 16,  "水", "법 헌"],
  ["準", 13,  "水", "준할 준"],
  ["民",  5,  "水", "백성 민"],
  ["妍",  7,  "水", "고울 연"],
  ["娟", 10,  "水", "예쁠 연"],
  ["娜", 10,  "水", "아름다울 나"],
  ["雨",  8,  "水", "비 우"],
  ["雪", 11,  "水", "눈 설"],
  ["月",  4,  "水", "달 월"],
  ["冬",  5,  "水", "겨울 동"],
];

// ─── DB 빌드 ─────────────────────────────────────────────────
const HANJA_DB = new Map<string, HanjaInfo>(
  RAW_DB.map(([char, strokes, element, meaning]) => {
    const el: Element =
      element === ("Water" as Element) ? "水" : element;
    const yinyang: YinYang = strokes % 2 !== 0 ? "陽" : "陰";
    return [char, { char, strokes, element: el, yinyang, meaning }];
  })
);

// ─── 공개 API ────────────────────────────────────────────────

/** 한자 1자 정보 조회 */
export function getHanjaInfo(char: string): HanjaInfo | undefined {
  return HANJA_DB.get(char);
}

/** 한자 문자열 → 총 획수 */
export function calcTotalStrokes(hanjaStr: string): number {
  return [...hanjaStr].reduce((sum, ch) => {
    return sum + (HANJA_DB.get(ch)?.strokes ?? 0);
  }, 0);
}

/** 한자 문자열 → 오행 배열 */
export function extractElements(hanjaStr: string): Element[] {
  return [...hanjaStr]
    .map(ch => HANJA_DB.get(ch)?.element)
    .filter((e): e is Element => !!e);
}

/** 두 오행의 관계 */
export function getElementRelation(a: Element, b: Element): "상생" | "상극" | "비화" {
  if (GENERATING[a] === b) return "상생";
  if (OVERCOMING[a] === b) return "상극";
  return "비화";
}

/**
 * 오행 배열 → 조화 분석 문자열
 * 예: "火木 상생 조화"
 */
export function analyzeElementHarmony(elements: Element[]): string {
  if (elements.length === 0) return "오행 데이터 없음";
  if (elements.length === 1) return `${ELEMENT_KO[elements[0]]} 단독`;

  const results: string[] = [];
  for (let i = 0; i < elements.length - 1; i++) {
    const a = elements[i];
    const b = elements[i + 1];
    const rel = getElementRelation(a, b);
    if (rel === "상생") results.push(`${a}${b} 상생 조화`);
    else if (rel === "상극") results.push(`${a}${b} 상극 주의`);
    else results.push(`${a}${b} 비화`);
  }
  return results.join(", ");
}

/**
 * 한자 문자열 → 획수 표기 문자열
 * 예: "旻(8획,火,陰)+俊(9획,木,陽)=17획(陽)"
 */
export function formatStrokeSummary(hanjaStr: string): string {
  const parts: string[] = [];
  let total = 0;
  for (const ch of hanjaStr) {
    const info = HANJA_DB.get(ch);
    if (info) {
      parts.push(`${ch}(${info.strokes}획,${info.element},${info.yinyang})`);
      total += info.strokes;
    }
  }
  if (parts.length === 0) return "";
  const totalYY: YinYang = total % 2 !== 0 ? "陽" : "陰";
  return parts.join("+") + `=${total}획(${totalYY})`;
}

/** 전체 분석 결과 */
export type HanjaAnalysisResult = {
  strokes: string;
  totalStrokes: number;
  elements: Element[];
  elementSummary: string;
  harmony: "상생" | "상극" | "비화" | "복합";
  totalYinYang: YinYang;
  detail: HanjaInfo[];
};

export function analyzeHanja(hanjaStr: string): HanjaAnalysisResult {
  const detail = [...hanjaStr]
    .map(ch => HANJA_DB.get(ch))
    .filter((v): v is HanjaInfo => !!v);
  const elements = detail.map(d => d.element);
  const totalStrokes = detail.reduce((s, d) => s + d.strokes, 0);

  const relations = new Set<"상생" | "상극" | "비화">();
  for (let i = 0; i < elements.length - 1; i++) {
    relations.add(getElementRelation(elements[i], elements[i + 1]));
  }
  const harmony: HanjaAnalysisResult["harmony"] =
    relations.size > 1 ? "복합" : relations.size === 1 ? [...relations][0] : "비화";

  return {
    strokes: formatStrokeSummary(hanjaStr),
    totalStrokes,
    elements,
    elementSummary: analyzeElementHarmony(elements),
    harmony,
    totalYinYang: totalStrokes % 2 !== 0 ? "陽" : "陰",
    detail,
  };
}
