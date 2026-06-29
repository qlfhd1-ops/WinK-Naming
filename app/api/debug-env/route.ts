import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  const envCheck = {
    OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
    OPENAI_KEY_LENGTH: process.env.OPENAI_API_KEY?.length ?? 0,
    OPENAI_KEY_PREFIX: process.env.OPENAI_API_KEY?.slice(0, 8) ?? "none",
    SUPABASE_SECRET_KEY_SET: !!process.env.SUPABASE_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  // OpenAI 연결 테스트
  let openaiTest = "not_tested";
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      openaiTest = "no_key";
    } else {
      const client = new OpenAI({ apiKey: key });
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5,
      });
      openaiTest = "success:" + (res.choices[0]?.message?.content ?? "empty");
    }
  } catch (e) {
    openaiTest = "error:" + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ ...envCheck, openaiTest });
}
