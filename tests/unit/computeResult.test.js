/**
 * Purpose: Unit tests for WBTI scoring and result mapping.
 */
import { describe, it, expect } from 'vitest';
import {
  computeResult,
  aggregateAxisScores,
  typeKeyFromScores,
  resolveAxisSign,
  TIE_SIGN_BY_AXIS,
} from '../../js/computeResult.js';
import { QUESTIONS } from '../../js/quizData.js';
import { RESULT_BY_KEY } from '../../js/resultTypes.js';

const tieFixture = Object.freeze([
  {
    id: 't1',
    prompt: 'tie',
    options: Object.freeze([
      { text: 'zero', scores: { a: 0, b: 0, c: 0 } },
    ]),
  },
]);

describe('resolveAxisSign', () => {
  it('uses tie when sum is zero', () => {
    expect(resolveAxisSign(0, 1)).toBe(1);
    expect(resolveAxisSign(0, -1)).toBe(-1);
  });

  it('ignores tie when sum is non-zero', () => {
    expect(resolveAxisSign(3, -1)).toBe(1);
    expect(resolveAxisSign(-2, 1)).toBe(-1);
  });
});

describe('typeKeyFromScores', () => {
  it('maps all-zero sums using TIE_SIGN_BY_AXIS', () => {
    const key = typeKeyFromScores({ a: 0, b: 0, c: 0 });
    const a = resolveAxisSign(0, TIE_SIGN_BY_AXIS.a) > 0 ? '+' : '-';
    const b = resolveAxisSign(0, TIE_SIGN_BY_AXIS.b) > 0 ? '+' : '-';
    const c = resolveAxisSign(0, TIE_SIGN_BY_AXIS.c) > 0 ? '+' : '-';
    expect(key).toBe(`${a}${b}${c}`);
    expect(key).toBe('+-+');
  });
});

describe('aggregateAxisScores', () => {
  it('matches manual sum for all first options', () => {
    const answers = Array(QUESTIONS.length).fill(0);
    const got = aggregateAxisScores(answers, QUESTIONS);
    let a = 0;
    let b = 0;
    let c = 0;
    for (let i = 0; i < QUESTIONS.length; i += 1) {
      const sc = QUESTIONS[i].options[0].scores;
      a += sc.a;
      b += sc.b;
      c += sc.c;
    }
    expect(got).toEqual({ a, b, c });
  });
});

describe('computeResult', () => {
  it('rejects wrong answer length', () => {
    expect(() => computeResult([], QUESTIONS)).toThrow(RangeError);
    expect(() => computeResult([0], QUESTIONS)).toThrow(RangeError);
  });

  it('rejects out-of-range option index', () => {
    const bad = Array(QUESTIONS.length).fill(0);
    bad[3] = 9;
    expect(() => computeResult(bad, QUESTIONS)).toThrow(RangeError);
  });

  it('returns a profile for an all-first-answers run', () => {
    const answers = Array(QUESTIONS.length).fill(0);
    const r = computeResult(answers, QUESTIONS);
    expect(r.typeKey).toMatch(/^[+-]{3}$/);
    expect(r.title.length).toBeGreaterThan(0);
    expect(r.gameSubtitle).toMatch(/稀有度/);
    expect(r.reportSections).toHaveLength(4);
    expect(r.paragraphs).toHaveLength(4);
    expect(r.paragraphs[0]).toContain('：');
    expect(r.scores).toEqual(aggregateAxisScores(answers, QUESTIONS));
  });

  it('works with custom single-question quiz', () => {
    const r = computeResult([0], tieFixture);
    expect(r.typeKey).toBe('+-+');
    expect(RESULT_BY_KEY[r.typeKey]).toBeDefined();
  });
});
