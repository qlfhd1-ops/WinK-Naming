import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "MISSING";
  return NextResponse.json({
    url,
    key_prefix: key.slice(0, 40),
    key_suffix: key.slice(-8),
  });
}
