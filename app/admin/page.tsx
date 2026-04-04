"use client";

import { useEffect, useRef, useState } from "react";

// ─── 타입 ──────────────────────────────────────────────────────
type DayCount    = { date: string; count: number };
type CatCount    = { category: string; count: number };
type NameCount   = { name: string; count: number };
type OrderRow    = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};
type DashStats = {
  totalGenerations: number;
  todayGenerations: number;
  weekAvg: number;
  paidUsers: number;
  weeklyGenerations: DayCount[];
  popularCategories: CatCount[];
  popularFamilyNames: NameCount[];
  recentOrders: OrderRow[];
};

const CATEGORY_LABEL: Record<string, string> = {
  child:   "아이 이름",
  brand:   "브랜드명",
  pet:     "반려동물",
  stage:   "활동명·예명",
  self:    "본인 개명",
  me:      "본인 개명",
  baby:    "아이 이름",
  activity:"활동명·예명",
  global:  "글로벌",
  korean_to_foreign: "한→외",
  foreign_to_korean: "외→한",
};

const STATUS_KO: Record<string, string> = {
  pending:   "접수",
  reviewing: "검토중",
  designing: "설계중",
  packaging: "패키지 준비",
  completed: "완료",
  cancelled: "취소",
};

const STATUS_OPTIONS = Object.entries(STATUS_KO).map(([v, l]) => ({ value: v, label: l }));

const STORAGE_KEY = "wink.admin.pw";

