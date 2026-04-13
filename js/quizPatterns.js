/**
 * Purpose: Canonical WBTI mother questions loaded from data (not inline JS).
 * Description:
 * - Source: data/canonical-questions.json (`patterns` array).
 * - Regenerate JSON via `node scripts/dump-canonical-to-json.mjs` after editing
 *   quiz content in JS during migration; prefer editing JSON directly now.
 * - Export name CANONICAL_TEN kept for import stability.
 */
import raw from '../data/canonical-questions.json' with { type: 'json' };
import { deepFreeze } from './deepFreeze.js';

const SCORES = new Set([-1, 0, 1]);

/**
 * @param {unknown} j
 * @returns {{ patterns: object[] }}
 */
function assertCanonicalPayload(j) {
  if (!j || typeof j !== 'object' || !Array.isArray(j.patterns)) {
    throw new Error('canonical-questions.json: need { patterns: [] }');
  }
  const { patterns } = j;
  if (patterns.length === 0) {
    throw new Error('canonical-questions: patterns must be non-empty');
  }
  for (let pi = 0; pi < patterns.length; pi += 1) {
    const q = patterns[pi];
    if (!q || typeof q !== 'object') {
      throw new Error(`canonical-questions: patterns[${pi}] invalid`);
    }
    if (typeof q.id !== 'string' || typeof q.prompt !== 'string') {
      throw new Error(`canonical-questions: patterns[${pi}] need id, prompt`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`canonical-questions: patterns[${pi}] need 4 options`);
    }
    for (let oi = 0; oi < 4; oi += 1) {
      const o = q.options[oi];
      if (!o || typeof o !== 'object') {
        throw new Error(`canonical-questions: p${pi} opt ${oi} invalid`);
      }
      if (typeof o.text !== 'string') {
        throw new Error(`canonical-questions: p${pi} opt ${oi} need text`);
      }
      if (!o.scores || typeof o.scores !== 'object') {
        throw new Error(`canonical-questions: p${pi} opt ${oi} need scores`);
      }
      for (const ax of ['a', 'b', 'c']) {
        const s = o.scores[ax];
        if (!SCORES.has(s)) {
          throw new Error(
            `canonical-questions: p${pi} opt ${oi} scores.${ax} not in -1,0,1`,
          );
        }
      }
    }
  }
  return /** @type {{ patterns: object[] }} */ (j);
}

const validated = assertCanonicalPayload(raw);
export const CANONICAL_TEN = deepFreeze(validated.patterns);
/** @type {typeof CANONICAL_TEN} */
export const QUESTIONS = CANONICAL_TEN;
