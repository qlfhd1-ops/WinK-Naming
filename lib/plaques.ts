/**
 * 이름카드 프리뷰 배경 스타일 — 한국 전통 문화 요소를 활용한 6종 디자인.
 * 瓦(기와) / 燈(등) / 墨(묵) / 花(꽃) / 四季(사계) / 紙(한지)
 */
export type PlaqueKey = "giwa" | "deung" | "muk" | "kkot" | "sagye" | "hanji";

export type PlaqueStyle = {
  bg: string;
  pattern: string;
  ink: string;
  sub: string;
  frame: string;
  line: string;
  badge: string;
  label: string;
};

export const PLAQUES: Record<PlaqueKey, PlaqueStyle> = {
  giwa: {
    bg: "linear-gradient(175deg, #4A3728 0%, #2E2218 40%, #1A1410 100%)",
    pattern: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 8px)",
    ink: "#E9C77B",
    sub: "#C9A773",
    frame: "#A8322A",
    line: "rgba(201,164,92,.7)",
    badge: "瓦",
    label: "Giwa · 기와",
  },
  deung: {
    bg: "radial-gradient(ellipse at 50% 30%, #8B4513 0%, #2E1C12 60%, #1A0F08 100%)",
    pattern: "radial-gradient(circle at 50% 25%, rgba(255,200,50,.06), transparent 60%)",
    ink: "#FFD700",
    sub: "#DAA520",
    frame: "#C9A45C",
    line: "rgba(255,215,0,.5)",
    badge: "燈",
    label: "Deung · 등",
  },
  muk: {
    bg: "linear-gradient(160deg, #1D1B18 0%, #0A0908 100%)",
    pattern: "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.04), transparent 70%)",
    ink: "#F3EEE4",
    sub: "#B9AE98",
    frame: "#1D1B18",
    line: "rgba(243,238,228,.4)",
    badge: "墨",
    label: "Muk · 묵",
  },
  kkot: {
    bg: "linear-gradient(160deg, #FBF8F2 0%, #F5E6D8 50%, #EDD5C8 100%)",
    pattern: "radial-gradient(circle at 80% 80%, rgba(168,50,42,.03), transparent 50%)",
    ink: "#A8322A",
    sub: "#6E675C",
    frame: "#A8322A",
    line: "rgba(168,50,42,.5)",
    badge: "花",
    label: "Kkot · 꽃",
  },
  sagye: {
    bg: "linear-gradient(to right, #FFB7C5 0%, #228B22 25%, #D2691E 50%, #B0C4DE 75%, #F0F8FF 100%)",
    pattern: "none",
    ink: "#1D1B18",
    sub: "#4A453D",
    frame: "#C9A45C",
    line: "rgba(29,27,24,.4)",
    badge: "四季",
    label: "Sagye · 사계",
  },
  hanji: {
    bg: "linear-gradient(160deg, #FBF8F2, #EFE7D8)",
    pattern: "repeating-linear-gradient(45deg, rgba(0,0,0,.01) 0 1px, transparent 1px 6px)",
    ink: "#1D1B18",
    sub: "#6E675C",
    frame: "#FBF8F2",
    line: "rgba(168,50,42,.6)",
    badge: "紙",
    label: "Hanji · 한지",
  },
};

export const PLAQUE_KEYS: PlaqueKey[] = ["giwa", "deung", "muk", "kkot", "sagye", "hanji"];

/** 밝은 배경(light) 스타일 — 다운로드 시 배경색/대비 처리에 사용 */
export const LIGHT_PLAQUE_KEYS: PlaqueKey[] = ["kkot", "sagye", "hanji"];

/** 오행(五行) 밸런스 바 색상 — 목화토금수 */
export const OHAENG_COLORS = {
  wood: "#3F7D5C",
  fire: "#C74A3C",
  earth: "#C9A45C",
  metal: "#8B8B8B",
  water: "#2D5F8A",
};
