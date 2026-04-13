/**
 * Purpose: Session draw balance rules and helpers.
 */
import { describe, it, expect } from 'vitest';
import {
  SESSION_SIZE,
  assertUniqueQuestionIdsInSession,
  balanceAxisHistogram,
  isPersonalityCoverageBalanced,
  patternRepeatCap,
  patternRepeatCapOk,
  pickBalancedSessionFromBank,
  primaryAxisForQuestion,
  sessionBalanceAxis,
  uniquePatternCountInBank,
} from '../../js/sessionBalance.js';
import { QUESTION_BANK } from '../../js/quizBank.js';
import { createMulberry32 } from '../../js/quizSession.js';

describe('isPersonalityCoverageBalanced', () => {
  it('accepts 5,5,6 for n=16', () => {
    expect(isPersonalityCoverageBalanced({ a: 5, b: 5, c: 6 }, 16)).toBe(true);
    expect(isPersonalityCoverageBalanced({ a: 6, b: 5, c: 5 }, 16)).toBe(true);
  });

  it('rejects skewed splits', () => {
    expect(isPersonalityCoverageBalanced({ a: 4, b: 6, c: 6 }, 16)).toBe(false);
    expect(isPersonalityCoverageBalanced({ a: 7, b: 5, c: 4 }, 16)).toBe(false);
  });
});

describe('QUESTION_BANK + pickBalancedSessionFromBank', () => {
  it('tags balanceAxis with rotating a/b/c by pattern', () => {
    const h = balanceAxisHistogram(QUESTION_BANK);
    expect(h.a + h.b + h.c).toBe(QUESTION_BANK.length);
    expect(h.a).toBe(120);
    expect(h.b).toBe(100);
    expect(h.c).toBe(100);
  });

  it('returns 16 unique ids and balanced histogram', () => {
    const r = createMulberry32(777);
    const sel = pickBalancedSessionFromBank(QUESTION_BANK, r);
    expect(sel.length).toBe(SESSION_SIZE);
    expect(new Set(sel.map((q) => q.id)).size).toBe(SESSION_SIZE);
    const bh = balanceAxisHistogram(sel);
    expect(isPersonalityCoverageBalanced(bh, SESSION_SIZE)).toBe(true);
  });

  it(
    'caps same patternId per session (≤⌈16/16⌉ = 1)',
    { timeout: 20000 },
    () => {
      expect(uniquePatternCountInBank(QUESTION_BANK)).toBe(16);
      expect(patternRepeatCap(SESSION_SIZE, QUESTION_BANK)).toBe(1);
      for (let seed = 0; seed < 48; seed += 1) {
        const sel = pickBalancedSessionFromBank(
          QUESTION_BANK,
          createMulberry32(seed),
        );
        expect(patternRepeatCapOk(sel, SESSION_SIZE, QUESTION_BANK)).toBe(true);
        /** @type {Record<number, number>} */
        const c = {};
        for (const q of sel) {
          c[q.patternId] = (c[q.patternId] || 0) + 1;
        }
        expect(Math.max(...Object.values(c))).toBeLessThanOrEqual(1);
      }
    },
  );

  it('is deterministic for fixed seed', () => {
    const a = pickBalancedSessionFromBank(
      QUESTION_BANK,
      createMulberry32(21),
    ).map((q) => q.id);
    const b = pickBalancedSessionFromBank(
      QUESTION_BANK,
      createMulberry32(21),
    ).map((q) => q.id);
    expect(a).toEqual(b);
  });

  it('uses balanceAxis when present on item', () => {
    const fake = {
      id: 'x',
      balanceAxis: 'b',
      options: [
        { scores: { a: 0, b: 0, c: 0 } },
        { scores: { a: 0, b: 0, c: 0 } },
      ],
    };
    expect(sessionBalanceAxis(fake)).toBe('b');
  });
});

describe('assertUniqueQuestionIdsInSession', () => {
  it('throws on duplicate id', () => {
    const dup = { id: 'x', options: [{ scores: { a: 0, b: 0, c: 0 } }] };
    expect(() =>
      assertUniqueQuestionIdsInSession([dup, dup]),
    ).toThrow(/duplicate question id/);
  });
});

describe('primaryAxisForQuestion', () => {
  it('breaks ties toward a then b then c', () => {
    const flat = {
      options: [
        { scores: { a: 0, b: 0, c: 0 } },
        { scores: { a: 0, b: 0, c: 0 } },
      ],
    };
    expect(primaryAxisForQuestion(flat)).toBe('a');
  });
});
