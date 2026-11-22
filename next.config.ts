import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/studio/yoonseul-naming",
  },

  // ── 소스맵 비활성화 (코드 복제 방지) ──────────────────────────
  productionBrowserSourceMaps: false,

  // ── 불필요한 헤더 제거 ──────────────────────────────────────
  poweredByHeader: false,

  // ── 정적 이미지/오디오 캐시 ───────────────────────────────────
  // public/ 파일은 기본값이 재검증(max-age=0)이라 방문자마다 다시 내려받아 데이터 전송량(Vercel 100GB 한도)을 많이 쓴다.
  // 1일 캐시 + 7일 stale-while-revalidate 로 재방문 전송을 줄인다(파일 교체 시 최대 1일 내 반영).
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/images/:path*", headers: cache },
      { source: "/audio/:path*", headers: cache },
    ];
  },
};

export default nextConfig;
