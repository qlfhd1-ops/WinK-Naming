import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ── 브라우저 전용 싱글턴 ───────────────────────────────────────
// 서버(SSR)에서는 싱글턴을 사용하지 않아야 합니다.
// - Next.js App Router: "use client" 컴포넌트도 SSR 시 서버에서 한 번 실행됨
// - 모듈 레벨 let 변수는 Node.js 프로세스 전체에서 공유 → 요청 간 상태 오염
// - persistSession: true 가 서버에서 localStorage 접근 시도 → 에러 또는 잘못된 상태 캐시
//
// 해결: SSR에서는 매번 새 클라이언트 생성 (싱글턴 없음)
//       브라우저에서는 탭 당 1개 싱글턴 (각 탭이 독립 모듈 스코프 가짐)

// NEXT_PUBLIC 변수는 브라우저에 노출되는 공개 값입니다
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://cyntpbjhpklgzkiwbmph.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnRwYmpocGtsZ3praXdibXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzAzOTYsImV4cCI6MjA4NzUwNjM5Nn0.-821zOmHC7v3y8NzC1FJ1yc92Q5l1E77K3jDzp6P9fE";

function createFreshClient() {
  const url     = SUPABASE_URL;
  const anonKey = SUPABASE_ANON;

  const isBrowser = typeof window !== "undefined";

  return createSupabaseClient(url, anonKey, {
    auth: {
      // 서버에서는 localStorage 없음 → persistSession 비활성화
      persistSession:     isBrowser,
      autoRefreshToken:   isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
}

// 타입은 createFreshClient의 반환값에서 추론 (제네릭 충돌 방지)
let _client: ReturnType<typeof createFreshClient> | null = null;

export function createClient(): ReturnType<typeof createFreshClient> {
  // SSR (서버) — 싱글턴 사용 안 함, 매번 새 인스턴스
  if (typeof window === "undefined") {
    return createFreshClient();
  }

  // 브라우저 — 탭 당 싱글턴 (안전)
  if (!_client) {
    _client = createFreshClient();
  }
  return _client;
}
