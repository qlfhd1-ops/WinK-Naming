/**
 * 이름카드 프리미엄 배경 — 한국 랜드마크 사진 6종.
 * 기존 plaque(CSS 그라디언트) 스타일에 더해 선택 가능한 실사 배경 옵션.
 */
export interface CardBackground {
  id: string;
  name: string;
  nameKo: string;
  image: string;
}

export const CARD_BACKGROUNDS: CardBackground[] = [
  { id: "hanok-village", name: "Hanok Village", nameKo: "북촌한옥마을", image: "/images/cards/hanok-village.jpg" },
  { id: "gwangan-bridge", name: "Gwangan Bridge", nameKo: "광안대교 야경", image: "/images/cards/gwangan-bridge.jpg" },
  { id: "gyeongbokgung", name: "Gyeongbokgung", nameKo: "경복궁", image: "/images/cards/gyeongbokgung.jpg" },
  { id: "namsan-tower", name: "Namsan Tower", nameKo: "남산타워 야경", image: "/images/cards/namsan-tower.jpg" },
  { id: "jeju-island", name: "Jeju Island", nameKo: "제주 성산일출봉", image: "/images/cards/jeju-island.jpg" },
  { id: "insadong-street", name: "Insadong Street", nameKo: "인사동 거리", image: "/images/cards/insadong-street.jpg" },
];

export type CardBackgroundId = (typeof CARD_BACKGROUNDS)[number]["id"];
