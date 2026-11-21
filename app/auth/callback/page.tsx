"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { isSupportedLang, type AppLang } from "@/lib/lang-config";
import { getSessionToken, clearSessionToken } from "@/lib/session-token";

/**
 * /auth/callback
 * 이메일 로그인 링크(Supabase 기본 링크: .../auth/v1/verify?token=...)를 눌렀을 때 도착하는 페이지.
 *
 * 기본 링크는 인증 후 `#access_token=...&refresh_token=...` 를 URL 해시에 붙여 돌려보낸다(implicit 방식).
 * 그런데 브라우저용 Supabase 클라이언트(@supabase/ssr)는 PKCE 방식으로 고정돼 있어서 이 해시를
 * "유효하지 않은 PKCE URL"로 거부하고, 그 결과 세션이 저장되지 않아 로그인 화면으로 계속 되돌아가는
 * "무한 로그인" 현상이 생긴다. 이 페이지가 해시의 토큰을 직접 setSession() 으로 저장한 뒤 원래 가려던
 * 페이지(next)로 이동시켜 이를 해결한다.
 *
 * 이메일 템플릿이 /auth/confirm(token_hash) 방식이어도 이 페이지로 오게 되며(이미 세션이 저장된 상태),
 * 그 경우엔 저장된 세션을 확인하고 바로 next 로 이동한다.
 */

const COPY = {
  ko: {
    working: "로그인을 완료하는 중입니다...",
    failed: "로그인 링크가 만료되었거나 이미 사용되었습니다. 가장 최근에 받은 메일의 링크를 사용하거나 새 링크를 받아 주세요.",
    retry: "로그인 화면으로 이동",
  },
  en: {
    working: "Completing your sign-in...",
    failed: "This sign-in link has expired or was already used. Use the link in your most recent email, or request a new one.",
    retry: "Go to login",
  },
} as const;

/** 같은 사이트 안의 경로만 허용(오픈 리다이렉트 방지) */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

export default function AuthCallbackPage() {
  const [failed, setFailed] = useState(false);
  const [lang, setLang] = useState<AppLang>("ko");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next = safeNext(sp.get("next"));
    const langParam = sp.get("lang");
    const pageLang: AppLang = langParam && isSupportedLang(langParam) ? langParam : "ko";
    setLang(pageLang);

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const hashError = hash.get("error") || hash.get("error_code");

    const go = () => window.location.replace(next);

    (async () => {
      const supabase = createClient();
      try {
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error || !data.session) throw error ?? new Error("no session");

          // 로그인 전 게스트 상태에서 만든 이름/주문 데이터를 방금 로그인한 계정에 연결(실패해도 로그인은 계속).
          try {
            const sessionToken = getSessionToken();
            if (sessionToken) {
              await fetch("/api/auth/merge-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionToken, accessToken: data.session.access_token }),
              });
              clearSessionToken();
            }
          } catch (mergeError) {
            console.error("[auth/callback] merge-session error:", mergeError);
          }
          go();
          return;
        }

        if (hashError) throw new Error(hashError);

        // 해시가 없으면(= /auth/confirm 등으로 이미 로그인된 경우) 저장된 세션만 확인한다.
        const { data } = await supabase.auth.getSession();
        if (data.session) { go(); return; }
        throw new Error("no session");
      } catch (e) {
        console.error("[auth/callback] failed:", e);
        setFailed(true);
      }
    })();
  }, []);

  const ui = COPY[lang === "ko" ? "ko" : "en"];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F6F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "var(--font-noto-sans-kr,'Noto Sans KR',sans-serif)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center", color: "#1B2A5E" }}>
        {failed ? (
          <>
            <p role="alert" style={{ fontSize: 14, color: "#C53030", lineHeight: 1.7, margin: "0 0 14px" }}>
              {ui.failed}
            </p>
            <a href={`/${lang}/login`} style={{ fontSize: 14, fontWeight: 700, color: "#1B2A5E", textDecoration: "underline" }}>
              {ui.retry}
            </a>
          </>
        ) : (
          <p style={{ fontSize: 15, fontWeight: 600 }}>{ui.working}</p>
        )}
      </div>
    </main>
  );
}
