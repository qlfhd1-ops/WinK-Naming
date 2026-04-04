"use client";

import { useEffect, useMemo, useState } from "react";

type Lang = "ko" | "en" | "ja" | "zh" | "es";

type Props = {
  visible: boolean;
  lang: Lang;
};

type Particle = {
  id: number;
  size: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
};

export default function YoonseulNameBirth({ visible, lang }: Props) {
  const [phase, setPhase] = useState<"float" | "gather" | "reveal">("float");

  useEffect(() => {
    if (!visible) {
      setPhase("float");
      return;
    }

    setPhase("float");

    const t1 = setTimeout(() => setPhase("gather"), 900);
    const t2 = setTimeout(() => setPhase("reveal"), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  const copy = {
    ko: {
      line1: "윤슬 같은 빛을 모으는 중입니다",
      line2: "당신의 마음에서 시작된 이름을 다듬고 있습니다",
      line3: "이름이 곧 모습을 드러냅니다",
      center: "윙크 네이밍",
    },
    en: {
      line1: "Gathering light like shimmering water",
      line2: "Refining a name that began from your heart",
      line3: "The name is about to appear",
      center: "윙크 네이밍",
    },
    ja: {
      line1: "水面のきらめきのような光を集めています",
      line2: "あなたの心から始まった名前を整えています",
      line3: "まもなく名前が姿を現します",
      center: "윙크 네이밍",
    },
    zh: {
      line1: "正在汇聚如波光般闪烁的光",
      line2: "正在打磨一个从你心意出发的名字",
      line3: "名字即将显现",
      center: "윙크 네이밍",
    },
    es: {
      line1: "Reuniendo luces como reflejos sobre el agua",
      line2: "Afinando un nombre que nació de tu corazón",
      line3: "El nombre está a punto de aparecer",
      center: "윙크 네이밍",
    },
  } as const;

  const t = copy[lang];

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      size: 4 + (i % 5) * 2,
      top: 8 + ((i * 13) % 80),
      left: 6 + ((i * 19) % 88),
      delay: (i % 9) * 0.12,
      duration: 2.8 + (i % 6) * 0.35,
      opacity: 0.35 + ((i % 5) * 0.12),
    }));
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background:
          "radial-gradient(circle at center, rgba(24,34,50,0.84) 0%, rgba(10,14,24,0.96) 68%, rgba(7,10,18,0.98) 100%)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(92vw, 720px)",
          minHeight: "min(74vh, 620px)",
          borderRadius: 32,
          overflow: "hidden",
          border: "1px solid rgba(212,175,55,0.14)",
          background:
            "linear-gradient(180deg, rgba(18,28,43,0.72), rgba(10,16,28,0.76))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(212,175,55,0.12), transparent 34%)",
            opacity: phase === "reveal" ? 1 : 0.75,
            transition: "opacity 800ms ease",
          }}
        />

        {particles.map((p) => {
          const gatherTop = 50 + ((p.id % 6) - 3) * 1.2;
          const gatherLeft = 50 + ((p.id % 8) - 4) * 1.6;

          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,244,200,0.98) 0%, rgba(212,175,55,0.9) 48%, rgba(212,175,55,0.08) 100%)",
                boxShadow:
                  "0 0 10px rgba(255,240,180,0.58), 0 0 22px rgba(212,175,55,0.2)",
                top: `${phase === "gather" || phase === "reveal" ? gatherTop : p.top}%`,
                left: `${phase === "gather" || phase === "reveal" ? gatherLeft : p.left}%`,
                opacity: phase === "reveal" ? 0.18 : p.opacity,
                transform:
                  phase === "reveal"
                    ? "translate(-50%, -50%) scale(0.7)"
                    : "translate(-50%, -50%) scale(1)",
                transition: `top 1400ms cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s, left 1400ms cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s, opacity 1000ms ease ${p.delay}s, transform 1200ms ease ${p.delay}s`,
                animation:
                  phase === "float"
                    ? `winkFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
                    : undefined,
              }}
            />
          );
        })}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              width: 124,
              height: 124,
              borderRadius: "50%",
              border: "1px solid rgba(212,175,55,0.22)",
              background:
                "radial-gradient(circle, rgba(255,244,200,0.14) 0%, rgba(212,175,55,0.08) 52%, rgba(212,175,55,0.02) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 26,
              boxShadow:
                phase === "reveal"
                  ? "0 0 42px rgba(212,175,55,0.3)"
                  : "0 0 20px rgba(212,175,55,0.14)",
              transition: "all 700ms ease",
            }}
          >
            <div
              style={{
                color: "#f0d27b",
                fontWeight: 800,
                letterSpacing: "0.06em",
                fontSize: 14,
              }}
            >
              {t.center}
            </div>
          </div>

          <div
            style={{
              color: "white",
              fontSize: "clamp(22px, 4vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.28,
              marginBottom: 14,
              maxWidth: 520,
            }}
          >
            {phase === "float" && t.line1}
            {phase === "gather" && t.line2}
            {phase === "reveal" && t.line3}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "clamp(13px, 2vw, 15px)",
              lineHeight: 1.8,
              maxWidth: 520,
            }}
          >
            {lang === "ko"
              ? "너무 빠르지 않게, 너무 가볍지 않게.\n누군가의 시작에 어울리는 이름을 정성껏 모으고 있습니다."
              : "Not too fast, not too light.\nWe are gathering a name with care for a meaningful beginning."}
          </div>
        </div>

        <style jsx>{`
          @keyframes winkFloat {
            0% {
              transform: translate(-50%, -50%) translateY(0px) scale(1);
            }
            100% {
              transform: translate(-50%, -50%) translateY(-10px) scale(1.08);
            }
          }
        `}</style>
      </div>
    </div>
  );
}