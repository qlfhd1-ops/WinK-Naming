"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
    success:
      "로그인 링크를 보냈습니다. 이메일을 확인해 주세요.",
    errorDefault: "로그인 링크 발송에 실패했습니다.",
    guideTitle: "안내",
    guide1: "이름 설계와 결과 확인은 로그인 없이도 가능합니다.",
    guide2: "로그인하시면 주문 내역, 저장 이력, 향후 보관함 기능과 더 자연스럽게 연결됩니다.",
    back: "이전으로",
    goCategory: "이름 설계로 가기",
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
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];

  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/")) return next;
    return `/${lang}/category`;
  }, [searchParams, lang]);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

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

        <section className="wink-form-section" style={{ marginTop: 24 }}>
          <form onSubmit={handleSubmit} className="wink-form">
            <div className="wink-field wink-field-full">
              <label>{ui.emailLabel}</label>
              <input
                type="email"
                className="wink-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ui.emailPlaceholder}
                autoComplete="email"
              />
            </div>

            {message ? (
              <div className="wink-success-banner">{message}</div>
            ) : null}

            {error ? (
              <div className="wink-error-banner">{error}</div>
            ) : null}

            <div className="wink-actions wink-actions-between">
              <button
                type="button"
                className="wink-secondary-btn"
                onClick={() => router.back()}
              >
                {ui.back}
              </button>

              <div className="wink-actions">
                <button
                  type="button"
                  className="wink-secondary-btn"
                  onClick={() => router.push(`/${lang}/category`)}
                >
                  {ui.goCategory}
                </button>

                <button
                  type="submit"
                  className="wink-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? ui.sending : ui.submit}
                </button>
              </div>
            </div>
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