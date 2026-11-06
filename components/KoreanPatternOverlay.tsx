/**
 * 한국 전통 문양 오버레이 — 운문(雲紋, 구름) + 기하학적 격자무늬.
 * 카드 우측 상단에 반투명 장식으로 사용.
 */
export default function KoreanPatternOverlay({
  size = 160,
  opacity = 0.2,
  color = "#FFFFFF",
}: {
  size?: number;
  opacity?: number;
  color?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 160 160"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* 기하학적 격자 */}
      <g stroke={color} strokeWidth="0.6" fill="none">
        <line x1="40" y1="0" x2="160" y2="120" />
        <line x1="80" y1="0" x2="160" y2="80" />
        <line x1="120" y1="0" x2="160" y2="40" />
        <line x1="0" y1="40" x2="120" y2="160" />
        <line x1="0" y1="80" x2="80" y2="160" />
        <line x1="0" y1="120" x2="40" y2="160" />
      </g>

      {/* 운문(雲紋) — 구름 소용돌이 */}
      <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
        <path d="M115 35c-8-10-24-10-30 1-10-6-22 2-19 13-10 2-13 15-4 21 2 9 14 13 21 7 7 7 19 5 22-4 10 1 17-9 12-18 7-6 5-17-2-20z" />
        <path d="M100 48c3-4 10-4 12 1" />
        <path d="M94 58c3-4 10-4 12 1" />
      </g>
      <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity={0.7}>
        <path d="M60 15c-5-6-15-6-18 1-6-4-13 1-11 8-6 1-8 9-2 13 1 5 8 8 13 4 4 4 11 3 13-2 6 1 10-5 7-11 4-4 3-10-2-13z" />
      </g>
    </svg>
  );
}
