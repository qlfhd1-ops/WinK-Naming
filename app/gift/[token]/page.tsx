import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import GiftResultClient from "./GiftResultClient";

type NameResult = {
  rank_order: number;
  track: string;
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  hanja_strokes?: string;
  five_elements?: string;
  phonetic_harmony?: string;
  english?: string;
  chinese?: string;
  chinese_pinyin?: string;
  japanese_kana?: string;
  japanese_reading?: string;
  meaning?: string;
  story?: string;
  fit_reason?: string;
  teasing_risk?: string;
  similarity_risk?: string;
  pronunciation_risk?: string;
  caution?: string;
  connection_analysis?: string;
  score?: number;
};

type GiftData = {
  token: string;
  results: NameResult[];
  brief: Record<string, string> | null;
  lang: string;
  created_at: string;
  expires_at: string | null;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function fetchGift(token: string): Promise<GiftData | null> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("gifts")
      .select("token, results, brief, lang, created_at, expires_at")
      .eq("token", token)
      .single();

    if (error || !data) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    return data as GiftData;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const gift = await fetchGift(token);

  const top = gift?.results?.[0];
  const name    = top?.name    ?? "이름 선물";
  const hanja   = top?.hanja   ?? "";
  const meaning = top?.meaning ?? "";

  const ogUrl = `/api/og?name=${encodeURIComponent(name)}&hanja=${encodeURIComponent(hanja)}&meaning=${encodeURIComponent(meaning)}`;

  return {
    title: `${name} — 윙크 네이밍`,
    description: meaning ? meaning.slice(0, 120) : "AI가 설계한 특별한 이름을 확인해보세요.",
    openGraph: {
      title: `${name} — 윙크 네이밍`,
      description: meaning ? meaning.slice(0, 120) : "AI가 설계한 특별한 이름을 확인해보세요.",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — 윙크 네이밍`,
      description: meaning ? meaning.slice(0, 120) : "AI가 설계한 특별한 이름을 확인해보세요.",
      images: [ogUrl],
    },
  };
}

export default async function GiftPage({ params }: Props) {
  const { token } = await params;
  const gift = await fetchGift(token);

  if (!gift) notFound();

  return <GiftResultClient gift={gift} />;
}
