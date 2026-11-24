import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/magic-link
 *
 * 로그인(매직링크) 메일을 보낸다.
 *
 * [기본 경로] 서버가 admin.generateLink 로 1회용 토큰만 발급하고, 메일은 우리가 Resend(인증된 도메인
 *  noreply@wink-naming.com)로 직접 보낸다. 링크는 /auth/confirm?token_hash=… 로 연결되며, 그 페이지에서
 *  버튼을 눌러야 로그인이 완료된다(메일 앱의 링크 미리보기가 1회용 토큰을 소모하지 못함).
 *  → Supabase 기본 메일러의 시간당 발송 한도(429 over_email_send_rate_limit)와 기본 링크(#access_token 해시)
 *    때문에 생기던 "로그인 반복" 문제를 모두 피한다.
 * [폴백] 서비스 롤/Resend 키가 없으면 예전처럼 signInWithOtp(Supabase 기본 메일)로 보낸다.
 *
 * 로그인 세션 쿠키는 하나의 도메인에만 저장되므로, 계정이 필요한 흐름은 항상
 * CANONICAL_BASE_URL(wink-naming.com) 하나로 통일한다.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

const CANONICAL_BASE_URL = "https://wink-naming.com";
const COOLDOWN_SEC = 60;

/** 절대 URL이든 상대 경로든, 도메인을 버리고 path+search+hash만 남긴다. */
function toCanonicalPath(input: string): string {
  try {
    const u = new URL(input, CANONICAL_BASE_URL);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return input.startsWith("/") ? input : `/${input}`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── 메일 문구 (9개 언어) ───────────────────────────────────────
type MailCopy = { subject: string; title: string; body: string; button: string; note: string; latest: string; ignore: string; codeHint: string };
const MAIL: Record<string, MailCopy> = {
  ko: { subject: "[윙크 네이밍] 로그인 링크", title: "로그인", body: "아래 버튼을 눌러 로그인을 완료해 주세요. 이 링크는 한 번만 사용할 수 있고 곧 만료됩니다.", button: "로그인하기", note: "버튼을 누르면 열리는 페이지에서 ‘로그인 확인’을 한 번 더 눌러 주세요.", latest: "가장 최근에 받은 메일의 링크만 사용할 수 있어요. 새 링크를 받으면 이전 링크는 만료됩니다.", ignore: "본인이 요청하지 않았다면 이 메일을 무시해 주세요.", codeHint: "링크가 열리지 않으면(인스타그램·카카오톡 등) 로그인 화면에 이 인증번호를 입력하세요." },
  en: { subject: "[Wink Naming] Your sign-in link", title: "Sign in", body: "Tap the button below to finish signing in. This link can be used once and expires soon.", button: "Sign in", note: "On the page that opens, tap “Confirm Login” once more.", latest: "Only the link in your most recent email works. Requesting a new link makes older ones expire.", ignore: "If you didn't request this, you can ignore this email.", codeHint: "If the link won't open (Instagram, in-app browsers…), enter this code on the sign-in screen instead." },
  ja: { subject: "[Wink Naming] ログインリンク", title: "ログイン", body: "下のボタンを押してログインを完了してください。このリンクは一度だけ使用でき、まもなく期限が切れます。", button: "ログインする", note: "開いたページで「ログイン確認」をもう一度押してください。", latest: "最新のメールのリンクのみ使えます。新しいリンクを受け取ると、以前のリンクは無効になります。", ignore: "お心当たりがない場合は、このメールを無視してください。", codeHint: "リンクが開けない場合（Instagram などのアプリ内ブラウザ）は、ログイン画面にこの認証コードを入力してください。" },
  zh: { subject: "[Wink Naming] 登录链接", title: "登录", body: "请点击下方按钮完成登录。此链接仅可使用一次，且很快过期。", button: "登录", note: "在打开的页面中，请再点击一次“确认登录”。", latest: "只有最新一封邮件中的链接有效。申请新链接后，旧链接将失效。", ignore: "如果这不是您本人的操作，请忽略此邮件。", codeHint: "如果链接无法打开（如 Instagram 等应用内浏览器），请在登录页面输入此验证码。" },
  es: { subject: "[Wink Naming] Tu enlace de acceso", title: "Iniciar sesión", body: "Pulsa el botón de abajo para completar el acceso. El enlace solo se puede usar una vez y caduca pronto.", button: "Iniciar sesión", note: "En la página que se abre, pulsa «Confirmar acceso» una vez más.", latest: "Solo funciona el enlace del correo más reciente. Al pedir un enlace nuevo, los anteriores caducan.", ignore: "Si no lo solicitaste, puedes ignorar este correo.", codeHint: "Si el enlace no se abre (Instagram u otros navegadores integrados), introduce este código en la pantalla de acceso." },
  ru: { subject: "[Wink Naming] Ссылка для входа", title: "Вход", body: "Нажмите кнопку ниже, чтобы завершить вход. Ссылка одноразовая и скоро истекает.", button: "Войти", note: "На открывшейся странице нажмите «Подтвердить вход» ещё раз.", latest: "Работает только ссылка из самого последнего письма. После запроса новой ссылки прежние перестают действовать.", ignore: "Если вы не запрашивали вход, просто проигнорируйте это письмо.", codeHint: "Если ссылка не открывается (Instagram и другие встроенные браузеры), введите этот код на экране входа." },
  fr: { subject: "[Wink Naming] Votre lien de connexion", title: "Connexion", body: "Appuyez sur le bouton ci-dessous pour terminer la connexion. Ce lien est à usage unique et expire bientôt.", button: "Se connecter", note: "Sur la page qui s'ouvre, appuyez une fois de plus sur « Confirmer la connexion ».", latest: "Seul le lien du e-mail le plus récent fonctionne. Demander un nouveau lien invalide les précédents.", ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.", codeHint: "Si le lien ne s'ouvre pas (Instagram, navigateurs intégrés…), saisissez ce code sur l'écran de connexion." },
  ar: { subject: "[Wink Naming] رابط تسجيل الدخول", title: "تسجيل الدخول", body: "اضغط على الزر أدناه لإكمال تسجيل الدخول. يمكن استخدام هذا الرابط مرة واحدة فقط وتنتهي صلاحيته قريبًا.", button: "تسجيل الدخول", note: "في الصفحة التي ستفتح، اضغط «تأكيد تسجيل الدخول» مرة أخرى.", latest: "يعمل الرابط الموجود في أحدث رسالة فقط. عند طلب رابط جديد تنتهي صلاحية الروابط السابقة.", ignore: "إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.", codeHint: "إذا لم يُفتح الرابط (إنستغرام أو المتصفحات المدمجة)، أدخل هذا الرمز في شاشة تسجيل الدخول." },
  hi: { subject: "[Wink Naming] आपका साइन-इन लिंक", title: "साइन इन", body: "साइन-इन पूरा करने के लिए नीचे दिया बटन दबाएँ। यह लिंक केवल एक बार उपयोग हो सकता है और जल्द समाप्त हो जाता है।", button: "साइन इन करें", note: "खुलने वाले पेज पर एक बार फिर “लॉगिन की पुष्टि करें” दबाएँ।", latest: "केवल सबसे नई ईमेल का लिंक काम करता है। नया लिंक मँगाने पर पुराने लिंक समाप्त हो जाते हैं।", ignore: "यदि आपने यह अनुरोध नहीं किया है, तो इस ईमेल को अनदेखा करें।", codeHint: "यदि लिंक नहीं खुलता (Instagram जैसे इन-ऐप ब्राउज़र), तो लॉगिन स्क्रीन पर यह कोड दर्ज करें।" },
};

function buildMail(lang: string, link: string, code: string, otp: string | null): { subject: string; html: string; text: string } {
  const c = MAIL[lang] ?? MAIL.en;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const safe = escapeHtml(link);
  const otpHtml = otp
    ? `<div style="margin:26px 0 0;padding-top:20px;border-top:1px solid #EEE;">
      <p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#777;">${escapeHtml(c.codeHint)}</p>
      <div style="display:inline-block;padding:10px 22px;border-radius:10px;background:#F8F6F1;font-size:28px;font-weight:700;letter-spacing:0.28em;color:#1B2A5E;font-family:'Courier New',monospace;direction:ltr;">${escapeHtml(otp)}</div>
    </div>`
    : "";
  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:'Noto Sans KR','Noto Sans',Arial,sans-serif;color:#1B2A5E;">
<div style="max-width:480px;margin:0 auto;padding:32px 20px;">
  <div style="font-size:11px;letter-spacing:0.16em;font-weight:700;color:#C9A84C;margin-bottom:14px;">WINK NAMING</div>
  <div style="background:#ffffff;border-radius:16px;padding:32px 26px;box-shadow:0 4px 24px rgba(27,42,94,0.08);text-align:center;">
    <h1 style="margin:0 0 14px;font-size:22px;color:#1B2A5E;">${escapeHtml(c.title)}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#444;">${escapeHtml(c.body)}</p>
    <a href="${safe}" style="display:inline-block;padding:14px 34px;border-radius:12px;background:#C9A84C;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">${escapeHtml(c.button)}</a>
    ${otpHtml}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#777;">${escapeHtml(c.note)}</p>
    <p style="margin:10px 0 0;font-size:12px;line-height:1.7;color:#B8923A;font-weight:700;">${escapeHtml(c.latest)}</p>
  </div>
  <p style="margin:18px 6px 0;font-size:11px;line-height:1.7;color:#999;text-align:center;">${escapeHtml(c.ignore)}</p>
</div></body></html>`;
  const text = `${c.title}\n\n${c.body}\n\n${link}\n\n${otp ? `${c.codeHint}\n${otp}\n\n` : ""}${c.note}\n${c.latest}\n${c.ignore}`;
  // 같은 제목의 메일은 Gmail이 한 대화로 묶어 예전 메일이 먼저 보이므로, 요청마다 다른 4자리 번호를 제목에 붙인다.
  return { subject: `${c.subject} · #${code}`, html, text };
}

// ── 이메일별 재요청 쿨다운 (Upstash 우선, 없으면 인메모리) ──────────────
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) _redis = new Redis({ url, token, retry: false });
  return _redis;
}

/** 허용되면 true. 같은 이메일로 COOLDOWN_SEC 안에 다시 요청하면 false. */
async function takeEmailCooldown(email: string): Promise<boolean> {
  const key = `magiclink:cd:${email}`;
  try {
    const redis = getRedis();
    if (redis) {
      // Redis 장애 시 로그인 응답이 느려지지 않도록 1.5초 안에 못 받으면 인메모리로 대체
      const ok = await Promise.race([
        redis.set(key, "1", { nx: true, ex: COOLDOWN_SEC }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("redis timeout")), 1500)),
      ]);
      return ok === "OK";
    }
  } catch (e) {
    console.error("[magic-link] redis cooldown error:", e);
  }
  return rateLimit(key, 1, COOLDOWN_SEC).allowed;
}

