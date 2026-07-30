import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/magic-link
 * Supabase admin으로 매직링크 생성 → Resend로 직접 발송
 * Supabase 대시보드 SMTP 설정 없이 동작
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const EMAIL_COPY: Record<string, { subject: string; body: string; btn: string; footer: string }> = {
  ko: {
    subject: "Wink Naming 로그인 링크",
    body: "아래 버튼을 클릭하시면 비밀번호 없이 바로 로그인됩니다.<br/>링크는 발송 후 1시간 동안 유효합니다.",
    btn: "로그인하기",
    footer: "이 이메일은 Wink Naming 로그인 요청에 의해 발송되었습니다.<br/>요청하지 않으셨다면 무시해 주세요.",
  },
  en: {
    subject: "Your Wink Naming Login Link",
    body: "Click the button below to log in without a password.<br/>This link is valid for 1 hour.",
    btn: "Log In",
    footer: "This email was sent because a login was requested for your account.<br/>If you didn't request this, you can safely ignore it.",
  },
  ja: {
    subject: "Wink Naming ログインリンク",
    body: "以下のボタンをクリックして、パスワードなしでログインしてください。<br/>このリンクは1時間有効です。",
    btn: "ログインする",
    footer: "このメールはWink Namingへのログインリクエストにより送信されました。<br/>心当たりがない場合は無視してください。",
  },
  zh: {
    subject: "您的 Wink Naming 登录链接",
    body: "点击下方按钮，无需密码即可登录。<br/>此链接有效期为1小时。",
    btn: "立即登录",
    footer: "此邮件因登录请求而发送。<br/>如果您没有请求，请忽略此邮件。",
  },
  es: {
    subject: "Su enlace de acceso a Wink Naming",
    body: "Haga clic en el botón para iniciar sesión sin contraseña.<br/>Este enlace es válido por 1 hora.",
    btn: "Iniciar sesión",
    footer: "Este correo fue enviado por una solicitud de inicio de sesión.<br/>Si no lo solicitó, puede ignorarlo.",
  },
  default: {
    subject: "Your Wink Naming Login Link",
    body: "Click the button below to log in without a password.<br/>This link is valid for 1 hour.",
    btn: "Log In",
    footer: "This email was sent because a login was requested.<br/>If you didn't request this, you can safely ignore it.",
  },
};

function buildEmailHtml(link: string, lang: string) {
  const c = EMAIL_COPY[lang] ?? EMAIL_COPY.default;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:'Noto Sans KR','Noto Sans',sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:0 16px;">
  <div style="background:#1B2A5E;border-radius:16px 16px 0 0;padding:28px 32px 20px;text-align:center;">
    <div style="font-size:11px;letter-spacing:0.16em;color:rgba(201,168,76,0.75);font-weight:700;margin-bottom:12px;text-transform:uppercase;">WINK NAMING</div>
    <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.02em;">${c.subject}</div>
  </div>
  <div style="background:#ffffff;padding:32px;border-left:1px solid #E8E8E8;border-right:1px solid #E8E8E8;">
    <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 28px;">${c.body}</p>
    <div style="text-align:center;">
      <a href="${link}" style="display:inline-block;background:#C9A84C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.06em;padding:14px 40px;border-radius:10px;">${c.btn}</a>
    </div>
    <p style="font-size:12px;color:#999;margin:28px 0 0;line-height:1.7;word-break:break-all;">
      링크가 작동하지 않으면 아래 주소를 브라우저에 붙여넣으세요:<br/>
      <span style="color:#1B2A5E;">${link}</span>
    </p>
  </div>
  <div style="background:#F0EDE8;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
    <p style="font-size:11px;color:#888;margin:0;line-height:1.7;">${c.footer}</p>
  </div>
</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo, lang = "ko" } = await req.json() as {
      email?: string;
      redirectTo?: string;
      lang?: string;
    };

    // 이메일 유효성 검사
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    // Resend API 키 확인
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ ok: false, error: "email service not configured" }, { status: 503 });
    }

    // Supabase admin 클라이언트
    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "auth service not configured" }, { status: 503 });
    }

    // 매직링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://wink-naming.vercel.app";
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim(),
      options: {
        redirectTo: redirectTo ?? `${baseUrl}/${lang}/category`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[magic-link] generateLink failed:", linkError?.message);
      return NextResponse.json({ ok: false, error: linkError?.message ?? "link generation failed" }, { status: 500 });
    }

    const actionLink = linkData.properties.action_link;
    const subject = (EMAIL_COPY[lang] ?? EMAIL_COPY.default).subject;
    const html = buildEmailHtml(actionLink, lang);

    // Resend로 발송
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Wink Naming <noreply@wink-naming.com>",
        to: [email.trim()],
        subject,
        html,
      }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.error("[magic-link] Resend error:", errText);
      return NextResponse.json({ ok: false, error: "email send failed" }, { status: 500 });
    }

    console.log("[magic-link] sent to", email.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link] error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
