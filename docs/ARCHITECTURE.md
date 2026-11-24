# 윙크 네이밍 — 프로젝트 지도 (ARCHITECTURE)

> 작성: 2026-11-24 (정리 브랜치 `cleanup/2026-11` 시작 시점의 구조 기준)
> 스택: Next.js 16 (App Router, Turbopack) · React · Supabase(Auth/Postgres) · OpenAI · Resend · Upstash Redis(현재 연결 끊김) · Stripe(베타 중 UI 비활성) · Vercel
> 이 문서는 "어디에 무엇이 있는지"를 알려 주는 지도입니다. 코드를 복사해 두지 않았습니다. 코드는 git 기록을 보세요.

---

## 1. 핵심 사용자 흐름

```
접속(/, 언어는 ?lang= 또는 localStorage "wink.naming.preferred-lang")
 └─ 카테고리 카드 선택 → /{lang}/design?type=…   (질문 입력, 약 3천 줄)
     └─ 이메일 로그인(매직링크)  →  /auth/confirm → /auth/callback → 원래 가려던 경로
         ※ 로그인 화면은 /{lang}/login, 서버는 /api/auth/magic-link (Resend 로 직접 발송)
     └─ /api/brief, /api/brief/start 로 입력 저장 → /api/naming(OpenAI, SSE 스트리밍)
 └─ /{lang}/result  (이름 3개, 카드 창, 후기, "이메일로 받기")
     └─ /api/send-card → 메일(선물 도착 증서) → /present(선물 열기) , /listen(발음 듣기)
 └─ (결제 준비 중) /{lang}/cart → /{lang}/checkout → /{lang}/order(굿즈: 도장·문패) → /{lang}/orders(주문 내역)
```

- 로그인 방식은 **이메일 매직링크 하나**입니다. 구글/소셜 로그인 버튼은 코드에 없습니다. (`/api/auth/naver` 라우트는 있으나 화면에서 호출하는 곳이 없습니다.)
- 로그인 전(게스트)에 만든 데이터는 `session_token`으로 저장해 두었다가 로그인 직후 `/api/auth/merge-session` 이 계정으로 합칩니다(`lib/session-token.ts`).
- 서비스는 "Pre-launch Beta" 상태입니다(아래 5장).

---

## 2. 폴더 구조와 역할

### app/ — 화면(페이지)
| 경로 | 역할 |
|---|---|
| `app/layout.tsx` | 전체 레이아웃: GTM, 베타 배너, 로그인 해시 리다이렉트 스크립트, 폰트, 메타데이터 |
| `app/page.tsx` | 홈. 히어로·카테고리 카드·후기·신뢰 지표. 9개 언어 문구가 파일 안에 들어 있음(약 2,775줄) |
| `app/robots.ts`, `app/sitemap.ts` | 검색엔진용 robots.txt / sitemap.xml |
| `app/[lang]/layout.tsx` | 지원 언어 검사(미지원이면 404) 후 `AppShell` 로 감쌈 |
| `app/[lang]/design/page.tsx` | 이름 설계 질문 입력(카테고리별 폼, 약 3,000줄) |
| `app/[lang]/result/page.tsx` | 이름 결과·선택·카드 창·이메일 받기·후기·후기 로그인(약 3,970줄) |
| `app/[lang]/login/page.tsx` | 이메일 로그인(매직링크 요청, 60초 재전송 대기, 안내 문구) |
| `app/[lang]/cart`, `checkout`, `order`, `orders` | 장바구니 / 결제 입력 / 굿즈(도장·문패) 주문 / 주문 내역 |
| `app/[lang]/shortlist` | 마음에 든 이름 보관함·공유 |
| `app/[lang]/terms`, `privacy` | 이용약관, 개인정보 처리방침 |
| `app/[lang]/category` | 옛 카테고리 페이지 → 홈으로 즉시 리다이렉트 |
| `app/[lang]/gift/[token]`, `app/gift/[token]` | 이름 선물 받기 페이지(`gifts` 테이블 기반, 옛 선물 기능) |
| `app/[lang]/property`, `app/admin/property`, `app/api/property`, `components/property` | **부동산 매물 기능(작업 중, git 미추적)** — 윙크 네이밍 본 기능과 무관, 아래 7장 참고 |
| `app/auth/confirm`, `app/auth/callback` | 매직링크 확인 버튼(`verifyOtp`) / 세션 저장·게스트 데이터 병합 |
| `app/present`, `app/listen` | 선물 열기(상자 연출+소리) / 이름 발음 듣기. 메일 버튼이 연결 |
| `app/archive` | 보관함 안내 페이지 |
| `app/cart`, `category`, `design`, `login`, `result` (루트) | **옛 링크 호환용 리다이렉트** — 언어 붙은 경로로 보냄. 유지 |
| `app/checkout/pape.tsx`, `app/orders/paga.tsx` | 파일명 오타(`page.tsx` 아님)라 라우트로 동작하지 않는 옛 사본 |
| `app/admin/*` | 관리자: 로그인, 대시보드(`page.tsx`), 후기 관리, 부동산 |

