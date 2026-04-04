"use client";

import { useRouter } from "next/navigation";

export default function ArchivePage() {
  const router = useRouter();

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">Wink Archive</div>

        <h1 className="wink-title">보관함</h1>
        <p className="wink-sub">
          보관함 기능은 현재 안정화 단계입니다. 핵심 설계 흐름을 우선 마무리한 뒤,
          저장된 설계 결과와 선택 내역을 이 화면에서 다시 확인할 수 있도록 확장할 예정입니다.
        </p>

        <section className="wink-panel" style={{ marginTop: 24, marginBottom: 20 }}>
          <div className="wink-section-title" style={{ marginBottom: 10 }}>
            현재 상태 안내
          </div>

          <div className="wink-result-text" style={{ marginBottom: 8 }}>
            지금은 작명 설계의 핵심 흐름인 카테고리 선택, 브리프 입력, 결과 확인,
            패키지 선택 구조를 안정적으로 마무리하는 단계입니다.
          </div>

          <div className="wink-result-text" style={{ marginBottom: 8 }}>
            보관함은 이후 단계에서 고객별 설계 이력, 선택한 패키지, 저장된 이름
            후보, 비교 결과 등을 다시 볼 수 있는 공간으로 확장할 예정입니다.
          </div>

          <div className="wink-result-text">
            현재 빌드 안정성을 위해 이 화면은 안전한 기본 버전으로 정리되어 있습니다.
          </div>
        </section>

        <section className="wink-form-section">
          <div className="wink-section-head">
            <h2 className="wink-section-title">다음으로 이동</h2>
            <p className="wink-section-desc">
              아래 버튼으로 핵심 설계 흐름으로 바로 이동하실 수 있습니다.
            </p>
          </div>

          <div className="wink-actions" style={{ flexWrap: "wrap" }}>
            <button
              type="button"
              className="wink-primary-btn"
              onClick={() => router.push("/ko/category")}
            >
              이름 설계 시작
            </button>

            <button
              type="button"
              className="wink-secondary-btn"
              onClick={() => router.push("/ko/result")}
            >
              최근 결과 확인
            </button>

            <button
              type="button"
              className="wink-secondary-btn"
              onClick={() => router.push("/cart")}
            >
              장바구니 보기
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}