// ─── 메인 ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [pw,        setPw]       = useState("");
  const [authed,    setAuthed]   = useState(false);
  const [authErr,   setAuthErr]  = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [stats,     setStats]    = useState<DashStats | null>(null);
  const [statsErr,  setStatsErr] = useState("");
  const [loading,   setLoading]  = useState(false);
  const savedPw = useRef("");

  // 세션스토리지에서 복원
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) { savedPw.current = stored; setAuthed(true); }
    } catch { /* ignore */ }
  }, []);

  // 인증 완료되면 stats 로드
  useEffect(() => {
    if (authed) loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr("");
    try {
      const res  = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setAuthErr(json.error ?? "인증 실패"); return; }
      savedPw.current = pw;
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    } catch { setAuthErr("서버 연결 실패"); }
    finally { setAuthLoading(false); }
  };

  const loadStats = async () => {
    setLoading(true);
    setStatsErr("");
    try {
      const res  = await fetch("/api/admin/stats", {
        headers: { "x-admin-password": savedPw.current },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setStatsErr(json.error ?? "통계 조회 실패"); return; }
      setStats(json.stats);
    } catch { setStatsErr("서버 연결 실패"); }
    finally { setLoading(false); }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setStats(null);
    setPw("");
    savedPw.current = "";
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error("상태 변경 실패");
      setStats((prev) => prev ? {
        ...prev,
        recentOrders: prev.recentOrders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : "실패");
    }
  };

  // ─── 비밀번호 게이트 ──────────────────────────────────────
  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#070f24", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%", maxWidth: 380,
            background: "linear-gradient(180deg, #101d3a 0%, #0b1428 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 24, padding: "40px 32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase", marginBottom: 18 }}>
            WINK ADMIN
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fbff", marginBottom: 6, lineHeight: 1.2 }}>관리자 대시보드</h1>
          <p style={{ fontSize: 13, color: "rgba(200,218,248,0.55)", marginBottom: 28 }}>
            비밀번호를 입력하세요
          </p>

          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "12px 16px", borderRadius: 12,
              border: `1px solid ${authErr ? "rgba(255,100,100,0.5)" : "rgba(200,218,248,0.18)"}`,
              background: "rgba(255,255,255,0.04)",
              color: "#f8fbff", fontSize: 15, outline: "none",
              marginBottom: 10,
            }}
          />
          {authErr && <p style={{ fontSize: 12, color: "rgba(255,120,120,0.9)", marginBottom: 12 }}>{authErr}</p>}

          <button
            type="submit"
            disabled={authLoading || pw.length === 0}
            style={{
              width: "100%", padding: "14px",
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, rgba(201,168,76,0.9), rgba(180,140,50,0.85))",
              color: "#0a1020", fontWeight: 800, fontSize: 15, cursor: "pointer",
              opacity: (authLoading || pw.length === 0) ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {authLoading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </main>
    );
  }

  // ─── 대시보드 ─────────────────────────────────────────────
  const weekMax = Math.max(...(stats?.weeklyGenerations.map((d) => d.count) ?? [1]), 1);

  return (
    <main style={{ minHeight: "100vh", background: "#060d22", padding: "0 0 60px" }}>
      {/* 헤더 */}
      <header style={{ background: "rgba(10,18,36,0.97)", borderBottom: "1px solid rgba(201,168,76,0.18)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase" }}>WINK ADMIN</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fbff", marginTop: 2 }}>관리자 대시보드</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={loadStats} disabled={loading}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(200,218,248,0.18)", background: "transparent", color: "rgba(200,218,248,0.7)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {loading ? "새로고침 중..." : "↻ 새로고침"}
          </button>
          <button type="button" onClick={handleSignOut}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,100,100,0.3)", background: "transparent", color: "rgba(255,120,120,0.8)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px" }}>
        {statsErr && (
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "rgba(255,130,130,0.9)", marginBottom: 20, fontSize: 14 }}>
            {statsErr}
          </div>
        )}

        {loading && !stats && (
          <div style={{ color: "rgba(200,218,248,0.55)", fontSize: 14, textAlign: "center", padding: 40 }}>통계를 불러오는 중...</div>
        )}

        {stats && (
          <>
            {/* ── 핵심 지표 ──────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "총 이름 생성 수", value: stats.totalGenerations.toLocaleString(), icon: "✦", accent: "rgba(201,168,76,0.9)" },
                { label: "오늘 생성 수", value: stats.todayGenerations.toLocaleString(), icon: "📅", accent: "rgba(100,180,255,0.85)" },
                { label: "주간 일평균", value: stats.weekAvg.toLocaleString(), icon: "📊", accent: "rgba(130,200,140,0.85)" },
                { label: "유료 사용자", value: stats.paidUsers.toLocaleString(), icon: "💎", accent: "rgba(180,120,255,0.85)" },
              ].map((card) => (
                <div key={card.label} style={{ borderRadius: 18, padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: card.accent, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(200,218,248,0.55)", marginTop: 5, fontWeight: 500 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── 주간 트렌드 ────────────────────────────── */}
            <section style={{ borderRadius: 20, padding: "22px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase", marginBottom: 18 }}>
                최근 7일 생성 추이
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                {stats.weeklyGenerations.map((d) => {
                  const heightPct = weekMax > 0 ? (d.count / weekMax) * 100 : 0;
                  const isToday   = d.date === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ fontSize: 10, color: "rgba(200,218,248,0.5)", fontWeight: 600, minHeight: 14 }}>
                        {d.count > 0 ? d.count : ""}
                      </div>
                      <div style={{ width: "100%", position: "relative" }}>
                        <div
                          style={{
                            height: Math.max(heightPct, 4),
                            width: "100%",
                            borderRadius: "4px 4px 0 0",
                            background: isToday
                              ? "linear-gradient(180deg, rgba(201,168,76,0.9), rgba(201,168,76,0.5))"
                              : "linear-gradient(180deg, rgba(100,160,255,0.7), rgba(100,160,255,0.3))",
                            transition: "height 0.4s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: isToday ? "rgba(201,168,76,0.9)" : "rgba(200,218,248,0.4)", fontWeight: isToday ? 700 : 500 }}>
                        {d.date.slice(5)} {/* MM-DD */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── 카테고리 + 성씨 ────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

              {/* 인기 카테고리 */}
              <section style={{ borderRadius: 20, padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase", marginBottom: 14 }}>
                  인기 카테고리
                </div>
                {stats.popularCategories.length === 0 && (
                  <div style={{ fontSize: 13, color: "rgba(200,218,248,0.4)" }}>데이터 없음</div>
                )}
                {stats.popularCategories.map((item, idx) => {
                  const catMax = stats.popularCategories[0]?.count || 1;
                  return (
                    <div key={item.category} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "rgba(200,218,248,0.82)", fontWeight: 600 }}>
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(200,218,248,0.5)", fontVariantNumeric: "tabular-nums" }}>
                          {item.count}
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${(item.count / catMax) * 100}%`,
                          borderRadius: 99,
                          background: idx === 0
                            ? "linear-gradient(90deg, rgba(201,168,76,0.9), rgba(201,168,76,0.5))"
                            : "linear-gradient(90deg, rgba(100,160,255,0.7), rgba(100,160,255,0.3))",
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* 인기 성씨 */}
              <section style={{ borderRadius: 20, padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase", marginBottom: 14 }}>
                  인기 성씨 TOP 10
                </div>
                {stats.popularFamilyNames.length === 0 && (
                  <div style={{ fontSize: 13, color: "rgba(200,218,248,0.4)" }}>데이터 없음</div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {stats.popularFamilyNames.map((item, idx) => (
                    <div key={item.name}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 999,
                        background: idx < 3 ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${idx < 3 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: idx < 3 ? "rgba(201,168,76,0.95)" : "rgba(200,218,248,0.82)" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(200,218,248,0.45)", fontVariantNumeric: "tabular-nums" }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── 최근 주문 ──────────────────────────────── */}
            <section style={{ borderRadius: 20, padding: "22px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase" }}>
                  최근 주문
                </div>
                <a href="/api/admin" style={{ fontSize: 11, color: "rgba(200,218,248,0.5)", textDecoration: "none" }}>
                  전체 보기 →
                </a>
              </div>

              {stats.recentOrders.length === 0 && (
                <div style={{ fontSize: 13, color: "rgba(200,218,248,0.4)", textAlign: "center", padding: 20 }}>주문 없음</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.recentOrders.map((order) => (
                  <div key={order.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}
                  >
                    <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f5ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.customer_name}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(200,218,248,0.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.customer_email}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(201,168,76,0.9)", whiteSpace: "nowrap" }}>
                      {order.currency} {order.total_amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(200,218,248,0.45)", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString("ko-KR")}
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{
                        padding: "5px 10px", borderRadius: 8,
                        border: "1px solid rgba(200,218,248,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(200,218,248,0.82)",
                        fontSize: 12, cursor: "pointer", outline: "none",
                      }}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
