/**
 * Purpose: Bank size, pattern coverage, balanceAxis metadata.
 */
import { describe, it, expect } from 'vitest';
import {
  QUESTION_BANK,
  PATTERN_COUNT,
  VARIANTS_PER_PATTERN,
} from '../../js/quizBank.js';
import { balanceAxisHistogram } from '../../js/sessionBalance.js';
import { CANONICAL_TEN } from '../../js/quizPatterns.js';

function scoreKey(sc) {
  return `${sc.a},${sc.b},${sc.c}`;
}

function multisetScores(qs) {
  const keys = [];
  for (const q of qs) {
    for (const o of q.options) {
      keys.push(scoreKey(o.scores));
    }
  }
  return keys.sort().join('|');
}

describe('QUESTION_BANK', () => {
  it('has 320 items (16 patterns × 20 variants)', () => {
    expect(QUESTION_BANK.length).toBe(320);
  });

  it('has 20 per patternId and variants 0..19', () => {
    const byP = new Map();
    for (const q of QUESTION_BANK) {
      expect(q.patternId).toBeGreaterThanOrEqual(0);
      expect(q.patternId).toBeLessThan(PATTERN_COUNT);
      expect(q.variantId).toBeGreaterThanOrEqual(0);
      expect(q.variantId).toBeLessThan(VARIANTS_PER_PATTERN);
      expect(['a', 'b', 'c']).toContain(q.balanceAxis);
      if (!byP.has(q.patternId)) byP.set(q.patternId, new Set());
      byP.get(q.patternId).add(q.variantId);
    }
    expect(byP.size).toBe(PATTERN_COUNT);
    for (let p = 0; p < PATTERN_COUNT; p += 1) {
      expect(byP.get(p)?.size).toBe(VARIANTS_PER_PATTERN);
    }
  });

  it('matches canonical score multiset per pattern (variant 0)', () => {
    for (let p = 0; p < PATTERN_COUNT; p += 1) {
      const v0 = QUESTION_BANK.find((q) => q.patternId === p && q.variantId === 0);
      expect(v0).toBeDefined();
      expect(multisetScores([v0])).toBe(multisetScores([CANONICAL_TEN[p]]));
    }
  });

  it('keeps canonical prompt and option text for every variant (no scene in stem)', () => {
    for (let p = 0; p < PATTERN_COUNT; p += 1) {
      const canon = CANONICAL_TEN[p];
      const variants = QUESTION_BANK.filter((q) => q.patternId === p);
      expect(variants.length).toBe(VARIANTS_PER_PATTERN);
      for (const q of variants) {
        expect(q.prompt).toBe(canon.prompt);
        expect(q.variantContext?.scene?.length).toBeGreaterThan(0);
        q.options.forEach((opt, oi) => {
          expect(opt.text).toBe(canon.options[oi].text);
        });
      }
    }
  });

  it('balanceAxis histogram matches patternIdx % 3', () => {
    const h = balanceAxisHistogram(QUESTION_BANK);
    expect(h.a).toBe(120);
    expect(h.b).toBe(100);
    expect(h.c).toBe(100);
  });
});
