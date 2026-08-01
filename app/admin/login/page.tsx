"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "비밀번호가 틀렸습니다.");
        return;
      }

      // 세션 저장: sessionStorage + 쿠키
      try { sessionStorage.setItem("wink_admin_pw", password); } catch { /* ignore */ }
      document.cookie = `wink_admin=${btoa(password)};path=/;max-age=86400;SameSite=Lax`;

      router.replace("/admin");
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#060d22",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(201,168,76,0.18)",
        borderRadius: 20,
        padding: "36px 28px",
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            color: "rgba(201,168,76,0.65)", textTransform: "uppercase", marginBottom: 8,
          }}>
            WINK NAMING
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f5ff" }}>
            관리자 로그인
          </div>
          <div style={{ fontSize: 13, color: "rgba(200,218,248,0.4)", marginTop: 6 }}>
            관리자 비밀번호를 입력하세요
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoFocus
              required
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 10,
                border: "1px solid rgba(200,218,248,0.15)",
                background: "rgba(255,255,255,0.04)",
                color: "#f0f5ff",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(255,80,80,0.07)",
              border: "1px solid rgba(255,80,80,0.22)",
              color: "rgba(255,130,130,0.9)",
              fontSize: 13,
              marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 10,
              border: "none",
              background: loading || !password
                ? "rgba(201,168,76,0.3)"
                : "linear-gradient(135deg, rgba(201,168,76,0.95), rgba(180,140,50,0.9))",
              color: loading || !password ? "rgba(255,255,255,0.4)" : "#060d22",
              fontSize: 15,
              fontWeight: 800,
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
