"use client";

import { useParams, useRouter } from "next/navigation";
import { isSupportedLang } from "@/lib/lang-config";

export default function TermsPage() {
  const params = useParams();
  const router = useRouter();
  const rawLang = String(params.lang || "ko");
  const lang = isSupportedLang(rawLang) ? rawLang : "ko";

  const COMPANY = "[사업자명]";
  const EMAIL = "[이메일@example.com]";
  const SERVICE = "윙크 네이밍";
  const today = "2026년 1월 1일";

  return (
    <main className="wink-page">
      <div className="wink-container" style={{ maxWidth: 800 }}>
        <div className="wink-chip">Legal</div>
        <h1 className="wink-title" style={{ fontSize: "clamp(24px,4vw,40px)", marginBottom: 8 }}>
          이용약관
        </h1>
        <p className="wink-sub" style={{ marginBottom: 32 }}>
          시행일: {today} · {COMPANY}
        </p>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제1조 (목적)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            이 약관은 {COMPANY}(이하 &ldquo;회사&rdquo;)가 운영하는 {SERVICE}(이하 &ldquo;서비스&rdquo;)의
            이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제2조 (정의)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>&ldquo;서비스&rdquo;</strong>란 회사가 제공하는 AI 기반 이름 설계 서비스 및 관련 부가 서비스 일체를 말합니다.</li>
              <li><strong>&ldquo;이용자&rdquo;</strong>란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li><strong>&ldquo;회원&rdquo;</strong>이란 회사에 개인정보를 제공하고 회원 등록을 한 자를 말합니다.</li>
              <li><strong>&ldquo;브리프&rdquo;</strong>란 이름 설계를 위해 이용자가 입력하는 목적, 분위기 등의 정보를 말합니다.</li>
              <li><strong>&ldquo;패키지&rdquo;</strong>란 이름 설계 결과를 바탕으로 도장, 문패, 선물 카드 등을 제작하는 유료 서비스를 말합니다.</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제3조 (약관의 효력 및 변경)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>이 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 합리적인 사유가 있는 경우 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전에 공지합니다.</li>
              <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제4조 (서비스의 내용)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>AI 기반 이름 설계 및 결과 보고서 제공</li>
              <li>이름 설계 결과를 바탕으로 한 도장·문패·선물 카드 패키지 제작</li>
              <li>이름 선물 카드 SNS 공유 서비스</li>
              <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제5조 (무료 및 유료 서비스)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>회원 로그인 시 매월 1회 이름 설계 결과 확인은 무료입니다.</li>
              <li>추가 이름 설계 및 패키지(도장, 문패, 선물 카드 등)는 유료이며, 이용 전 가격을 명시합니다.</li>
              <li>유료 서비스 결제 후 이름 설계 결과가 마음에 들지 않는 경우, 결제일로부터 30일 이내에 1회 무료 재설계를 신청할 수 있습니다.</li>
              <li>패키지(도장, 문패) 제작이 시작된 이후에는 환불이 불가합니다. 제작 시작 전 환불 요청은 {EMAIL}로 문의하십시오.</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제6조 (이용자의 의무)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            이용자는 다음 행위를 해서는 안 됩니다.
            <ul style={{ marginTop: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>허위 정보 입력 또는 타인의 정보를 도용하는 행위</li>
              <li>서비스를 통해 생성된 이름 결과를 상업적으로 무단 재배포하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>회사의 지식재산권을 침해하는 행위</li>
              <li>기타 관련 법령 및 이 약관을 위반하는 행위</li>
            </ul>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제7조 (지식재산권)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>서비스 내 UI, 디자인, 텍스트, 로고 등의 저작권은 회사에 귀속됩니다.</li>
              <li>이용자가 서비스를 통해 설계 받은 이름 결과물에 대한 사용 권리는 이용자에게 있습니다.</li>
              <li>단, 회사는 서비스 개선 목적으로 익명화된 브리프 데이터를 활용할 수 있습니다.</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제8조 (면책 조항)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>회사는 AI가 생성한 이름의 법적 등록 가능 여부, 상표권 충돌 여부에 대해 보증하지 않습니다. 최종 상표·도메인·법적 검토는 이용자의 책임입니다.</li>
              <li>천재지변, 서비스 장애 등 불가항력으로 인한 서비스 중단에 대해 회사는 책임을 지지 않습니다.</li>
              <li>이용자가 입력한 브리프 내용의 정확성에 대한 책임은 이용자에게 있습니다.</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>제9조 (분쟁 해결)</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>서비스 이용과 관련한 분쟁은 먼저 {EMAIL}를 통해 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않을 경우, 회사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</li>
              <li>이 약관은 대한민국 법률에 따라 해석됩니다.</li>
            </ol>
          </div>
        </section>

        <section className="wink-panel" style={{ marginBottom: 32 }}>
          <h2 className="wink-section-title" style={{ marginBottom: 12 }}>부칙</h2>
          <div className="wink-result-text" style={{ lineHeight: 2 }}>
            이 약관은 {today}부터 시행합니다.
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
            onClick={() => router.push(`/${lang}/privacy`)}
          >
            개인정보처리방침 보기
          </button>
        </div>
      </div>
    </main>
  );
}
