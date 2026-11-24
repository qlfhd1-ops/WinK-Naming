# 정리 작업 보고 (2026-11-24, 브랜치 `cleanup/2026-11`)

목표: 기능은 그대로 두고 쓰이지 않는 파일을 정리하고, 프로젝트 지도(`docs/ARCHITECTURE.md`)를 만든다.
각 묶음마다 `npm run build` 통과를 확인한 뒤 커밋했다. 이 브랜치는 **아직 push·병합·배포하지 않았다.**

## 1. 삭제한 파일 (호출처 없음을 검색으로 확인)
| 묶음 | 파일 |
|---|---|
| 컴포넌트 6개 | `components/AddToCartButton`, `NameGiftCard`, `PremiumExpansionOptions`, `ReturningWelcome`, `SocialProof`, `YoonseulNameBirth` |
| lib·번역 | `lib/brand.ts`, `brandValidation.ts`, `fetcher.ts`, `i18n.ts`, `messages/{ko,en,ja,zh,es}.ts` |
| 오타 파일·중복 음원 | `app/checkout/pape.tsx`, `app/orders/paga.tsx`(라우트로 동작하지 않던 옛 사본), 중복 mp3 3개 |
| 옛 API | `api/brand-validate`, `api/global-naming`, `api/generate` |
| 옛 화면·라우트 | `app/api/admin/page.tsx`(옛 주문 화면), `app/archive`, `api/auth/naver`(+callback) |
| 홈의 죽은 코드 | `/api/guest-email` 호출(API도 없고 값을 저장하는 곳도 없었음), 표시된 적 없는 재방문 배너 `ReturnBanner` |

합계: 약 6,000줄 삭제(분리로 늘어난 줄 포함 순감소 약 3,500줄).

## 2. 수정한 파일
- **`app/page.tsx` 분리** (2,775줄 → 약 420줄): 문구·데이터·섹션 컴포넌트를 `app/_home/`로 이동. 분리 전후 렌더 결과(DOM)를 9개 언어로 비교해 동일함을 확인.
- **"로그인 없이 무료" 문구 정정**: 홈(`emailStart` 9개 언어), 로그인 화면(`guide1` 9개 언어), 개인정보 처리방침 제8조. 실제 동작(이메일 로그인 필요)과 일치시킴.
- **로그인 개선**
  - `api/auth/magic-link`: 메일에 6자리 인증번호 추가(9개 언어 안내문), 응답에 `codeSent` 포함. 기존 링크 방식은 그대로.
  - `app/[lang]/login`: 메일 발송 후 인증번호 입력칸 표시(`verifyOtp`, 게스트 데이터 병합 포함), 이메일 사용 목적 한 줄 안내(9개 언어).
- **문서**: `docs/ARCHITECTURE.md`를 최종 구조로 갱신, 본 문서 추가.

## 3. 아직 확인하지 못한 것 (사람이 해 봐야 함)
- **인증번호 로그인 실제 끝까지 시험**: 화면 동작(입력칸 표시, 틀린 번호 오류 문구)은 확인했지만, 실제 메일을 받아 번호로 로그인하는 것은 메일 발송이 필요해 시험하지 않았다. 배포 후 본인 메일로 (1) 링크 (2) 번호 두 방식을 시험할 것. Supabase 설정에서 이메일 OTP 길이가 6이 아니면 입력칸 안내 문구("6자리")만 어긋난다(입력은 6~10자리 허용).
- 인스타그램·카카오톡 앱 안에서 실제로 번호 로그인이 되는지 휴대폰 시험.

## 4. 남은 문제 (이번 정리에서 건드리지 않음)
| 항목 | 내용 |
|---|---|
| `api/admin/orders` | 어떤 화면도 호출하지 않음. 관리자 주문 확인을 다시 만들 계획이 없으면 삭제 후보 |
| `qrcode.react` | 코드에서 쓰이지 않는 의존성(`package.json` 그대로 둠) |
| `NAVER_*` 환경변수 | 사용처 삭제됨. Vercel에 남아 있다면 삭제 가능 |
| `naming_free_usage` 테이블 없음 | 월 무료 횟수(`FREE_MONTHLY_QUOTA=3`)가 실제로는 제한되지 않음. 테이블을 만들지, 제한을 포기할지 결정 필요 |
| DB에 없는 테이블 참조 | `naming_ars`, `naming_gift_cards`, `gifts`, `naming_packages`, `properties`, `property_photos` — 해당 기능(A/S·선물카드·선물·패키지·부동산)은 실제로 동작하지 않음 |
| Upstash Redis | 주소가 끊김(재시도를 꺼서 지연은 없앰, 인메모리 제한으로 동작 — 서버 인스턴스별이라 제한이 느슨함). 교체 또는 폐기 결정 필요 |
| 카카오 SDK | CSP `script-src`에 `kakaocdn.net`이 없어 카카오 공유 SDK가 막힐 수 있음 |
| 큰 파일 | `result`(약 3,970줄), `design`(약 3,000줄), `order`는 아직 분리하지 않음 |
| 부동산 기능 | git 미추적 로컬 작업물(별개 기능). 정리에서 제외 |
| Google 로그인 | 코드에 없음. 원하면 OAuth 앱 생성·Supabase 설정이 필요한 별도 기능 |

## 5. 병합 전 체크
1. `cleanup/2026-11`을 push하고 Vercel 미리보기에서 홈(9개 언어)·로그인(링크와 번호)·결과 페이지를 확인.
2. 이상 없으면 `main`에 병합 → 프로덕션 자동 배포.
