import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ── 브라우저 전용 싱글턴 ───────────────────────────────────────
// 서버(SSR)에서는 싱글턴을 사용하지 않아야 합니다.
// - Next.js App Router: "use client" 컴포넌트도 SSR 시 서버에서 한 번 실행됨
// - 모듈 레벨 let 변수는 Node.js 프로세스 전체에서 공유 → 요청 간 상태 오염
// - persistSession: true 가 서버에서 localStorage 접근 시도 → 에러 또는 잘못된 상태 캐시
//
// 해결: SSR에서는 매번 새 클라이언트 생성 (싱글턴 없음)
//       브라우저에서는 탭 당 1개 싱글턴 (각 탭이 독립 모듈 스코프 가짐)

function createFreshClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [
      !url     && "NEXT_PUBLIC_SUPABASE_URL",
      !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean).join(", ");
    throw new Error(
      `Supabase 초기화 실패 — 환경변수 없음: ${missing}. ` +
      `Vercel 대시보드 → Settings → Environment Variables 를 확인하세요.`
    );
  }

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
