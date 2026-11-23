import type { MetadataRoute } from "next";
import { LANG_CONFIG } from "@/lib/lang-config";

const BASE_URL = "https://wink-naming.com";

/**
 * 검색엔진용 사이트맵. 로그인 없이 볼 수 있는 공개 페이지만 담는다.
 * 홈(/)은 언어를 ?lang= 로 바꿔 보여 주는 한 페이지라 한 번만 넣고,
 * 언어별 주소가 따로 있는 이용약관·개인정보 처리방침은 9개 언어를 모두 넣는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const langs = Object.keys(LANG_CONFIG);

  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...langs.flatMap((lang) => [
      { url: `${BASE_URL}/${lang}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
      { url: `${BASE_URL}/${lang}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    ]),
  ];
}
