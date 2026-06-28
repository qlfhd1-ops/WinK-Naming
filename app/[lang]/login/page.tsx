"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { AppLang, isSupportedLang } from "@/lib/lang-config";

const COPY = {
  ko: {
    chip: "Wink Login",
    title: "로그인",
    subtitle: "이메일로 로그인 링크를 보내드립니다. 비밀번호 없이 안전하게 접속하실 수 있습니다.",
    emailLabel: "이메일",
    emailPlaceholder: "name@email.com",
    submit: "로그인 링크 보내기",
    sending: "보내는 중...",
    success: "로그인 링크를 보냈습니다. 이메일을 확인해 주세요.",
    successNote: "링크는 10분간 유효합니다. 스팸 폴더도 확인해 보세요.",
    errorDefault: "로그인 링크 발송에 실패했습니다.",
    guideTitle: "안내",
    guide1: "로그인하시면 이름 설계, 주문 내역, 저장 이력을 이용할 수 있습니다.",
    guide2: "소셜 로그인은 준비 중입니다. 현재 이메일 로그인을 이용해 주세요.",
    orDivider: "소셜 로그인 (준비 중)",
    comingSoon: "준비 중",
    back: "이전으로",
    goCategory: "이름 설계로 가기",
  },
  en: {
    chip: "Wink Login",
    title: "Login",
    subtitle: "We will send you a secure email login link. No password is required.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Send Login Link",
    sending: "Sending...",
    success: "A login link has been sent. Please check your email.",
    successNote: "The link is valid for 10 minutes. Check your spam folder too.",
    errorDefault: "Failed to send the login link.",
    guideTitle: "Guide",
    guide1: "Log in to access name design, order history, and saved records.",
    guide2: "Social login is coming soon. Please use email login for now.",
    orDivider: "Social Login (Coming Soon)",
    comingSoon: "Coming soon",
    back: "Back",
    goCategory: "Go to Naming",
  },
  ja: {
    chip: "Wink Login",
    title: "ログイン",
    subtitle: "メールでログインリンクを送信します。パスワードなしで安全に接続できます。",
    emailLabel: "メールアドレス",
    emailPlaceholder: "name@email.com",
    submit: "ログインリンクを送る",
    sending: "送信中...",
    success: "ログインリンクを送信しました。メールをご確認ください。",
    successNote: "リンクは10分間有効です。迷惑メールフォルダもご確認ください。",
    errorDefault: "ログインリンクの送信に失敗しました。",
    guideTitle: "案内",
    guide1: "ログインすると名前設計、注文履歴、保存履歴を利用できます。",
    guide2: "ソーシャルログインは準備中です。現在はメールログインをご利用ください。",
    orDivider: "ソーシャルログイン（準備中）",
    comingSoon: "準備中",
    back: "戻る",
    goCategory: "名前設計へ",
  },
  zh: {
    chip: "Wink Login",
    title: "登录",
    subtitle: "我们会通过邮箱发送登录链接。无需密码即可安全登录。",
    emailLabel: "邮箱",
    emailPlaceholder: "name@email.com",
    submit: "发送登录链接",
    sending: "发送中...",
    success: "登录链接已发送，请检查您的邮箱。",
    successNote: "链接有效期为10分钟，请也检查垃圾邮件文件夹。",
    errorDefault: "发送登录链接失败。",
    guideTitle: "说明",
    guide1: "登录后可以使用命名设计、订单记录和保存历史功能。",
    guide2: "社交登录即将推出，请目前使用邮箱登录。",
    orDivider: "社交登录（即将推出）",
    comingSoon: "即将推出",
    back: "返回",
    goCategory: "前往命名",
  },
  es: {
    chip: "Wink Login",
    title: "Iniciar sesión",
    subtitle: "Le enviaremos un enlace de acceso por correo. No se requiere contraseña.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "name@email.com",
    submit: "Enviar enlace de acceso",
    sending: "Enviando...",
    success: "Se envió el enlace de acceso. Revise su correo.",
    successNote: "El enlace es válido por 10 minutos. Revise también la carpeta de spam.",
    errorDefault: "No se pudo enviar el enlace de acceso.",
    guideTitle: "Guía",
    guide1: "Inicie sesión para acceder al diseño de nombres, historial y registros.",
    guide2: "El inicio de sesión social estará disponible próximamente.",
    orDivider: "Inicio social (próximamente)",
    comingSoon: "Próximamente",
    back: "Volver",
    goCategory: "Ir al naming",
  },
  ru: {
    chip: "Wink Login",
    title: "Войти",
    subtitle: "Мы отправим вам ссылку для входа по email. Пароль не требуется.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Отправить ссылку для входа",
    sending: "Отправляем...",
    success: "Ссылка для входа отправлена. Проверьте свой email.",
    successNote: "Ссылка действительна 10 минут. Проверьте также папку «Спам».",
    errorDefault: "Не удалось отправить ссылку для входа.",
    guideTitle: "Справка",
    guide1: "Войдите для доступа к дизайну имён, истории заказов и записям.",
    guide2: "Вход через соцсети скоро будет доступен.",
    orDivider: "Соцсети (скоро)",
    comingSoon: "Скоро",
    back: "Назад",
    goCategory: "Перейти к именованию",
  },
  fr: {
    chip: "Wink Login",
    title: "Connexion",
    subtitle: "Nous vous enverrons un lien de connexion sécurisé par email. Aucun mot de passe requis.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Envoyer le lien de connexion",
    sending: "Envoi en cours...",
    success: "Le lien de connexion a été envoyé. Vérifiez votre email.",
    successNote: "Le lien est valable 10 minutes. Vérifiez aussi votre dossier spam.",
    errorDefault: "Échec de l'envoi du lien de connexion.",
    guideTitle: "Guide",
    guide1: "Connectez-vous pour accéder au design de noms, à l'historique et aux enregistrements.",
    guide2: "La connexion sociale sera disponible prochainement.",
    orDivider: "Réseaux sociaux (bientôt)",
    comingSoon: "Bientôt",
    back: "Retour",
    goCategory: "Aller au naming",
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
    successNote: "الرابط صالح لمدة 10 دقائق. تحقق أيضاً من مجلد الرسائل غير المرغوب فيها.",
    errorDefault: "فشل إرسال رابط تسجيل الدخول.",
    guideTitle: "دليل",
    guide1: "سجّل دخولك للوصول إلى تصميم الأسماء والطلبات والسجلات.",
    guide2: "تسجيل الدخول عبر الشبكات الاجتماعية قادم قريباً.",
    orDivider: "الشبكات الاجتماعية (قريباً)",
    comingSoon: "قريباً",
    back: "رجوع",
    goCategory: "الذهاب إلى التسمية",
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
    successNote: "लिंक 10 मिनट के लिए वैध है। स्पैम फ़ोल्डर भी जांचें।",
    errorDefault: "लॉगिन लिंक भेजने में विफल।",
    guideTitle: "मार्गदर्शिका",
    guide1: "लॉगिन करके नाम डिज़ाइन, ऑर्डर इतिहास और रिकॉर्ड एक्सेस करें।",
    guide2: "सोशल लॉगिन जल्द आ रहा है। अभी ईमेल लॉगिन का उपयोग करें।",
    orDivider: "सोशल लॉगिन (जल्द आ रहा है)",
    comingSoon: "जल्द आएगा",
    back: "वापस",
    goCategory: "नामकरण पर जाएं",
  },
} as const;

