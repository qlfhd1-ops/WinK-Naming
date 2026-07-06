export type ShortlistItem = {
  id: string;
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  hanja_strokes?: string;
  five_elements?: string;
  phonetic_harmony?: string;
  meaning: string;
  story?: string;
  fit_reason?: string;
  english?: string;
  track: string;
  score: number;
  category?: string;
  lang?: string;
  savedAt: string;
};

const KEY = "wink-shortlist";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getShortlist(): ShortlistItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToShortlist(item: Omit<ShortlistItem, "id" | "savedAt">): boolean {
  const list = getShortlist();
  if (list.some((x) => x.name === item.name && x.category === item.category)) return false;
  const newItem: ShortlistItem = {
    ...item,
    id: `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([newItem, ...list].slice(0, 20)));
  return true;
}

export function removeFromShortlist(id: string) {
  const list = getShortlist().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearShortlist() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}

export function isInShortlist(name: string, category?: string): boolean {
  return getShortlist().some((x) => x.name === name && (category ? x.category === category : true));
}

export function getShortlistCount(): number {
  return getShortlist().length;
}
