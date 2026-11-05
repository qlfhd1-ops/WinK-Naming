"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type ReplyRow = { id: string; content: string; created_at: string; updated_at: string };

type ReviewRow = {
  id: string;
  user_id: string;
  brief_id: string;
  name_used: string | null;
  rating: number;
  content: string;
  display_name: string | null;
  country: string | null;
  lang: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  reply: ReplyRow | null;
};

type StatusFilter = "all" | "pending" | "approved" | "featured";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "승인 대기" },
  { value: "approved", label: "승인됨" },
  { value: "featured", label: "메인 노출" },
];

const PAGE_SIZE = 20;

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const accessTokenRef = useRef("");
  const adminPwRef = useRef("");

  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyBusyId, setReplyBusyId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        let pw = "";
        try { pw = sessionStorage.getItem("wink_admin_pw") ?? ""; } catch { /* ignore */ }
        if (pw) {
          const res = await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw }),
          });
          if (res.ok) {
            adminPwRef.current = pw;
            setAuthState("ok");
            return;
          }
          try { sessionStorage.removeItem("wink_admin_pw"); } catch { /* ignore */ }
        }

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/admin/login"); return; }

        accessTokenRef.current = session.access_token;

        const res = await fetch("/api/admin/check-role", {
          headers: { "Authorization": `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (!json.isAdmin) { router.replace("/admin/login"); return; }

        setAuthState("ok");
      } catch {
        router.replace("/admin/login");
      }
    };
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeaders = (): Record<string, string> =>
    adminPwRef.current
      ? { "X-Admin-Password": adminPwRef.current }
      : { "Authorization": `Bearer ${accessTokenRef.current}` };

  const loadReviews = async (p = page, status = statusFilter) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}&page=${p}&pageSize=${PAGE_SIZE}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error ?? "후기 조회 실패"); return; }
      setReviews(json.reviews);
      setTotal(json.total);
      setPage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState === "ok") loadReviews(1, statusFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  const changeStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    loadReviews(1, status);
  };

  const togglePatch = async (reviewId: string, patch: { is_approved?: boolean; is_featured?: boolean }) => {
    setBusyId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ reviewId, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "업데이트 실패");
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...patch } : r)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "실패");
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("이 후기를 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setBusyId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "삭제 실패");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      alert(e instanceof Error ? e.message : "실패");
    } finally {
      setBusyId(null);
    }
  };

  const submitReply = async (reviewId: string) => {
    const content = (replyDrafts[reviewId] ?? "").trim();
    if (!content) return;
    setReplyBusyId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ reviewId, content }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "답변 저장 실패");
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: json.reply } : r)));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      setEditingReplyId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "실패");
    } finally {
      setReplyBusyId(null);
    }
  };

  const deleteReply = async (reviewId: string) => {
    if (!confirm("이 답변을 삭제하시겠습니까?")) return;
    setReplyBusyId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/replies?reviewId=${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "삭제 실패");
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: null } : r)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "실패");
    } finally {
      setReplyBusyId(null);
    }
  };

  if (authState === "loading") {
    return (
      <main style={{ minHeight: "100vh", background: "#060d22", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(201,168,76,0.7)", fontSize: 14, letterSpacing: "0.08em" }}>
          인증 확인 중...
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#060d22", paddingBottom: 60 }}>
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
            후기 관리
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => router.push("/admin")}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(200,218,248,0.15)", background: "transparent", color: "rgba(200,218,248,0.65)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            ← 대시보드
          </button>
          <button type="button" onClick={() => loadReviews(page, statusFilter)} disabled={loading}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(200,218,248,0.15)", background: "transparent", color: "rgba(200,218,248,0.65)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {loading ? "새로고침 중..." : "↻ 새로고침"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.22)", color: "rgba(255,130,130,0.9)", marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* 상태 탭 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => changeStatusFilter(tab.value)}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: `1px solid ${statusFilter === tab.value ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: statusFilter === tab.value ? "rgba(201,168,76,0.12)" : "transparent",
                color: statusFilter === tab.value ? "rgba(230,210,150,0.95)" : "rgba(200,218,248,0.6)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && reviews.length === 0 ? (
          <div style={{ color: "rgba(200,218,248,0.45)", fontSize: 14, textAlign: "center", padding: 48 }}>
            후기를 불러오는 중...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ color: "rgba(200,218,248,0.45)", fontSize: 14, textAlign: "center", padding: 48 }}>
            해당 조건의 후기가 없습니다.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{
                borderRadius: 16,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(201,168,76,0.95)", fontSize: 13, letterSpacing: 2 }}>
                      {"★".repeat(r.rating)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f5ff" }}>
                      {r.display_name || "(닉네임 없음)"}
                    </span>
                    {r.country && (
                      <span style={{ fontSize: 11, color: "rgba(200,218,248,0.5)" }}>· {r.country}</span>
                    )}
                    {r.name_used && (
                      <span style={{ fontSize: 11, color: "rgba(200,218,248,0.5)" }}>· {r.name_used}</span>
                    )}
                    <span style={{ fontSize: 11, color: "rgba(200,218,248,0.35)" }}>· {r.lang}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(200,218,248,0.4)" }}>{fmtDate(r.created_at)}</span>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(220,230,250,0.9)", marginBottom: 14 }}>
                  {r.content}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => togglePatch(r.id, { is_approved: !r.is_approved })}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: busyId === r.id ? "default" : "pointer",
                      border: `1px solid ${r.is_approved ? "rgba(100,210,120,0.4)" : "rgba(255,255,255,0.15)"}`,
                      background: r.is_approved ? "rgba(100,210,120,0.12)" : "transparent",
                      color: r.is_approved ? "rgba(140,230,150,0.95)" : "rgba(200,218,248,0.6)",
                      opacity: busyId === r.id ? 0.6 : 1,
                    }}
                  >
                    {r.is_approved ? "✓ 승인됨" : "승인하기"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => togglePatch(r.id, { is_featured: !r.is_featured })}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: busyId === r.id ? "default" : "pointer",
                      border: `1px solid ${r.is_featured ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.15)"}`,
                      background: r.is_featured ? "rgba(201,168,76,0.12)" : "transparent",
                      color: r.is_featured ? "rgba(230,210,150,0.95)" : "rgba(200,218,248,0.6)",
                      opacity: busyId === r.id ? 0.6 : 1,
                    }}
                  >
                    {r.is_featured ? "✓ 메인 노출 중" : "메인에 노출"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => deleteReview(r.id)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: busyId === r.id ? "default" : "pointer",
                      border: "1px solid rgba(255,100,100,0.3)", background: "transparent",
                      color: "rgba(255,130,130,0.85)", marginLeft: "auto",
                      opacity: busyId === r.id ? 0.6 : 1,
                    }}
                  >
                    삭제
                  </button>
                </div>

                {/* 운영자 답변 */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                  {r.reply && editingReplyId !== r.id ? (
                    <div style={{
                      borderRadius: 10, padding: "10px 14px",
                      background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(230,210,150,0.9)" }}>
                          ✓ 운영자 답변
                        </span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(r.id);
                              setReplyDrafts((prev) => ({ ...prev, [r.id]: r.reply!.content }));
                            }}
                            style={{ background: "none", border: "none", color: "rgba(200,218,248,0.55)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            disabled={replyBusyId === r.id}
                            onClick={() => deleteReply(r.id)}
                            style={{ background: "none", border: "none", color: "rgba(255,130,130,0.75)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(220,230,250,0.85)" }}>
                        {r.reply.content}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={replyDrafts[r.id] ?? ""}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="답변 작성..."
                        style={{
                          flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 13,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                          color: "#f0f5ff", outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        disabled={replyBusyId === r.id || !(replyDrafts[r.id] ?? "").trim()}
                        onClick={() => submitReply(r.id)}
                        style={{
                          padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                          border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.12)",
                          color: "rgba(230,210,150,0.95)",
                          cursor: replyBusyId === r.id ? "default" : "pointer",
                          opacity: (replyDrafts[r.id] ?? "").trim() ? 1 : 0.5,
                        }}
                      >
                        {replyBusyId === r.id ? "저장 중..." : "답변 달기"}
                      </button>
                      {editingReplyId === r.id && (
                        <button
                          type="button"
                          onClick={() => setEditingReplyId(null)}
                          style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(200,218,248,0.6)", cursor: "pointer" }}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > PAGE_SIZE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
            <span style={{ fontSize: 12, color: "rgba(200,218,248,0.45)" }}>
              총 {total}건 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadReviews(page - 1, statusFilter)}
                style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: page <= 1 ? "rgba(200,218,248,0.25)" : "rgba(200,218,248,0.7)", fontSize: 12, cursor: page <= 1 ? "not-allowed" : "pointer" }}
              >
                이전
              </button>
              <button
                type="button"
                disabled={page * PAGE_SIZE >= total}
                onClick={() => loadReviews(page + 1, statusFilter)}
                style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: page * PAGE_SIZE >= total ? "rgba(200,218,248,0.25)" : "rgba(200,218,248,0.7)", fontSize: 12, cursor: page * PAGE_SIZE >= total ? "not-allowed" : "pointer" }}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
