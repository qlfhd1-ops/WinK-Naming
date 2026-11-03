-- ============================================================
-- 윙크 네이밍 — Supabase Schema (실제 운영 DB 기준 재동기화)
--
-- 이 파일은 2026-11-03 기준 실제 운영 Supabase 프로젝트
-- (cyntpbjhpklgzkiwbmph, "Yoon Seul-Naming")의 테이블/컬럼/제약조건/
-- 인덱스/RLS 정책을 Supabase MCP로 직접 조회해 그대로 반영한 것이다.
--
-- 과거 버전의 이 파일은 naming_packages, naming_ars, naming_gift_cards,
-- gifts, naming_free_usage 등 실제로는 존재하지 않는 테이블을 포함하고,
-- naming_requests/naming_candidates/naming_selections/entitlements/
-- generations/user_carts/user_shortlists/shortlist_shares/guest_carts/
-- user_emails 등 실제 존재하는 테이블은 빠져 있는 등 실제 DB와 크게
-- 어긋나 있었다. 이번 버전은 그 불일치를 해소한 것이다.
--
-- 모든 CREATE TABLE은 IF NOT EXISTS를 사용하고, 모든 정책은
-- DROP POLICY IF EXISTS 후 CREATE POLICY로 작성해 기존 DB에 다시
-- 실행해도(재동기화/신규 프로젝트 셋업 등) 에러 없이 안전하게 재실행
-- 가능하도록 했다.
-- ============================================================

-- ─── 1. naming_requests ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  purpose          TEXT NOT NULL,
  gender           TEXT,
  family_name      TEXT,
  style_keywords   TEXT,
  avoid_keywords   TEXT,
  memo             TEXT,
  target_country   TEXT,
  display_language TEXT
);

ALTER TABLE public.naming_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "naming_requests_insert_own" ON public.naming_requests;
CREATE POLICY "naming_requests_insert_own"
  ON public.naming_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "naming_requests_select_own" ON public.naming_requests;
CREATE POLICY "naming_requests_select_own"
  ON public.naming_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "naming_requests_update_own" ON public.naming_requests;
CREATE POLICY "naming_requests_update_own"
  ON public.naming_requests FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 2. naming_candidates ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_candidates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id       UUID NOT NULL REFERENCES public.naming_requests(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  name             TEXT NOT NULL,
  concept          TEXT,
  score            INTEGER,
  tone             TEXT,
  image            TEXT,
  reason           TEXT,
  caution          TEXT,
  summary          TEXT,
  alternatives     JSONB,
  hanja            TEXT,
  hanja_meaning    TEXT,
  english          TEXT,
  english_alt      TEXT,
  chinese          TEXT,
  pinyin           TEXT,
  japanese_kana    TEXT,
  japanese_reading TEXT,
  gift_message     TEXT,
  global_comment   TEXT
);

ALTER TABLE public.naming_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "naming_candidates_insert_own" ON public.naming_candidates;
CREATE POLICY "naming_candidates_insert_own"
  ON public.naming_candidates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "naming_candidates_select_own" ON public.naming_candidates;
CREATE POLICY "naming_candidates_select_own"
  ON public.naming_candidates FOR SELECT USING (auth.uid() = user_id);

