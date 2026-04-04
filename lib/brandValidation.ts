export type BrandValidationSummary = {
  normalizedName: string;
  duplicateRisk: "low" | "medium" | "high";
  uniquenessScore: number;
  searchHitsEstimate: number;
  recommendation: string;
  suggestedDomains: string[];
};

export function normalizeBrandName(name: string) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function scoreDuplicateRisk(searchHitsEstimate: number): {
  duplicateRisk: "low" | "medium" | "high";
  uniquenessScore: number;
} {
  if (searchHitsEstimate <= 3) {
    return { duplicateRisk: "low", uniquenessScore: 90 };
  }

  if (searchHitsEstimate <= 10) {
    return { duplicateRisk: "medium", uniquenessScore: 72 };
  }

  return { duplicateRisk: "high", uniquenessScore: 48 };
}

export function buildSuggestedDomains(name: string) {
  const n = normalizeBrandName(name);
  if (!n) return [];

  return [`${n}.com`, `${n}.co.kr`, `${n}.ai`, `${n}.kr`];
}

export function buildRecommendation(
  duplicateRisk: "low" | "medium" | "high",
  searchHitsEstimate: number
) {
  if (duplicateRisk === "low") {
    return `검색 기반으로 볼 때 중복 리스크가 낮은 편입니다. 초기 브랜드 후보로 검토할 가치가 있습니다. 검색 노출 추정 ${searchHitsEstimate}건`;
  }

  if (duplicateRisk === "medium") {
    return `검색 결과가 어느 정도 존재합니다. 동일·유사 브랜드가 있을 수 있으므로 상표와 상호를 추가 확인하는 것이 좋습니다. 검색 노출 추정 ${searchHitsEstimate}건`;
  }

  return `이미 유사하게 쓰이는 표현일 가능성이 높습니다. 차별화된 대안명을 함께 검토하는 것이 안전합니다. 검색 노출 추정 ${searchHitsEstimate}건`;
}

export function buildBrandValidationSummary(
  name: string,
  searchHitsEstimate: number
): BrandValidationSummary {
  const normalizedName = normalizeBrandName(name);
  const { duplicateRisk, uniquenessScore } =
    scoreDuplicateRisk(searchHitsEstimate);

  return {
    normalizedName,
    duplicateRisk,
    uniquenessScore,
    searchHitsEstimate,
    recommendation: buildRecommendation(duplicateRisk, searchHitsEstimate),
    suggestedDomains: buildSuggestedDomains(name),
  };
}