// ── 비활성화 소셜 버튼 ─────────────────────────────────────────
function DisabledSocialBtn({
  label, bg, color, border, icon, comingSoon,
}: {
  label: string;
  bg: string;
  color: string;
  border?: string;
  icon: React.ReactNode;
  comingSoon: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={comingSoon}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 10px",
        borderRadius: 10,
        border: border ?? "none",
        background: bg,
        color,
        fontSize: 13,
        fontWeight: 600,
        cursor: "not-allowed",
        opacity: 0.38,
        width: "100%",
        position: "relative",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <span style={{ flexShrink: 0, lineHeight: 0 }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
        {label}
      </span>
      <span style={{
        position: "absolute", top: 3, right: 6,
        fontSize: 9, fontWeight: 700,
        background: "rgba(0,0,0,0.2)",
        color: color === "#000000" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)",
        padding: "2px 5px", borderRadius: 4,
        letterSpacing: "0.03em",
      }}>
        {comingSoon}
      </span>
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setError(ui.errorDefault);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
      const next = new URLSearchParams(window.location.search).get("next") ?? `/${lang}/category`;
      const emailRedirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo },
      });

      if (signInError) throw signInError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.errorDefault);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="wink-page">
      <div className="wink-container" style={{ maxWidth: 560 }}>
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title" style={{ marginBottom: 10 }}>{ui.title}</h1>
        <p className="wink-sub" style={{ marginBottom: 28 }}>{ui.subtitle}</p>

        {/* ── 이메일 로그인 폼 ── */}
        <section className="wink-form-section">
          {!sent ? (
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
                  autoFocus
                />
              </div>

              {error && (
                <p role="alert" className="wink-error">{error}</p>
              )}

              <button
                type="submit"
                className="wink-btn-primary"
                disabled={submitting}
                style={{ marginTop: 8 }}
              >
                {submitting ? ui.sending : ui.submit}
              </button>
            </form>
          ) : (
            /* ── 발송 완료 상태 ── */
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>✉️</div>
              <p role="status" style={{
                fontSize: 16, fontWeight: 700,
                color: "var(--gold-strong)",
                marginBottom: 8, lineHeight: 1.6,
              }}>
                {ui.success}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 20 }}>
                {ui.successNote}
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(""); }}
                style={{
                  background: "none",
                  border: "1px solid rgba(120,160,255,0.3)",
                  color: "var(--text-soft)",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← 이메일 다시 입력
              </button>
            </div>
          )}
        </section>

        {/* ── 소셜 로그인 (비활성화) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(200,215,240,0.4)", whiteSpace: "nowrap" }}>
            {ui.orDivider}
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* Google */}
          <DisabledSocialBtn
            label="Google"
            bg="#ffffff"
            color="#1F1F1F"
            border="1px solid #dadce0"
            comingSoon={ui.comingSoon}
            icon={
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
            }
          />

          {/* Apple */}
          <DisabledSocialBtn
            label="Apple"
            bg="#000000"
            color="#ffffff"
            comingSoon={ui.comingSoon}
            icon={
              <svg width="14" height="17" viewBox="0 0 814 1000" aria-hidden fill="#ffffff">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-165.9-117.9-116-186.5-116-267.5c0-137.9 90.4-210.9 178.2-210.9 45.4 0 83.3 30.1 111.4 30.1 27.2 0 71.8-32.1 126.3-32.1 19.8 0 108.2 1.9 162.7 103.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
            }
          />

          {/* Kakao */}
          <DisabledSocialBtn
            label="Kakao"
            bg="#FEE500"
            color="#000000"
            comingSoon={ui.comingSoon}
            icon={
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden fill="#000000">
                <path d="M9 1C4.582 1 1 3.865 1 7.385c0 2.24 1.483 4.205 3.718 5.348L3.87 15.5a.25.25 0 0 0 .366.27L8.01 13.5c.325.024.654.036.99.036 4.418 0 8-2.865 8-6.15C17 3.865 13.418 1 9 1z"/>
              </svg>
            }
          />

          {/* Naver */}
          <DisabledSocialBtn
            label="Naver"
            bg="#03C75A"
            color="#ffffff"
            comingSoon={ui.comingSoon}
            icon={
              <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1, color: "#fff" }}>N</span>
            }
          />

          {/* X (Twitter) */}
          <DisabledSocialBtn
            label="X (Twitter)"
            bg="#000000"
            color="#ffffff"
            comingSoon={ui.comingSoon}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="#ffffff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            }
          />

          {/* LINE */}
          <DisabledSocialBtn
            label="LINE"
            bg="#06C755"
            color="#ffffff"
            comingSoon={ui.comingSoon}
            icon={
              <svg width="16" height="16" viewBox="0 0 50 50" aria-hidden fill="#ffffff">
                <path d="M9 4C6.239 4 4 6.239 4 9v32c0 2.761 2.239 5 5 5h32c2.761 0 5-2.239 5-5V9c0-2.761-2.239-5-5-5H9zm16 8c8.271 0 15 5.373 15 11.984 0 3.531-1.933 6.685-5 8.932-3.042 2.225-8.285 4.646-10 5.084v-3c-8.271 0-15-5.373-15-11.984C10 17.373 16.729 12 25 12z"/>
              </svg>
            }
          />
        </div>

        {/* ── 안내 ── */}
        <section className="wink-panel" style={{ marginTop: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 10 }}>{ui.guideTitle}</div>
          <div className="wink-result-text" style={{ marginBottom: 6 }}>{ui.guide1}</div>
          <div className="wink-result-text" style={{ opacity: 0.65 }}>{ui.guide2}</div>
        </section>

        {/* ── 하단 버튼 ── */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "10px 18px", borderRadius: 12,
              border: "1px solid rgba(120,160,255,0.2)",
              background: "transparent",
              color: "var(--text-soft)", fontSize: 13, cursor: "pointer",
            }}
          >
            ← {ui.back}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/category`)}
            style={{
              padding: "10px 18px", borderRadius: 12,
              border: "1px solid rgba(212,175,55,0.3)",
              background: "transparent",
              color: "var(--gold-soft, #d4af37)", fontSize: 13, cursor: "pointer",
            }}
          >
            {ui.goCategory} →
          </button>
        </div>
      </div>
    </main>
  );
}
