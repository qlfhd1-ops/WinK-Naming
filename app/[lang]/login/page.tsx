"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import { createClient } from "@/lib/supabase/browser";
import { getSessionToken, clearSessionToken } from "@/lib/session-token";

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
    guide1: "이름 설계에는 이메일 로그인이 필요해요. 결과 이름카드를 메일로 보내 드리고, 만든 이름을 보관하기 위해서예요.",
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
    guide1: "Email sign-in is needed to design names, so we can send your name card by email and keep your names safe.",
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
    guide1: "名前の設計にはメールログインが必要です。名前カードをメールでお届けし、作成した名前を保管するためです。",
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
    guide1: "设计名字需要使用邮箱登录，以便通过邮件发送名字卡并为您保存已生成的名字。",
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
    guide1: "Para diseñar nombres necesitas iniciar sesión con tu correo: así te enviamos la tarjeta del nombre y guardamos tus nombres.",
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
    guide1: "Для создания имён нужен вход по e-mail: так мы отправим карточку имени на почту и сохраним ваши имена.",
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
    guide1: "La connexion par e-mail est nécessaire pour concevoir des noms : nous vous envoyons la carte du prénom et conservons vos prénoms.",
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
    guide1: "يلزم تسجيل الدخول بالبريد الإلكتروني لتصميم الأسماء، لنرسل لك بطاقة الاسم ونحفظ أسماءك.",
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
    guide1: "नाम डिज़ाइन करने के लिए ईमेल लॉगिन ज़रूरी है, ताकि हम नेम कार्ड ईमेल कर सकें और आपके नाम सुरक्षित रख सकें।",
    guide2: "लॉगिन करने से ऑर्डर और सहेजे गए इतिहास जुड़ते हैं।",
  },
} as const;

