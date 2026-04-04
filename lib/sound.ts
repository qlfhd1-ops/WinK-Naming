/**
 * Wink Naming — ASMR 효과음 시스템
 * Web Audio API 전용, 별도 파일 없음
 * 브라우저 자동재생 정책 대응
 */

export const Sound = {
  ctx: null as AudioContext | null,
  enabled: true,

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      try {
        this.ctx = new (
          window.AudioContext ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).webkitAudioContext
        )();
      } catch { return; }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  },

  // ① 버튼 클릭음 — 부드러운 틱
  playClick() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.type = "sine";
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.08);
    } catch { /* ignore */ }
  },

  // ② 페이지 전환음 — 부드러운 스윕
  playPageTurn() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.20);
      osc.type = "sine";
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.20);
    } catch { /* ignore */ }
  },

  // ③ 이름 완성음 — 3음 차임벨
  playNameComplete() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    const notes = [
      { freq: 523, delay: 0,    duration: 0.5 },
      { freq: 659, delay: 0.18, duration: 0.5 },
      { freq: 784, delay: 0.36, duration: 0.8 },
    ];
    notes.forEach(({ freq, delay, duration }) => {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = this.ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.13, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      } catch { /* ignore */ }
    });
  },

  // ④ 탭 선택음
  playTab() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.value = 440;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.06);
    } catch { /* ignore */ }
  },

  // ⑤ 인장 등장음 — 도장 찍는 느낌
  playSeal() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.15);
    } catch { /* ignore */ }
  },
};

/** AudioPlayer On/Off 연동 */
export function setSoundMuted(muted: boolean) {
  Sound.enabled = !muted;
}

export function isSoundMuted(): boolean {
  return !Sound.enabled;
}

// 하위 호환 — 기존 named export 유지
export const playClick = () => Sound.playClick();
export const playPageTurn = () => Sound.playPageTurn();
export const playTab = () => Sound.playTab();
export const playReveal = () => Sound.playNameComplete();
export const playNameComplete = () => Sound.playNameComplete();
