"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { clearCart, getCartItems, getCartTotal, type CartItem } from "@/lib/cart";

type CustomerForm = {
  name: string;
  email: string;
  note: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    email: "",
    note: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const total = useMemo(() => getCartTotal(), [items]);

  const canSubmit =
    items.length > 0 &&
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.email.includes("@");

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setMessage("");

    let userId: string | null = null;

    try {
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }
    } catch {
      userId = null;
    }

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: form,
          items,
          total,
          userId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "주문 저장에 실패했습니다.");
      }

      clearCart();
      setItems([]);
      router.push("/orders");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">Wink Checkout</div>
        <h1 className="wink-title">주문 요약</h1>
        <p className="wink-sub">
          선택한 패키지와 고객 정보를 확인한 뒤 주문을 저장합니다.
        </p>

        {message && <div className="wink-error-banner">{message}</div>}

        <div className="wink-result-grid">
          <section className="wink-result-card">
            <div className="wink-section-title" style={{ marginBottom: 14 }}>
              선택한 상품
            </div>

            {items.length === 0 ? (
              <div className="wink-panel">장바구니가 비어 있습니다.</div>
            ) : (
              <div className="wink-form" style={{ gap: 12 }}>
                {items.map((item) => (
                  <div key={item.id} className="wink-result-section">
                    <div className="wink-result-head">
                      <div className="wink-card-title">{item.title}</div>
                      <div className="wink-score-pill">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="wink-result-text">{item.description}</div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        color: "var(--text-soft)",
                        fontSize: 14,
                      }}
                    >
                      <span>수량 {item.quantity}</span>
                      <span>briefId: {item.briefId}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="wink-result-card">
            <div className="wink-section-title" style={{ marginBottom: 14 }}>
              주문자 정보
            </div>

            <div className="wink-form-grid">
              <div className="wink-field wink-field-full">
                <label>이름</label>
                <input
                  className="wink-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="주문자 이름"
                />
              </div>

              <div className="wink-field wink-field-full">
                <label>이메일</label>
                <input
                  className="wink-input"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@email.com"
                />
              </div>

              <div className="wink-field wink-field-full">
                <label>요청 메모</label>
                <textarea
                  className="wink-textarea"
                  rows={5}
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="인장 문구, 배송 메모, 추가 요청 등"
                />
              </div>
            </div>

            <div className="wink-panel" style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div className="wink-section-title" style={{ margin: 0 }}>
                  총 결제 예정 금액
                </div>
                <div className="wink-top-pick-score">
                  ₩{total.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="wink-actions" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="wink-primary-btn"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "저장 중..." : "주문 저장"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}