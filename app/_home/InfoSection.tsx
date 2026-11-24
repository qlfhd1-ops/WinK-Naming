"use client";

import { useState } from "react";
import { type HomeCopy } from "./home-copy";
import { INFO_CARDS_BY_LANG, INFO_TABS_BY_LANG, type InfoTabId } from "./info-copy";
import { type Lang } from "./lang";

export function InfoSection({ copy, lang }: { copy: HomeCopy; lang: Lang }) {
  const [activeTab, setActiveTab] = useState<InfoTabId>("rank");
  const tabs = INFO_TABS_BY_LANG[lang] ?? INFO_TABS_BY_LANG.ko;
  const cards = (INFO_CARDS_BY_LANG[lang] ?? INFO_CARDS_BY_LANG.ko)[activeTab];
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  return (
    <section className="lg-info-section">
      <div className="lg-section">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            REFERENCE · 참고 자료
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 900, color: "#111111", fontFamily: serif, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {copy.infoTitle}
            <span style={{ fontSize: "0.42em", color: "#AAA", marginLeft: 10, fontWeight: 600, verticalAlign: "middle" }}>{copy.infoHanja}</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`lg-info-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id as InfoTabId)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="lg-info-grid">
          {cards.map(c => (
            <div key={c.title} className="lg-info-card">
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1B2A5E", marginBottom: 12, fontFamily: serif, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: "#555555", lineHeight: 1.85, marginBottom: 16 }}>{c.body}</div>
              {c.highlight && (
                <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "4px 12px" }}>
                  {c.highlight}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
