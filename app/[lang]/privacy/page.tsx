"use client";

import { useParams, useRouter } from "next/navigation";
import { isSupportedLang } from "@/lib/lang-config";

export default function PrivacyPage() {
  const params = useParams();
  const router = useRouter();
  const rawLang = String(params.lang || "ko");
  const lang = isSupportedLang(rawLang) ? rawLang : "ko";

  const COMPANY = "[사업자명]";
  const EMAIL = "[이메일@example.com]";
  const today = "2026년 1월 1일";

  return (
    <main className="wink-page">
      <div className="wink-container" style={{ maxWidth: 800 }}>
        <div className="wink-chip">Legal</div>
        <h1 className="wink-title" style={{ fontSize: "clamp(24px,4vw,40px)", marginBottom: 8 }}>
          개인정보처리방침
        </h1>
        <p className="wink-sub" style={{ marginBottom: 32 }}>
          시행일: {today} · {COMPANY}
        </p>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제1조 (개인정보의 처리 목적)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            {COMPANY}(이하 &ldquo;회사&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 시에는
            사전 동의를 구할 예정입니다.
            <ul style={{ marginTop: 12, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>이름 설계 서비스 제공 및 결과 보고서 생성</li>
              <li>회원 가입 및 관리, 본인 확인</li>
              <li>결제 처리 및 환불 처리</li>
              <li>고객 문의 및 불만 처리</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제2조 (처리하는 개인정보의 항목)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <strong>필수 항목</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>이메일 주소 (소셜 로그인 시 제공되는 정보)</li>
              <li>이름 설계 입력 정보 (성씨, 목적, 분위기 등 브리프 내용)</li>
            </ul>
            <strong style={{ display: "block", marginTop: 14 }}>선택 항목</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>생년월일 (아이 이름 설계 시)</li>
              <li>결제 정보 (결제 시, 카드번호는 PG사에서 직접 처리)</li>
            </ul>
            <strong style={{ display: "block", marginTop: 14 }}>자동 수집 항목</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>접속 IP, 쿠키, 서비스 이용 기록, 기기 정보</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제3조 (개인정보의 처리 및 보유 기간)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>회원 정보:</strong> 회원 탈퇴 시까지. 단, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 보관</li>
              <li><strong>이름 설계 브리프 및 결과:</strong> 서비스 제공일로부터 3년 (이용자 요청 시 즉시 삭제)</li>
              <li><strong>결제 기록:</strong> 전자상거래법에 따라 5년</li>
              <li><strong>소비자 불만 및 분쟁 처리:</strong> 전자상거래법에 따라 3년</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제4조 (개인정보의 제3자 제공)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            회사는 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며,
            이용자의 동의 없이 외부에 제공하지 않습니다. 단, 다음의 경우는 예외입니다.
            <ul style={{ marginTop: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>법령에 의거하거나 수사기관의 요청이 있는 경우</li>
              <li>결제 처리를 위한 PG사 (카드 번호 등 결제 정보에 한함)</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제5조 (개인정보처리의 위탁)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            회사는 서비스 향상을 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
            <ul style={{ marginTop: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Supabase Inc.</strong> — 데이터베이스 및 인증 서비스 (미국)</li>
              <li><strong>OpenAI, Inc.</strong> — AI 이름 설계 처리 (미국, 입력 브리프 전달)</li>
              <li><strong>Vercel Inc.</strong> — 서비스 호스팅 (미국)</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            <ul style={{ marginTop: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>개인정보 열람 요청</li>
              <li>오류 등이 있을 경우 정정 요청</li>
              <li>삭제 요청</li>
              <li>처리 정지 요청</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있으며,
              지체 없이 조치하겠습니다.
            </p>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제7조 (쿠키의 사용)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            회사는 이용자에게 개인화된 서비스를 제공하기 위하여 쿠키(cookie)를 사용합니다.
            쿠키는 브라우저 설정에서 언제든지 거부하거나 삭제할 수 있습니다.
            단, 쿠키 거부 시 일부 서비스 이용이 제한될 수 있습니다.
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제8조 (개인정보의 안전성 확보 조치)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>개인정보 암호화 저장 및 전송 시 SSL/TLS 암호화</li>
              <li>접근 권한 최소화 및 관리</li>
              <li>보안 취약점 점검 및 업데이트</li>
              <li>개인정보 취급자 교육</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제9조 (개인정보 보호책임자)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <p>회사는 개인정보 처리에 관한 업무를 총괄하여 책임지는 개인정보 보호책임자를 지정하고 있습니다.</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>책임자:</strong> {COMPANY} 대표</li>
              <li><strong>이메일:</strong> {EMAIL}</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              개인정보 침해에 관한 신고나 상담은 아래 기관에 문의하실 수 있습니다.
            </p>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>개인정보 침해 신고센터: privacy.kisa.or.kr / 국번 없이 118</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 32 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제10조 (개인정보처리방침의 변경)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            이 개인정보처리방침은 {today}부터 적용됩니다.
            변경 시 서비스 내 공지사항을 통해 사전 안내합니다.
          </div>
        </section>

        <div className="wink-actions">
          <button
            type="button"
            className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}`)}
          >
            홈으로
          </button>
          <button
            type="button"
            className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}/terms`)}
          >
            이용약관 보기
          </button>
        </div>
      </div>
    </main>
  );
}
