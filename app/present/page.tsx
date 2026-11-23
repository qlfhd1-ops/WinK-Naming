import type { Metadata } from "next";
import { decodeGift } from "@/lib/gift-link";
import PresentClient from "./PresentClient";

/**
 * /present?d=<인코딩된 이름 데이터>
 * 이름카드 메일의 "🎁 선물 열기" 버튼이 여는 페이지. 로그인·DB 없이 링크의 공개 이름 정보만으로 열린다.
 */

type Props = { searchParams: Promise<{ d?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const d = Array.isArray(sp.d) ? sp.d[0] : sp.d;
  const gift = decodeGift(d);
  return {
    title: gift ? `🎁 ${gift.n} — Wink Naming` : "🎁 Wink Naming",
    description: "A Korean name, gift-wrapped for you.",
    robots: { index: false, follow: false },
  };
}

export default async function PresentPage({ searchParams }: Props) {
  const sp = await searchParams;
  const d = Array.isArray(sp.d) ? sp.d[0] : sp.d;
  return <PresentClient gift={decodeGift(d)} />;
}
