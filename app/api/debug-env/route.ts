import { NextResponse } from "next/server";

/** GET /api/debug-env — 환경변수 존재 여부 확인 (값 비노출, 배포 후 삭제 예정) */
export async function GET() {
  return NextResponse.json({
    OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
    OPENAI_KEY_LENGTH: process.env.OPENAI_API_KEY?.length ?? 0,
    OPENAI_KEY_PREFIX: process.env.OPENAI_API_KEY?.slice(0, 8) ?? "none",
    NEXT_PUBLIC_SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY_SET: !!process.env.SUPABASE_SECRET_KEY,
    UPSTASH_REDIS_REST_URL_SET: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN_SET: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });
}
