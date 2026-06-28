import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  // ── 소스맵 비활성화 (코드 복제 방지) ──────────────────────────
  productionBrowserSourceMaps: false,

  // ── 불필요한 헤더 제거 ──────────────────────────────────────
  poweredByHeader: false,
};

export default nextConfig;
