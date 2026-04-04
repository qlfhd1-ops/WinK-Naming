import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type NamingRequestInput = {
  id?: string;
  purpose?: string;
  gender?: string | null;
  family_name?: string | null;
  style_keywords?: string | null;
  avoid_keywords?: string | null;
  memo?: string | null;
  target_country?: string | null;
  display_language?: string | null;
};

type GeneratedItem = {
  name: string;
  concept: string;
  score: number;
  reason: string;
  caution: string;
  summary: string;
  alternatives: string[];
  hanja: string;
  hanjaMeaning: string;
  english: string;
  englishAlt: string;
  chinese: string;
  pinyin: string;
  japaneseKana: string;
  japaneseReading: string;
  giftMessage: string;
  globalComment: string;
};

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function clampScore(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 84;
  return Math.max(70, Math.min(99, Math.round(n)));
}

function parseCategoryFromMemo(memo?: string | null): string {
  const raw = safeString(memo);
  if (!raw) return "baby";

  const parts = raw.split(" / ");
  const found = parts.find((part) => part.startsWith("카테고리:"));
  if (!found) return "baby";

  return found.replace("카테고리:", "").trim() || "baby";
}

function pickLang(displayLanguage?: string | null): "ko" | "en" | "ja" | "zh" | "es" {
  const lang = safeString(displayLanguage, "ko").toLowerCase();
  if (lang === "en" || lang === "ja" || lang === "zh" || lang === "es") return lang;
  return "ko";
}

function buildBaseWords(input: NamingRequestInput) {
  const purpose = safeString(input.purpose, "의미 있는 이름");
  const style = safeString(input.style_keywords, "부드럽고 세련된");
  const avoid = safeString(input.avoid_keywords, "과하게 무거운");
  const family = safeString(input.family_name);
  const memo = safeString(input.memo);
  const category = parseCategoryFromMemo(input.memo);

  return { purpose, style, avoid, family, memo, category };
}

function buildFallbackNames(input: NamingRequestInput): string[] {
  const { category } = buildBaseWords(input);

  const map: Record<string, string[]> = {
    baby: ["윤슬", "라온", "하린"],
    rename: ["이안", "서윤", "도하"],
    activity: ["루멘", "모어", "노바"],
    brand: ["윈슬로", "윤슬랩", "브릴로"],
    pet: ["보리", "몽실", "코코"],
    plant: ["이슬", "그린나", "플로라"],
    global: ["Yunsel", "Liora", "Mira"],
  };

  return map[category] || ["윤슬", "라온", "하린"];
}

function romanizeBasic(name: string): string {
  const lower = name.toLowerCase();
  if (/^[a-z0-9\s-]+$/i.test(name)) return name;
  const known: Record<string, string> = {
    윤슬: "Yunsel",
    라온: "Raon",
    하린: "Harin",
    이안: "Ian",
    서윤: "Seoyun",
    도하: "Doha",
    루멘: "Lumen",
    모어: "More",
    노바: "Nova",
    보리: "Bori",
    몽실: "Mongsil",
    코코: "Coco",
    이슬: "Iseul",
  };
  return known[name] || lower.replace(/\s+/g, "");
}

