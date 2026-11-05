/**
 * WINK Mark — 윙크 네이밍 브랜드 로고
 * 빨간 사각형(丹靑 red) 안에 ● (天) + ﹏ (地) 두 요소로 구성된 심볼.
 * 기존 "W" 텍스트 로고를 대체한다.
 */
export default function WinkMark({ size = 40 }: { size?: number }) {
  const scale = size / 40;
  const dot = 8 * scale;
  const smileW = 13 * scale;
  const smileH = 7 * scale;
  const gap = 6 * scale;
  const borderW = 3 * scale;
  const borderW2 = 4.5 * scale;
  const radius = 4 * scale;
  const smileRadius = 9 * scale;

  return (
    <span
      aria-label="Wink Naming"
      style={{
        width: size,
        height: size,
        background: "#A8322A",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        borderRadius: radius,
        boxShadow: `inset 0 0 0 ${borderW}px #A8322A, inset 0 0 0 ${borderW2}px #F3EEE4`,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: "#F3EEE4",
        }}
      />
      <span
        aria-hidden
        style={{
          width: smileW,
          height: smileH,
          border: `${borderW}px solid #F3EEE4`,
          borderTop: 0,
          borderRadius: `0 0 ${smileRadius}px ${smileRadius}px`,
          marginTop: -2 * scale,
        }}
      />
    </span>
  );
}
