/**
 * Purpose: Local-only achievement ids (entertainment, not rankings).
 * Description: Unlocks stored in localStorage; evaluated on quiz complete.
 * Thresholds from data/app-config.json (`achievements`).
 */
import {
  ACHIEVEMENTS_STORAGE_KEY,
  NIGHT_OWL_FROM_HOUR,
  NIGHT_OWL_TO_HOUR_INCLUSIVE,
  SPEED_RUNNER_THRESHOLD_MS,
} from './appConfig.js';

const STORAGE_KEY = ACHIEVEMENTS_STORAGE_KEY;

/** @returns {Set<string>} */
function loadSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/** @param {Set<string>} ids */
function saveSet(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

/**
 * @param {{ completedAt: Date, minSelectMs: number }} evt
 */
export function onQuizComplete(evt) {
  const u = loadSet();
  u.add('finish_once');
  const h = evt.completedAt.getHours();
  if (h >= NIGHT_OWL_FROM_HOUR || h <= NIGHT_OWL_TO_HOUR_INCLUSIVE) {
    u.add('night_owl');
  }
  if (evt.minSelectMs < SPEED_RUNNER_THRESHOLD_MS) u.add('speed_runner');
  saveSet(u);
}

/** @returns {string[]} */
export function listUnlockedIds() {
  return [...loadSet()].sort();
}
