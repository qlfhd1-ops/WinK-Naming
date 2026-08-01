"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { AppLang, isSupportedLang } from "@/lib/lang-config";

/**
 * GET /auth/confirm
 * signInWithOtp 매직링크 클릭 시 Supabase가 리다이렉트하는 엔드포인트.
 *
 * 이메일 앱(특히 네이버 등)이 "링크 미리보기/안전성 검사"를 위해 이 URL을
 * 서버에서 자동으로 한 번 먼저 GET 요청하는 경우가 있다. 예전에는 이 라우트가
 * 요청이 오자마자 곧바로 verifyOtp()를 실행하는 서버 라우트였기 때문에,
 * 그 미리보기 요청 한 번에 1회용 토큰이 소모되어 실제 사용자가 클릭했을 때는
 * "링크가 만료되었습니다" 에러와 함께 로그인 화면으로 되돌아가는 문제가 있었다.
 *
 * 이를 막기 위해 이 페이지는 클라이언트 컴포넌트로 전환했다:
 * - 페이지 로드 자체는 아무 인증도 수행하지 않는다(서버 라우트가 아니므로
 *   미리보기 스캐너가 이 URL을 방문해도 토큰이 소모되지 않는다).
 * - 사용자가 "로그인 확인" 버튼을 직접 눌러야만 verifyOtp가 실행된다.
 */

const COPY = {
  ko: {
    chip: "Wink Login",
    title: "로그인 확인",
    subtitle: "아래 버튼을 눌러 로그인을 완료해 주세요.",
    confirm: "로그인 확인",
    confirming: "확인하는 중...",
    invalidLink: "유효하지 않은 링크입니다. 다시 로그인해 주세요.",
    errorDefault: "로그인 확인에 실패했습니다. 다시 시도해 주세요.",
    retry: "로그인 화면으로 돌아가기",
  },
  en: {
    chip: "Wink Login",
    title: "Confirm Login",
    subtitle: "Tap the button below to finish signing in.",
    confirm: "Confirm Login",
    confirming: "Confirming...",
    invalidLink: "This link is invalid. Please sign in again.",
    errorDefault: "Failed to confirm login. Please try again.",
    retry: "Back to login",
  },
} as const;

function extractLang(redirectTo: string): AppLang {
  try {
    const url = new URL(redirectTo, "https://wink-naming.com");
    const fromQuery = url.searchParams.get("lang");
    if (fromQuery && isSupportedLang(fromQuery)) return fromQuery;
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] && isSupportedLang(segments[0])) return segments[0];
  } catch {
    /* ignore */
  }
  return "ko";
}

export default function AuthConfirmPage() {
  const [params, setParams] = useState<{
    token_hash: string;
    type: string;
    redirect_to: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      token_hash: sp.get("token_hash") ?? "",
      type: sp.get("type") ?? "magiclink",
      redirect_to: sp.get("redirect_to") ?? "/",
    });
  }, []);

  const lang: AppLang = params ? extractLang(params.redirect_to) : "ko";
  const ui = COPY[lang === "ko" ? "ko" : "en"];

  const handleConfirm = async () => {
    if (!params?.token_hash) {
      setStatus("error");
      setErrorMsg(ui.invalidLink);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.token_hash,
      type: params.type as "magiclink" | "email",
    });

    if (error) {
      console.error("[auth/confirm] verifyOtp error:", error.message);
      setStatus("error");
      setErrorMsg(ui.errorDefault);
      return;
    }

    const dest = params.redirect_to.startsWith("http")
      ? params.redirect_to
      : `${window.location.origin}${params.redirect_to}`;
    window.location.href = dest;
  };

  const sans = "var(--font-noto-sans-kr,'Noto Sans KR',sans-serif)";
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F6F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: sans,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#C9A84C",
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 20,
            padding: "4px 14px",
            marginBottom: 20,
          }}
        >
          {ui.chip}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 26,
            fontWeight: 900,
            color: "#1B2A5E",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          {ui.title}
        </h1>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, marginTop: 12, marginBottom: 28 }}>
          {ui.subtitle}
        </p>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(27,42,94,0.08), 0 1px 4px rgba(27,42,94,0.04)",
            padding: "32px 28px",
          }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={status === "loading" || !params}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: status === "loading" ? "#D4B96A" : "#C9A84C",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 700,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              transition: "background 0.2s",
              fontFamily: sans,
            }}
          >
            {status === "loading" ? ui.confirming : ui.confirm}
          </button>

          {status === "error" && (
            <div style={{ marginTop: 16 }}>
              <p role="alert" style={{ fontSize: 13, color: "#C53030", margin: 0, lineHeight: 1.5 }}>
                {errorMsg}
              </p>
              <a
                href={`/${lang}/login`}
                style={{ fontSize: 13, color: "#1B2A5E", fontWeight: 600, textDecoration: "underline" }}
              >
                {ui.retry}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
