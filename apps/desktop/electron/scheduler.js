import { store } from './store.js';

let timer = null;
let isPaused = false;

export function startScheduler(triggerOverlayCallback) {
  if (timer) clearInterval(timer);

  const settings = store.get('settings');
  const intervalMs = (settings.intervalMin || 45) * 60 * 1000;

  timer = setInterval(() => {
    if (!isPaused) {
      triggerOverlayCallback();
    }
  }, intervalMs);
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
}

export function pauseScheduler(minutes) {
  isPaused = true;
  setTimeout(() => {
    isPaused = false;
  }, minutes * 60 * 1000);
}
