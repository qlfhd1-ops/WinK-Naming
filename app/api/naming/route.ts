import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getFreeLimiter } from "@/lib/upstash";
import { rateLimit } from "@/lib/rate-limiter";
import { calcSaju, sajuToPromptText } from "@/lib/saju";

// OpenAI 클라이언트 — 요청 시점에 초기화 (env var 누락 시 모듈 크래시 방지)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

const CATEGORY_LABEL: Record<string, string> = {
  child: "태어날 아이·자녀 이름",
  self: "나 자신의 이름·개명",
  brand: "브랜드·상호·서비스명",
  pet: "반려동물 이름",
  stage: "활동명·예명·닉네임",
  korean_to_foreign: "한국이름 → 외국이름 변환",
  foreign_to_korean: "외국이름 → 한국이름 변환",
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getIp(req: Request): string {
  const fwd = (req as unknown as { headers: { get: (k: string) => string | null } })
    .headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "unknown";
}

async function isUserPaid(userId: string): Promise<boolean> {
  try {
    const { data } = await getAdminClient()
      .from("user_plans")
      .select("plan, plan_expires_at")
      .eq("user_id", userId)
      .single();
    if (!data || data.plan === "free") return false;
    if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) return false;
    return true;
  } catch {
    return false;
  }
}

