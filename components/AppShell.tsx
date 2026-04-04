"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANG_CONFIG, type AppLang, isSupportedLang } from "@/lib/lang-config";
import { Sound } from "@/lib/sound";
import { createClient } from "@/lib/supabase/browser";

type ThemeMode = "light" | "dark";

function buildNextPath(pathname: string | null, nextLang: AppLang) {
  if (!pathname) return `/${nextLang}/category`;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${nextLang}/category`;

  if (isSupportedLang(segments[0])) {
    segments[0] = nextLang;
    return `/${segments.join("/")}`;
  }

  return `/${nextLang}/category`;
}

function isActivePath(pathname: string | null, target: string) {
  if (!pathname) return false;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function AppShell({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const safeLang: AppLang = isSupportedLang(lang) ? lang : "ko";
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wink-theme");
    const nextTheme: ThemeMode =
      saved === "light" || saved === "dark" ? saved : "dark";

    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    showToast(safeLang === "ko" ? "로그아웃 되었습니다." : "Signed out.");
    router.push(`/${safeLang}/category`);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("wink-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const languageOptions = useMemo(
    () =>
      Object.entries(LANG_CONFIG).map(([code, info]) => ({
        code: code as AppLang,
        label: info.label,
      })),
    []
  );

  const moveTo = (path: string) => {
    Sound.playPageTurn();
    router.push(path);
  };

  const isLoggedIn = !!userEmail;
  const emailPrefix = userEmail ? userEmail.split("@")[0] : null;

  const navItems = [
    {
      key: "category",
      label: safeLang === "ko" ? "카테고리" : "Category",
      path: `/${safeLang}/category`,
      onClick: undefined as (() => void) | undefined,
    },
    {
      key: "cart",
      label: safeLang === "ko" ? "장바구니" : "Cart",
      path: "/cart",
      onClick: undefined as (() => void) | undefined,
    },
    {
      key: "auth",
      label: isLoggedIn
        ? (emailPrefix ?? (safeLang === "ko" ? "로그아웃" : "Sign out"))
        : (safeLang === "ko" ? "로그인" : "Login"),
      path: isLoggedIn ? null : `/${safeLang}/login`,
      onClick: isLoggedIn ? handleLogout : undefined,
    },
  ];

  const dir = LANG_CONFIG[safeLang].dir ?? "ltr";

  return (
    <div className="wink-app-shell" dir={dir}>
      {/* Toast notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)",
            background: "rgba(27,42,94,0.96)", color: "#fff",
            padding: "10px 22px", borderRadius: 50, fontSize: 14, fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)", zIndex: 9999,
            whiteSpace: "nowrap", pointerEvents: "none",
            animation: "toastFadeIn 0.2s ease-out",
          }}
        >
          {toastMsg}
        </div>
      )}
      <header
        className="wink-header"
        style={{
          backdropFilter: "blur(18px)",
          background:
            theme === "dark"
              ? "linear-gradient(180deg, rgba(5, 12, 30, 0.88) 0%, rgba(5, 12, 30, 0.58) 100%)"
              : "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.64) 100%)",
          borderBottom:
            theme === "dark"
              ? "1px solid rgba(120, 160, 255, 0.12)"
              : "1px solid rgba(110, 140, 210, 0.12)",
        }}
      >
        <div
          className="wink-header-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <button
            type="button"
            className="wink-brand"
            onClick={() => moveTo(`/${safeLang}/category`)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span className="wink-brand-mark">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#C0392B"/>
                <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">W</text>
              </svg>
            </span>

            <span className="wink-brand-text">
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--text-main)",
                }}
              >
                Wink Naming
              </span>
              <span
                className="wink-brand-sub"
                style={{
                  fontSize: 11,
                  color: "var(--text-soft)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {safeLang === "ko"
                  ? "삶의 가치를 높이는 한국식 이름 설계"
                  : "Korean-style naming that elevates life's value"}
              </span>
            </span>
          </button>

          {/* 헤더 우측: 데스크톱 nav + 공통 컨트롤 */}
          <div className="wink-header-right">
            {/* 데스크톱 전용 nav */}
            <nav className="wink-desktop-nav">
              {navItems.map((item) => {
                const active = item.path ? isActivePath(pathname, item.path) : false;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (item.onClick) { item.onClick(); }
                      else if (item.path) { moveTo(item.path); }
                    }}
                    className={active ? "wink-primary-btn" : "wink-secondary-btn"}
                    style={{ minHeight: 40, padding: active ? "0 16px" : "0 14px", fontSize: 14, borderRadius: 14 }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* 언어 선택 */}
            <div className="wink-select-wrap">
              <select
                aria-label="Language"
                className="wink-select wink-lang-select"
                value={safeLang}
                onChange={(e) => {
                  Sound.playClick();
                  router.push(buildNextPath(pathname, e.target.value as AppLang));
                }}
              >
                {languageOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 테마 토글 */}
            {mounted && (
              <div className="wink-theme-pill">
                <button
                  type="button"
                  onClick={() => theme !== "light" && toggleTheme()}
                  aria-label="낮의 결"
                  className={`wink-theme-btn ${theme === "light" ? "is-active" : ""}`}
                >
                  🌞
                </button>
                <button
                  type="button"
                  onClick={() => theme !== "dark" && toggleTheme()}
                  aria-label="밤의 결"
                  className={`wink-theme-btn ${theme === "dark" ? "is-active is-dark" : ""}`}
                >
                  🌙
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="wink-shell-body">{children}</div>

      {/* 모바일 하단 네비게이션 바 */}
      <nav className="wink-bottom-nav">
        {navItems.map((item) => {
          const active = item.path ? isActivePath(pathname, item.path) : false;
          const icons: Record<string, string> = { category: "🏷️", cart: "🛒", auth: isLoggedIn ? "👤" : "🔑" };
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.onClick) { item.onClick(); }
                else if (item.path) { moveTo(item.path); }
              }}
              className={`wink-bottom-nav-item ${active ? "is-active" : ""}`}
            >
              <span className="wink-bottom-nav-icon">{icons[item.key]}</span>
              <span className="wink-bottom-nav-label" style={{ maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}