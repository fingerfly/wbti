/**
 * Purpose: Default-off sound/haptics toggles for quiz interactions.
 */

const KEY = 'wbti.fxEnabled';

/**
 * @returns {boolean}
 */
export function isFxEnabled() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** @param {boolean} on */
export function setFxEnabled(on) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/**
 * @param {boolean} enabled
 */
export function playTapIfEnabled(enabled) {
  if (!enabled) return;
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.04;
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 45);
  } catch {
    /* ignore */
  }
}

/**
 * @param {boolean} enabled
 */
export function vibrateTapIfEnabled(enabled) {
  if (!enabled || typeof navigator === 'undefined') return;
  try {
    navigator.vibrate?.(12);
  } catch {
    /* ignore */
  }
}
