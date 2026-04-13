/**
 * Purpose: Local counters for bank rotation (no server).
 * Description: completionCount toggles A/B bank per child plan rules.
 */

const COUNT_KEY = 'wbti.completionCount';

/**
 * @returns {number}
 */
export function getCompletionCount() {
  try {
    const raw = localStorage.getItem(COUNT_KEY);
    const n = parseInt(raw ?? '0', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function bumpCompletionCount() {
  try {
    localStorage.setItem(COUNT_KEY, String(getCompletionCount() + 1));
  } catch {
    /* ignore */
  }
}