function stripTags(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawBrief = body?.brief ?? body;
    const userId: string | undefined = typeof body?.userId === "string" ? body.userId : undefined;
    const excludeNames: string[] = Array.isArray(body?.excludeNames) ? body.excludeNames : [];

    // XSS / 입력값 sanitize
    const brief = rawBrief ? {
      ...rawBrief,
      targetName: stripTags(rawBrief.targetName),
      familyName: stripTags(rawBrief.familyName),
      purpose: stripTags(rawBrief.purpose),
      styleKeywords: stripTags(rawBrief.styleKeywords),
      avoidKeywords: stripTags(rawBrief.avoidKeywords),
      memo: stripTags(rawBrief.memo),
    } : rawBrief;

    if (!brief || !brief.purpose) {
      return new Response(
        `data: ${JSON.stringify({ error: "brief missing" })}\n\n`,
        { status: 400, headers: { "Content-Type": "text/event-stream" } }
      );
    }

    // ─── Rate limiting ────────────────────────────────────────
    const ip = getIp(req);
    const paid = userId ? await isUserPaid(userId) : false;

    if (!paid) {
      const upstash = getFreeLimiter();
      if (upstash) {
        // Upstash 슬라이딩 윈도우: 시간당 5회 (연결 실패 시 in-memory 폴백)
        try {
          const { success, remaining } = await upstash.limit(`naming:${ip}`);
          if (!success) {
            return new Response(
              `data: ${JSON.stringify({ error: "rate_limit", message: "시간당 5회 한도 초과. 잠시 후 다시 시도해 주세요." })}\n\n`,
              { status: 429, headers: { "Content-Type": "text/event-stream", "X-RateLimit-Remaining": String(remaining) } }
            );
          }
        } catch {
          // Upstash 연결 실패 → in-memory 폴백으로 계속 진행
          const { allowed } = rateLimit(`naming:${ip}`, 5, 3600);
          if (!allowed) {
            return new Response(
              `data: ${JSON.stringify({ error: "rate_limit", message: "시간당 5회 한도 초과. 잠시 후 다시 시도해 주세요." })}\n\n`,
              { status: 429, headers: { "Content-Type": "text/event-stream" } }
            );
          }
        }
      } else {
        // Upstash 미설정 → in-memory 폴백: 시간당 5회
        const { allowed } = rateLimit(`naming:${ip}`, 5, 3600);
        if (!allowed) {
          return new Response(
            `data: ${JSON.stringify({ error: "rate_limit", message: "시간당 5회 한도 초과. 잠시 후 다시 시도해 주세요." })}\n\n`,
            { status: 429, headers: { "Content-Type": "text/event-stream" } }
          );
        }
      }
    }
    // ─────────────────────────────────────────────────────────

    const {
      familyName = "",
      category = "child",
      purpose,
      styleKeywords,
      avoidKeywords = "",
      memo = "",
      targetCountry = "한국",
      preferredScript = "한글",
      targetName = "",
      lang = "ko",
      birthDate = "",
      birthTime = "",
      childOrder = "",
      gender = "",
    } = brief;

    // ─── 카테고리별 프롬프트 분기 ────────────────────────────
    const isKTF   = category === "korean_to_foreign";
    const isBrand = category === "brand";

    // ─── 사주 오행 계산 (child 카테고리, birthDate 있을 때) ───
    const sajuText = (category === "child" && birthDate)
      ? (() => {
          const saju = calcSaju(birthDate, birthTime || undefined);
          return saju ? sajuToPromptText(saju) : "";
        })()
      : "";

    const brandSystemPrompt = `당신은 글로벌 브랜드 네이밍 전문가이자 상표 전략가입니다.

[브랜드 네이밍 철학]
이름은 브랜드의 첫 번째 마케팅입니다. 기억에 남고, 발음하기 쉽고, 트레이드마크로 보호받을 수 있어야 합니다.

[핵심 설계 원칙]
1. 글로벌 발음 가능성 — 한국어·영어·중국어·일본어 화자 모두 쉽게 발음 가능한 이름 우선
2. 상표 차별성 — 기존 유명 브랜드와 유사하거나 충돌 가능성이 있는 이름 회피
3. 도메인 가용성 — .com 도메인 확보 가능성 고려 (짧고 독특한 이름 선호)
4. 기억 용이성 — 2음절 또는 3음절, 반복 패턴, 강한 모음 조합 선호
5. 확장 가능성 — 브랜드가 성장해도 카테고리를 제한하지 않는 이름
6. 의미 안전성 — 세계 주요 언어에서 부정적·저속한 의미 없음 확인
7. 3방향 트랙: rank_order 1=안정형(safe·검증된 스타일), 2=세련형(refined·세련되고 현대적), 3=창의형(creative·독창적·미래지향적)

[브랜드명 유형 예시]
- 조어형(invented): Kodak, Häagen-Dazs, Xerox
- 의미형(meaningful): Apple, Amazon, Nest
- 축약형(abbreviated): IBM, BMW, KFC
- 감성형(evocative): Dove, Kindle, Slack
- 고유명(proper noun): Tesla, Nike, Adidas

반드시 유효한 JSON 배열만 반환하세요. 마크다운 코드블록, 주석, 다른 텍스트는 절대 포함하지 마세요.`;

    const brandUserPrompt = `아래 조건으로 브랜드명 후보 3개를 설계해주세요.

[입력 조건]
- 브랜드/서비스 성격: ${purpose}
- 원하는 분위기·키워드: ${styleKeywords || "없음"}
- 피하고 싶은 느낌·단어: ${avoidKeywords || "없음"}
- 주 타깃 국가/언어권: ${targetCountry || "글로벌"}
- 표기 방향: ${preferredScript || "한글+영문 병행"}
- 추가 요청: ${memo || "없음"}
- UI 언어: ${lang}
${excludeNames.length > 0 ? `- 제외할 이름 (이미 제안한 이름, 반드시 다른 이름 설계): ${excludeNames.join(", ")}` : ""}

[출력 형식 — JSON 배열만, 순수 텍스트로]
[
  {
    "rank_order": 1,
    "track": "safe",
    "name": "브랜드명 (메인 표기)",
    "hanja": "",
    "hanja_meaning": "",
    "hanja_strokes": "",
    "five_elements": "",
    "yinyang": "",
    "english": "영문 표기",
    "chinese": "중문 표기 (음차)",
    "chinese_pinyin": "병음",
    "japanese_kana": "가나 표기",
    "japanese_reading": "로마자 읽기",
    "meaning": "브랜드명의 의미·어원·유래 (2-3문장)",
    "story": "이 이름이 브랜드 정체성을 어떻게 담는지: 발음·기억·확장성·차별성 관점 (3-4문장)",
    "fit_reason": "안정형 트랙으로 선정한 이유 — 시장 내 포지셔닝 관점 (1-2문장)",
    "phonetic_harmony": "글로벌 발음 용이성 분석 — 주요 언어권별 발음 평가 (1-2문장)",
    "teasing_risk": "low",
    "similarity_risk": "low",
    "pronunciation_risk": "low",
    "caution": "상표 등록 또는 도메인 확보 시 주의사항 (1문장)",
    "connection_analysis": "입력하신 브랜드 성격·분위기·타깃 조건이 이 이름에 구체적으로 어떻게 반영되었는지 2-3문장",
    "score": 95
  },
  { "rank_order": 2, "track": "refined", ... },
  { "rank_order": 3, "track": "creative", ... }
]`;

    const systemPrompt = isBrand
      ? brandSystemPrompt
      : isKTF
      ? `당신은 한국 이름의 의미와 철학을 세계 언어로 아름답게 재탄생시키는 전문가입니다.

[작명 철학]
발음이 아닌 의미로 잇는 이름 설계. 한국 이름의 정수를 세계 무대에 전달합니다.

[작명 원칙]
1. 한국 이름의 발음은 참고만 한다 — 발음 비슷한 외국 이름을 찾는 것이 아님
2. 이름의 뜻과 의미를 핵심으로 반영한다 — 한국 이름이 담은 가치관·바람·철학을 외국어로 재해석
3. 해당 언어권에서 자연스럽게 통용되는 실존 이름을 생성한다 — 조어(造語)가 아닌 실제 사용되는 이름
4. 발음이 달라도 의미가 통하는 이름 우선 선정
5. 각 이름마다 한국 이름과의 의미적 연결고리를 구체적으로 설명한다
6. 3방향 트랙: rank_order 1=가장 자연스러운(safe), 2=세련된(refined), 3=독특한(creative)

[성별 작명 원칙 — 필수 준수]
- 여자(female): 해당 언어권에서 명확히 여성 이름으로 인식되는 이름만 추천
  예) 일본어: 하루카(春花), 유이(結衣), 아오이(葵) — 시즈카(静香)는 여성명이나 남성명과 혼용되므로 주의
  예) 영어: Sophie, Emma, Claire 계열
  예) 중국어: 怡, 雯, 婷 계열 이름
- 남자(male): 해당 언어권에서 명확히 남성 이름으로 인식되는 이름만 추천
- 중성(neutral): 성별 구분 없이 사용 가능한 젠더 뉴트럴 이름
- 성별 미지정: 해당 언어권에서 가장 자연스럽고 보편적인 이름 추천

성별이 지정된 경우, 해당 언어권의 문화·관습에서 그 성별로 명확히 인식되는 이름만 선정할 것.
성별이 애매한 이름(예: 일본어의 남녀 공용명)은 caution 필드에 반드시 명시할 것.

반드시 유효한 JSON 배열만 반환하세요. 마크다운 코드블록, 주석, 다른 텍스트는 절대 포함하지 마세요.`
      : `당신은 대한민국 최고 수준의 작명 전문가이자 성명학·명리학·한자학 전문가입니다.

[작명 철학]
이름은 평생의 선물입니다. 단순 생성이 아닌 정밀 설계입니다.

[핵심 설계 원칙]
1. 성씨+이름 음운 조화 — 성씨의 종성·두음·운율을 분석하여 전체 이름이 자연스럽고 리듬감 있게 흐르도록 설계
2. 한자 오행 획수 분석 (필수) — 각 한자의 정확한 획수와 오행(木火土金水)을 반드시 명시하고, 이름 전체 오행의 상생/상극 관계를 분석할 것
   - 오행 상생: 木→火→土→金→水→木 (이름에 반영 권장)
   - 오행 상극: 木→土, 火→金, 土→水, 金→木, 水→火 (가능하면 회피)
   - 획수 음양: 홀수=陽, 짝수=陰 — 이름 전체 획수의 음양 균형 검토
3. 발음오행 (자음 기준): ㄱㅋ=木, ㄴㄷㅌㄹ=火, ㅇㅎ=土, ㅅㅈㅊ=金, ㅁㅂㅍ=水
   — 한자 오행과 발음 오행이 일치하거나 상생 관계이면 더욱 좋은 이름
4. 놀림감·발음 어색함 필터링 — 동물명·욕설·부정적 연상·발음 꼬임·이중 의미를 완전 차단
5. 흔한 이름 배제 — 도윤·서준·하준·지우·하윤·지호·시우 등 출생 빈출 이름 사용 금지
6. 3방향 트랙 분리 — rank_order 1=안정형(safe), 2=세련형(refined), 3=창의형(creative)으로 각기 다른 방향성 설계

[한자 획수 작성 규칙]
- hanja_strokes 필드 예시: "旻(8획,火,陰)+俊(9획,木,陽)=17획(陽)"
- five_elements 필드 예시: "火木 상생 조화 — 화생목(火生木) / 발음오행: ㅁ(水)·ㅈ(金) 상생"
- yinyang 필드 예시: "陽 (총획 17획, 홀수)" 또는 "陰 (총획 14획, 짝수)"
- 획수가 불확실한 한자는 절대 임의로 기재하지 말고, 가장 많이 쓰이는 이름용 한자를 선택할 것

[성별 작명 원칙]
- 남성(남자/male): 강하고 듬직한 느낌의 이름
  예시 스타일 → "오태현", "김민준", "박도윤"
  한자: 강할 강(强), 클 대(大), 빛날 환(煥), 굳셀 건(健), 씩씩할 웅(雄) 계열 우선
  음운: 받침이 있는 묵직한 음절 선호 (현·준·민·혁·진·우 등)

- 여성(여자/female): 우아하고 섬세한 느낌의 이름
  예시 스타일 → "이아영", "김서연", "박지윤"
  한자: 아름다울 미(美), 빛날 영(英), 봄 춘(春), 맑을 청(淸), 부드러울 유(柔) 계열 우선
  음운: 모음이 풍부하고 부드러운 음절 선호 (연·윤·아·서·혜·나 등)

- 중성(neutral): 부드럽고 현대적인 느낌
  예시 스타일 → "조하린", "김다온", "이새벽"
  한자: 밝을 하(夏), 이슬 린(璘), 새벽 새(曙), 온화할 온(溫), 모을 집(集) 계열 우선
  음운: 성별 구분 없이 자연스러운 현대 한국어 이름

성별이 지정된 경우 반드시 해당 성별에 맞는 계열의 한자와 이름 구성을 사용할 것.
성별이 다른 요청이라면 이름 구성과 한자 선택이 반드시 달라야 한다.
성씨와의 음운 조화를 최우선으로 검토하고, 발음이 자연스럽게 이어지는 이름만 추천할 것.

반드시 유효한 JSON 배열만 반환하세요. 마크다운 코드블록, 주석, 다른 텍스트는 절대 포함하지 마세요.`;

    const ktfUserPrompt = `아래 한국 이름을 의미 중심으로 외국어 이름 후보 3개로 재탄생시켜주세요.

[입력 조건]
- 한국 이름 (참고용): ${targetName || "없음"}
- 이름의 뜻/의미 (핵심 반영 요소): ${purpose}
- 성별: ${gender || "미지정"} ← 반드시 성별에 맞는 이름만 추천할 것 (여자=여성 이름, 남자=남성 이름, 중성=젠더 뉴트럴)
- 원하는 언어권: ${targetCountry || styleKeywords || "영어권"}
- 원하는 분위기: ${styleKeywords || "없음"}
- 추가 메모: ${memo || "없음"}
- UI 언어: ${lang}
${excludeNames.length > 0 ? `- 제외할 이름 (이미 제안한 이름, 반드시 다른 이름 설계): ${excludeNames.join(", ")}` : ""}

[출력 형식 — JSON 배열만, 순수 텍스트로]
[
  {
    "rank_order": 1,
    "track": "safe",
    "name": "외국이름 (메인으로 표시될 이름)",
    "hanja": "",
    "hanja_meaning": "",
    "hanja_strokes": "",
    "five_elements": "",
    "english": "현지 발음 표기 (로마자)",
    "chinese": "한국어로 읽으면 (음차)",
    "chinese_pinyin": "",
    "japanese_kana": "${targetCountry || styleKeywords || "영어"}",
    "japanese_reading": "언어명 예: English / Français / 日本語",
    "meaning": "이름의 의미 (2-3문장)",
    "story": "한국 이름 '${targetName || "해당 이름"}'과의 의미적 연결 설명 (3-4문장) — 왜 이 이름이 한국 이름의 정수를 담는지",
    "fit_reason": "이 트랙(가장 자연스러운)으로 선정한 이유 (1-2문장)",
    "phonetic_harmony": "해당 언어권에서의 사용 적합성 (1문장)",
    "teasing_risk": "low",
    "similarity_risk": "low",
    "pronunciation_risk": "low",
    "caution": "이 이름을 선물받는 당신에게 — 짧은 선물 메시지 (1문장)",
    "connection_analysis": "한국 이름의 의미·가치관이 어떻게 이 외국 이름으로 재탄생했는지 구체적 설명 (2-3문장)",
    "score": 95
  },
  { "rank_order": 2, "track": "refined", ... },
  { "rank_order": 3, "track": "creative", ... }
]`;

    const standardUserPrompt = `아래 조건으로 이름 후보 3개를 설계해주세요.

[입력 조건]
- 카테고리: ${CATEGORY_LABEL[category] ?? category}
- 이름 대상: ${targetName || "없음"}
- 성별: ${gender || "미지정"}
- 성씨: ${familyName || "없음"}
- 목적: ${purpose}
- 원하는 분위기: ${styleKeywords || "없음"}
- 피하고 싶은 느낌: ${avoidKeywords || "없음"}
- 주 사용 국가/언어권: ${targetCountry}
- 표기 방향: ${preferredScript}
- 추가 메모: ${memo || "없음"}
- 아이 순서: ${childOrder || "없음"}
- 생년월일: ${birthDate || "미입력"}
- 태어난 시간: ${birthTime || "미입력"}
- UI 언어: ${lang}
${excludeNames.length > 0 ? `- 제외할 이름 (이미 제안한 이름, 반드시 다른 이름 설계): ${excludeNames.join(", ")}` : ""}
${sajuText ? `\n${sajuText}` : ""}

[출력 형식 — JSON 배열만, 순수 텍스트로]
[
  {
    "rank_order": 1,
    "track": "safe",
    "name": "한글이름",
    "hanja": "漢字 (해당 없으면 빈 문자열)",
    "hanja_meaning": "한자 각 글자의 뜻 (예: 旻=가을하늘 민, 俊=준걸 준)",
    "hanja_strokes": "획수 상세 (예: 旻(8획,火,陰)+俊(9획,木,陽)=17획(陽))",
    "five_elements": "오행 분석 (예: 火木 상생 — 화생목(火生木) / 발음오행: ㅁ(水)·ㅈ(金) 상생)",
    "yinyang": "음양 판단 (예: 陽 — 총획 17획 홀수 / 또는 陰 — 총획 14획 짝수)",
    "english": "로마자 표기",
    "chinese": "중문 표기",
    "chinese_pinyin": "병음",
    "japanese_kana": "가나 표기",
    "japanese_reading": "로마자 읽기",
    "meaning": "이름 전체 의미 (2-3문장)",
    "story": "설계 배경: 성씨 음운 조화·한자 오행·획수 음양·사주 보완·방향성 포함 (3-4문장)",
    "fit_reason": "이 트랙(안정형)으로 선정한 이유 (2문장)",
    "phonetic_harmony": "성씨+이름 음운 조화 분석 + 발음오행 (1-2문장)",
    "teasing_risk": "low",
    "similarity_risk": "low",
    "pronunciation_risk": "low",
    "caution": "주의사항 (1문장)",
    "connection_analysis": "입력하신 목적·분위기·성씨 조건이 이 이름에 구체적으로 어떻게 반영되었는지 2-3문장 설명",
    "score": 95
  },
  { "rank_order": 2, "track": "refined", ... },
  { "rank_order": 3, "track": "creative", ... }
]`;

    const userPrompt = isBrand ? brandUserPrompt : isKTF ? ktfUserPrompt : standardUserPrompt;

    const streamResponse = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 2200,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        // ── 증분 JSON 파싱 상태 ───────────────────────────────
        let inArray = false;   // '[' 를 만났는지
        let inString = false;  // 문자열 내부인지
        let escape = false;    // 이스케이프 문자 다음인지
        let braceDepth = 0;    // 현재 중괄호 깊이
        let objectStart = 0;   // 현재 name 객체 시작 위치
        let namesSent = 0;     // 전송한 이름 수

        try {
          for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (!delta) continue;

            // 한 글자씩 파싱해서 완성된 이름 객체 즉시 전송
            for (const char of delta) {
              const pos = fullText.length;
              fullText += char;

              // 이스케이프 처리
              if (escape) { escape = false; continue; }
              if (char === "\\" && inString) { escape = true; continue; }

              // 문자열 경계
              if (char === '"') { inString = !inString; continue; }
              if (inString) continue;

              // 배열 시작 '[' 이전은 무시
              if (!inArray) {
                if (char === "[") inArray = true;
                continue;
              }

              // 중괄호 깊이 추적
              if (char === "{") {
                if (braceDepth === 0) objectStart = pos; // name 객체 시작
                braceDepth++;
              } else if (char === "}") {
                braceDepth--;
                if (braceDepth === 0) {
                  // name 객체 하나 완성 → 즉시 파싱 후 전송
                  const objStr = fullText.slice(objectStart);
                  try {
                    const nameObj = JSON.parse(objStr);
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ name: nameObj, index: namesSent })}\n\n`
                      )
                    );
                    namesSent++;
                  } catch {
                    // 파싱 실패 시 done 이벤트 fallback 에서 처리
                  }
                }
              }
            }
          }

          // 최종 전체 파싱 (fallback + done 신호)
          const cleaned = fullText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const results = JSON.parse(cleaned);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, results })}\n\n`)
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "parse failed";
          console.error("[naming stream error]", msg, "\nRaw:", fullText.slice(0, 400));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
      cancel() {
        streamResponse.controller.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[naming route error]", error);
    return new Response(
      `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
      { status: 500, headers: { "Content-Type": "text/event-stream" } }
    );
  }
}