function clientIp(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, redirectTo, lang = "ko" } = (await req.json()) as {
      email?: string;
      redirectTo?: string;
      lang?: string;
    };
    const email = (rawEmail ?? "").trim();

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[magic-link] Supabase env vars missing");
      return NextResponse.json({ ok: false, error: "server misconfigured" }, { status: 500 });
    }

    // 로그인 링크는 /auth/callback 으로 돌아오게 한다(원래 가려던 경로는 next 로 전달).
    const rawDestination = redirectTo ?? `/?lang=${lang}`;
    const destPath = toCanonicalPath(rawDestination);
    const nextPath = destPath.startsWith("/") && !destPath.startsWith("//") ? destPath : "/";
    const safeLang = Object.prototype.hasOwnProperty.call(MAIL, lang) ? lang : "en";
    const emailRedirectTo =
      `${CANONICAL_BASE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}&lang=${encodeURIComponent(safeLang)}`;

    const resendKey = process.env.RESEND_API_KEY;

    // ───── 기본 경로: 토큰은 Supabase, 메일은 Resend ─────
    if (SERVICE_KEY && resendKey) {
      // 남의 주소로 메일을 쏘는 악용 방지: IP당 시간당 20회 + 이메일당 60초 쿨다운
      if (!rateLimit(`magiclink:ip:${clientIp(req)}`, 20, 3600).allowed) {
        return NextResponse.json({ ok: false, code: "rate_limited", retryAfter: 300 }, { status: 429 });
      }
      if (!(await takeEmailCooldown(email.toLowerCase()))) {
        return NextResponse.json({ ok: false, code: "rate_limited", retryAfter: COOLDOWN_SEC }, { status: 429 });
      }

      const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: emailRedirectTo },
      });
      const hashed = data?.properties?.hashed_token;
      const vtype = data?.properties?.verification_type;
      if (!error && hashed && vtype) {
        const link =
          `${CANONICAL_BASE_URL}/auth/confirm?token_hash=${encodeURIComponent(hashed)}` +
          `&type=${encodeURIComponent(vtype)}&redirect_to=${encodeURIComponent(emailRedirectTo)}`;
        const otp = typeof data?.properties?.email_otp === "string" && /^\d{6,10}$/.test(data.properties.email_otp)
          ? data.properties.email_otp
          : null;
        const mail = buildMail(safeLang, link, String(1000 + Math.floor(Math.random() * 9000)), otp);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "윙크 네이밍 <noreply@wink-naming.com>",
            to: [email],
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          }),
        });
        if (res.ok) {
          console.log("[magic-link] resend login mail sent");
          // codeSent: 메일에 인증번호가 들어 있어 로그인 화면에서 번호 입력으로도 로그인할 수 있다.
          return NextResponse.json({ ok: true, codeSent: otp !== null });
        }
        console.error("[magic-link] Resend error:", res.status, await res.text().catch(() => ""));
      } else {
        console.error("[magic-link] generateLink failed:", error?.message ?? "no token");
      }
      // 실패하면 아래 폴백(Supabase 기본 메일)으로 계속 진행
    }

    // ───── 폴백: Supabase 기본 메일 ─────
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: true },
    });

    if (error) {
      console.error("[magic-link] signInWithOtp error:", error.message);

      // Supabase의 "N초 후에 다시 요청" 제한(429) — 화면에서 현지화된 안내와
      // 카운트다운을 보여줄 수 있도록 구조화된 코드로 돌려준다.
      if (error.status === 429 || /you can only request this after/i.test(error.message)) {
        const seconds = Number(/after (\d+) seconds?/i.exec(error.message)?.[1]);
        const retryAfter = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 300) : 60;
        const isEmailLimit = /email rate limit/i.test(error.message);
        return NextResponse.json(
          { ok: false, code: isEmailLimit ? "email_rate_limit" : "rate_limited", retryAfter },
          { status: 429 },
        );
      }

      return NextResponse.json({ ok: false, code: "send_failed", error: error.message }, { status: 500 });
    }

    console.log("[magic-link] otp sent (supabase default mailer)");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link] error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
