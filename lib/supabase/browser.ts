import { createBrowserClient } from "@supabase/ssr";

// anon 키는 공개 키 (클라이언트 번들에 노출됨, 비밀 아님) — 환경변수로 관리.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // 빌드/배포는 계속 진행하되, 런타임에 원인을 바로 알 수 있도록 경고만 남긴다.
  console.warn(
    "[supabase/browser] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다. " +
      "Vercel 프로젝트 환경변수를 확인하세요."
  );
}

// createBrowserClient — 쿠키 기반 세션 (서버 SSR 세션과 동기화됨)
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");
  }
  return _client;
}
