"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
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
    errorDefault: "로그인 링크 발송에 실패했습니다.",
    guide1: "이름 설계와 결과 확인은 로그인 없이도 가능합니다.",
    guide2: "로그인하시면 주문 내역, 저장 이력, 향후 보관함 기능과 더 자연스럽게 연결됩니다.",
  },
  en: {
    chip: "Wink Login",
    title: "Login",
    subtitle: "We'll send you a secure login link. No password required.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Send Login Link",
    sending: "Sending...",
    success: "A login link has been sent. Please check your email.",
    errorDefault: "Failed to send the login link.",
    guide1: "You can design names and view results without logging in.",
    guide2: "Logging in connects your orders, saved history, and future archive features.",
  },
  ja: {
    chip: "Wink Login",
    title: "ログイン",
    subtitle: "メールでログインリンクを送信します。パスワード不要で安全に接続できます。",
    emailLabel: "メールアドレス",
    emailPlaceholder: "name@email.com",
    submit: "ログインリンクを送る",
    sending: "送信中...",
    success: "ログインリンクを送信しました。メールをご確認ください。",
    errorDefault: "ログインリンクの送信に失敗しました。",
    guide1: "名前設計と結果確認はログインなしでも利用できます。",
    guide2: "ログインすると注文履歴・保存履歴・今後の保管機能と連携できます。",
  },
  zh: {
    chip: "Wink Login",
    title: "登录",
    subtitle: "我们会通过邮箱发送登录链接，无需密码即可安全登录。",
    emailLabel: "邮箱",
    emailPlaceholder: "name@email.com",
    submit: "发送登录链接",
    sending: "发送中...",
    success: "登录链接已发送，请检查您的邮箱。",
    errorDefault: "发送登录链接失败。",
    guide1: "即使不登录，也可以进行命名设计和查看结果。",
    guide2: "登录后可连接订单记录、保存历史和后续档案功能。",
  },
  es: {
    chip: "Wink Login",
    title: "Iniciar sesión",
    subtitle: "Le enviaremos un enlace de acceso por correo. Sin contraseña.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "name@email.com",
    submit: "Enviar enlace de acceso",
    sending: "Enviando...",
    success: "Se envió el enlace de acceso. Revise su correo.",
    errorDefault: "No se pudo enviar el enlace de acceso.",
    guide1: "Puede diseñar nombres y ver resultados sin iniciar sesión.",
    guide2: "Iniciar sesión conecta pedidos, historial y funciones de archivo.",
  },
  ru: {
    chip: "Wink Login",
    title: "Войти",
    subtitle: "Мы отправим вам безопасную ссылку для входа. Пароль не требуется.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Отправить ссылку для входа",
    sending: "Отправляем...",
    success: "Ссылка для входа отправлена. Проверьте свой email.",
    errorDefault: "Не удалось отправить ссылку для входа.",
    guide1: "Вы можете проектировать имена без входа в систему.",
    guide2: "Вход помогает связать заказы, историю и функции архива.",
  },
  fr: {
    chip: "Wink Login",
    title: "Connexion",
    subtitle: "Nous vous enverrons un lien de connexion sécurisé par email. Sans mot de passe.",
    emailLabel: "Email",
    emailPlaceholder: "name@email.com",
    submit: "Envoyer le lien de connexion",
    sending: "Envoi en cours...",
    success: "Le lien de connexion a été envoyé. Vérifiez votre email.",
    errorDefault: "Échec de l'envoi du lien de connexion.",
    guide1: "Vous pouvez concevoir des noms sans vous connecter.",
    guide2: "La connexion relie vos commandes, l'historique et les futures fonctions.",
  },
  ar: {
    chip: "Wink Login",
    title: "تسجيل الدخول",
    subtitle: "سنرسل لك رابط دخول آمن بالبريد الإلكتروني. لا كلمة مرور مطلوبة.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "name@email.com",
    submit: "إرسال رابط تسجيل الدخول",
    sending: "جارٍ الإرسال...",
    success: "تم إرسال رابط تسجيل الدخول. تحقق من بريدك.",
    errorDefault: "فشل إرسال رابط تسجيل الدخول.",
    guide1: "يمكنك تصميم الأسماء دون تسجيل الدخول.",
    guide2: "يساعد تسجيل الدخول على ربط الطلبات والتاريخ.",
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
    guide1: "आप बिना लॉगिन के नाम डिज़ाइन कर सकते हैं।",
    guide2: "लॉगिन करने से ऑर्डर और सहेजे गए इतिहास जुड़ते हैं।",
  },
} as const;

export default function LoginPage() {
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];

  const [email, setEmail]           = useState("");
  const [message, setMessage]       = useState("");
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError(ui.errorDefault); return; }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const supabase   = createClient();
      const origin     = window.location.origin;
      const next       = new URLSearchParams(window.location.search).get("next");
      const redirectTo = next && next.startsWith("/") ? next : `/${lang}/category`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}${redirectTo}` },
      });

      if (signInError) throw signInError;
      setMessage(ui.success);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.errorDefault);
    } finally {
      setSubmitting(false);
    }
  };

  const sans  = "var(--font-noto-sans-kr,'Noto Sans KR',sans-serif)";
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  return (
    <main style={{
      minHeight: "100vh", background: "#F8F6F1",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 16px", fontFamily: sans,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 20, padding: "4px 14px", marginBottom: 20,
          }}>
            {ui.chip}
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: 28, fontWeight: 900,
            color: "#1B2A5E", margin: 0, letterSpacing: "0.02em",
          }}>
            {ui.title}
          </h1>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>
            {ui.subtitle}
          </p>
        </div>

        {/* 이메일 폼 카드 */}
        <div style={{
          background: "#FFFFFF", borderRadius: 20,
          boxShadow: "0 4px 24px rgba(27,42,94,0.08), 0 1px 4px rgba(27,42,94,0.04)",
          padding: "32px 28px",
        }}>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1B2A5E", marginBottom: 8, letterSpacing: "0.02em" }}
            >
              {ui.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ui.emailPlaceholder}
              required
              autoComplete="email"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "13px 16px", borderRadius: 12,
                border: "1.5px solid #E0E0E0", fontSize: 15,
                color: "#1B2A5E", outline: "none", fontFamily: sans,
                background: "#FAFAFA", transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C9A84C"; e.target.style.background = "#FFF"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#E0E0E0"; e.target.style.background = "#FAFAFA"; }}
            />

            {error && (
              <p role="alert" style={{ fontSize: 13, color: "#C53030", marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
                {error}
              </p>
            )}

            {message && (
              <div style={{
                marginTop: 14, padding: "12px 16px", borderRadius: 10,
                background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)",
                fontSize: 13, color: "#856A2A", lineHeight: 1.6,
              }}>
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 18, width: "100%", padding: "14px",
                borderRadius: 12, border: "none",
                background: submitting ? "#D4B96A" : "#C9A84C",
                color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", transition: "background 0.2s",
                fontFamily: sans,
              }}
            >
              {submitting ? ui.sending : ui.submit}
            </button>
          </form>
        </div>

        {/* 안내 */}
        <div style={{
          marginTop: 20, padding: "16px 20px", borderRadius: 14,
          background: "rgba(27,42,94,0.03)", border: "1px solid rgba(27,42,94,0.07)",
        }}>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 4 }}>· {ui.guide1}</div>
            <div>· {ui.guide2}</div>
          </div>
        </div>

      </div>
    </main>
  );
}
