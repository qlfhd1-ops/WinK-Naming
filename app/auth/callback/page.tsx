"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/ko/category";
    const code = params.get("code");

    // PKCE flow: ?code= 처리
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? "/ko/login?error=auth_failed" : next);
      });
      return;
    }

    // Implicit flow: #access_token= 처리
    // Supabase 클라이언트가 해시를 자동 감지해 세션 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    // 6초 타임아웃
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace("/ko/login?error=timeout");
    }, 6000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F8F6F1",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid #E8E8E8",
          borderTop: "3px solid #C9A84C", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#1B2A5E", fontWeight: 700, fontSize: 15, fontFamily: "sans-serif" }}>로그인 중...</p>
      </div>
    </main>
  );
}
