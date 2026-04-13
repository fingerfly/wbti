/**
 * Purpose: Unit tests for quiz session shuffle invariants and scoring
 * equivalence vs canonical order.
 */
import { describe, it, expect } from 'vitest';
import {
  buildQuizSession,
  createMulberry32,
  createUniform01,
  shuffleInPlace,
} from '../../js/quizSession.js';
import { QUESTIONS } from '../../js/quizData.js';
import { QUESTION_BANK } from '../../js/quizBank.js';
import {
  SESSION_SIZE,
  pickBalancedSessionFromBank,
  isPersonalityCoverageBalanced,
  balanceAxisHistogram,
} from '../../js/sessionBalance.js';
import { computeResult } from '../../js/computeResult.js';

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

function canonicalMultiset() {
  return multisetScores([...QUESTIONS]);
}

/**
 * @param {Record<string, string>} choiceByQid
 * @returns {number[]}
 */
function canonicalAnswersFromChoices(choiceByQid) {
  return QUESTIONS.map((q) => {
    const oid = choiceByQid[q.id];
    const idx = q.options.findIndex((o) => o.optionId === oid);
    if (idx < 0) throw new Error(`missing option ${oid}`);
    return idx;
  });
}

/**
 * @param {Record<string, string>} choiceByQid
 * @param {{ questions: { id: string, options: { optionId?: string }[] }[] }} session
 * @returns {number[]}
 */
function sessionAnswersFromChoices(choiceByQid, session) {
  return session.questions.map((q) => {
    const oid = choiceByQid[q.id];
    const idx = q.options.findIndex((o) => o.optionId === oid);
    if (idx < 0) throw new Error(`missing option ${oid} in session`);
    return idx;
  });
}

describe('createUniform01', () => {
  it('returns values in [0, 1) and varies', () => {
    const r = createUniform01();
    const seen = new Set();
    for (let i = 0; i < 40; i += 1) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      seen.add(Math.floor(x * 1e6));
    }
    expect(seen.size).toBeGreaterThan(5);
  });
});

describe('shuffleInPlace', () => {
  it('permutes with seeded rng deterministically', () => {
    const a = [1, 2, 3, 4, 5];
    const r = createMulberry32(42);
    shuffleInPlace(a, r);
    expect(a).toEqual([1, 5, 3, 2, 4]);
  });
});

describe('buildQuizSession', () => {
  it('keeps multiset of option scores per full bank', () => {
    const r = createMulberry32(99);
    const { questions } = buildQuizSession({
      questions: QUESTIONS,
      random: r,
    });
    expect(questions.length).toBe(QUESTIONS.length);
    const ids = new Set(questions.map((q) => q.id));
    expect(ids.size).toBe(QUESTIONS.length);
    for (const q of questions) {
      expect(q.options.length).toBe(4);
    }
    expect(multisetScores(questions)).toBe(canonicalMultiset());
  });

  it('matches canonical typeKey for same optionId choices (seed 7)', () => {
    const choiceByQid = Object.fromEntries(
      QUESTIONS.map((q) => [q.id, q.options[0].optionId]),
    );
    const canonAns = canonicalAnswersFromChoices(choiceByQid);
    const tCanon = computeResult(canonAns, QUESTIONS).typeKey;
    const r = createMulberry32(7);
    const session = buildQuizSession({ questions: QUESTIONS, random: r });
    const sAns = sessionAnswersFromChoices(choiceByQid, session);
    const tSess = computeResult(sAns, session.questions).typeKey;
    expect(tSess).toBe(tCanon);
  });

  it('matches canonical typeKey for mixed choices across seeds', () => {
    const choiceByQid = {
      q1: 'q1-b',
      q2: 'q2-c',
      q3: 'q3-a',
      q4: 'q4-d',
      q5: 'q5-b',
      q6: 'q6-c',
      q7: 'q7-d',
      q8: 'q8-a',
      q9: 'q9-b',
      q10: 'q10-c',
      q11: 'q11-a',
      q12: 'q12-b',
      q13: 'q13-c',
      q14: 'q14-d',
      q15: 'q15-a',
      q16: 'q16-b',
    };
    const canonAns = canonicalAnswersFromChoices(choiceByQid);
    const tCanon = computeResult(canonAns, QUESTIONS).typeKey;
    for (let seed = 0; seed < 40; seed += 1) {
      const r = createMulberry32(seed);
      const session = buildQuizSession({ questions: QUESTIONS, random: r });
      const sAns = sessionAnswersFromChoices(choiceByQid, session);
      expect(computeResult(sAns, session.questions).typeKey).toBe(tCanon);
    }
  });

  it('16-item balanced pick stays balanced after shuffle', () => {
    const rPick = createMulberry32(11);
    const picked = pickBalancedSessionFromBank(QUESTION_BANK, rPick);
    const rShuf = createMulberry32(22);
    const { questions } = buildQuizSession({
      questions: picked,
      random: rShuf,
    });
    expect(questions.length).toBe(SESSION_SIZE);
    const bh = balanceAxisHistogram(questions);
    expect(isPersonalityCoverageBalanced(bh, SESSION_SIZE)).toBe(true);
  });
});
