"use client";

import { useEffect, useRef } from "react";

type Props = {
  title: string;
  subtitle: string;
  previewName?: string;
  isComplete?: boolean;
  statusMessage?: string;
};

// #1B2A5E navy, #C9A84C gold
const GOLD: [number, number, number] = [201, 168, 76];
const BLUE: [number, number, number] = [120, 160, 255];
const WHITE: [number, number, number] = [255, 248, 220];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  r: number;
  g: number;
  b: number;
  life: number;
  maxLife: number;
  mode: "converge" | "burst";
}

export default function NameGenerationScene({
  title,
  subtitle,
  previewName,
  isComplete = false,
  statusMessage,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const completeRef = useRef(false);
  const flashRef = useRef(0);
  const frameRef = useRef(0);

  // Main animation loop — runs once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const spawnConverge = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      let x: number, y: number;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * w; y = -8; }
      else if (edge === 1) { x = w + 8; y = Math.random() * h; }
      else if (edge === 2) { x = Math.random() * w; y = h + 8; }
      else { x = -8; y = Math.random() * h; }

      const dx = cx - x + (Math.random() - 0.5) * 60;
      const dy = cy - y + (Math.random() - 0.5) * 60;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 1.0 + Math.random() * 1.5;

      const isGold = Math.random() > 0.35;
      const [r, g, b] = isGold ? GOLD : BLUE;

      particlesRef.current.push({
        x, y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        size: isGold ? 2 + Math.random() * 3 : 1.2 + Math.random() * 2,
        alpha: 0.5 + Math.random() * 0.5,
        r, g, b,
        life: 0,
        maxLife: 0.95 + Math.random() * 0.05,
        mode: "converge",
      });
    };

    const spawnBurst = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < 140; i++) {
        const angle = (Math.PI * 2 * i) / 140 + (Math.random() - 0.5) * 0.25;
        const speed = 2.5 + Math.random() * 10;
        const isGold = Math.random() > 0.18;
        const [r, g, b] = isGold ? GOLD : WHITE;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 12,
          y: cy + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 4.5,
          alpha: 0.95,
          r, g, b,
          life: 0,
          maxLife: 0.9,
          mode: "burst",
        });
      }
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      frameRef.current++;
      const frame = frameRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // ── Background
      const bg = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, Math.max(w, h) * 0.8);
      bg.addColorStop(0, "#1B2A5E");
      bg.addColorStop(0.45, "#0F1B3E");
      bg.addColorStop(1, "#060D22");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── Spawn converge particles
      if (!completeRef.current && frame % 2 === 0) {
        spawnConverge();
      }

      // ── Pulsing core glow
      const t = frame / 60;
      const pulse = (Math.sin(t * 1.8) + 1) / 2;
      const coreR = 60 + pulse * 25;
      const outerR = 130 + pulse * 45;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      coreGrad.addColorStop(0, `rgba(255, 245, 190, ${0.35 + pulse * 0.25})`);
      coreGrad.addColorStop(0.15, `rgba(201, 168, 76, ${0.28 + pulse * 0.18})`);
      coreGrad.addColorStop(0.4, `rgba(27, 42, 94, ${0.12})`);
      coreGrad.addColorStop(1, "rgba(6, 13, 34, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Bright center dot
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 252, 230, ${0.6 + pulse * 0.35})`;
      ctx.fill();

      // ── Update & draw particles
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        if (p.mode === "converge") {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 36) {
            p.alpha *= 0.90;
            p.life += 0.04;
          } else {
            const pull = Math.min(1, dist / 120);
            p.vx += (dx / dist) * 0.09 * pull;
            p.vy += (dy / dist) * 0.09 * pull;
            p.vx *= 0.965;
            p.vy *= 0.965;
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.007;
          }

          if (p.life < p.maxLife && p.alpha > 0.015) alive.push(p);
        } else {
          // burst
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.x += p.vx;
          p.y += p.vy;
          p.life += 0.014;
          p.alpha -= 0.011;
          if (p.alpha > 0.01 && p.life < p.maxLife) alive.push(p);
        }

        // Draw glow
        if (p.alpha > 0.01) {
          const glowR = p.size * 2.8;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${p.r},${p.g},${p.b},${p.alpha})`);
          grad.addColorStop(0.35, `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.45})`);
          grad.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Bright core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 220, ${p.alpha * 0.85})`;
          ctx.fill();
        }
      }
      particlesRef.current = alive;

      // ── Flash overlay on completion
      if (flashRef.current > 0) {
        flashRef.current = Math.max(0, flashRef.current - 0.018);
        const eased = flashRef.current * flashRef.current;
        ctx.fillStyle = `rgba(255, 238, 160, ${eased * 0.88})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    // Trigger burst when complete
    const checkComplete = () => {
      if (completeRef.current) {
        spawnBurst();
        flashRef.current = 1;
      }
    };
    const intv = setInterval(checkComplete, 100);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intv);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  // React to isComplete prop change
  useEffect(() => {
    if (isComplete && !completeRef.current) {
      completeRef.current = true;
    }
  }, [isComplete]);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 620,
        borderRadius: 20,
        border: "1px solid rgba(201, 168, 76, 0.28)",
        boxShadow: "0 28px 80px rgba(0,0,0,0.40)",
        background: "#060D22",  /* canvas fallback — always dark */
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 620,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            marginBottom: 18,
            padding: "7px 16px",
            borderRadius: 999,
            border: "1px solid rgba(201, 168, 76, 0.35)",
            color: "rgba(242, 210, 110, 0.98)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          Miraculous Naming Moment
        </div>

        <h2
          className="wink-title"
          style={{
            marginBottom: 12,
            fontSize: "clamp(26px, 4.5vw, 44px)",
            lineHeight: 1.16,
            maxWidth: 720,
            color: "#f0f4ff",
            textShadow: "0 2px 24px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </h2>

        <p
          className="wink-sub"
          style={{
            maxWidth: 680,
            marginBottom: 36,
            color: "rgba(218, 228, 245, 0.92)",
            lineHeight: 1.75,
          }}
        >
          {subtitle}
        </p>

        <div
          style={{
            width: "100%",
            maxWidth: 580,
            borderRadius: 24,
            padding: "32px 24px",
            border: "1px solid rgba(201, 168, 76, 0.16)",
            background: "linear-gradient(180deg, rgba(11,22,52,0.82) 0%, rgba(6,13,34,0.90) 100%)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 70px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: 160,
              height: 2,
              margin: "0 auto 18px",
              borderRadius: 9999,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(201,168,76,0.9) 50%, rgba(255,255,255,0) 100%)",
              animation: "winkShimmer 2.8s ease-in-out infinite",
            }}
          />

          <style jsx>{`
            @keyframes winkShimmer {
              0% { opacity: 0.4; transform: scaleX(0.8); }
              50% { opacity: 1; transform: scaleX(1.08); }
              100% { opacity: 0.4; transform: scaleX(0.85); }
            }
            @keyframes winkReveal {
              0% { opacity: 0; transform: translateY(14px) scale(0.97); filter: blur(12px); }
              60% { opacity: 0.6; filter: blur(3px); }
              100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
          `}</style>

          <div
            style={{
              fontSize: 12,
              color: "rgba(185, 200, 230, 0.7)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Light gathers into a name
          </div>

          <div
            style={{
              minHeight: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(36px, 6.5vw, 60px)",
                fontWeight: 800,
                color: "#f8fbff",
                lineHeight: 1.1,
                animation: "winkReveal 2s ease forwards",
                textShadow:
                  "0 0 28px rgba(201, 168, 76, 0.22), 0 0 50px rgba(120, 160, 255, 0.14)",
                wordBreak: "keep-all",
                letterSpacing: "0.04em",
              }}
            >
              {previewName || "Wink"}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 14.5,
              lineHeight: 1.9,
              color: "rgba(200, 212, 235, 0.82)",
              maxWidth: 480,
              marginInline: "auto",
              minHeight: 60,
              transition: "opacity 0.5s ease",
            }}
          >
            {statusMessage ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "rgba(201,168,76,0.9)",
                fontWeight: 600,
                fontSize: 15,
              }}>
                <span style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "rgba(201,168,76,0.85)",
                  animation: "winkPulse 1.1s ease-in-out infinite",
                }} />
                {statusMessage}
                <style jsx>{`
                  @keyframes winkPulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.85); }
                    50% { opacity: 1; transform: scale(1.2); }
                  }
                `}</style>
              </span>
            ) : (
              <>
                이름은 정해진 목록에서 꺼내지는 것이 아니라,
                <br />
                입력하신 마음과 의미, 성씨와의 흐름 위에
                <br />
                빛처럼 모여 한 글자씩 선명해지고 있습니다.
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
