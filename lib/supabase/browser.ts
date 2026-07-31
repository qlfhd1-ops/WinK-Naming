import { createBrowserClient } from "@supabase/ssr";

// Vercel 환경변수 불일치 문제로 올바른 프로젝트 값을 직접 고정
// anon 키는 NEXT_PUBLIC_ 공개 키 — 클라이언트 번들에 이미 노출됨
const SUPABASE_URL = "https://cyntpbjhpklgzkiwbmph.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnRwYmpocGtsZ3praXdibXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzAzOTYsImV4cCI6MjA4NzUwNjM5Nn0.-821zOmHC7v3y8NzC1FJ1yc92Q5l1E77K3jDzp6P9fE";

// createBrowserClient — 쿠키 기반 세션 (서버 SSR 세션과 동기화됨)
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
