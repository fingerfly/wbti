/**
 * Purpose: Unit tests for easter-egg picker (display-only).
 */
import { describe, it, expect } from 'vitest';
import { pickEasterEgg } from '../../js/resultExtras.js';

const stubSession = (n) => ({
  questions: Array.from({ length: n }, () => ({})),
});

describe('pickEasterEgg', () => {
  it('returns line when every answer picks first slot', () => {
    const answers = [0, 0, 0];
    const line = pickEasterEgg({ answers, session: stubSession(3) });
    expect(line).toContain('第一个选项');
  });

  it('returns line when every answer picks same slot', () => {
    const answers = [2, 2, 2];
    const line = pickEasterEgg({ answers, session: stubSession(3) });
    expect(line).toContain('同一槽位');
  });

  it('returns undefined for mixed slots', () => {
    const answers = [0, 1, 0];
    expect(pickEasterEgg({ answers, session: stubSession(3) })).toBeUndefined();
  });

  it('returns line when every answer picks last slot', () => {
    const answers = [3, 3, 3];
    const line = pickEasterEgg({ answers, session: stubSession(3) });
    expect(line).toContain('最后一个选项');
  });

  it('returns zigzag egg for 0/3 alternation', () => {
    const answers = [0, 3, 0, 3];
    const line = pickEasterEgg({ answers, session: stubSession(4) });
    expect(line).toContain('反复横跳');
  });

  it('returns high-score egg when scores are extreme', () => {
    const answers = [0, 1, 2];
    const line = pickEasterEgg({
      answers,
      session: stubSession(3),
      result: { scores: { a: 9, b: 9, c: 9 } },
    });
    expect(line).toContain('满');
  });

  it('returns low-score egg when provided', () => {
    const answers = [0, 1, 2];
    const line = pickEasterEgg({
      answers,
      session: stubSession(3),
      result: { scores: { a: -9, b: -9, c: -9 } },
    });
    expect(line).toContain('淡');
  });
});
