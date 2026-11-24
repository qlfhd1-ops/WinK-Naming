"use client";

import { type Lang } from "./lang";
import { MARQUEE_BY_LANG } from "./marquee-copy";

// ── 마퀴 자막 (56px 네이비) ──────────────────────────────
export function MarqueeBand({ lang }: { lang: Lang }) {
  const segments = MARQUEE_BY_LANG[lang] ?? MARQUEE_BY_LANG.ko;
  return (
    <div style={{ overflow: "hidden", background: "#1B2A5E", height: 56, display: "flex", alignItems: "center" }}>
      <div className="marquee-track" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.05em", padding: "0 48px", flexShrink: 0 }}>
            {segments.map((seg, j) => (
              <span key={j} style={{ color: seg.color }}>{seg.text}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
