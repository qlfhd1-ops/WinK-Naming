"use client";

import { type CategoryVideo } from "./videos";

export function CategoryVideoCard({
  video, accent, bg, playing, onPlay,
}: { video: CategoryVideo; accent: string; bg: string; playing: boolean; onPlay: () => void }) {
  return (
    <div
      className="lg-big-name-card"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, #1B2A5E 100%)`, border: `1px solid ${accent}22` }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, #1B2A5E 0%, ${accent} 100%)`, zIndex: 2 }} />
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.caption}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={onPlay}
          aria-label="영상 재생"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            border: "none", padding: 0, cursor: "pointer",
            backgroundImage: `url(https://i.ytimg.com/vi/${video.id}/hqdefault.jpg)`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(6,14,34,0.75) 0%, rgba(6,14,34,0.15) 55%, rgba(6,14,34,0.55) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1B2A5E" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
              {video.label}
            </div>
            <div style={{ fontSize: "clamp(15px,1.8vw,20px)", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.4 }}>
              {video.caption}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
