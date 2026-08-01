import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/studio/yoonseul-naming",
  },

  // ── 소스맵 비활성화 (코드 복제 방지) ──────────────────────────
  productionBrowserSourceMaps: false,

  // ── 불필요한 헤더 제거 ──────────────────────────────────────
  poweredByHeader: false,
};

export default nextConfig;
