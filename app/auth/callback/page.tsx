"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Suspense } from "react";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("로그인 처리 중입니다...");

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") ?? "/ko/category";

    // ── 1. PKCE 코드 교환 (소셜 로그인 / PKCE 매직링크)
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setMessage("로그인 처리에 실패했습니다.");
          setTimeout(() => router.replace("/ko/login"), 2000);
        } else {
          router.replace(next);
        }
      });
      return;
    }

    // ── 2. 이메일 매직링크 (implicit flow) — onAuthStateChange로 세션 감지
    // detectSessionInUrl: true 가 URL 해시를 자동 파싱 → SIGNED_IN 이벤트 발생
    let redirected = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (redirected) return;
      if (event === "SIGNED_IN" && session) {
        redirected = true;
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    // 이미 세션이 있는 경우 (새로고침 등)
    supabase.auth.getSession().then(({ data }) => {
      if (redirected) return;
      if (data.session) {
        redirected = true;
        subscription.unsubscribe();
        router.replace(next);
        return;
      }

      // 해시에 access_token이 없고 세션도 없으면 — 3초 타임아웃 후 실패 처리
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (!hash.includes("access_token")) {
        redirected = true;
        subscription.unsubscribe();
        router.replace("/ko/login");
      }
    });

    // 5초 안에 SIGNED_IN이 오지 않으면 실패 처리
    const timeout = setTimeout(() => {
      if (redirected) return;
      redirected = true;
      subscription.unsubscribe();
      setMessage("로그인 처리에 실패했습니다. 다시 시도해 주세요.");
      setTimeout(() => router.replace("/ko/login"), 2000);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b0f14",
        color: "white",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ fontSize: 15, color: "rgba(200,215,240,0.8)" }}>{message}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0b0f14", color: "white" }}>
        <p>로그인 처리 중...</p>
      </main>
    }>
      <CallbackInner />
    </Suspense>
  );
}
