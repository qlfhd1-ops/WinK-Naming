"use client";

import { useEffect, useState } from "react";

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_note: string | null;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "접수" },
  { value: "reviewing", label: "검토중" },
  { value: "designing", label: "설계중" },
  { value: "packaging", label: "패키지 준비" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("주문 목록을 불러오는 중입니다...");
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "주문 목록 조회 실패");
      }

      setOrders(json.orders || []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "상태 변경 실패");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "상태 변경 실패");
    }
  };

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">Wink Admin</div>
        <h1 className="wink-title">운영자 주문 관리</h1>
        <p className="wink-sub">
          주문 접수부터 설계, 패키지 제작, 완료까지 상태를 관리할 수 있습니다.
        </p>

        {message && <div className="wink-panel">{message}</div>}

        {!loading && orders.length > 0 && (
          <div className="wink-result-grid">
            {orders.map((order) => (
              <article key={order.id} className="wink-result-card">
                <div className="wink-result-head">
                  <div className="wink-card-title">{order.customer_name}</div>
                  <div className="wink-score-pill">
                    {order.currency} {order.total_amount.toLocaleString()}
                  </div>
                </div>

                <div className="wink-result-section">
                  <div className="wink-result-label">이메일</div>
                  <div className="wink-result-text">{order.customer_email}</div>
                </div>

                <div className="wink-result-section">
                  <div className="wink-result-label">메모</div>
                  <div className="wink-result-text">{order.customer_note || "-"}</div>
                </div>

                <div className="wink-result-section">
                  <div className="wink-result-label">생성일</div>
                  <div className="wink-result-text">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="wink-result-section">
                  <div className="wink-result-label">상태</div>
                  <select
                    className="wink-select"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}