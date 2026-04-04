import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role env is missing.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const ALLOWED_STATUS = [
  "pending",
  "reviewing",
  "designing",
  "packaging",
  "completed",
  "cancelled",
] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const status = typeof body?.status === "string" ? body.status : "";

    if (!orderId || !ALLOWED_STATUS.includes(status as any)) {
      return NextResponse.json(
        { ok: false, error: "Invalid orderId or status." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { error } = await supabase
      .from("naming_orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}