### app/api/ — 서버 API (Route Handler)
| 경로 | 역할 |
|---|---|
| `naming` | 이름 생성(OpenAI, SSE). 무료 시간당 5회 제한, 최근 과다 이름 회피, 3개 결과 |
| `brief`, `brief/start` | 설계 입력(brief) 저장 / 시작 |
| `send-card` | 이름카드 메일 발송(1회만, 원자적 선점, 첨부 이미지) |
| `auth/magic-link` | 로그인 메일(Resend). IP·이메일 제한. `auth/merge-session` 게스트 병합, `auth/naver` 네이버 OAuth 시작 |
| `free-usage`, `user-plan` | 월 무료 사용량(테이블 없으면 "무료 가능" 처리) / 플랜 조회 |
| `reviews`, `reviews/featured` | 후기 제출 / 공개 노출용 후기 |
| `order`, `direct-order`, `gift-card`, `gift`, `ars`, `package` | 주문·직접 주문·선물카드·선물·A/S·패키지 관련(결제 준비 중) |
| `stripe/checkout`, `stripe/webhook` | Stripe 결제 / 웹훅(백엔드는 유지, UI만 비활성) |
| `shipping/calculate` | 굿즈 배송비 계산 |
| `global-naming`, `generate`, `brand-validate` | 옛 외국인 이름/생성/브랜드 검증 API |
| `stats/naming-count` | 공개 통계(총 이름 생성 수) |
| `cron/keep-alive` | Supabase 자동 정지 방지(Vercel Cron, 매일 03:00 UTC, `vercel.json`) |
| `admin/*` | 관리자 API: `auth`, `check-role`, `stats`, `leads`, `orders`, `order-status`, `reviews`, `reviews/replies`. `x-admin-password` 또는 Bearer 토큰+admin role |
| `admin/page.tsx` | API 폴더 안의 화면 파일(라우트로는 쓰이지 않음) |

### components/ — 화면 부품
`AppShell`(언어별 공통 껍데기·헤더) · `AudioPlayer`(배경음) · `MultiLangNameCard`(이름카드 창, 스타일 선택·저장·공유·이메일) · `NameGenerationScene`(생성 중 애니메이션) · `ReviewModal` · `PrivacyConsentModal` · `UpgradeModal` · `SealStamp`(인장 SVG) · `KoreanPatternOverlay` · `WinkLogoFull/WinkMark/WinkMarkClassic`(로고) · `GoogleAnalytics`(GTM dataLayer 이벤트) · 그 외 `AddToCartButton`, `NameGiftCard`, `PremiumExpansionOptions`, `ReturningWelcome`, `SocialProof`, `YoonseulNameBirth`(사용처 점검 대상, `docs/CLEANUP-2026-11.md` 참고)