function buildFallbackItems(input: NamingRequestInput): GeneratedItem[] {
  const { purpose, style, avoid, category } = buildBaseWords(input);
  const names = buildFallbackNames(input);

  return names.slice(0, 3).map((name, idx) => {
    const english = romanizeBasic(name);
    const score = 92 - idx * 3;

    return {
      name,
      concept:
        category === "brand"
          ? `${style} 인상과 확장성을 고려한 브랜드형 이름`
          : `${purpose}에 어울리도록 ${style} 인상을 담은 이름`,
      score,
      reason: `${name}은(는) 발음이 비교적 부드럽고 기억에 남기 쉬우며, ${avoid} 느낌을 과하게 주지 않도록 균형을 맞춘 후보입니다.`,
      caution:
        category === "brand"
          ? "도메인·상표·법인명은 실제 등록 가능 여부를 별도 확인해 주세요."
          : "실제 사용 전 가족/주변 호칭감과 발음 느낌을 함께 확인해 주세요.",
      summary: `${name}은(는) ${purpose}의 방향성과 ${style} 분위기를 함께 담아낸 이름 후보입니다. 첫인상은 부드럽지만 가볍지 않고, 반복해서 불러도 어색하지 않은 흐름을 목표로 구성했습니다.`,
      alternatives: idx === 0 ? names.slice(1, 3) : [names[0], names[(idx + 1) % names.length]].filter(Boolean),
      hanja: name,
      hanjaMeaning: `${name}에 담긴 의미를 상징적으로 해석한 참고 표현입니다.`,
      english,
      englishAlt: english,
      chinese: english,
      pinyin: english,
      japaneseKana: english,
      japaneseReading: english,
      giftMessage:
        category === "brand"
          ? `${name}, 오래 사랑받고 신뢰받는 브랜드가 되길 바라는 마음을 담았습니다.`
          : `${name}, 새로운 시작을 다정하게 응원하는 마음을 담았습니다.`,
      globalComment:
        "영문·중문·일문 표기와 발음은 참고용입니다. 실제 현지 사용 전 문화권별 사용성 점검을 권장합니다.",
    };
  });
}

function extractJsonBlock(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeItem(raw: any, fallbackName: string, idx: number): GeneratedItem {
  const english = safeString(raw?.english) || romanizeBasic(safeString(raw?.name) || fallbackName);
  return {
    name: safeString(raw?.name, fallbackName),
    concept: safeString(raw?.concept, "의미와 인상을 함께 고려한 이름"),
    score: clampScore(raw?.score ?? 90 - idx * 3),
    reason: safeString(raw?.reason, "발음, 인상, 사용성을 종합해 추천한 이름입니다."),
    caution: safeString(
      raw?.caution,
      "실사용 전 발음, 중복, 문화권별 인상을 함께 확인해 주세요."
    ),
    summary: safeString(raw?.summary, "이름의 방향성과 인상을 균형 있게 담은 후보입니다."),
    alternatives: Array.isArray(raw?.alternatives)
      ? raw.alternatives.map((v: unknown) => safeString(v)).filter(Boolean).slice(0, 3)
      : [],
    hanja: safeString(raw?.hanja, safeString(raw?.name, fallbackName)),
    hanjaMeaning: safeString(raw?.hanjaMeaning || raw?.hanja_meaning, "상징적 의미를 담은 참고 해석입니다."),
    english,
    englishAlt: safeString(raw?.englishAlt || raw?.english_alt, english),
    chinese: safeString(raw?.chinese, english),
    pinyin: safeString(raw?.pinyin, english),
    japaneseKana: safeString(raw?.japaneseKana || raw?.japanese_kana, english),
    japaneseReading: safeString(raw?.japaneseReading || raw?.japanese_reading, english),
    giftMessage: safeString(raw?.giftMessage || raw?.gift_message, `${safeString(raw?.name, fallbackName)}, 의미 있는 시작을 응원하는 이름 선물입니다.`),
    globalComment: safeString(
      raw?.globalComment || raw?.global_comment,
      "글로벌 표기와 발음은 참고용이며 실제 현지 사용 전 점검을 권장합니다."
    ),
  };
}

async function tryOpenAIGeneration(input: NamingRequestInput): Promise<GeneratedItem[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const { purpose, style, avoid, family, memo, category } = buildBaseWords(input);
  const lang = pickLang(input.display_language);
  const targetCountry = safeString(input.target_country, "global");

  const prompt = `
당신은 작명 컨설턴트입니다.
아래 요청을 바탕으로 이름 후보 3개를 JSON으로만 반환하세요.

[입력]
- category: ${category}
- purpose: ${purpose}
- gender: ${safeString(input.gender, "-")}
- family_name: ${family || "-"}
- style_keywords: ${style}
- avoid_keywords: ${avoid}
- memo: ${memo || "-"}
- target_country: ${targetCountry}
- display_language: ${lang}

[출력 규칙]
- 반드시 JSON 객체 하나만 반환
- 형태:
{
  "items": [
    {
      "name": "string",
      "concept": "string",
      "score": 92,
      "reason": "string",
      "caution": "string",
      "summary": "string",
      "alternatives": ["string", "string"],
      "hanja": "string",
      "hanjaMeaning": "string",
      "english": "string",
      "englishAlt": "string",
      "chinese": "string",
      "pinyin": "string",
      "japaneseKana": "string",
      "japaneseReading": "string",
      "giftMessage": "string",
      "globalComment": "string"
    }
  ]
}
- items는 정확히 3개
- 중복 이름 금지
- 설명은 과장 없이 자연스럽게
- brand 카테고리면 브랜드/상호/서비스명 관점 반영
- global 카테고리면 다국어 사용성을 조금 더 반영
`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON. Do not wrap in markdown. Do not add commentary.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned empty content");
  }

  const parsed = extractJsonBlock(content) as any;
  const rawItems = Array.isArray(parsed?.items) ? parsed.items : null;
  if (!rawItems || rawItems.length === 0) {
    throw new Error("OpenAI JSON parsing failed");
  }

  const fallbackNames = buildFallbackNames(input);

  return rawItems.slice(0, 3).map((item: any, idx: number) =>
    normalizeItem(item, fallbackNames[idx] || `이름${idx + 1}`, idx)
  );
}

