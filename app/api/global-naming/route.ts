import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Lang = "ko" | "en" | "ja" | "zh" | "es";

type GlobalNamingRequestBody = {
  purpose?: string;
  gender?: string | null;
  familyName?: string | null;
  styleKeywords?: string;
  avoidKeywords?: string;
  memo?: string;
  targetCountry?: string;
  lang?: Lang;
  userId?: string | null;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase env missing");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GlobalNamingRequestBody;

    const {
      purpose,
      gender,
      familyName,
      styleKeywords,
      avoidKeywords,
      memo,
      targetCountry,
      lang,
      userId,
    } = body;

    if (!purpose || !styleKeywords) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid payload",
        },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const insertRow = {
      user_id: userId ?? null,
      purpose,
      gender: gender ?? null,
      family_name: familyName ?? null,
      style_keywords: styleKeywords,
      avoid_keywords: avoidKeywords ?? null,
      memo: memo ?? null,
      target_country: targetCountry ?? null,
      display_language: lang ?? "ko",
    };

    const { data, error } = await (supabase as any)
      .from("naming_requests")
      .insert([insertRow])
      .select("*");

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
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