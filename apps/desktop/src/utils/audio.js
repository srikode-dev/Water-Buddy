/**
 * Water Buddy Desktop Audio Synthesizer (Pure Web Audio API)
 * Studio synthesized acoustic chimes matching the web application.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Basalt Drop - Gentle water drop sound with pitch bend and resonant filter
 */
export function playBasaltDrop(volume = 0.5) {
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

  const vol = Math.max(0.01, Math.min(1, volume));
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25 * vol, now + 0.02);
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
export function playIcelandicChime(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const fundamental = 432;
  const vol = Math.max(0.01, Math.min(1, volume));

  [1, 1.5, 2].forEach((ratio, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, now);

    const baseVol = (0.16 * vol) / (idx + 1);
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
 * Ocean Ripple - Playful bubbling arpeggio chord (Aqua droplet shimmer)
 */
export function playOceanRipple(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [440, 554.37, 659.25, 880];
  const vol = Math.max(0.01, Math.min(1, volume));

  freqs.forEach((freq, idx) => {
    const startOffset = idx * 0.045;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + startOffset);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + startOffset + 0.06);

    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.linearRampToValueAtTime(0.18 * vol, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + startOffset);
    osc.stop(now + startOffset + 0.38);
  });
}

/**
 * Singing Bowl - 528Hz healing resonance with slow meditative sustain
 */
export function playSingingBowl(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const vol = Math.max(0.01, Math.min(1, volume));

  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, now);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(528 * 1.5, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.2 * vol, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 2.1);
  osc2.stop(now + 2.1);
}

/**
 * Play chime by key
 */
export function playChimeByName(name = 'icelandic', volume = 0.5) {
  switch (name) {
    case 'basalt':
      playBasaltDrop(volume);
      break;
    case 'ripple':
      playOceanRipple(volume);
      break;
    case 'bowl':
      playSingingBowl(volume);
      break;
    case 'icelandic':
    default:
      playIcelandicChime(volume);
      break;
  }
}
