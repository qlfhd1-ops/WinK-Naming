"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupportedLang } from "@/lib/lang-config";

/**
 * /[lang]/category — 구버전 카테고리 선택 페이지는 폐기되었습니다.
 * 홈페이지(/)가 동일한 카테고리 선택 기능을 신규 디자인으로 제공하므로
 * 이곳으로 들어오는 모든 진입(로그인 후 랜딩, 인앱 네비게이션 등)은
 * 홈페이지로 즉시 리다이렉트합니다.
 */
export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang = isSupportedLang(rawLang) ? rawLang : "ko";

  useEffect(() => {
    router.replace(`/?lang=${lang}`);
  }, [router, lang]);

  return null;
}
