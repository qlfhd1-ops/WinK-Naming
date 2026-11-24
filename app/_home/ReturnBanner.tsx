"use client";

import { useRouter } from "next/navigation";
import { type CatId, SUGGEST_CAT } from "./categories";

// ── 재방문 배너 ───────────────────────────────────────────
export type ReturnInfo = { visitCount: number; lastNameKr: string | null; lastCategory: string | null };

export function ReturnBanner({
  info, onClose, onCatSelect, router,
}: {
  info: ReturnInfo;
  onClose: () => void;
  onCatSelect: (id: CatId) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { visitCount, lastNameKr, lastCategory } = info;
  const suggest = lastCategory ? SUGGEST_CAT[lastCategory] : null;

  const base: React.CSSProperties = {
    padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
    borderBottom: "1px solid #E8E8E8", animation: "lgSlideDown 0.3s ease",
  };
  const closeBtn: React.CSSProperties = { flexShrink: 0, background: "none", border: "none", color: "#BBB", cursor: "pointer", fontSize: 20, lineHeight: 1 };
  const serif = "var(--font-noto-serif-kr,'Noto Serif KR',serif)";

  if (visitCount >= 5) {
    return (
      <div style={{ ...base, background: "rgba(201,168,76,0.07)", borderBottom: "1px solid rgba(201,168,76,0.18)" }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🎁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3, fontFamily: serif }}>단골 고객님께 특별 혜택을 드립니다</div>
          <div style={{ fontSize: 13, color: "#555" }}>{visitCount}번 찾아주셨군요! 도장·굿즈 주문 시 <strong style={{ color: "#C4845A" }}>10% 할인</strong>을 드립니다.{lastNameKr && ` '${lastNameKr}'을 도장에 새겨보는 건 어떨까요?`}</div>
        </div>
        <button onClick={() => router.push("/ko/order")} style={{ flexShrink: 0, background: "#1B2A5E", color: "#C9A84C", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>굿즈 보기 →</button>
        <button onClick={onClose} style={closeBtn}>×</button>
      </div>
    );
  }
  if (visitCount >= 3 && lastNameKr) {
    return (
      <div style={{ ...base, background: "rgba(27,42,94,0.04)" }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>✨</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3 }}>지난번에 만드신 &lsquo;{lastNameKr}&rsquo; 기억하시나요?</div>
          <div style={{ fontSize: 13, color: "#555" }}>{suggest ? suggest.label : "다른 이름도 설계해 보세요!"}</div>
        </div>
        {suggest && (
          <button onClick={() => { onCatSelect(suggest.id); onClose(); }} style={{ flexShrink: 0, background: "rgba(201,168,76,0.1)", color: "#1B2A5E", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>바로 시작 →</button>
        )}
        <button onClick={onClose} style={closeBtn}>×</button>
      </div>
    );
  }
  return (
    <div style={{ ...base, background: "rgba(106,174,143,0.06)", borderBottom: "1px solid rgba(106,174,143,0.15)" }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>😊</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A5E", marginBottom: 3 }}>다시 방문해 주셨군요! 반갑습니다</div>
        <div style={{ fontSize: 13, color: "#555" }}>{lastNameKr ? `지난번에 '${lastNameKr}'을 설계하셨죠. 이번엔 어떤 이름을 만들어 볼까요?` : "이번엔 어떤 이름을 설계해 볼까요?"}</div>
      </div>
      <button onClick={onClose} style={closeBtn}>×</button>
    </div>
  );
}
