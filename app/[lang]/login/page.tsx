"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { AppLang, isSupportedLang } from "@/lib/lang-config";

const COPY = {
  ko: {
    chip: "Wink Login",
    title: "로그인",
    subtitle:
      "이메일로 로그인 링크를 보내드립니다. 비밀번호 없이 안전하게 접속하실 수 있습니다.",
    emailLabel: "이메일",
    emailPlaceholder: "name@email.com",
    submit: "로그인 링크 보내기",
    sending: "보내는 중...",
    success: "로그인 링크를 보냈습니다. 이메일을 확인해 주세요.",
    errorDefault: "로그인 링크 발송에 실패했습니다.",
    guideTitle: "안내",
    guide1: "이름 설계와 결과 확인은 로그인 없이도 가능합니다.",
    guide2: "로그인하시면 주문 내역, 저장 이력, 향후 보관함 기능과 더 자연스럽게 연결됩니다.",
    back: "이전으로",
    goCategory: "이름 설계로 가기",
    orDivider: "또는 소셜 로그인",
    googleBtn: "Google로 계속하기",
    appleBtn: "Apple로 계속하기",
    xBtn: "X(Twitter)로 계속하기",
    instagramBtn: "Instagram으로 계속하기 (준비 중)",
    kakaoBtn: "카카오로 계속하기",
    naverBtn: "네이버로 계속하기",
    wechatBtn: "WeChat으로 계속하기 (준비 중)",
    lineBtn: "LINE으로 계속하기 (준비 중)",
    socialLoading: "연결 중...",
    comingSoon: "준비 중",
  },
  en: {
    chip: "Wink Login",
    title: "Login",
    subtitle:
      "We will send you a secure email login link. No password is required.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Send Login Link",
    sending: "Sending...",
    success: "A login link has been sent. Please check your email.",
    errorDefault: "Failed to send the login link.",
    guideTitle: "Guide",
    guide1: "You can still design names and view results without logging in.",
    guide2:
      "Logging in helps connect your orders, saved history, and future archive features.",
    back: "Back",
    goCategory: "Go to Naming Flow",
    orDivider: "Or continue with",
    googleBtn: "Continue with Google",
    appleBtn: "Continue with Apple",
    xBtn: "Continue with X (Twitter)",
    instagramBtn: "Continue with Instagram (Coming soon)",
    kakaoBtn: "Continue with Kakao",
    naverBtn: "Continue with Naver",
    wechatBtn: "Continue with WeChat (Coming soon)",
    lineBtn: "Continue with LINE (Coming soon)",
    socialLoading: "Connecting...",
    comingSoon: "Coming soon",
  },
  ja: {
    chip: "Wink Login",
    title: "ログイン",
    subtitle:
      "メールでログインリンクを送信します。パスワードなしで安全に接続できます。",
    emailLabel: "メールアドレス",
    emailPlaceholder: "name@email.com",
    submit: "ログインリンクを送る",
    sending: "送信中...",
    success: "ログインリンクを送信しました。メールをご確認ください。",
    errorDefault: "ログインリンクの送信に失敗しました。",
    guideTitle: "案内",
    guide1: "名前設計と結果確認はログインなしでも利用できます。",
    guide2:
      "ログインすると注文履歴、保存履歴、今後の保管機能と自然に連携できます。",
    back: "戻る",
    goCategory: "名前設計へ",
    orDivider: "またはソーシャルログイン",
    googleBtn: "Googleで続ける",
    appleBtn: "Appleで続ける",
    xBtn: "X(Twitter)で続ける",
    instagramBtn: "Instagramで続ける（準備中）",
    kakaoBtn: "カカオで続ける",
    naverBtn: "Naverで続ける",
    wechatBtn: "WeChatで続ける（準備中）",
    lineBtn: "LINEで続ける（準備中）",
    socialLoading: "接続中...",
    comingSoon: "準備中",
  },
  zh: {
    chip: "Wink Login",
    title: "登录",
    subtitle:
      "我们会通过邮箱发送登录链接。无需密码即可安全登录。",
    emailLabel: "邮箱",
    emailPlaceholder: "name@email.com",
    submit: "发送登录链接",
    sending: "发送中...",
    success: "登录链接已发送，请检查您的邮箱。",
    errorDefault: "发送登录链接失败。",
    guideTitle: "说明",
    guide1: "即使不登录，也可以进行命名设计和查看结果。",
    guide2:
      "登录后可更自然地连接订单记录、保存历史和后续档案功能。",
    back: "返回",
    goCategory: "前往命名流程",
    orDivider: "或使用社交账号登录",
    googleBtn: "使用 Google 继续",
    appleBtn: "使用 Apple 继续",
    xBtn: "使用 X(Twitter) 继续",
    instagramBtn: "使用 Instagram 继续（即将开放）",
    kakaoBtn: "使用 Kakao 继续",
    naverBtn: "使用 Naver 继续",
    wechatBtn: "使用微信继续（即将开放）",
    lineBtn: "使用 LINE 继续（即将开放）",
    socialLoading: "连接中...",
    comingSoon: "即将开放",
  },
  es: {
    chip: "Wink Login",
    title: "Iniciar sesión",
    subtitle:
      "Le enviaremos un enlace de acceso por correo. No se requiere contraseña.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "name@email.com",
    submit: "Enviar enlace de acceso",
    sending: "Enviando...",
    success: "Se envió el enlace de acceso. Revise su correo.",
    errorDefault: "No se pudo enviar el enlace de acceso.",
    guideTitle: "Guía",
    guide1: "Puede diseñar nombres y ver resultados sin iniciar sesión.",
    guide2:
      "Iniciar sesión ayuda a conectar pedidos, historial guardado y futuras funciones de archivo.",
    back: "Volver",
    goCategory: "Ir al flujo de naming",
    orDivider: "O continuar con",
    googleBtn: "Continuar con Google",
    appleBtn: "Continuar con Apple",
    xBtn: "Continuar con X (Twitter)",
    instagramBtn: "Continuar con Instagram (Próximamente)",
    kakaoBtn: "Continuar con Kakao",
    naverBtn: "Continuar con Naver",
    wechatBtn: "Continuar con WeChat (Próximamente)",
    lineBtn: "Continuar con LINE (Próximamente)",
    socialLoading: "Conectando...",
    comingSoon: "Próximamente",
  },
  ru: {
    chip: "Wink Login",
    title: "Войти",
    subtitle: "Мы отправим вам безопасную ссылку для входа по email. Пароль не требуется.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Отправить ссылку для входа",
    sending: "Отправляем...",
    success: "Ссылка для входа отправлена. Проверьте свой email.",
    errorDefault: "Не удалось отправить ссылку для входа.",
    guideTitle: "Справка",
    guide1: "Вы можете проектировать имена и просматривать результаты без входа в систему.",
    guide2: "Вход в систему помогает связать заказы, историю и будущие функции архива.",
    back: "Назад",
    goCategory: "Перейти к именованию",
    orDivider: "Или войти через",
    googleBtn: "Войти через Google",
    appleBtn: "Войти через Apple",
    xBtn: "Войти через X (Twitter)",
    instagramBtn: "Войти через Instagram (скоро)",
    kakaoBtn: "Войти через Kakao",
    naverBtn: "Войти через Naver",
    wechatBtn: "Войти через WeChat (скоро)",
    lineBtn: "Войти через LINE (скоро)",
    socialLoading: "Подключение...",
    comingSoon: "Скоро",
  },
  fr: {
    chip: "Wink Login",
    title: "Connexion",
    subtitle: "Nous vous enverrons un lien de connexion sécurisé par email. Aucun mot de passe requis.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Envoyer le lien de connexion",
    sending: "Envoi en cours...",
    success: "Le lien de connexion a été envoyé. Veuillez vérifier votre email.",
    errorDefault: "Échec de l'envoi du lien de connexion.",
    guideTitle: "Guide",
    guide1: "Vous pouvez concevoir des noms et voir les résultats sans vous connecter.",
    guide2: "La connexion aide à relier vos commandes, l'historique et les futures fonctions d'archive.",
    back: "Retour",
    goCategory: "Aller au flux de naming",
    orDivider: "Ou continuer avec",
    googleBtn: "Continuer avec Google",
    appleBtn: "Continuer avec Apple",
    xBtn: "Continuer avec X (Twitter)",
    instagramBtn: "Continuer avec Instagram (bientôt)",
    kakaoBtn: "Continuer avec Kakao",
    naverBtn: "Continuer avec Naver",
    wechatBtn: "Continuer avec WeChat (bientôt)",
    lineBtn: "Continuer avec LINE (bientôt)",
    socialLoading: "Connexion...",
    comingSoon: "Bientôt",
  },
  ar: {
    chip: "Wink Login",
    title: "تسجيل الدخول",
    subtitle: "سنرسل لك رابط تسجيل دخول آمن عبر البريد الإلكتروني. لا كلمة مرور مطلوبة.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "name@email.com",
    submit: "إرسال رابط تسجيل الدخول",
    sending: "جارٍ الإرسال...",
    success: "تم إرسال رابط تسجيل الدخول. يرجى التحقق من بريدك الإلكتروني.",
    errorDefault: "فشل إرسال رابط تسجيل الدخول.",
    guideTitle: "دليل",
    guide1: "يمكنك تصميم الأسماء ورؤية النتائج دون تسجيل الدخول.",
    guide2: "يساعد تسجيل الدخول على ربط الطلبات والتاريخ ووظائف الأرشيف المستقبلية.",
    back: "رجوع",
    goCategory: "الذهاب إلى تدفق التسمية",
    orDivider: "أو المتابعة باستخدام",
    googleBtn: "المتابعة مع Google",
    appleBtn: "المتابعة مع Apple",
    xBtn: "المتابعة مع X (Twitter)",
    instagramBtn: "المتابعة مع Instagram (قريباً)",
    kakaoBtn: "المتابعة مع Kakao",
    naverBtn: "المتابعة مع Naver",
    wechatBtn: "المتابعة مع WeChat (قريباً)",
    lineBtn: "المتابعة مع LINE (قريباً)",
    socialLoading: "جارٍ الاتصال...",
    comingSoon: "قريباً",
  },
  hi: {
    chip: "Wink Login",
    title: "लॉगिन",
    subtitle: "हम आपको ईमेल द्वारा एक सुरक्षित लॉगिन लिंक भेजेंगे। कोई पासवर्ड आवश्यक नहीं।",
    emailLabel: "ईमेल",
    emailPlaceholder: "name@email.com",
    submit: "लॉगिन लिंक भेजें",
    sending: "भेज रहे हैं...",
    success: "लॉगिन लिंक भेज दिया गया है। कृपया अपना ईमेल जांचें।",
    errorDefault: "लॉगिन लिंक भेजने में विफल।",
    guideTitle: "मार्गदर्शिका",
    guide1: "आप बिना लॉगिन के नाम डिज़ाइन और परिणाम देख सकते हैं।",
    guide2: "लॉगिन करने से आपके ऑर्डर, सहेजे गए इतिहास और भविष्य की सुविधाएं जुड़ती हैं।",
    back: "वापस",
    goCategory: "नामकरण प्रवाह पर जाएं",
    orDivider: "या सोशल लॉगिन से",
    googleBtn: "Google से जारी रखें",
    appleBtn: "Apple से जारी रखें",
    xBtn: "X (Twitter) से जारी रखें",
    instagramBtn: "Instagram से जारी रखें (जल्द आ रहा है)",
    kakaoBtn: "Kakao से जारी रखें",
    naverBtn: "Naver से जारी रखें",
    wechatBtn: "WeChat से जारी रखें (जल्द आ रहा है)",
    lineBtn: "LINE से जारी रखें (जल्द आ रहा है)",
    socialLoading: "कनेक्ट हो रहे हैं...",
    comingSoon: "जल्द आ रहा है",
  },
} as const;

