"use client";

import { useEffect, useRef, useState } from "react";
import { setSoundMuted } from "@/lib/sound";

const TRACKS = [
  "/audio/01_Bicycles_on_Main_Street.mp3",
  "/audio/02_Ready_for_the_Day.mp3",
  "/audio/03_Sunday_Morning_Coffee.mp3",
];

const TARGET_VOLUME = 0.25;
const FADE_DURATION = 3000; // ms — 페이드인 3초
const STORAGE_KEY = "wink-bgm";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackIdxRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // ── 초기화 ──────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // 다음 곡 자동 전환
    audio.addEventListener("ended", () => {
      trackIdxRef.current = (trackIdxRef.current + 1) % TRACKS.length;
      playTrack(audio, trackIdxRef.current);
    });

    setReady(true);

    // 저장된 상태 복원
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "on") {
      // 자동재생 시도 (브라우저 정책상 실패 가능)
      audio.src = TRACKS[0];
      audio.volume = 0;
      audio.play()
        .then(() => {
          fadeIn(audio);
          setPlaying(true);
          setSoundMuted(false);
        })
        .catch(() => {
          // 자동재생 차단 → 버튼 클릭 대기
        });
    } else {
      setSoundMuted(true);
    }

    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audio.pause();
      audio.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 페이드인 ─────────────────────────────────────────────
  function fadeIn(audio: HTMLAudioElement) {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const steps = FADE_DURATION / 100;
    const stepVol = TARGET_VOLUME / steps;
    audio.volume = 0;
    fadeTimerRef.current = setInterval(() => {
      if (audio.volume < TARGET_VOLUME - stepVol) {
        audio.volume = Math.min(audio.volume + stepVol, TARGET_VOLUME);
      } else {
        audio.volume = TARGET_VOLUME;
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      }
    }, 100);
  }

  // ── 트랙 재생 ────────────────────────────────────────────
  function playTrack(audio: HTMLAudioElement, idx: number) {
    audio.src = TRACKS[idx];
    audio.volume = 0;
    audio.play().then(() => fadeIn(audio)).catch(() => {});
  }

  // ── 토글 ─────────────────────────────────────────────────
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      // 정지
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audio.pause();
      audio.volume = 0;
      setPlaying(false);
      setSoundMuted(true);
      localStorage.setItem(STORAGE_KEY, "off");
    } else {
      // 재생 — 현재 트랙이 없으면 처음부터
      if (!audio.src || audio.ended || audio.src === window.location.href) {
        trackIdxRef.current = 0;
        audio.src = TRACKS[0];
      }
      audio.play()
        .then(() => {
          fadeIn(audio);
          setPlaying(true);
          setSoundMuted(false);
          localStorage.setItem(STORAGE_KEY, "on");
        })
        .catch(() => {});
    }
  };

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "배경음악 끄기" : "배경음악 켜기"}
      title={playing ? "배경음악 끄기" : "배경음악 켜기"}
      style={{
        position: "fixed",
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        right: 18,
        zIndex: 200,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `2px solid ${playing ? "rgba(201,168,76,0.75)" : "rgba(201,168,76,0.35)"}`,
        background: "linear-gradient(135deg, #1B2A5E 0%, #0f1a3d 100%)",
        color: playing ? "#C9A84C" : "rgba(201,168,76,0.5)",
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: playing
          ? "0 0 0 4px rgba(201,168,76,0.12), 0 6px 20px rgba(0,0,0,0.4)"
          : "0 4px 14px rgba(0,0,0,0.35)",
        transition: "all 0.25s ease",
        backdropFilter: "blur(10px)",
        animation: playing ? "bgm-pulse 2.8s ease-in-out infinite" : "none",
      }}
    >
      {playing ? "🎵" : "🔇"}
      <style>{`
        @keyframes bgm-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(201,168,76,0.12), 0 6px 20px rgba(0,0,0,0.4); }
          50%       { box-shadow: 0 0 0 9px rgba(201,168,76,0.06), 0 6px 20px rgba(0,0,0,0.4); }
        }
      `}</style>
    </button>
  );
}