-- ─── 3. naming_selections ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_selections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID NOT NULL REFERENCES public.naming_requests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.naming_candidates(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "naming_selections_insert_own" ON public.naming_selections;
CREATE POLICY "naming_selections_insert_own"
  ON public.naming_selections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "naming_selections_select_own" ON public.naming_selections;
CREATE POLICY "naming_selections_select_own"
  ON public.naming_selections FOR SELECT USING (auth.uid() = user_id);

-- ─── 4. naming_briefs ───────────────────────────────────────
-- user_id가 NULL이면 비로그인(게스트) 작명. guest_email은 게스트의
-- 연락처(리드 캡처용, 폼에서 필수 수집). status는 'started'(폼 제출 직후,
-- 이름 생성 전 이탈 추적용)/'completed'(이름 생성까지 완료) 두 가지 값을 가짐.
CREATE TABLE IF NOT EXISTS public.naming_briefs (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lang                       TEXT NOT NULL,
  category                   TEXT NOT NULL,
  target_name                TEXT,
  family_name                TEXT,
  purpose                    TEXT NOT NULL,
  style_keywords             TEXT NOT NULL,
  avoid_keywords             TEXT,
  target_country             TEXT,
  preferred_script           TEXT,
  memo                       TEXT,
  needs_global_pronunciation BOOLEAN NOT NULL DEFAULT true,
  needs_stamp_package        BOOLEAN NOT NULL DEFAULT false,
  needs_doorplate_package    BOOLEAN NOT NULL DEFAULT false,
  needs_giftcard_package     BOOLEAN NOT NULL DEFAULT true,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  guest_email                TEXT,
  status                     TEXT NOT NULL DEFAULT 'completed'
);

ALTER TABLE public.naming_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "briefs_insert_own" ON public.naming_briefs;
CREATE POLICY "briefs_insert_own"
  ON public.naming_briefs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "briefs_select_own" ON public.naming_briefs;
CREATE POLICY "briefs_select_own"
  ON public.naming_briefs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "briefs_update_own" ON public.naming_briefs;
CREATE POLICY "briefs_update_own"
  ON public.naming_briefs FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 5. naming_results ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id           UUID NOT NULL REFERENCES public.naming_briefs(id) ON DELETE CASCADE,
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rank_order         INTEGER NOT NULL,
  name               TEXT NOT NULL,
  english            TEXT,
  chinese            TEXT,
  chinese_pinyin     TEXT,
  japanese_kana      TEXT,
  japanese_reading   TEXT,
  meaning            TEXT,
  story              TEXT,
  fit_reason         TEXT,
  teasing_risk       TEXT,
  similarity_risk    TEXT,
  pronunciation_risk TEXT,
  brand_risk         TEXT,
  caution            TEXT,
  score              INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "results_insert_own" ON public.naming_results;
CREATE POLICY "results_insert_own"
  ON public.naming_results FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "results_select_own" ON public.naming_results;
CREATE POLICY "results_select_own"
  ON public.naming_results FOR SELECT USING (auth.uid() = user_id);

-- ─── 6. naming_package_selections ───────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_package_selections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id     UUID NOT NULL REFERENCES public.naming_briefs(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  package_type TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_package_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "package_insert_own" ON public.naming_package_selections;
CREATE POLICY "package_insert_own"
  ON public.naming_package_selections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "package_select_own" ON public.naming_package_selections;
CREATE POLICY "package_select_own"
  ON public.naming_package_selections FOR SELECT USING (auth.uid() = user_id);

-- ─── 7. naming_orders ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_note  TEXT,
  total_amount   INTEGER NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'KRW',
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_own" ON public.naming_orders;
CREATE POLICY "orders_insert_own"
  ON public.naming_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_select_own" ON public.naming_orders;
CREATE POLICY "orders_select_own"
  ON public.naming_orders FOR SELECT USING (auth.uid() = user_id);

-- ─── 8. naming_order_items ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.naming_orders(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brief_id     UUID NOT NULL REFERENCES public.naming_briefs(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL DEFAULT 0,
  quantity     INTEGER NOT NULL DEFAULT 1,
  lang         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_insert_own" ON public.naming_order_items;
CREATE POLICY "order_items_insert_own"
  ON public.naming_order_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "order_items_select_own" ON public.naming_order_items;
CREATE POLICY "order_items_select_own"
  ON public.naming_order_items FOR SELECT USING (auth.uid() = user_id);

-- ─── 9. entitlements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_free_generated_date DATE
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entitlements_insert_own" ON public.entitlements;
CREATE POLICY "entitlements_insert_own"
  ON public.entitlements FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "entitlements_select_own" ON public.entitlements;
CREATE POLICY "entitlements_select_own"
  ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "entitlements_update_own" ON public.entitlements;
CREATE POLICY "entitlements_update_own"
  ON public.entitlements FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 10. generations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  input      JSONB NOT NULL,
  names      JSONB NOT NULL,
  is_saved   BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "generations_insert_own" ON public.generations;
CREATE POLICY "generations_insert_own"
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "generations_select_own" ON public.generations;
CREATE POLICY "generations_select_own"
  ON public.generations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "generations_update_own" ON public.generations;
CREATE POLICY "generations_update_own"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "generations_delete_own" ON public.generations;
CREATE POLICY "generations_delete_own"
  ON public.generations FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS generations_user_id_idx    ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS generations_expires_at_idx ON public.generations(expires_at);

-- ─── 11. user_plans ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_plans (
  user_id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL DEFAULT 'free',
  plan_expires_at         TIMESTAMPTZ,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_plans_insert_own" ON public.user_plans;
CREATE POLICY "user_plans_insert_own"
  ON public.user_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plans_select_own" ON public.user_plans;
CREATE POLICY "user_plans_select_own"
  ON public.user_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_plans_update_own" ON public.user_plans;
CREATE POLICY "user_plans_update_own"
  ON public.user_plans FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 12. profiles (관리자 역할 관리) ────────────────────────
-- role: 'user' (기본값) | 'admin'
-- 어드민 계정 등록: INSERT INTO profiles (id, role) VALUES ('<user-uuid>', 'admin');
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  role       TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ─── 13. user_carts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own cart" ON public.user_carts;
CREATE POLICY "users can manage own cart"
  ON public.user_carts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 14. user_shortlists ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_shortlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_shortlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can manage own shortlist" ON public.user_shortlists;
CREATE POLICY "users can manage own shortlist"
  ON public.user_shortlists FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 15. shortlist_shares (로그인 불필요, 토큰 기반 공유 링크) ──
-- INSERT/UPDATE/DELETE 정책이 없다 — 서버(service_role)만 쓰기 가능,
-- 누구나 토큰으로 조회만 가능(만료 전인 경우).
CREATE TABLE IF NOT EXISTS public.shortlist_shares (
  token      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  items      JSONB NOT NULL,
  lang       TEXT NOT NULL DEFAULT 'ko',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.shortlist_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shortlist_shares_select" ON public.shortlist_shares;
CREATE POLICY "shortlist_shares_select"
  ON public.shortlist_shares FOR SELECT USING (expires_at > now());

CREATE INDEX IF NOT EXISTS idx_shortlist_shares_expires ON public.shortlist_shares(expires_at);

-- ─── 16. guest_carts (게스트 장바구니, 서버 전용 테이블) ────────
-- RLS는 켜져 있지만 정책이 전혀 없다 — anon/authenticated로는 어떤
-- 접근도 불가능(기본 거부)하고, 서버 API가 service_role로만 접근한다.
CREATE TABLE IF NOT EXISTS public.guest_carts (
  email      TEXT PRIMARY KEY,
  items      JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guest_carts ENABLE ROW LEVEL SECURITY;
-- (의도적으로 정책 없음 — service_role 전용)

-- ─── 17. user_emails (방문자 이메일 수집, 서버 전용 테이블) ──────
-- guest_carts와 동일하게 정책이 전혀 없다 — service_role 전용.
CREATE TABLE IF NOT EXISTS public.user_emails (
  email       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_visit  TIMESTAMPTZ DEFAULT now(),
  visit_count INTEGER DEFAULT 1
);

ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;
-- (의도적으로 정책 없음 — service_role 전용)

-- ─── 인덱스 (위에서 테이블별로 생성한 것 제외, 나머지 전체) ────────
CREATE INDEX IF NOT EXISTS idx_naming_briefs_user_id            ON public.naming_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_briefs_status             ON public.naming_briefs(status);
CREATE INDEX IF NOT EXISTS idx_naming_briefs_guest_email         ON public.naming_briefs(guest_email);
CREATE INDEX IF NOT EXISTS idx_naming_results_brief_id          ON public.naming_results(brief_id);
CREATE INDEX IF NOT EXISTS idx_naming_results_user_id           ON public.naming_results(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_package_selections_brief_id ON public.naming_package_selections(brief_id);
CREATE INDEX IF NOT EXISTS idx_naming_orders_user_id            ON public.naming_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_order_items_order_id      ON public.naming_order_items(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_carts_user_id_idx        ON public.user_carts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_shortlists_user_id_idx   ON public.user_shortlists(user_id);
