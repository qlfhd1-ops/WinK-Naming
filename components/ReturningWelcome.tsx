"use client";

import { useMemo } from "react";
import type { WinkRelationship } from "@/lib/relationship";

type Lang = "ko" | "en" | "ja" | "zh" | "es";

type Props = {
  lang: Lang;
  relationship: WinkRelationship;
};

function getGiftTargetLabel(raw?: string) {
  if (!raw) return "";
  return raw;
}

export default function ReturningWelcome({ lang, relationship }: Props) {
  const copy = useMemo(() => {
    const lastTarget = getGiftTargetLabel(relationship.lastGiftTargetLabel);
    const lastName = relationship.lastName || "";

    const map = {
      ko: {
        title:
          relationship.visitCount <= 1
            ? "처음 와주셔서 감사합니다"
            : "다시 찾아와 주셔서 감사합니다",
        desc:
          relationship.visitCount <= 1
            ? "윙크 네이밍은 이름을 검색하는 곳이 아니라, 누군가의 시작을 응원하는 마음으로 이름을 선물하는 곳입니다."
            : lastName
              ? `지난번 ${lastTarget ? `${lastTarget} ` : ""}선물하셨던 이름 “${lastName}”을 기억하고 있습니다. 다시 와주셔서 반갑습니다.`
              : "당신이 다시 찾아와 주신 것을 윙크 네이밍은 소중하게 기억합니다.",
        badge:
          relationship.visitCount <= 1
            ? "First Visit"
            : `Returning · ${relationship.visitCount}번째 방문`,
        note:
          relationship.visitCount >= 3
            ? "자주 방문해주시는 당신께는 앞으로 더 따뜻한 혜택과 선물을 준비하겠습니다."
            : "이름은 한 번의 검색보다, 한 사람의 마음에서 더 오래 남습니다.",
      },
      en: {
        title:
          relationship.visitCount <= 1
            ? "Thank you for your first visit"
            : "Thank you for coming back",
        desc:
          relationship.visitCount <= 1
            ? "윙크 네이밍 is not just a place to search names. It is where names are designed and gifted for meaningful beginnings."
            : lastName
              ? `We remember the name gift “${lastName}”${lastTarget ? ` for ${lastTarget}` : ""}. We are glad to welcome you back.`
              : "윙크 네이밍 remembers that you chose to return.",
        badge:
          relationship.visitCount <= 1
            ? "First Visit"
            : `Returning · Visit ${relationship.visitCount}`,
        note:
          relationship.visitCount >= 3
            ? "We will prepare warmer benefits and gifts for loyal visitors."
            : "A name stays longer than a search. It stays in someone’s heart.",
      },
      ja: {
        title:
          relationship.visitCount <= 1
            ? "初めてのご訪問ありがとうございます"
            : "また来てくださってありがとうございます",
        desc:
          relationship.visitCount <= 1
            ? "윙크 네이밍は名前を検索する場所ではなく、誰かの始まりを応援する気持ちで名前を贈る場所です。"
            : lastName
              ? `前回${lastTarget ? `${lastTarget}へ ` : ""}贈られた名前「${lastName}」を覚えています。再訪ありがとうございます。`
              : "再び訪れてくださったことを、윙크 네이밍は大切に覚えています。",
        badge:
          relationship.visitCount <= 1
            ? "First Visit"
            : `Returning · ${relationship.visitCount}回目`,
        note:
          relationship.visitCount >= 3
            ? "よく訪れてくださるあなたのために、よりあたたかな特典を準備していきます。"
            : "名前は一度の検索より、誰かの心に長く残ります。",
      },
      zh: {
        title:
          relationship.visitCount <= 1
            ? "感谢你的第一次到来"
            : "感谢你再次回来",
        desc:
          relationship.visitCount <= 1
            ? "윙크 네이밍 不是单纯搜索名字的地方，而是为某个重要开始送上名字礼物的平台。"
            : lastName
              ? `我们记得你上次${lastTarget ? `送给${lastTarget}的` : ""}名字礼物“${lastName}”。欢迎再次回来。`
              : "윙크 네이밍 会记得你再次回来了。",
        badge:
          relationship.visitCount <= 1
            ? "First Visit"
            : `Returning · 第${relationship.visitCount}次访问`,
        note:
          relationship.visitCount >= 3
            ? "我们会为常来访问的你准备更温暖的礼遇与礼物。"
            : "名字留在心里的时间，往往比一次搜索更久。",
      },
      es: {
        title:
          relationship.visitCount <= 1
            ? "Gracias por tu primera visita"
            : "Gracias por volver",
        desc:
          relationship.visitCount <= 1
            ? "윙크 네이밍 no es solo un lugar para buscar nombres. Es un lugar para diseñar y regalar nombres con intención."
            : lastName
              ? `Recordamos el nombre regalo “${lastName}”${lastTarget ? ` para ${lastTarget}` : ""}. Nos alegra verte de nuevo.`
              : "윙크 네이밍 recuerda que has vuelto.",
        badge:
          relationship.visitCount <= 1
            ? "First Visit"
            : `Returning · Visita ${relationship.visitCount}`,
        note:
          relationship.visitCount >= 3
            ? "Prepararemos beneficios y regalos más cálidos para quienes vuelven a visitarnos."
            : "Un nombre permanece más tiempo que una simple búsqueda.",
      },
    } as const;

    return map[lang];
  }, [lang, relationship]);

  return (
    <section
      style={{
        padding: 24,
        borderRadius: 24,
        background:
          "radial-gradient(circle at top left, rgba(212,175,55,0.12), transparent 26%), linear-gradient(180deg, rgba(18,28,43,0.96), rgba(13,20,33,0.96))",
        border: "1px solid rgba(212,175,55,0.14)",
        boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(212,175,55,0.12)",
          color: "#f3d377",
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 12,
        }}
      >
        {copy.badge}
      </div>

      <h2 style={{ fontSize: 28, lineHeight: 1.25, marginBottom: 12 }}>
        {copy.title}
      </h2>

      <p style={{ opacity: 0.9, lineHeight: 1.8, marginBottom: 12 }}>
        {copy.desc}
      </p>

      <p style={{ opacity: 0.72, lineHeight: 1.8 }}>
        {copy.note}
      </p>
    </section>
  );
}