// ── 소셜 버튼 공통 컴포넌트 ──────────────────────────────────
function SocialBtn({
  label, bg, color, border, disabled, loading, comingSoon, icon, onClick,
}: {
  label: string;
  bg: string;
  color: string;
  border?: string;
  disabled?: boolean;
  loading?: boolean;
  comingSoon?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 10px",
        borderRadius: 10,
        border: border ?? "none",
        background: disabled && !loading ? `${bg}99` : bg,
        color,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !loading ? 0.55 : 1,
        transition: "opacity 0.2s",
        position: "relative",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "100%",
      }}
    >
      {loading ? (
        <span style={{ fontSize: 12 }}>⏳</span>
      ) : (
        icon && <span style={{ flexShrink: 0, lineHeight: 0 }}>{icon}</span>
      )}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
        {label}
      </span>
      {comingSoon && !loading && (
        <span style={{
          position: "absolute", top: 4, right: 6,
          fontSize: 9, fontWeight: 700,
          background: "rgba(0,0,0,0.25)",
          color: color === "#000000" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)",
          padding: "2px 5px", borderRadius: 4,
          letterSpacing: "0.03em",
        }}>
          {comingSoon}
        </span>
      )}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();

  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // ── Google / Apple: Supabase 기본 OAuth (대시보드에서 provider 활성화 필요)
  // ── Kakao: Supabase 기본 지원, Kakao Developers 앱 등록 + Supabase 대시보드 설정 필요
  //    참고: https://supabase.com/docs/guides/auth/social-login/auth-kakao
  // ── Naver: Supabase 미지원 — 커스텀 OAuth 또는 Edge Function 필요
  //    참고: https://supabase.com/docs/guides/auth/social-login (미지원 목록 확인)
  // ── WeChat: Supabase 미지원 — WeChat Open Platform 앱 등록 + 커스텀 OAuth 필요
  //    참고: https://open.weixin.qq.com
  // ── LINE: Supabase 미지원 — LINE Developers 앱 등록 + 커스텀 OAuth 필요
  //    참고: https://developers.line.biz/en/docs/line-login/
  const handleSocialLogin = async (provider: "google" | "apple" | "twitter" | "kakao") => {
    setSocialLoading(provider);
    setError("");
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "https://yoonseul-naming.vercel.app/auth/callback",
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.errorDefault);
      setSocialLoading(null);
    }
    // 리다이렉트 후 자동으로 로딩 해제됨
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(ui.errorDefault);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const next = new URLSearchParams(window.location.search).get("next");
      const redirectTo = next && next.startsWith("/") ? next : `/${lang}/category`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}${redirectTo}`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setMessage(ui.success);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.errorDefault);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="wink-page">
      <div className="wink-container" style={{ maxWidth: 760 }}>
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.subtitle}</p>

        {/* ── 소셜 로그인 섹션 ── */}
        <section style={{ marginTop: 24 }}>
          {/* 소셜 버튼 그리드: 2열 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

            {/* Google — Supabase 기본 지원 (대시보드 활성화 필요) */}
            <SocialBtn
              label={socialLoading === "google" ? ui.socialLoading : ui.googleBtn}
              bg="#ffffff"
              color="#1F1F1F"
              border="1px solid #dadce0"
              disabled={socialLoading !== null}
              loading={socialLoading === "google"}
              onClick={() => handleSocialLogin("google")}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
              }
            />

            {/* Apple — Supabase 기본 지원 (Apple Developer 설정 필요) */}
            <SocialBtn
              label={socialLoading === "apple" ? ui.socialLoading : ui.appleBtn}
              bg="#000000"
              color="#ffffff"
              disabled={socialLoading !== null}
              loading={socialLoading === "apple"}
              onClick={() => handleSocialLogin("apple")}
              icon={
                <svg width="17" height="20" viewBox="0 0 814 1000" aria-hidden fill="#ffffff">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-165.9-117.9-116-186.5-116-267.5c0-137.9 90.4-210.9 178.2-210.9 45.4 0 83.3 30.1 111.4 30.1 27.2 0 71.8-32.1 126.3-32.1 19.8 0 108.2 1.9 162.7 103.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
              }
            />

            {/* X (Twitter) — Supabase 기본 지원 (Twitter Developer 앱 등록 + Supabase 대시보드 활성화 필요)
                설정: Supabase Dashboard → Auth → Providers → Twitter
                참고: https://supabase.com/docs/guides/auth/social-login/auth-twitter */}
            <SocialBtn
              label={socialLoading === "twitter" ? ui.socialLoading : ui.xBtn}
              bg="#000000"
              color="#ffffff"
              disabled={socialLoading !== null}
              loading={socialLoading === "twitter"}
              onClick={() => handleSocialLogin("twitter")}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="#ffffff">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              }
            />

            {/* 카카오 — Supabase 기본 지원 (대시보드 활성화 필요)
                설정: Supabase Dashboard → Auth → Providers → Kakao
                참고: https://supabase.com/docs/guides/auth/social-login/auth-kakao */}
            <SocialBtn
              label={socialLoading === "kakao" ? ui.socialLoading : ui.kakaoBtn}
              bg="#FEE500"
              color="#000000"
              disabled={socialLoading !== null}
              loading={socialLoading === "kakao"}
              onClick={() => handleSocialLogin("kakao")}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="#000000">
                  <path d="M9 1C4.582 1 1 3.865 1 7.385c0 2.24 1.483 4.205 3.718 5.348L3.87 15.5a.25.25 0 0 0 .366.27L8.01 13.5c.325.024.654.036.99.036 4.418 0 8-2.865 8-6.15C17 3.865 13.418 1 9 1z"/>
                </svg>
              }
            />

            {/* 네이버 — 커스텀 OAuth (/api/auth/naver) */}
            <SocialBtn
              label={socialLoading === "naver" ? ui.socialLoading : ui.naverBtn}
              bg="#03C75A"
              color="#ffffff"
              loading={socialLoading === "naver"}
              onClick={() => {
                setSocialLoading("naver");
                window.location.href = "/api/auth/naver";
              }}
              icon={
                <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1, color: "#fff" }}>N</span>
              }
            />

            {/* WeChat — TODO: Supabase 미지원, 커스텀 OAuth 필요
                설정: WeChat Open Platform 앱 등록 → 커스텀 OAuth Provider 구현
                참고: https://open.weixin.qq.com */}
            <SocialBtn
              label={ui.wechatBtn}
              bg="#07C160"
              color="#ffffff"
              disabled
              comingSoon={ui.comingSoon}
              icon={
                <svg width="20" height="18" viewBox="0 0 24 20" aria-hidden fill="#ffffff">
                  <path d="M15.3 3C10.6 3 6.8 6.1 6.8 10c0 1.5.5 2.9 1.5 4l-.8 2.4 2.7-1.3c1 .4 2.1.6 3.1.6.3 0 .6 0 .9-.1C14 15 14 14.5 14 14c0-3.9 3.5-7 7.7-7h.3C21.2 4.8 18.5 3 15.3 3zM12 8.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                  <path d="M21.7 9C18.2 9 15.3 11.4 15.3 14.4c0 3 2.9 5.4 6.4 5.4.8 0 1.5-.1 2.2-.4l2 1-.6-1.9c.9-.9 1.4-2 1.4-3.2C26.7 11.4 24.4 9 21.7 9zm-2.2 4c-.5 0-.8-.4-.8-.8s.3-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.4 0c-.5 0-.8-.4-.8-.8s.3-.8.8-.8.8.4.8.8-.3.8-.8.8z"/>
                </svg>
              }
            />

            {/* Instagram — TODO: Supabase 미지원, Meta(Facebook) OAuth 필요
                설정: Meta for Developers → Instagram Basic Display API or Instagram Graph API
                참고: https://developers.facebook.com/docs/instagram-basic-display-api */}
            <SocialBtn
              label={ui.instagramBtn}
              bg="linear-gradient(45deg, #FCAF45, #E1306C, #833AB4)"
              color="#ffffff"
              disabled
              comingSoon={ui.comingSoon}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="#ffffff">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              }
            />

            {/* LINE — TODO: Supabase 미지원, 커스텀 OAuth 필요
                설정: LINE Developers 앱 등록 → LINE Login 채널 생성 → 커스텀 OAuth 구현
                참고: https://developers.line.biz/en/docs/line-login/ */}
            <div style={{ gridColumn: "1 / -1" }}>
            <SocialBtn
              label={ui.lineBtn}
              bg="#06C755"
              color="#ffffff"
              disabled
              comingSoon={ui.comingSoon}
              icon={
                <svg width="18" height="18" viewBox="0 0 50 50" aria-hidden fill="#ffffff">
                  <path d="M9 4C6.239 4 4 6.239 4 9v32c0 2.761 2.239 5 5 5h32c2.761 0 5-2.239 5-5V9c0-2.761-2.239-5-5-5H9zm16 8c8.271 0 15 5.373 15 11.984 0 3.531-1.933 6.685-5 8.932-3.042 2.225-8.285 4.646-10 5.084v-3c-8.271 0-15-5.373-15-11.984C10 17.373 16.729 12 25 12zm-6 9a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-4l3 4a1 1 0 0 0 1.8-.6v-6a1 1 0 0 0-2 0v4l-3-4a1 1 0 0 0-.8-.4zm8 0a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zm3 0a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2h-2v-5a1 1 0 0 0-1-1zm-11 0a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2h-2v-1h2a1 1 0 0 0 0-2h-2v-1h2a1 1 0 0 0 0-2h-3z"/>
                </svg>
              }
            />
            </div>
          </div>
        </section>

        {/* ── 또는 구분선 ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, color: "rgba(200,215,240,0.5)", whiteSpace: "nowrap" }}>
            {ui.orDivider}
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* ── 이메일 로그인 폼 ── */}
        <section className="wink-form-section">
          <form onSubmit={handleSubmit} className="wink-form">
            <div className="wink-field">
              <label className="wink-label" htmlFor="email">
                {ui.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                className="wink-input"
                placeholder={ui.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <p role="alert" className="wink-error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="wink-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="wink-btn-primary"
              disabled={submitting}
            >
              {submitting ? ui.sending : ui.submit}
            </button>
          </form>
        </section>

        <section className="wink-panel" style={{ marginTop: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 12 }}>
            {ui.guideTitle}
          </div>
          <div className="wink-result-text" style={{ marginBottom: 8 }}>
            {ui.guide1}
          </div>
          <div className="wink-result-text">{ui.guide2}</div>
        </section>
      </div>
    </main>
  );
}