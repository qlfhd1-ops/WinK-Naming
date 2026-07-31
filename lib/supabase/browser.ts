import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ── 브라우저 전용 싱글턴 ───────────────────────────────────────
// Vercel 환경변수 불일치 문제로 올바른 프로젝트 값을 직접 고정
// anon 키는 NEXT_PUBLIC_ 공개 키 — 클라이언트 번들에 이미 노출됨
const SUPABASE_URL = "https://cyntpbjhpklgzkiwbmph.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnRwYmpocGtsZ3praXdibXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzAzOTYsImV4cCI6MjA4NzUwNjM5Nn0.-821zOmHC7v3y8NzC1FJ1yc92Q5l1E77K3jDzp6P9fE";

function createFreshClient() {
  const isBrowser = typeof window !== "undefined";

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession:     isBrowser,
      autoRefreshToken:   isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
}

let _client: ReturnType<typeof createFreshClient> | null = null;

export function createClient(): ReturnType<typeof createFreshClient> {
  if (typeof window === "undefined") {
    return createFreshClient();
  }
  if (!_client) {
    _client = createFreshClient();
  }
  return _client;
}