### lib/ — 공용 로직
| 파일 | 역할 |
|---|---|
| `lang-config.ts` | 지원 언어 9개 목록·표시명·방향(ar=RTL) — **언어 목록의 기준** |
| `i18n.ts`, `messages/*` | 옛 5개 언어(ko/en/ja/zh/es) 번역 묶음(사용처 점검 대상) |
| `naming-engine.ts`, `hanja-analysis.ts`, `saju.ts`, `name-filters.ts`, `relationship.ts` | 이름 설계 규칙·한자 획수/오행·사주·놀림/중복 필터·관계 |
| `pricing.ts` | 가격·플랜·월 무료 횟수(`FREE_MONTHLY_QUOTA`)·**`SERVICE_PRE_LAUNCH` 플래그** |
| `name-card-email.ts` | 이름카드 "선물 도착" 메일 HTML(9개 언어) |
| `gift-link.ts` | `/present` 링크 데이터 인코딩/검증(개인정보 없음) |
| `send-email.ts` | Resend 공통 발송 유틸(주문·선물 메일 등) |
| `plaques.ts`, `card-backgrounds.ts`, `country-flags.ts` | 카드 스타일 6종 / 랜드마크 사진 6종 / 국기 |
| `generation-steps.ts` | 생성 중 6단계 문구(9개 언어) |
| `cart.ts`, `shortlist.ts`, `session-token.ts` | 장바구니(로컬) / 보관함 / 게스트 세션 토큰 |
| `rate-limiter.ts`, `upstash.ts` | 인메모리 제한 / Upstash 제한(현재 Redis 주소 끊겨 폴백으로 동작) |
| `sound.ts` | Web Audio 효과음 |
| `supabase/browser.ts`, `utils/supabase/server.ts` | 브라우저(anon) / 서버(service role·SSR) 클라이언트 |
| `brand.ts`, `brandValidation.ts`, `fetcher.ts` | 옛 브랜드 네이밍·fetch 도우미(사용처 점검 대상) |

기타: `proxy.ts`(Next 16 미들웨어: 관리자 보호, 봇 UA 차단, POST 제한, 보안 헤더·CSP), `types/naming.ts`, `public/images`(로고·카드 사진), `public/audio`(배경음), `supabase-schema.sql`(DB 스키마 기록), `next.config.ts`(이미지/오디오 캐시 헤더).

---

## 3. 환경변수 (이름만, 값은 적지 않음)

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 접속(브라우저 공개) |
| `SUPABASE_SERVICE_ROLE_KEY` (또는 `SUPABASE_SECRET_KEY`) | 서버 전용 관리자 키 |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | 이름 생성 |
| `RESEND_API_KEY`, `RESEND_FROM` | 메일 발송(발신 도메인 wink-naming.com) |
| `ADMIN_PASSWORD` | 관리자 API/로그인 |
| `NEXT_PUBLIC_BASE_URL` | 사이트 기준 주소 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | 요청 제한(현재 주소 끊김) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | 결제(베타 중 UI 비활성) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 공유 |
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | 네이버 로그인(화면 연결 없음) |
| `CRON_SECRET` | Vercel Cron 보호 |
| `SHIPPING_FREE_EVENT_UNTIL` | 무료배송 이벤트 종료일 |

`.env.local` 은 로컬 전용이며 저장소에 올리지 않습니다. Vercel 프로젝트 설정에 같은 이름으로 등록되어 있어야 합니다.

---

## 4. Supabase (프로젝트 `cyntpbjhpklgzkiwbmph`) 테이블

실제 DB의 public 테이블 19개(모두 RLS 켜짐):

| 테이블 | 용도 |
|---|---|
| `naming_briefs` | 이름 설계 입력(brief). 게스트/로그인, `card_sent_*`(카드 메일 1회 발송 기록), `session_token` |
| `naming_results` | 생성된 이름 결과(브리프당 최대 3개) |
| `naming_candidates`, `naming_selections`, `naming_requests`, `naming_package_selections` | 후보·선택·요청·패키지 선택 기록 |
| `naming_orders`, `naming_order_items` | 굿즈/주문 및 품목 |
| `naming_reviews`, `review_replies` | 후기와 답글 |
| `user_plans`, `entitlements`, `generations` | 플랜·권한·생성 횟수 기록 |
| `profiles` | 사용자 프로필/관리자 role |
| `user_carts`, `guest_carts`, `user_shortlists`, `shortlist_shares`, `user_emails` | 장바구니·보관함·공유·이메일 |

