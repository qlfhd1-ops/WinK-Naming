export const WINK_RELATIONSHIP_KEY = "wink_relationship_v1";

export type WinkRelationship = {
  visitCount: number;
  lastCategory?: string;
  lastName?: string;
  lastVisitedAt?: string;
  lastGiftTargetLabel?: string;
};

export function loadRelationship(): WinkRelationship {
  if (typeof window === "undefined") {
    return { visitCount: 0 };
  }

  try {
    const raw = localStorage.getItem(WINK_RELATIONSHIP_KEY);
    if (!raw) return { visitCount: 0 };
    const parsed = JSON.parse(raw);
    return {
      visitCount: Number(parsed.visitCount || 0),
      lastCategory: parsed.lastCategory || undefined,
      lastName: parsed.lastName || undefined,
      lastVisitedAt: parsed.lastVisitedAt || undefined,
      lastGiftTargetLabel: parsed.lastGiftTargetLabel || undefined,
    };
  } catch {
    return { visitCount: 0 };
  }
}

export function saveRelationship(next: WinkRelationship) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WINK_RELATIONSHIP_KEY, JSON.stringify(next));
}

export function touchVisit() {
  const current = loadRelationship();
  const next: WinkRelationship = {
    ...current,
    visitCount: current.visitCount + 1,
    lastVisitedAt: new Date().toISOString(),
  };
  saveRelationship(next);
  return next;
}

export function rememberGift(params: {
  category?: string;
  name?: string;
  targetLabel?: string;
}) {
  const current = loadRelationship();
  const next: WinkRelationship = {
    ...current,
    lastCategory: params.category || current.lastCategory,
    lastName: params.name || current.lastName,
    lastGiftTargetLabel: params.targetLabel || current.lastGiftTargetLabel,
    lastVisitedAt: new Date().toISOString(),
  };
  saveRelationship(next);
  return next;
}