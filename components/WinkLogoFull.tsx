/**
 * WINK Logo Full — 윙크 네이밍 전체 로고 lockup
 * 한옥 처마 + 매듭 아이콘 + "윙크 네이밍" 한글 워드마크 + "WINK NAMING" 영문 캡션 + 명(名) 낙관.
 * 공간이 넉넉한 자리(로그인/스플래시 등)에서만 사용하고, 좁은 자리는 WinkMark(작은 아이콘)를 쓴다.
 */
export default function WinkLogoFull({
  width = 280,
  className,
}: {
  width?: number;
  className?: string;
}) {
  // source asset aspect ratio: 1600 x 1084
  const height = Math.round((width * 1084) / 1600);
  return (
    <img
      src="/images/wink-logo-full.png"
      alt="Wink Naming"
      className={className}
      width={width}
      height={height}
      style={className ? undefined : { width, height, objectFit: "contain" }}
    />
  );
}
