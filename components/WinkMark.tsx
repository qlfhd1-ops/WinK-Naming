/**
 * WINK Mark — 윙크 네이밍 브랜드 로고
 * 한옥 처마 + 전통 매듭/술 모티프를 담은 정사각형 아이콘.
 * 좁은 자리(헤더, 네임카드)에 쓰는 작은 아이콘 버전이며,
 * 넓은 자리에는 components/WinkLogoFull.tsx(전체 로고 lockup)를 사용한다.
 */
export default function WinkMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/images/wink-logo-icon.png"
      alt="Wink Naming"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}
