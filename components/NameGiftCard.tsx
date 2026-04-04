"use client";

import { forwardRef } from "react";

type Props = {
  name: string;
  hanja?: string;
  hanjaMeaning?: string;
  english?: string;
  chinese?: string;
  chinesePinyin?: string;
  japaneseKana?: string;
  japaneseReading?: string;
  meaning: string;
  categoryLabel?: string;
  giftMessage?: string;
  senderName?: string;
  recipientName?: string;
  lang?: "ko" | "en" | "ja" | "zh" | "es";
  isFree?: boolean;
};

const Diamond = ({ style }: { style: React.CSSProperties }) => (
  <span
    aria-hidden
    style={{
      position: "absolute",
      color: "rgba(240,208,128,0.55)",
      fontSize: 12,
      lineHeight: 1,
      ...style,
    }}
  >
    ◆
  </span>
);

const NameGiftCard = forwardRef<HTMLDivElement, Props>(function NameGiftCard(props, ref) {
  const {
    name, hanja, hanjaMeaning,
    english, chinese, chinesePinyin, japaneseKana, japaneseReading,
    meaning, giftMessage, senderName, recipientName,
    lang = "ko", isFree = false,
  } = props;

  const pronounceRows = [
    { label: "EN", value: english, sub: null },
    { label: "中文", value: chinese, sub: chinesePinyin },
    { label: "日本語", value: japaneseKana, sub: japaneseReading },
  ];

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 560,
        borderRadius: 24,
        background: "linear-gradient(160deg, #1B2A5E 0%, #0D1A3E 55%, #080F28 100%)",
        border: "1px solid rgba(240,208,128,0.22)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "28px 32px 24px",
        boxSizing: "border-box",
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      {/* Subtle radial glow top-right */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -60, right: -40,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,208,128,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* 4-corner diamonds */}
      <Diamond style={{ top: 16, left: 16 }} />
      <Diamond style={{ top: 16, right: 16 }} />
      <Diamond style={{ bottom: 16, left: 16 }} />
      <Diamond style={{ bottom: 16, right: 16 }} />

      {/* Brand header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontSize: 10, letterSpacing: "0.22em", color: "rgba(240,208,128,0.60)",
          textTransform: "uppercase", fontWeight: 600,
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        }}>
          Wink Naming · Gift Card
        </div>
        {(recipientName || senderName) && (
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(210,224,248,0.55)" }}>
            {recipientName && <span>To. {recipientName}</span>}
            {recipientName && senderName && <span style={{ margin: "0 6px" }}>·</span>}
            {senderName && <span>From. {senderName}</span>}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 64, fontWeight: 900, lineHeight: 1.05,
        color: "#F0D080",
        letterSpacing: "0.06em",
        textShadow: "0 0 32px rgba(240,208,128,0.25)",
        fontFamily: "'Noto Serif KR', serif",
        marginBottom: 6,
      }}>
        {name}
      </div>

      {/* Hanja */}
      {hanja && (
        <div style={{
          fontSize: 20, color: "rgba(240,208,128,0.75)",
          letterSpacing: "0.14em", marginBottom: 10,
        }}>
          {hanja}
        </div>
      )}

      {/* Hanja meaning */}
      {hanjaMeaning && (
        <div style={{
          fontSize: 12, color: "rgba(200,216,248,0.65)",
          letterSpacing: "0.02em", marginBottom: 14,
          lineHeight: 1.5,
        }}>
          {hanjaMeaning}
        </div>
      )}

      {/* Divider */}
      <div style={{
        textAlign: "center", color: "rgba(240,208,128,0.45)",
        fontSize: 12, letterSpacing: "0.12em",
        margin: "2px 0 14px",
        fontFamily: "serif",
      }}>
        ─── ✦ ───
      </div>

      {/* Meaning */}
      <div style={{ flex: 1, marginBottom: 14 }}>
        <div style={{
          fontSize: 14, fontStyle: "italic",
          color: "rgba(215,228,252,0.88)",
          lineHeight: 1.75,
          wordBreak: "keep-all",
        }}>
          {meaning}
        </div>
      </div>

      {/* Gift message */}
      {giftMessage && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(240,208,128,0.12)",
          fontSize: 12, color: "rgba(210,224,248,0.80)", lineHeight: 1.7,
        }}>
          {giftMessage}
        </div>
      )}

      {/* Gold divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(240,208,128,0.30), transparent)", marginBottom: 12 }} />

      {/* 3-language pronunciation row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 }}>
        {pronounceRows.map(({ label, value, sub }) => (
          <div
            key={label}
            style={{
              padding: "7px 8px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(240,208,128,0.60)", fontWeight: 700, marginBottom: 2, letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ fontSize: 13, color: "#eef3ff", fontWeight: 600 }}>{value || "—"}</div>
            {sub && <div style={{ fontSize: 9, color: "rgba(180,200,238,0.50)", marginTop: 1 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Footer brand */}
      <div style={{ textAlign: "right", marginTop: 6 }}>
        <span style={{
          fontSize: 9, letterSpacing: "0.18em",
          color: "rgba(240,208,128,0.35)",
          textTransform: "uppercase",
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        }}>
          wink-naming.vercel.app
        </span>
      </div>

      {/* Free user blur overlay */}
      {isFree && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24,
          backdropFilter: "blur(12px)",
          background: "rgba(8,15,40,0.55)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12,
        }}>
          <div style={{ fontSize: 36 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F0D080", textAlign: "center", lineHeight: 1.5 }}>
            {lang === "ko" ? "유료 서비스입니다" : "Premium Feature"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(210,224,248,0.70)", textAlign: "center", lineHeight: 1.6 }}>
            {lang === "ko" ? "이름 생성 후 결제하시면\n선물 카드를 다운로드할 수 있습니다." : "Purchase to download your gift card."}
          </div>
        </div>
      )}
    </div>
  );
});

export default NameGiftCard;
