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
    const run = async () => {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/";

      // ── 1. OAuth PKCE 코드 교환 (소셜 로그인)
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?error=" + encodeURIComponent(error.message));
          return;
        }
        router.replace(next);
        return;
      }

      // ── 2. 이메일 OTP 매직링크 — URL 해시에서 토큰 추출
      // Supabase가 #access_token=...&type=magiclink 형태로 전달
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash.includes("access_token")) {
        // 해시 파싱 완료까지 대기 후 세션 확인
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          await new Promise((r) => setTimeout(r, 1000));
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          if (retryError || !retryData.session) {
            setMessage("로그인 처리에 실패했습니다. 다시 시도해 주세요.");
            setTimeout(() => router.replace("/ko/login"), 2000);
            return;
          }
        }
        // 세션 localStorage 저장 완료까지 추가 대기
        await new Promise((r) => setTimeout(r, 300));
        router.replace(next);
        return;
      }

      // ── 3. 세션 없이 도착한 경우 — 세션이 이미 있으면 그냥 통과
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession.session) {
        router.replace(next);
        return;
      }
      router.replace("/ko/login");
    };

    run();
  }, [router, searchParams]);

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
