/**
 * Purpose: Per-option quips loaded from data/option-quips.json (display-only).
 * Description:
 * - Matrix shape: patterns × 4 × variantsPerPattern strings; must match
 *   CANONICAL_TEN length and appConfig VARIANTS_PER_PATTERN.
 * - Regenerate: `node scripts/dump-option-quips-to-json.mjs` (requires temporary
 *   export of OPTION_QUIPS from a JS snapshot) or edit JSON directly.
 */
import rawMatrix from '../data/option-quips.json' with { type: 'json' };
import { CANONICAL_TEN } from './quizPatterns.js';
import { VARIANTS_PER_PATTERN } from './appConfig.js';
import { deepFreeze } from './deepFreeze.js';

export const OPTION_QUIP_VARIANTS = VARIANTS_PER_PATTERN;

const OPTION_QUIPS = deepFreeze(rawMatrix);

export function getOptionQuip(p, oi, v) {
  return OPTION_QUIPS[p][oi][v];
}

export function assertOptionQuipsMatrix() {
  const pc = CANONICAL_TEN.length;
  if (!Array.isArray(OPTION_QUIPS) || OPTION_QUIPS.length !== pc) {
    throw new Error(`OPTION_QUIPS: need ${pc} patterns`);
  }
  const vPer = VARIANTS_PER_PATTERN;
  for (let p = 0; p < pc; p += 1) {
    const row = OPTION_QUIPS[p];
    if (!Array.isArray(row) || row.length !== 4) {
      throw new Error(`OPTION_QUIPS[${p}]: need 4 options`);
    }
    for (let oi = 0; oi < 4; oi += 1) {
      const cell = row[oi];
      if (!Array.isArray(cell) || cell.length !== vPer) {
        throw new Error(`OPTION_QUIPS[${p}][${oi}]: need ${vPer} quips`);
      }
      const u = new Set(cell);
      if (u.size !== cell.length) {
        throw new Error(`OPTION_QUIPS[${p}][${oi}]: duplicate quip`);
      }
    }
  }
}
