-- ============================================================
-- 윙크 네이밍 — RLS 강화 마이그레이션 (유료화 대비)
-- Supabase SQL Editor에 붙여넣고 실행하세요.
--
-- 배경: naming_briefs / naming_results / naming_orders / naming_order_items /
-- naming_packages / naming_ars의 INSERT 정책이 WITH CHECK (true)로 되어 있어,
-- 클라이언트에 노출된 anon key만 있으면 누구나 Supabase REST API에 직접
-- INSERT 요청을 보낼 수 있었다 (앱의 API 라우트를 거치지 않고도 삽입 가능).
--
-- 앱의 실제 쓰기 작업은 전부 서버 API 라우트(app/api/**)가
-- SUPABASE_SERVICE_ROLE_KEY로 수행하며, service_role은 RLS를 우회하므로
-- 이 변경은 앱 동작에 영향이 없다. 즉 아래 정책 강화는 "앱이 아닌 경로로의
-- 무분별한 직접 삽입"만 차단한다.
--
-- 단, 비로그인(게스트) 사용자의 무료 작명 체험 흐름(user_id=NULL로 저장)은
-- 서버 라우트가 service_role로 대신 insert해주므로 계속 정상 동작한다.
-- (RLS는 Supabase REST API로 anon/authenticated 키를 직접 쓸 때만 적용됨)
-- ============================================================

-- ─── 1. naming_briefs ───────────────────────────────────────
DROP POLICY IF EXISTS "anyone can insert briefs" ON public.naming_briefs;

CREATE POLICY "authenticated users can insert briefs"
  ON public.naming_briefs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 2. naming_results ──────────────────────────────────────
DROP POLICY IF EXISTS "anyone can insert results" ON public.naming_results;

CREATE POLICY "authenticated users can insert results"
  ON public.naming_results FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 3. naming_orders ───────────────────────────────────────
DROP POLICY IF EXISTS "anyone can insert orders" ON public.naming_orders;

CREATE POLICY "authenticated users can insert orders"
  ON public.naming_orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 4. naming_order_items ──────────────────────────────────
DROP POLICY IF EXISTS "anyone can insert order items" ON public.naming_order_items;

CREATE POLICY "authenticated users can insert order items"
  ON public.naming_order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 5. naming_packages ─────────────────────────────────────
DROP POLICY IF EXISTS "anyone can insert packages" ON public.naming_packages;

CREATE POLICY "authenticated users can insert packages"
  ON public.naming_packages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 6. naming_ars (After-Service 재설계) ───────────────────
DROP POLICY IF EXISTS "anyone can insert ars" ON public.naming_ars;

CREATE POLICY "authenticated users can insert ars"
  ON public.naming_ars FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 7. naming_gift_cards ───────────────────────────────────
-- SELECT 정책은 유지한다 — 선물 수신자가 로그인 없이 토큰(URL)으로만
-- 카드를 열어보는 플로우이기 때문에 "anyone can read" 자체가 필요하다.
-- 다만 현재는 token 컬럼으로 필터링하지 않고 전체 테이블을 읽을 수 있게
-- 열려 있으므로, 추후 다음과 같은 형태로 token 기반 필터링으로 좁히는 것을
-- 고려한다 (애플리케이션이 항상 token으로만 조회하도록 바뀐 뒤 적용):
--
--   CREATE POLICY "read gift cards by token only"
--     ON public.naming_gift_cards FOR SELECT
--     USING (token = current_setting('request.jwt.claims', true)::json->>'token');
--
-- (주의: 위 예시는 참고용 스케치이며 그대로 실행하면 기존 조회 흐름이
-- 깨질 수 있다. 실제 전환 시 애플리케이션 코드와 함께 재검토 필요.)

-- ─── 8. gifts (결과 공유 링크) ──────────────────────────────
-- naming_gift_cards와 동일한 이유로 SELECT 정책 유지.
-- 추후 token 기반 필터링 전환 시 naming_gift_cards와 같은 패턴 적용 고려.