// 재전송 쿨다운/안내 문구 — {n}은 남은 초로 치환된다.
const COPY_EXTRA = {
  ko: {
    resendIn: "{n}초 후 다시 보내기",
    rateLimited: "요청이 너무 잦습니다. {n}초 후에 다시 시도해 주세요.",
    invalidEmail: "올바른 이메일 주소를 입력해 주세요.",
    hint: "가장 최근에 받은 메일의 링크만 유효합니다. 메일이 보이지 않으면 스팸함을 확인해 주세요.",
    whyEmail: "이메일은 로그인 링크·인증번호를 보내고, 만든 이름을 보관하는 데에만 사용해요.",
    codeLabel: "인증번호로 로그인",
    codeHelp: "메일 링크가 열리지 않나요? (인스타그램·카카오톡 앱 등) 메일에 적힌 인증번호를 입력하세요.",
    codePlaceholder: "인증번호 6자리",
    verify: "인증번호로 로그인",
    verifying: "확인하는 중...",
    codeInvalid: "인증번호가 올바르지 않거나 만료되었어요. 가장 최근 메일의 번호를 입력해 주세요.",
  },
  en: {
    resendIn: "Resend in {n}s",
    rateLimited: "Too many requests. Please try again in {n} seconds.",
    invalidEmail: "Please enter a valid email address.",
    hint: "Only the link in your most recent email works. If you can't find it, check your spam folder.",
    whyEmail: "We only use your email to send the sign-in link or code and to keep the names you create.",
    codeLabel: "Sign in with a code",
    codeHelp: "Link won't open (Instagram or other in-app browsers)? Enter the code from the email.",
    codePlaceholder: "6-digit code",
    verify: "Sign in with code",
    verifying: "Verifying...",
    codeInvalid: "That code is incorrect or has expired. Enter the code from your most recent email.",
  },
  ja: {
    resendIn: "{n}秒後に再送信",
    rateLimited: "リクエストが多すぎます。{n}秒後にもう一度お試しください。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    hint: "最新のメールのリンクのみ有効です。見つからない場合は迷惑メールフォルダをご確認ください。",
    whyEmail: "メールアドレスは、ログインリンク・認証コードの送信と、作成した名前の保管にのみ使用します。",
    codeLabel: "認証コードでログイン",
    codeHelp: "リンクが開けませんか？（Instagram などのアプリ内ブラウザ）メールに記載のコードを入力してください。",
    codePlaceholder: "認証コード（6桁）",
    verify: "認証コードでログイン",
    verifying: "確認中...",
    codeInvalid: "認証コードが正しくないか、期限切れです。最新のメールのコードを入力してください。",
  },
  zh: {
    resendIn: "{n}秒后可重新发送",
    rateLimited: "请求过于频繁，请在{n}秒后重试。",
    invalidEmail: "请输入有效的邮箱地址。",
    hint: "只有最新一封邮件中的链接有效。如果没有收到，请检查垃圾邮件箱。",
    whyEmail: "邮箱仅用于发送登录链接/验证码，以及保存您生成的名字。",
    codeLabel: "使用验证码登录",
    codeHelp: "链接打不开？（如 Instagram 等应用内浏览器）请输入邮件中的验证码。",
    codePlaceholder: "6位验证码",
    verify: "验证码登录",
    verifying: "验证中...",
    codeInvalid: "验证码错误或已过期。请输入最新一封邮件中的验证码。",
  },
  es: {
    resendIn: "Reenviar en {n}s",
    rateLimited: "Demasiadas solicitudes. Inténtelo de nuevo en {n} segundos.",
    invalidEmail: "Introduzca un correo electrónico válido.",
    hint: "Solo es válido el enlace del correo más reciente. Si no lo ve, revise la carpeta de spam.",
    whyEmail: "Solo usamos tu correo para enviar el enlace o código de acceso y guardar los nombres que crees.",
    codeLabel: "Acceder con un código",
    codeHelp: "¿No se abre el enlace (Instagram u otros navegadores integrados)? Introduce el código del correo.",
    codePlaceholder: "Código de 6 dígitos",
    verify: "Acceder con código",
    verifying: "Verificando...",
    codeInvalid: "El código es incorrecto o ha caducado. Introduce el código del correo más reciente.",
  },
  ru: {
    resendIn: "Отправить снова через {n} с",
    rateLimited: "Слишком много запросов. Повторите через {n} с.",
    invalidEmail: "Введите корректный адрес email.",
    hint: "Действует только ссылка из самого последнего письма. Если письма нет, проверьте папку «Спам».",
    whyEmail: "Email нужен только для отправки ссылки или кода для входа и для сохранения созданных вами имён.",
    codeLabel: "Вход по коду",
    codeHelp: "Ссылка не открывается (Instagram и другие встроенные браузеры)? Введите код из письма.",
    codePlaceholder: "Код из 6 цифр",
    verify: "Войти по коду",
    verifying: "Проверяем...",
    codeInvalid: "Код неверный или истёк. Введите код из самого последнего письма.",
  },
  fr: {
    resendIn: "Renvoyer dans {n} s",
    rateLimited: "Trop de demandes. Réessayez dans {n} secondes.",
    invalidEmail: "Veuillez saisir une adresse email valide.",
    hint: "Seul le lien du dernier email reçu est valide. Si vous ne le voyez pas, vérifiez vos spams.",
    whyEmail: "Votre e-mail sert uniquement à envoyer le lien ou le code de connexion et à conserver les prénoms que vous créez.",
    codeLabel: "Se connecter avec un code",
    codeHelp: "Le lien ne s'ouvre pas (Instagram ou autres navigateurs intégrés) ? Saisissez le code reçu par e-mail.",
    codePlaceholder: "Code à 6 chiffres",
    verify: "Se connecter avec le code",
    verifying: "Vérification...",
    codeInvalid: "Code incorrect ou expiré. Saisissez le code de l'e-mail le plus récent.",
  },
  ar: {
    resendIn: "إعادة الإرسال بعد {n} ث",
    rateLimited: "طلبات كثيرة جدًا. حاول مرة أخرى بعد {n} ثانية.",
    invalidEmail: "يرجى إدخال بريد إلكتروني صالح.",
    hint: "الرابط في أحدث رسالة فقط هو الصالح. إذا لم تجدها، تحقق من مجلد البريد العشوائي.",
    whyEmail: "نستخدم بريدك الإلكتروني فقط لإرسال رابط أو رمز تسجيل الدخول ولحفظ الأسماء التي تنشئها.",
    codeLabel: "تسجيل الدخول بالرمز",
    codeHelp: "لا يُفتح الرابط (إنستغرام أو المتصفحات المدمجة)؟ أدخل الرمز الموجود في البريد.",
    codePlaceholder: "رمز من 6 أرقام",
    verify: "تسجيل الدخول بالرمز",
    verifying: "جارٍ التحقق...",
    codeInvalid: "الرمز غير صحيح أو منتهي الصلاحية. أدخل الرمز من أحدث رسالة.",
  },
  hi: {
    resendIn: "{n} सेकंड में दोबारा भेजें",
    rateLimited: "बहुत अधिक अनुरोध। कृपया {n} सेकंड बाद पुनः प्रयास करें।",
    invalidEmail: "कृपया मान्य ईमेल पता दर्ज करें।",
    hint: "केवल सबसे हाल के ईमेल का लिंक मान्य है। न मिले तो स्पैम फ़ोल्डर देखें।",
    whyEmail: "आपका ईमेल केवल साइन-इन लिंक/कोड भेजने और आपके बनाए नाम सहेजने के लिए उपयोग होता है।",
    codeLabel: "कोड से साइन इन करें",
    codeHelp: "लिंक नहीं खुल रहा (Instagram जैसे इन-ऐप ब्राउज़र)? ईमेल में दिया कोड दर्ज करें।",
    codePlaceholder: "6 अंकों का कोड",
    verify: "कोड से साइन इन करें",
    verifying: "जाँच रहे हैं...",
    codeInvalid: "कोड गलत है या समाप्त हो गया है। सबसे नई ईमेल का कोड दर्ज करें।",
  },
} as const;

