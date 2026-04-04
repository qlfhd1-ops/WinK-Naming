import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PlanId } from "@/lib/pricing";

// Stripe requires the raw body for signature verification — do NOT parse JSON
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function monthFromNow(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

async function upsertPlan(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  plan: PlanId,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null,
  expiresAt?: string | null
) {
  await supabase.from("user_plans").upsert(
    {
      user_id: userId,
      plan,
      plan_expires_at: expiresAt ?? monthFromNow(),
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      ...(stripeSubscriptionId ? { stripe_subscription_id: stripeSubscriptionId } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  const body = await req.text(); // raw body required for signature check
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      // ── 결제 완료 → 플랜 활성화
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as PlanId | undefined;

        if (!userId || !plan) break;

        await upsertPlan(
          supabase,
          userId,
          plan,
          typeof session.customer === "string" ? session.customer : null,
          typeof session.subscription === "string" ? session.subscription : null,
          monthFromNow()
        );
        console.log(`[stripe/webhook] plan activated: userId=${userId} plan=${plan}`);
        break;
      }

      // ── 구독 갱신 → 만료일 연장
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
        if (!customerId) break;

        await supabase
          .from("user_plans")
          .update({ plan_expires_at: monthFromNow(), updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }

      // ── 결제 실패 / 구독 취소 → 무료로 다운그레이드
      case "invoice.payment_failed":
      case "customer.subscription.deleted": {
        const obj = event.data.object as Stripe.Invoice | Stripe.Subscription;
        const customerId =
          typeof obj.customer === "string" ? obj.customer : null;
        if (!customerId) break;

        await supabase
          .from("user_plans")
          .update({ plan: "free", plan_expires_at: null, updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        console.log(`[stripe/webhook] plan downgraded: customer=${customerId}`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    // 200 반환 — Stripe가 재시도하지 않도록
  }

  return NextResponse.json({ received: true });
}
