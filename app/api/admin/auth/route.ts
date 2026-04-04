import { NextResponse } from "next/server";

/**
 * POST /api/admin/auth
 * Body: { password: string }
 * Returns: { ok: true } or 401
 *
 * ADMIN_PASSWORD 환경변수와 비교. 일치하면 클라이언트가 이후 요청에
 * X-Admin-Password 헤더로 재사용한다.
 */
export async function POST(req: Request) {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD not set" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const entered = typeof body?.password === "string" ? body.password : "";

  if (entered !== adminPw) {
    return NextResponse.json({ ok: false, error: "비밀번호가 틀렸습니다" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
