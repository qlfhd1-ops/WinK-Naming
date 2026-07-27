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
  const [hovered, setHovered] = useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        border: "3px solid #1B2A5E",
        background: hovered ? "#1B2A5E" : "#FFFFFF",
        color: hovered ? "#FFFFFF" : "#1B2A5E",
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(27,42,94,0.3)",
        transition: "all 0.25s ease",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {playing ? (
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        ) : (
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        )}
      </svg>
    </button>
  );
}
