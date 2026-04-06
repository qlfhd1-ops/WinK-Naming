"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

// ─── 타입 ──────────────────────────────────────────────────
type DayCount     = { date: string; count: number };
type CatCount     = { category: string; count: number };
type NameCount    = { name: string; count: number };
type MonthRevenue = { month: string; revenue: number };
type OrderRow     = {
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
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  weeklyGenerations: DayCount[];
  popularCategories: CatCount[];
  popularFamilyNames: NameCount[];
  recentOrders: OrderRow[];
  monthlyRevenue: MonthRevenue[];
};

const CATEGORY_LABEL: Record<string, string> = {
  child: "아이 이름", brand: "브랜드명", pet: "반려동물",
  stage: "활동명·예명", self: "본인 개명", me: "본인 개명",
  baby: "아이 이름", activity: "활동명·예명", global: "글로벌",
  korean_to_foreign: "한→외", foreign_to_korean: "외→한",
};

const STATUS_KO: Record<string, string> = {
  pending: "접수", reviewing: "검토중", designing: "설계중",
  packaging: "패키지 준비", completed: "완료", cancelled: "취소",
};
const STATUS_OPTIONS = Object.entries(STATUS_KO).map(([v, l]) => ({ value: v, label: l }));

const STATUS_COLOR: Record<string, string> = {
  pending:   "rgba(201,168,76,0.85)",
  reviewing: "rgba(100,160,255,0.85)",
  designing: "rgba(100,200,160,0.85)",
  packaging: "rgba(180,120,255,0.85)",
  completed: "rgba(100,210,120,0.85)",
  cancelled: "rgba(255,100,100,0.75)",
};

