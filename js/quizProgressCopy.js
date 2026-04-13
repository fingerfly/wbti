/**
 * Purpose: Personified quiz progress line (F-02, entertainment copy).
 * Description: Template in data/ui-copy.json (`progressLine.template`).
 */
import { UI_COPY, interpolate } from './uiCopy.js';

/**
 * @param {number} indexZero - 0-based question index
 * @param {number} total
 * @returns {string}
 */
export function personifiedProgressLine(indexZero, total) {
  const pct = Math.round(((indexZero + 1) / total) * 100);
  const rest = total - indexZero - 1;
  return interpolate(UI_COPY.progressLine.template, {
    current: String(indexZero + 1),
    total: String(total),
    pct: String(pct),
    rest: String(rest),
  });
}
