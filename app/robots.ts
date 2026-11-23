import type { MetadataRoute } from "next";

const BASE_URL = "https://wink-naming.com";

/**
 * 검색엔진 크롤링 규칙.
 * 공개 페이지(홈, 이용약관, 개인정보 처리방침, 이름 설계 진입)는 허용하고,
 * 로그인·결제·주문·결과·관리자·API·선물/발음 개인 링크 등 검색에 노출될 이유가 없는 경로는 막는다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/auth/",
          "/login",
          "/*/login",
          "/result",
          "/*/result",
          "/cart",
          "/*/cart",
          "/checkout",
          "/*/checkout",
          "/orders",
          "/*/orders",
          "/*/order",
          "/*/shortlist",
          "/present",
          "/listen",
          "/gift/",
          "/*/gift/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
