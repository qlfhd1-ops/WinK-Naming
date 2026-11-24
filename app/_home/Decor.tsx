"use client";

// ── 단청 문양 SVG 배경 ────────────────────────────────────
export function DanchingBg() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      <defs>
        <pattern id="dp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 3L77 40L40 77L3 40Z" fill="none" stroke="#1B2A5E" strokeWidth="0.7" opacity="0.055"/>
          <path d="M40 18L62 40L40 62L18 40Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.04"/>
          <circle cx="40" cy="3"  r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="77" cy="40" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="40" cy="77" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="3"  cy="40" r="1.5" fill="#1B2A5E" opacity="0.04"/>
          <circle cx="40" cy="40" r="2" fill="#C9A84C" opacity="0.035"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dp)"/>
    </svg>
  );
}

// ── 전통 매듭 구분선 ──────────────────────────────────────
export function KnotDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
      <svg width="260" height="20" viewBox="0 0 260 20" aria-hidden="true">
        <line x1="0" y1="10" x2="108" y2="10" stroke="#E8E8E8" strokeWidth="1"/>
        <path d="M112 10L130 2L148 10L130 18Z" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.55"/>
        <circle cx="130" cy="10" r="2.5" fill="#C9A84C" opacity="0.45"/>
        <line x1="152" y1="10" x2="260" y2="10" stroke="#E8E8E8" strokeWidth="1"/>
      </svg>
    </div>
  );
}