async function trySaveCandidatesToSupabase(
  requestId: string,
  items: GeneratedItem[]
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: requestRow, error: requestError } = await admin
    .from("naming_requests")
    .select("id,user_id")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    console.error("[generate/save] naming_requests lookup failed:", requestError.message);
    return;
  }

  if (!requestRow?.id) {
    return;
  }

  const userId = (requestRow as any).user_id ?? null;

  const rows = items.map((item) => ({
    request_id: requestId,
    user_id: userId,
    name: item.name,
    concept: item.concept,
    score: item.score,
    reason: item.reason,
    caution: item.caution,
    summary: item.summary,
    alternatives: item.alternatives,
    hanja: item.hanja,
    hanja_meaning: item.hanjaMeaning,
    english: item.english,
    english_alt: item.englishAlt,
    chinese: item.chinese,
    pinyin: item.pinyin,
    japanese_kana: item.japaneseKana,
    japanese_reading: item.japaneseReading,
    gift_message: item.giftMessage,
    global_comment: item.globalComment,
    image: null,
  }));

  const { error: deleteError } = await admin
    .from("naming_candidates")
    .delete()
    .eq("request_id", requestId);

  if (deleteError) {
    console.error("[generate/save] delete old candidates failed:", deleteError.message);
  }

  const { error: insertError } = await admin
    .from("naming_candidates")
    .insert(rows);

  if (insertError) {
    console.error("[generate/save] insert candidates failed:", insertError.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestData = (body?.requestData || {}) as NamingRequestInput;

    const requestId =
      safeString(body?.requestId) ||
      safeString(requestData?.id);

    if (!requestData || Object.keys(requestData).length === 0) {
      return NextResponse.json(
        { error: "requestData is required" },
        { status: 400 }
      );
    }

    let items: GeneratedItem[] | null = null;

    try {
      items = await tryOpenAIGeneration(requestData);
    } catch (aiError) {
      console.error("[/api/generate] AI generation failed:", aiError);
    }

    if (!items || items.length === 0) {
      items = buildFallbackItems(requestData);
    }

    if (requestId) {
      try {
        await trySaveCandidatesToSupabase(requestId, items);
      } catch (saveError) {
        console.error("[/api/generate] save candidates failed:", saveError);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        requestId: requestId || null,
        items,
        source: process.env.OPENAI_API_KEY ? "ai-or-fallback" : "fallback",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/generate] fatal error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate naming candidates",
      },
      { status: 500 }
    );
  }
}