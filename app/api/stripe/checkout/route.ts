import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

const PLAN_PRICE_ENV: Record<string, string> = {
  basic: "STRIPE_PRICE_BASIC",
  premium: "STRIPE_PRICE_PREMIUM",
};

/**
 * POST /api/stripe/checkout
 * Body: { plan: "basic" | "premium", userId: string, email?: string, lang?: string }
 * Returns: { url: string }  (Stripe Checkout redirect URL)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan: string = body.plan ?? "";
    const userId: string = body.userId ?? "";
    const email: string | undefined = body.email || undefined;
    const lang: string = body.lang ?? "ko";

    if (!plan || !userId) {
      return NextResponse.json({ error: "plan and userId required" }, { status: 400 });
    }

    const envKey = PLAN_PRICE_ENV[plan];
    if (!envKey) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const priceId = process.env[envKey];
    if (!priceId) {
      return NextResponse.json(
        { error: `${envKey} env var not set — create the price in Stripe dashboard first` },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      metadata: { userId, plan, lang },
      success_url: `${origin}/${lang}/result?payment=success`,
      cancel_url: `${origin}/${lang}/category`,
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const msg = err instanceof Error ? err.message : "Failed to create session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
