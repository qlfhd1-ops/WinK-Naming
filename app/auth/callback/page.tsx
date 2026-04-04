"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState("로그인 처리 중입니다...");

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        router.replace("/login?message=" + encodeURIComponent("로그인 코드가 없습니다."));
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        router.replace(
          "/login?message=" + encodeURIComponent(error.message)
        );
        return;
      }

      router.replace("/");
    };

    run();
  }, [router, supabase]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b0f14",
        color: "white",
      }}
    >
      <p>{message}</p>
    </main>
  );
}