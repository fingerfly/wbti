/**
 * Purpose: Verify questionnaire can produce every WBTI character key.
 * Description:
 * - Enumerates all reachable axis score states from canonical questions.
 * - Converts each state to a type key with production tie rules.
 * - Guards against future edits that make a character unreachable.
 */
import { describe, it, expect } from 'vitest';
import { typeKeyFromScores } from '../../js/computeResult.js';
import { QUESTIONS } from '../../js/quizData.js';

describe('questionnaire reachability', () => {
  it('can reach all eight type keys', () => {
    const seenKeys = new Set();
    let states = new Set(['0,0,0']);

    for (let i = 0; i < QUESTIONS.length; i += 1) {
      const next = new Set();
      const options = QUESTIONS[i].options;

      for (const state of states) {
        const [a, b, c] = state.split(',').map(Number);
        for (const option of options) {
          const na = a + option.scores.a;
          const nb = b + option.scores.b;
          const nc = c + option.scores.c;
          next.add(`${na},${nb},${nc}`);
        }
      }
      states = next;
    }

    for (const state of states) {
      const [a, b, c] = state.split(',').map(Number);
      seenKeys.add(typeKeyFromScores({ a, b, c }));
    }

    const expected = ['+++', '++-', '+-+', '+--', '-++', '-+-', '--+', '---'];
    expect(Array.from(seenKeys).sort()).toEqual(expected);
  });
});
