-- ============================================================
-- 윙크 네이밍 — Supabase Schema
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- ============================================================

-- ─── 1. naming_briefs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_briefs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lang                     TEXT NOT NULL DEFAULT 'ko',
  category                 TEXT NOT NULL,
  target_name              TEXT,
  family_name              TEXT,
  purpose                  TEXT NOT NULL,
  style_keywords           TEXT,
  avoid_keywords           TEXT,
  target_country           TEXT,
  preferred_script         TEXT,
  memo                     TEXT,
  needs_global_pronunciation BOOLEAN NOT NULL DEFAULT false,
  needs_stamp_package      BOOLEAN NOT NULL DEFAULT false,
  needs_doorplate_package  BOOLEAN NOT NULL DEFAULT false,
  needs_giftcard_package   BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert briefs"
  ON public.naming_briefs FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own briefs"
  ON public.naming_briefs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 2. naming_results ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id            UUID REFERENCES public.naming_briefs(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rank_order          INTEGER NOT NULL DEFAULT 1,
  name                TEXT NOT NULL,
  hanja               TEXT,
  hanja_meaning       TEXT,
  hanja_strokes       TEXT,
  five_elements       TEXT,
  phonetic_harmony    TEXT,
  english             TEXT,
  chinese             TEXT,
  chinese_pinyin      TEXT,
  japanese_kana       TEXT,
  japanese_reading    TEXT,
  meaning             TEXT,
  story               TEXT,
  fit_reason          TEXT,
  teasing_risk        TEXT,
  similarity_risk     TEXT,
  pronunciation_risk  TEXT,
  brand_risk          TEXT,
  caution             TEXT,
  score               INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert results"
  ON public.naming_results FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own results"
  ON public.naming_results FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 3. naming_orders ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_note   TEXT,
  total_amount    INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'KRW',
  status          TEXT NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert orders"
  ON public.naming_orders FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own orders"
  ON public.naming_orders FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 4. naming_order_items ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES public.naming_orders(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brief_id      UUID REFERENCES public.naming_briefs(id) ON DELETE SET NULL,
  package_type  TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL DEFAULT 0,
  quantity      INTEGER NOT NULL DEFAULT 1,
  lang          TEXT NOT NULL DEFAULT 'ko',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert order items"
  ON public.naming_order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own order items"
  ON public.naming_order_items FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 5. naming_packages ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id      UUID REFERENCES public.naming_briefs(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  package_type  TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL DEFAULT 0,
  lang          TEXT NOT NULL DEFAULT 'ko',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert packages"
  ON public.naming_packages FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own packages"
  ON public.naming_packages FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 6. naming_gift_cards ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_gift_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token            TEXT NOT NULL UNIQUE,
  brief_id         UUID REFERENCES public.naming_briefs(id) ON DELETE SET NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id         UUID REFERENCES public.naming_orders(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  hanja            TEXT,
  hanja_meaning    TEXT,
  hanja_strokes    TEXT,
  five_elements    TEXT,
  english          TEXT,
  chinese          TEXT,
  chinese_pinyin   TEXT,
  japanese_kana    TEXT,
  japanese_reading TEXT,
  meaning          TEXT,
  story            TEXT,
  phonetic_harmony TEXT,
  sender_name      TEXT,
  recipient_name   TEXT,
  message          TEXT,
  paid             BOOLEAN NOT NULL DEFAULT false,
  lang             TEXT NOT NULL DEFAULT 'ko',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert gift cards"
  ON public.naming_gift_cards FOR INSERT WITH CHECK (true);

CREATE POLICY "anyone can read gift cards by token"
  ON public.naming_gift_cards FOR SELECT USING (true);

CREATE POLICY "service role can update gift cards"
  ON public.naming_gift_cards FOR UPDATE USING (true);

-- ─── 7. gifts (결과 공유 링크) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.gifts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results    JSONB NOT NULL,
  brief      JSONB,
  lang       TEXT NOT NULL DEFAULT 'ko',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert gifts"
  ON public.gifts FOR INSERT WITH CHECK (true);

CREATE POLICY "anyone can read gifts by token"
  ON public.gifts FOR SELECT USING (true);

-- ─── 8. naming_free_usage ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.naming_free_usage (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month      TEXT NOT NULL,  -- 'YYYY-MM' 형식
  brief_id   UUID REFERENCES public.naming_briefs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

ALTER TABLE public.naming_free_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can insert own free usage"
  ON public.naming_free_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can read own free usage"
  ON public.naming_free_usage FOR SELECT USING (auth.uid() = user_id);

-- ─── 9. naming_ars (After-Service 재설계) ───────────────────
CREATE TABLE IF NOT EXISTS public.naming_ars (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_brief_id  UUID REFERENCES public.naming_briefs(id) ON DELETE SET NULL,
  ars_brief_id       UUID REFERENCES public.naming_briefs(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naming_ars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert ars"
  ON public.naming_ars FOR INSERT WITH CHECK (true);

CREATE POLICY "users can read own ars"
  ON public.naming_ars FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- ─── 10. user_plans ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan             TEXT NOT NULL DEFAULT 'free',
  plan_expires_at  TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own plan"
  ON public.user_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "service role can manage plans"
  ON public.user_plans FOR ALL USING (true);

-- ─── 11. profiles (관리자 역할 관리) ────────────────────────
-- role: 'user' (기본값) | 'admin'
-- 어드민 계정 등록: INSERT INTO profiles (id, role) VALUES ('<user-uuid>', 'admin');
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "service role can manage profiles"
  ON public.profiles FOR ALL USING (true);

-- ─── 인덱스 ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_naming_briefs_user_id       ON public.naming_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_results_brief_id     ON public.naming_results(brief_id);
CREATE INDEX IF NOT EXISTS idx_naming_orders_user_id       ON public.naming_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_order_items_order_id ON public.naming_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_naming_gift_cards_token     ON public.naming_gift_cards(token);
CREATE INDEX IF NOT EXISTS idx_gifts_token                 ON public.gifts(token);
CREATE INDEX IF NOT EXISTS idx_naming_free_usage_user_month ON public.naming_free_usage(user_id, month);
