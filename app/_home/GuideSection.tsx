"use client";

import { GUIDE_BY_LANG } from "./guide-copy";
import { type Lang } from "./lang";

// ── 3단계 가이드 섹션 ─────────────────────────────────────
export function GuideSection({ lang, onStart }: { lang: Lang; onStart: () => void }) {
  const guide = GUIDE_BY_LANG[lang] ?? GUIDE_BY_LANG.ko;
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  return (
    <section className="lg-section" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
          {guide.badge}
        </div>
        <h2 style={{ margin: 0, fontSize: "clamp(22px,2.6vw,32px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {guide.title}
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 32 }}>
        {guide.steps.map((step, i) => (
          <div key={step.title} style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", borderRadius: 16, padding: "28px 22px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 800, letterSpacing: "0.08em", marginBottom: 8 }}>STEP {i + 1}</div>
            <div style={{ fontSize: 34, marginBottom: 12 }}>{step.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1B2A5E", marginBottom: 8, fontFamily: serif }}>{step.title}</div>
            <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.7 }}>{step.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={onStart} className="lg-cta-btn">
          {guide.cta}
        </button>
      </div>
    </section>
  );
}