const DEFAULT_COOLDOWN_SEC = 60;

export default function LoginPage() {
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];
  const extra = COPY_EXTRA[lang];

  const [email, setEmail]           = useState("");
  const [message, setMessage]       = useState("");
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown]     = useState(0);
  const [codeSent, setCodeSent]     = useState(false);
  const [code, setCode]             = useState("");
  const [verifying, setVerifying]   = useState(false);

  // 재전송 쿨다운 카운트다운 (1초 단위)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || cooldown > 0) return;
    if (!email.trim()) { setError(ui.errorDefault); return; }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const origin     = window.location.origin;
      const next       = new URLSearchParams(window.location.search).get("next");
      const redirectTo = `${origin}${next && next.startsWith("/") ? next : `/?lang=${lang}`}`;

      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirectTo, lang }),
      });

      const data = await res.json() as {
        ok: boolean; code?: string; retryAfter?: number; error?: string; codeSent?: boolean;
      };

      if (!data.ok) {
        // 서버 원문 에러(영어)는 화면에 노출하지 않고, 코드별 현지화 문구만 보여준다.
        if (res.status === 429) {
          const wait = data.retryAfter && data.retryAfter > 0 ? data.retryAfter : DEFAULT_COOLDOWN_SEC;
          setCooldown(wait);
          setError(extra.rateLimited.replace("{n}", String(wait)));
        } else if (res.status === 400) {
          setError(extra.invalidEmail);
        } else {
          setError(ui.errorDefault);
        }
        return;
      }

      setMessage(ui.success);
      setCodeSent(data.codeSent === true);
      setCode("");
      setCooldown(DEFAULT_COOLDOWN_SEC);
    } catch {
      setError(ui.errorDefault);
    } finally {
      setSubmitting(false);
    }
  };

  // 메일에 적힌 인증번호로 로그인(인스타그램·카카오톡 등 앱 안 브라우저처럼 메일 링크가 다른 브라우저로 열리는 경우용)
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\s+/g, "");
    if (verifying || !/^\d{6,10}$/.test(token)) { setError(extra.codeInvalid); return; }

    setVerifying(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: vErr } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      if (vErr || !data?.session) {
        setError(extra.codeInvalid);
        return;
      }

      // 로그인 전 게스트 상태에서 만든 이름/주문을 방금 로그인한 계정에 연결(실패해도 로그인은 계속)
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
        console.error("[login] merge-session error:", mergeError);
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : `/?lang=${lang}`;
      window.location.href = safeNext;
    } catch {
      setError(extra.codeInvalid);
    } finally {
      setVerifying(false);
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

            <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: "8px 2px 0" }}>{extra.whyEmail}</p>

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
                <div style={{ marginTop: 6, fontSize: 12, color: "#6B5A2A" }}>{extra.hint}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || cooldown > 0}
              style={{
                marginTop: 18, width: "100%", padding: "14px",
                borderRadius: 12, border: "none",
                background: submitting || cooldown > 0 ? "#D4B96A" : "#C9A84C",
                color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                cursor: submitting || cooldown > 0 ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", transition: "background 0.2s",
                fontFamily: sans,
              }}
            >
              {submitting
                ? ui.sending
                : cooldown > 0
                  ? extra.resendIn.replace("{n}", String(cooldown))
                  : ui.submit}
            </button>
          </form>

          {codeSent && (
            <form onSubmit={handleVerifyCode} style={{ marginTop: 24, paddingTop: 22, borderTop: "1px solid #EEE" }}>
              <label
                htmlFor="otp"
                style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1B2A5E", marginBottom: 6 }}
              >
                {extra.codeLabel}
              </label>
              <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6, margin: "0 0 10px" }}>{extra.codeHelp}</p>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={extra.codePlaceholder}
                dir="ltr"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "13px 16px", borderRadius: 12,
                  border: "1.5px solid #E0E0E0", fontSize: 20, letterSpacing: "0.3em", textAlign: "center",
                  color: "#1B2A5E", outline: "none", fontFamily: sans, background: "#FAFAFA",
                }}
              />
              <button
                type="submit"
                disabled={verifying || code.length < 6}
                style={{
                  marginTop: 12, width: "100%", padding: "13px",
                  borderRadius: 12, border: "1.5px solid #1B2A5E",
                  background: verifying || code.length < 6 ? "#F2F2F2" : "#1B2A5E",
                  color: verifying || code.length < 6 ? "#AAA" : "#FFFFFF",
                  fontSize: 15, fontWeight: 700, fontFamily: sans,
                  cursor: verifying || code.length < 6 ? "not-allowed" : "pointer",
                }}
              >
                {verifying ? extra.verifying : extra.verify}
              </button>
            </form>
          )}
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