function fmt(n: number) { return n.toLocaleString("ko-KR"); }
function fmtKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${Math.floor(n / 10_000)}만`;
  return fmt(n);
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function shortMonth(m: string) {
  // "2025-04" → "4월"
  const [, mo] = m.split("-");
  return `${parseInt(mo, 10)}월`;
}

// ─── 공통 섹션 컨테이너 ────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 20,
      padding: "22px 20px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      color: "rgba(201,168,76,0.75)", textTransform: "uppercase",
      marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

// ─── 메인 ──────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const accessTokenRef = useRef("");

  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading");
  const [stats,     setStats]    = useState<DashStats | null>(null);
  const [statsErr,  setStatsErr] = useState("");
  const [loading,   setLoading]  = useState(false);

  // ── Supabase auth → admin role check ──────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/"); return; }

        accessTokenRef.current = session.access_token;

        const res  = await fetch("/api/admin/check-role", {
          headers: { "Authorization": `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (!json.isAdmin) { router.replace("/"); return; }

        setAuthState("ok");
      } catch {
        router.replace("/");
      }
    };
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 인증 완료 후 stats 로드 ────────────────────────────
  useEffect(() => {
    if (authState === "ok") loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  const loadStats = async () => {
    setLoading(true);
    setStatsErr("");
    try {
      const res  = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${accessTokenRef.current}` },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setStatsErr(json.error ?? "통계 조회 실패"); return; }
      setStats(json.stats);
    } catch { setStatsErr("서버 연결 실패"); }
    finally  { setLoading(false); }
  };

  const handleSignOut = async () => {
    try { const s = createClient(); await s.auth.signOut(); } catch { /* ignore */ }
    router.replace("/");
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

  // ── 로딩 중 ────────────────────────────────────────────
  if (authState === "loading") {
    return (
      <main style={{ minHeight: "100vh", background: "#060d22", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(201,168,76,0.7)", fontSize: 14, letterSpacing: "0.08em" }}>
          인증 확인 중...
        </div>
      </main>
    );
  }

  // ── 월별 매출 차트 ─────────────────────────────────────
  const monthMax = Math.max(...(stats?.monthlyRevenue.map((m) => m.revenue) ?? [1]), 1);
  const weekMax  = Math.max(...(stats?.weeklyGenerations.map((d) => d.count) ?? [1]), 1);
  const today    = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  return (
    <main style={{ minHeight: "100vh", background: "#060d22", paddingBottom: 60 }}>

      {/* ── Sticky 헤더 ──────────────────────────────────── */}
      <header style={{
        background: "rgba(8,14,32,0.97)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(12px)",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase" }}>
            WINK NAMING · ADMIN
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#f0f5ff", marginTop: 1 }}>
            관리자 대시보드
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={loadStats} disabled={loading}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(200,218,248,0.15)", background: "transparent", color: "rgba(200,218,248,0.65)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {loading ? "새로고침 중..." : "↻ 새로고침"}
          </button>
          <button type="button" onClick={handleSignOut}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,100,100,0.25)", background: "transparent", color: "rgba(255,120,120,0.75)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>

        {statsErr && (
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.22)", color: "rgba(255,130,130,0.9)", marginBottom: 20, fontSize: 14 }}>
            {statsErr}
          </div>
        )}
        {loading && !stats && (
          <div style={{ color: "rgba(200,218,248,0.45)", fontSize: 14, textAlign: "center", padding: 48 }}>
            통계를 불러오는 중...
          </div>
        )}

        {stats && (
          <>
            {/* ── 1. 요약 카드 4개 ────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                {
                  label: "총 유저 수",
                  value: fmt(stats.totalUsers),
                  sub: `유료 ${fmt(stats.paidUsers)}명`,
                  icon: "👤",
                  accent: "rgba(100,160,255,0.9)",
                },
                {
                  label: "총 주문 수",
                  value: fmt(stats.totalOrders),
                  sub: `전환율 ${stats.conversionRate}%`,
                  icon: "📦",
                  accent: "rgba(180,120,255,0.9)",
                },
                {
                  label: "총 매출",
                  value: `₩${fmtKRW(stats.totalRevenue)}`,
                  sub: `${fmt(stats.totalRevenue)} 원`,
                  icon: "💰",
                  accent: "rgba(201,168,76,0.95)",
                },
                {
                  label: "이름 생성 수",
                  value: fmt(stats.totalGenerations),
                  sub: `오늘 ${fmt(stats.todayGenerations)}건`,
                  icon: "✦",
                  accent: "rgba(100,210,160,0.9)",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    borderRadius: 18, padding: "20px 18px",
                    background: "linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 10 }}>{card.icon}</div>
                  <div style={{
                    fontSize: "clamp(24px,4vw,34px)", fontWeight: 900,
                    color: card.accent, lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(200,218,248,0.5)", marginTop: 6, fontWeight: 500 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(200,218,248,0.35)", marginTop: 3 }}>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* ── 2. 월별 매출 차트 (12개월) ─────────────────── */}
            <Card style={{ marginBottom: 20 }}>
              <SectionLabel>월별 매출 (최근 12개월)</SectionLabel>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {stats.monthlyRevenue.map((m) => {
                  const pct = monthMax > 0 ? (m.revenue / monthMax) * 100 : 0;
                  const isCurrent = m.month === thisMonth;
                  return (
                    <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: "rgba(200,218,248,0.45)", minHeight: 12, fontVariantNumeric: "tabular-nums" }}>
                        {m.revenue > 0 ? fmtKRW(m.revenue) : ""}
                      </div>
                      <div style={{
                        width: "100%",
                        height: Math.max(pct * 0.9, m.revenue > 0 ? 4 : 2),
                        borderRadius: "3px 3px 0 0",
                        background: isCurrent
                          ? "linear-gradient(180deg, rgba(201,168,76,0.95), rgba(201,168,76,0.5))"
                          : "linear-gradient(180deg, rgba(100,160,255,0.65), rgba(100,160,255,0.25))",
                        transition: "height 0.4s ease",
                      }} />
                      <div style={{ fontSize: 9, color: isCurrent ? "rgba(201,168,76,0.85)" : "rgba(200,218,248,0.35)", fontWeight: isCurrent ? 700 : 400 }}>
                        {shortMonth(m.month)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ── 3. 7일 추이 + 전환율 ────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

              {/* 7일 생성 추이 */}
              <Card>
                <SectionLabel>최근 7일 생성 추이</SectionLabel>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                  {stats.weeklyGenerations.map((d) => {
                    const pct = weekMax > 0 ? (d.count / weekMax) * 100 : 0;
                    const isToday = d.date === today;
                    return (
                      <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 10, color: "rgba(200,218,248,0.5)", minHeight: 13 }}>
                          {d.count > 0 ? d.count : ""}
                        </div>
                        <div style={{
                          width: "100%",
                          height: Math.max(pct, d.count > 0 ? 4 : 2),
                          borderRadius: "3px 3px 0 0",
                          background: isToday
                            ? "linear-gradient(180deg, rgba(201,168,76,0.9), rgba(201,168,76,0.4))"
                            : "linear-gradient(180deg, rgba(100,160,255,0.65), rgba(100,160,255,0.25))",
                        }} />
                        <div style={{ fontSize: 9, color: isToday ? "rgba(201,168,76,0.85)" : "rgba(200,218,248,0.35)", fontWeight: isToday ? 700 : 400 }}>
                          {d.date.slice(5)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 전환율 + 주요 지표 */}
              <Card>
                <SectionLabel>유입 & 전환</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* 전환율 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "rgba(200,218,248,0.65)" }}>구매 전환율</span>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "rgba(201,168,76,0.95)", fontVariantNumeric: "tabular-nums" }}>
                        {stats.conversionRate}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{
                        height: "100%", width: `${Math.min(stats.conversionRate, 100)}%`,
                        borderRadius: 99,
                        background: "linear-gradient(90deg, rgba(201,168,76,0.9), rgba(201,168,76,0.5))",
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(200,218,248,0.35)", marginTop: 4 }}>
                      이름 생성 {fmt(stats.totalGenerations)}건 → 구매 {fmt(stats.totalOrders)}건
                    </div>
                  </div>

                  {/* 세부 지표 */}
                  {[
                    { label: "오늘 생성", value: fmt(stats.todayGenerations) + "건" },
                    { label: "주간 일평균", value: fmt(stats.weekAvg) + "건" },
                    { label: "유료 전환 사용자", value: fmt(stats.paidUsers) + "명" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "rgba(200,218,248,0.55)" }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(200,218,248,0.85)", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── 4. 주문/결제 내역 테이블 ─────────────────── */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <SectionLabel>주문 / 결제 내역</SectionLabel>
                <span style={{ fontSize: 11, color: "rgba(200,218,248,0.4)" }}>
                  최근 {stats.recentOrders.length}건
                </span>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "rgba(200,218,248,0.35)" }}>
                  주문 없음
                </div>
              ) : (
                <>
                  {/* 테이블 헤더 */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "130px 1fr 1fr 90px 70px 100px",
                    gap: 8,
                    padding: "8px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 6,
                  }}>
                    {["날짜", "고객명", "이메일", "금액", "통화", "상태"].map((h) => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(200,218,248,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {h}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {stats.recentOrders.map((order) => (
                      <div key={order.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "130px 1fr 1fr 90px 70px 100px",
                          gap: 8,
                          alignItems: "center",
                          padding: "10px 10px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ fontSize: 11, color: "rgba(200,218,248,0.5)" }}>
                          {fmtDate(order.created_at)}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f5ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.customer_name}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(200,218,248,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.customer_email}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(201,168,76,0.9)", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(order.total_amount)}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(200,218,248,0.45)" }}>
                          {order.currency}
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 7,
                            border: `1px solid ${STATUS_COLOR[order.status] ?? "rgba(200,218,248,0.18)"}44`,
                            background: "rgba(255,255,255,0.04)",
                            color: STATUS_COLOR[order.status] ?? "rgba(200,218,248,0.75)",
                            fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* ── 5. 카테고리 + 성씨 ──────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Card>
                <SectionLabel>카테고리 분포</SectionLabel>
                {stats.popularCategories.length === 0 && (
                  <div style={{ fontSize: 13, color: "rgba(200,218,248,0.35)" }}>데이터 없음</div>
                )}
                {stats.popularCategories.map((item, idx) => {
                  const catMax = stats.popularCategories[0]?.count || 1;
                  return (
                    <div key={item.category} style={{ marginBottom: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "rgba(200,218,248,0.8)", fontWeight: 600 }}>
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(200,218,248,0.45)", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(item.count)}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{
                          height: "100%",
                          width: `${(item.count / catMax) * 100}%`,
                          borderRadius: 99,
                          background: idx === 0
                            ? "linear-gradient(90deg, rgba(201,168,76,0.9), rgba(201,168,76,0.45))"
                            : "linear-gradient(90deg, rgba(100,160,255,0.65), rgba(100,160,255,0.25))",
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </Card>

              <Card>
                <SectionLabel>인기 성씨 TOP 10</SectionLabel>
                {stats.popularFamilyNames.length === 0 && (
                  <div style={{ fontSize: 13, color: "rgba(200,218,248,0.35)" }}>데이터 없음</div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {stats.popularFamilyNames.map((item, idx) => (
                    <div key={item.name}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 999,
                        background: idx < 3 ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${idx < 3 ? "rgba(201,168,76,0.28)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: idx < 3 ? "rgba(201,168,76,0.95)" : "rgba(200,218,248,0.8)" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(200,218,248,0.4)", fontVariantNumeric: "tabular-nums" }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </>
        )}
      </div>
    </main>
  );
}
