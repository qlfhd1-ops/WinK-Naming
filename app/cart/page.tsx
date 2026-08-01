"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSupportedLang } from "@/lib/lang-config";

// /cart → /[lang]/cart 로 리다이렉트
// 이전에 localStorage에 힌두어(hi) 등 다른 언어가 남아 있어도
// URL 기반 언어 라우팅을 사용하는 새 카트 페이지로 정상 이동됩니다.
export default function CartRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wink.naming.preferred-lang");
      const lang = stored && isSupportedLang(stored) ? stored : "ko";
      router.replace(`/${lang}/cart`);
    } catch {
      router.replace("/ko/cart");
    }
  }, [router]);

  return null;
}
