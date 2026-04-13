/**
 * Purpose: Build a per-attempt quiz session with shuffled order.
 * Description:
 * - Copies bank questions/options, shuffles question order then each option row.
 * - Injectable RNG: tests use seeded PRNG; play uses createUniform01 when set.
 */

/**
 * Uniform floats in [0, 1); prefers crypto for quiz draws (entropy + variety).
 * Falls back to Math.random when crypto is missing (older hosts).
 * @returns {() => number}
 */
export function createUniform01() {
  const buf = new Uint32Array(1);
  return function next() {
    const c = globalThis.crypto;
    if (c && typeof c.getRandomValues === 'function') {
      c.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  };
}

/**
 * Mulberry32 PRNG; returns floats in [0, 1).
 * @param {number} seed - any uint32-ish seed
 * @returns {() => number}
 */
export function createMulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher–Yates shuffle in place.
 * @template T
 * @param {T[]} arr
 * @param {() => number} random - returns [0, 1)
 * @returns {T[]}
 */
export function shuffleInPlace(arr, random) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

/**
 * @param {{
 *   questions: readonly {
 *     id: string,
 *     prompt: string,
 *     options: readonly Record<string, unknown>[],
 *   }[],
 *   random: () => number,
 * }} opts
 * @returns {{ questions: { id: string, prompt: string, options: object[] }[] }}
 */
export function buildQuizSession({ questions, random }) {
  const qs = questions.map((q) => {
    const row = {
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((o) => ({ ...o })),
    };
    if ('patternId' in q) row.patternId = q.patternId;
    if ('variantId' in q) row.variantId = q.variantId;
    if ('balanceAxis' in q) row.balanceAxis = q.balanceAxis;
    if ('variantContext' in q) row.variantContext = q.variantContext;
    return row;
  });
  shuffleInPlace(qs, random);
  for (const q of qs) {
    shuffleInPlace(q.options, random);
  }
  return { questions: qs };
}
