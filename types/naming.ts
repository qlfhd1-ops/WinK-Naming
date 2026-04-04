export type NamingRequest = {
  id: string;
  purpose: string;
  gender: string | null;
  family_name: string | null;
  style_keywords: string | null;
  avoid_keywords: string | null;
  memo: string | null;
  created_at: string;
  target_country: string | null;
  display_language: string | null;
};

export type GeneratedNameItem = {
  name: string;
  concept: string;
  score: number;
  tone: string;
  image: string;
  reason: string;
  caution: string;
  summary: string;
  alternatives: string[];
};