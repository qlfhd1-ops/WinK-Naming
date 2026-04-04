import { NextResponse } from "next/server";
import {
  buildBrandValidationSummary,
} from "@/lib/brandValidation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // 1차 버전:
    // 실제 검색 API 연동 전까지는 간단한 규칙 기반 추정치를 사용
    // 이후 2차에서 네이버/구글/KIPRIS/도메인 API로 대체
    const searchHitsEstimate = estimateSearchHits(name);

    const summary = buildBrandValidationSummary(name, searchHitsEstimate);

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "brand validation failed",
      },
      { status: 500 }
    );
  }
}

function estimateSearchHits(name: string) {
  const n = name.trim();

  // 1차 휴리스틱
  // 짧고 일반적인 단어일수록 중복 리스크를 높게 봄
  if (n.length <= 2) return 18;
  if (n.length === 3) return 11;

  const genericKorean = [
    "행복",
    "미래",
    "우리",
    "좋은",
    "사랑",
    "빛",
    "한빛",
    "스마일",
    "드림",
    "플러스",
  ];

  const genericEnglish = [
    "nova",
    "luna",
    "prime",
    "smart",
    "bright",
    "best",
    "plus",
    "dream",
    "future",
  ];

  const lowered = n.toLowerCase();

  if (
    genericKorean.some((w) => n.includes(w)) ||
    genericEnglish.some((w) => lowered.includes(w))
  ) {
    return 13;
  }

  if (/^[a-zA-Z]+$/.test(n) && n.length <= 5) {
    return 9;
  }

  return 4;
}