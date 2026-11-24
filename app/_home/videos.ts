import { type CatId } from "./categories";

// ── 카테고리별 영상 슬라이드 데이터 ──────────────────────
// 카테고리마다 원하는 만큼 영상을 추가할 수 있다 — 이름카드 순환 사이클
// 마지막에 이어 붙어 카드 → 카드 → ... → 영상1 → 영상2 → 다시 카드1 순으로 돈다.
// 클릭 전에는 썸네일만 노출하고, 클릭해야 iframe이 실제로 로드/재생된다.
export type CategoryVideo = { id: string; label: string; caption: string };

export const CATEGORY_VIDEOS: Partial<Record<CatId, CategoryVideo[]>> = {
  goods: [
    {
      id: "PJ7LImfsCcA",
      label: "WINK NAMING GOODS · 여행지 소식",
      caption: "늘어난 부산 관광객, 지금 이름 새긴 도장·굿즈로 특별한 기념을 남겨보세요",
    },
  ],
};
