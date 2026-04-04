import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/og?name=이름&hanja=漢字&meaning=의미&sub=설명
 * Generates a 1200×630 OG image for social sharing.
 */
export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name    = searchParams.get("name")    ?? "이름";
  const hanja   = searchParams.get("hanja")   ?? "";
  const meaning = searchParams.get("meaning") ?? "";
  const sub     = searchParams.get("sub")     ?? "윙크 네이밍 — AI 작명 서비스";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0d1830 0%, #060c1e 60%, #0a1020 100%)",
          padding: "60px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(ellipse at 20% 30%, rgba(201,168,76,0.12) 0%, transparent 55%)",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 24px",
            borderRadius: 999,
            border: "1px solid rgba(201,168,76,0.45)",
            color: "rgba(242,210,110,0.92)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: 44,
            background: "rgba(201,168,76,0.08)",
          }}
        >
          WINK NAMING GIFT
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 112,
            fontWeight: 800,
            color: "#f8fbff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: hanja ? 16 : 32,
            textShadow: "0 0 60px rgba(201,168,76,0.25)",
            display: "flex",
          }}
        >
          {name}
        </div>

        {/* Hanja */}
        {hanja && (
          <div
            style={{
              fontSize: 40,
              color: "rgba(242,210,110,0.85)",
              letterSpacing: "0.12em",
              marginBottom: 32,
              display: "flex",
            }}
          >
            {hanja}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 1,
            background: "rgba(201,168,76,0.35)",
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Meaning */}
        {meaning && (
          <div
            style={{
              fontSize: 24,
              color: "rgba(218,230,250,0.82)",
              lineHeight: 1.6,
              textAlign: "center",
              maxWidth: 900,
              marginBottom: 24,
              display: "flex",
            }}
          >
            {meaning.length > 80 ? meaning.slice(0, 80) + "…" : meaning}
          </div>
        )}

        {/* Sub line */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(160,185,220,0.55)",
            letterSpacing: "0.06em",
            display: "flex",
          }}
        >
          {sub}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