코드는 참조하지만 **DB에는 없는 테이블**: `naming_free_usage`(없으면 "무료 가능" 처리), `naming_ars`, `naming_gift_cards`, `gifts`, `naming_packages`, `properties`, `property_photos`. 이 테이블을 쓰는 기능(A/S, 선물카드, 선물, 패키지, 부동산)은 실제로는 동작하지 않거나 오류 처리로 넘어갑니다.

---

## 5. 수정 시 주의

- **9개 언어 문구 위치**: 언어 목록은 `lib/lang-config.ts`(ko/en/ja/zh/es/ru/fr/ar/hi). 문구는 대부분 **각 파일 안의 `COPY`/`*_COPY` 객체**에 들어 있습니다. 홈 `app/page.tsx`, 설계 `design`, 결과 `result`(여러 개), 로그인 `login`, 주문 `order/checkout`, 카드 창 `MultiLangNameCard`, 메일 `lib/name-card-email.ts` 와 `api/auth/magic-link/route.ts`(로그인 메일), 발음 `app/listen`, 선물 열기 `app/present`. 새 문구는 **9개 언어를 함께** 넣으세요(아랍어는 RTL). 옛 `lib/i18n.ts`·`messages/`는 5개 언어뿐입니다.
- **결제 베타 상태**: `lib/pricing.ts` 의 `SERVICE_PRE_LAUNCH = true` 인 동안 가격 표시와 결제 버튼이 UI에서 꺼집니다. 백엔드(Stripe 웹훅 등)는 그대로입니다. 사업자등록 후 `false` 로 바꾸고 Stripe 키·가격 ID를 설정하세요. 상단 "Pre-launch Beta" 배너는 `app/layout.tsx` 에 있습니다.
- **로그인**: 매직링크(`/api/auth/magic-link` → `/auth/confirm` → `/auth/callback`)는 여러 사고를 거쳐 안정화된 흐름입니다. 고칠 때는 실제 메일로 끝까지 시험하세요. Gmail이 같은 제목 메일을 묶으므로 제목 끝에 `#번호`가 붙습니다. Supabase 기본 메일러가 아니라 Resend 로 직접 보냅니다.
- **카드 메일은 1회만 발송**: `naming_briefs.card_sent_at` 으로 원자적 선점. 이름을 바꿔도 재발송되지 않습니다(서버가 막음).
- **개인정보**: `/present`·`/listen` 링크에는 이름 카드의 공개 내용만 담고 이메일 등은 넣지 않습니다. 새 링크에도 개인정보를 넣지 마세요.
- **Upstash Redis**: 주소가 끊겨 있습니다(재시도를 꺼서 지연은 없앰). 새 DB로 바꾸거나 쓰지 않기로 정해야 합니다.
- **언어 루트(`/ko` 등)는 없는 주소**입니다. 사이트 링크는 `/?lang=ko` 형식을 쓰세요.
- 큰 파일(`result`, `design`, `app/page.tsx`, `order`)은 한 파일에 문구·로직·화면이 섞여 있어 수정 영향 범위가 큽니다.

---

## 6. 배포·운영 메모
- 저장소 `qlfhd1-ops/WinK-Naming`, `main` 푸시 시 Vercel 프로덕션 자동 배포. 도메인 `wink-naming.com`(별칭 .co.kr, .shop).
- Vercel Pro 플랜, 지출 알림만 설정(일시 중지 끔). 이미지는 `public/images` 에서 용량을 작게 유지하고 `next.config.ts` 로 캐시.
- 메일은 Resend(발신 `noreply@wink-naming.com`). 이름카드 첨부 이미지는 고객 브라우저에서 만든 JPEG.

---

## 7. 이 저장소의 미추적(작업 중) 항목
git 에 올라가지 않은 로컬 작업물입니다: `.claude/`, `docs/`, `wink-video/`, 부동산 매물 기능(`app/[lang]/property`, `app/admin/property`, `app/api/property`, `components/property`, `lib/property-constants.ts`, `supabase-property-schema.sql`). 부동산 기능은 윙크 네이밍과 별개이며 DB에 `properties`, `property_photos` 테이블이 없습니다. 정리 작업에서는 건드리지 않았습니다.
