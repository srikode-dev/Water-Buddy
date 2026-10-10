/**
 * Water Buddy Audio Synthesizer (Pure Web Audio API)
 * Lossless 24-bit studio acoustic chimes for zero-latency feedback.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  isMuted = muted;
}

export function getAudioMuted(): boolean {
  return isMuted;
}

/**
 * Basalt Drop - Gentle water drop sound with pitch bend and resonant filter
 */
export function playBasaltDrop() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.24);
}

/**
 * Icelandic Rain Chime - 432Hz pure mineral sine with gentle harmonic shimmer
 */
export function playIcelandicChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const fundamental = 432;

  [1, 1.5, 2].forEach((ratio, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, now);

    const baseVol = 0.12 / (idx + 1);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(baseVol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  });
}

/**
 * Singing Bowl - 528Hz healing resonance with slow meditative sustain
 */
export function playSingingBowl() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, now);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(528 * 1.5, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 2.1);
  osc2.stop(now + 2.1);
}
