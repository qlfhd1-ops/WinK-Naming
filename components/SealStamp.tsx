"use client";

interface Props {
  /** 이름 (앞 3글자 + "인" = 4글자 2×2 배치) */
  name: string;
  size?: number;
}

/**
 * 김철수인 스타일 한국 전통 인장 SVG
 * - name.slice(0,3) + "인" → 4글자 2×2 격자 배치
 * - 원 안에 글씨가 꽉 차는 리얼 도장 스타일
 */
export default function SealStamp({ name, size = 300 }: Props) {
  const raw = (name.replace(/\s/g, "").slice(0, 3) + "인").slice(0, 4);
  const chars = raw.split("");

  const uid = `seal-${raw.replace(/[^\w가-힣]/g, "x")}`;

  // 2×2 격자 좌표 (viewBox 0 0 300 300 기준)
  const positions = [
    { x: 75,  y: 112 }, // 좌상
    { x: 225, y: 112 }, // 우상
    { x: 75,  y: 225 }, // 좌하
    { x: 225, y: 225 }, // 우하
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <style>{`
        @keyframes sealAppear {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          display: "inline-block",
          animation: "sealAppear 0.3s ease-out both",
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <defs>
            <filter id={`${uid}-ink`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="3"
                seed="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          <g transform="rotate(-1, 150, 150)" filter={`url(#${uid}-ink)`}>
            {/* 바깥 원 */}
            <circle
              cx="150" cy="150" r="140"
              stroke="#CC0000"
              strokeWidth="10"
              fill="none"
            />
            {/* 안쪽 원 */}
            <circle
              cx="150" cy="150" r="128"
              stroke="#CC0000"
              strokeWidth="3"
              fill="none"
            />
            {/* 이름 글자 2×2 격자 */}
            {chars.map((ch, i) => (
              <text
                key={i}
                x={positions[i]?.x ?? 150}
                y={positions[i]?.y ?? 150}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#CC0000"
                fontSize="90"
                fontFamily="'Noto Serif KR', 'Hahmlet', serif"
                fontWeight="900"
              >
                {ch}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 10,
          color: "#999",
          textAlign: "center",
          lineHeight: 1.5,
          letterSpacing: "0.02em",
        }}
      >
        미리보기용 · 실제 제품과 다를 수 있습니다
      </p>
    </div>
  );
}
