/**
 * Purpose: Balanced session draw from an extensible question bank.
 * Description:
 * - "人格角色覆盖" operationalized as **primary-axis balance** (WBTI a/b/c).
 * - Each item's primary axis = argmax of (max−min) option scores on that axis;
 *   ties break in order a → b → c (deterministic).
 * - For session size n: require every axis count in [⌊n/3⌋, ⌈n/3⌉] (e.g. n=16 →
 *   only permutations of 5,5,6). Same rule scales when bank grows.
 * - Draw: random 16 distinct bank indices → if unbalanced, swap (replacement
 *   must not reuse an id already in the session); greedy fallback same rule.
 * - **母题 cap**：同一 `patternId` 每局至多 ⌈n / 母题种数⌉ 次（16 题、16 母题 →
 *   每母题 ≤1），一局题干正文互不重复。
 * - Every return path asserts unique question.id within the session.
 */
import { SESSION_SIZE } from './appConfig.js';

export { SESSION_SIZE };

/** @typedef {'a'|'b'|'c'} Axis */

const AXES = /** @type {const} */ (['a', 'b', 'c']);

/**
 * Per-axis score spread across options (discriminative strength).
 * @param {{ options: readonly { scores: { a: number, b: number, c: number } }[] }} q
 * @returns {{ a: number, b: number, c: number }}
 */
export function axisDiscrimination(q) {
  const opts = q.options;
  let minA = Infinity;
  let maxA = -Infinity;
  let minB = Infinity;
  let maxB = -Infinity;
  let minC = Infinity;
  let maxC = -Infinity;
  for (const o of opts) {
    const { a, b, c } = o.scores;
    minA = Math.min(minA, a);
    maxA = Math.max(maxA, a);
    minB = Math.min(minB, b);
    maxB = Math.max(maxB, b);
    minC = Math.min(minC, c);
    maxC = Math.max(maxC, c);
  }
  return {
    a: maxA - minA,
    b: maxB - minB,
    c: maxC - minC,
  };
}

/**
 * Single primary axis for balance counting (ties → a, then b, then c).
 * @param {{ options: readonly { scores: { a: number, b: number, c: number } }[] }} q
 * @returns {Axis}
 */
export function primaryAxisForQuestion(q) {
  const d = axisDiscrimination(q);
  const m = Math.max(d.a, d.b, d.c);
  if (d.a === m) return 'a';
  if (d.b === m) return 'b';
  return 'c';
}

/**
 * Balance slot for coverage (authoritative when set on bank items).
 * @param {{ balanceAxis?: string, options?: unknown }} q
 * @returns {Axis}
 */
export function sessionBalanceAxis(q) {
  const ax = q.balanceAxis;
  if (ax === 'a' || ax === 'b' || ax === 'c') return ax;
  return primaryAxisForQuestion(/** @type {object} */ (q));
}

/**
 * Histogram of balance slots (maps to the three poles that form 8 roles).
 * @param {readonly object[]} questions
 * @returns {Record<Axis, number>}
 */
export function balanceAxisHistogram(questions) {
  /** @type {Record<Axis, number>} */
  const h = { a: 0, b: 0, c: 0 };
  for (const q of questions) {
    h[sessionBalanceAxis(q)] += 1;
  }
  return h;
}

/**
 * True iff each axis count lies in [⌊n/3⌋, ⌈n/3⌉] (uniform coverage of the
 * three poles that define the 8 WBTI roles).
 * @param {Record<Axis, number>} h
 * @param {number} n - session length
 */
export function isPersonalityCoverageBalanced(h, n) {
  if (h.a + h.b + h.c !== n) return false;
  const lo = Math.floor(n / 3);
  const hi = Math.ceil(n / 3);
  return h.a >= lo && h.a <= hi && h.b >= lo && h.b <= hi && h.c >= lo && h.c <= hi;
}

/**
 * @param {readonly { id: string }[]} questions
 * @throws {Error} if any duplicate id
 */
export function assertUniqueQuestionIdsInSession(questions) {
  const seen = new Set();
  for (const q of questions) {
    if (seen.has(q.id)) {
      throw new Error(
        `sessionBalance: duplicate question id in session: ${q.id}`,
      );
    }
    seen.add(q.id);
  }
}

/**
 * Distinct mother-question ids in bank (items without patternId ignored).
 * @param {readonly object[]} bank
 * @returns {number}
 */
export function uniquePatternCountInBank(bank) {
  const s = new Set();
  for (const q of bank) {
    if (typeof q.patternId === 'number') s.add(q.patternId);
  }
  return s.size;
}

/**
 * Max repeats of the same patternId allowed in one session (spread stems).
 * @param {number} n - session length
 * @param {readonly object[]} bank
 * @returns {number} Infinity when bank has no patternId metadata
 */
export function patternRepeatCap(n, bank) {
  const u = uniquePatternCountInBank(bank);
  if (u === 0) return Infinity;
  return Math.ceil(n / u);
}

/**
 * @param {readonly object[]} questions
 * @param {number} n
 * @param {readonly object[]} bank
 */
export function patternRepeatCapOk(questions, n, bank) {
  const cap = patternRepeatCap(n, bank);
  if (!Number.isFinite(cap)) return true;
  /** @type {Record<number, number>} */
  const c = {};
  for (const q of questions) {
    if (typeof q.patternId !== 'number') continue;
    const k = q.patternId;
    c[k] = (c[k] || 0) + 1;
    if (c[k] > cap) return false;
  }
  return true;
}

/**
 * @param {object[]} sel
 * @param {number} ri
 * @param {object} rep
 * @param {number} n
 * @param {readonly object[]} bank
 */
function swapKeepsPatternCap(sel, ri, rep, n, bank) {
  const cap = patternRepeatCap(n, bank);
  if (!Number.isFinite(cap)) return true;
  /** @type {Record<number, number>} */
  const c = {};
  for (let i = 0; i < sel.length; i += 1) {
    if (i === ri) continue;
    const pid = sel[i].patternId;
    if (typeof pid !== 'number') continue;
    c[pid] = (c[pid] || 0) + 1;
  }
  const rp = rep.patternId;
  if (typeof rp === 'number') {
    c[rp] = (c[rp] || 0) + 1;
  }
  return Object.values(c).every((x) => x <= cap);
}

/**
 * @param {object[]} sel
 * @param {number} n
 * @param {readonly object[]} bank
 */
function sessionDrawOk(sel, n, bank) {
  return (
    isPersonalityCoverageBalanced(balanceAxisHistogram(sel), n) &&
    patternRepeatCapOk(sel, n, bank)
  );
}

/**
 * @param {number[]} idxs
 * @param {() => number} random
 * @returns {number[]}
 */
function shuffleIndices(idxs, random) {
  const a = [...idxs];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/**
 * @template T
 * @param {readonly T[]} arr
 * @param {number} k
 * @param {() => number} random
 * @returns {T[]}
 */
function sampleDistinctByIndex(arr, k, random) {
  if (arr.length < k) {
    throw new RangeError(`bank size ${arr.length} < session size ${k}`);
  }
  const order = shuffleIndices(
    arr.map((_, i) => i),
    random,
  );
  return order.slice(0, k).map((i) => arr[i]);
}

/**
 * @param {Record<Axis, number>} h
 * @returns {Axis}
 */
function argMaxAxis(h) {
  let ax = 'a';
  let v = h.a;
  if (h.b > v) {
    ax = 'b';
    v = h.b;
  }
  if (h.c > v) {
    ax = 'c';
    v = h.c;
  }
  return /** @type {Axis} */ (ax);
}

/**
 * @param {Record<Axis, number>} h
 * @returns {Axis}
 */
function argMinAxis(h) {
  let ax = 'a';
  let v = h.a;
  if (h.b < v) {
    ax = 'b';
    v = h.b;
  }
  if (h.c < v) {
    ax = 'c';
    v = h.c;
  }
  return /** @type {Axis} */ (ax);
}

/**
 * Max items drawable from one balanceAxis pool under patternRepeatCap (per-pattern
 * variant ceiling).
 * @param {readonly object[]} bank
 * @param {Axis} ax
 * @param {number} cap
 */
function maxAxisTakeUnderPatternCap(bank, ax, cap) {
  if (!Number.isFinite(cap)) return Infinity;
  /** @type {Record<number, number>} */
  const variantCount = {};
  for (const q of bank) {
    if (sessionBalanceAxis(q) !== ax) continue;
    const p = q.patternId;
    if (typeof p !== 'number') continue;
    variantCount[p] = (variantCount[p] || 0) + 1;
  }
  let sum = 0;
  for (const cnt of Object.values(variantCount)) {
    sum += Math.min(cnt, cap);
  }
  return sum;
}

/**
 * Greedy 5+5+6-style construction when random+swap fails.
 * @param {readonly object[]} bank
 * @param {() => number} random
 * @param {number} n
 */
function greedyBalancedPick(bank, random, n) {
  const lo = Math.floor(n / 3);
  const cap = patternRepeatCap(n, bank);
  /** @type {Record<Axis, object[]>} */
  const pools = { a: [], b: [], c: [] };
  for (const q of bank) {
    pools[sessionBalanceAxis(q)].push(q);
  }
  for (const ax of AXES) {
    if (pools[ax].length < lo) {
      throw new Error(
        `sessionBalance: bank lacks ≥${lo} questions with primary axis ${ax}`,
      );
    }
  }
  const targets = { a: lo, b: lo, c: lo };
  const rem = n - lo * 3;
  for (let i = 0; i < rem; i += 1) {
    const candidates = AXES.filter(
      (ax) =>
        targets[ax] < maxAxisTakeUnderPatternCap(bank, ax, cap),
    );
    if (candidates.length === 0) {
      throw new Error(
        'sessionBalance: greedy cannot assign remainder under pattern cap',
      );
    }
    const ax = candidates[Math.floor(random() * candidates.length)];
    targets[ax] += 1;
  }
  for (const ax of AXES) {
    if (pools[ax].length < targets[ax]) {
      throw new Error(
        `sessionBalance: axis ${ax} need ${targets[ax]} items, have ${pools[ax].length}`,
      );
    }
  }
  /** @type {Record<number, number>} */
  const patCount = {};
  /** @param {object} q */
  function canTake(q) {
    if (!Number.isFinite(cap)) return true;
    const pid = q.patternId;
    if (typeof pid !== 'number') return true;
    return (patCount[pid] || 0) < cap;
  }
  /** @param {object} q */
  function take(q) {
    const pid = q.patternId;
    if (typeof pid === 'number') {
      patCount[pid] = (patCount[pid] || 0) + 1;
    }
  }
  const out = [];
  for (const ax of AXES) {
    const need = targets[ax];
    const order = shuffleIndices(
      pools[ax].map((_, i) => i),
      random,
    );
    let got = 0;
    for (const ii of order) {
      if (got >= need) break;
      const q = pools[ax][ii];
      if (canTake(q)) {
        out.push(q);
        take(q);
        got += 1;
      }
    }
    if (got < need) {
      throw new Error(
        `sessionBalance: greedy cannot fill axis ${ax} (${got}/${need}) ` +
          `with patternRepeatCap=${cap}`,
      );
    }
  }
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  assertUniqueQuestionIdsInSession(out);
  if (!sessionDrawOk(out, n, bank)) {
    throw new Error('sessionBalance: greedy failed sessionDrawOk');
  }
  return out;
}

/**
 * @param {{ maxFullRetries?: number, maxLocalSwaps?: number, sessionSize?: number }} [opts]
 */
export function pickBalancedSessionFromBank(bank, random, opts = {}) {
  const n = opts.sessionSize ?? SESSION_SIZE;
  const maxFullRetries = opts.maxFullRetries ?? 100;
  const maxLocalSwaps = opts.maxLocalSwaps ?? 400;

  for (let attempt = 0; attempt < maxFullRetries; attempt += 1) {
    const selected = sampleDistinctByIndex(bank, n, random);
    /** @param {object[]} sel */
    const idSet = (sel) => new Set(sel.map((q) => q.id));

    let h = balanceAxisHistogram(selected);
    if (sessionDrawOk(selected, n, bank)) {
      assertUniqueQuestionIdsInSession(selected);
      return selected;
    }

    for (let s = 0; s < maxLocalSwaps; s += 1) {
      if (sessionDrawOk(selected, n, bank)) break;
      h = balanceAxisHistogram(selected);
      const axisBad = !isPersonalityCoverageBalanced(h, n);
      const patternBad = !patternRepeatCapOk(selected, n, bank);

      if (axisBad) {
        const over = argMaxAxis(h);
        const under = argMinAxis(h);
        if (h[over] > h[under] + 1) {
          const outIdxs = [];
          for (let i = 0; i < selected.length; i += 1) {
            if (sessionBalanceAxis(selected[i]) === over) outIdxs.push(i);
          }
          if (outIdxs.length === 0) break;
          const ri = outIdxs[Math.floor(random() * outIdxs.length)];
          const used = idSet(selected);

          const preferIn = bank.filter(
            (q) =>
              !used.has(q.id) &&
              sessionBalanceAxis(q) === under &&
              swapKeepsPatternCap(selected, ri, q, n, bank),
          );
          const pool =
            preferIn.length > 0
              ? preferIn
              : bank.filter(
                  (q) =>
                    !used.has(q.id) &&
                    sessionBalanceAxis(q) !== over &&
                    swapKeepsPatternCap(selected, ri, q, n, bank),
                );
          if (pool.length === 0) break;

          const replacement = pool[Math.floor(random() * pool.length)];
          selected[ri] = replacement;
          continue;
        }
      }

      if (patternBad) {
        const cap = patternRepeatCap(n, bank);
        /** @type {Record<number, number>} */
        const pc = {};
        for (const q of selected) {
          if (typeof q.patternId !== 'number') continue;
          pc[q.patternId] = (pc[q.patternId] || 0) + 1;
        }
        const badKeys = Object.keys(pc).filter((k) => pc[Number(k)] > cap);
        if (badKeys.length === 0) break;
        const overPid = Number(
          badKeys[Math.floor(random() * badKeys.length)],
        );
        const idxs = [];
        for (let i = 0; i < selected.length; i += 1) {
          if (selected[i].patternId === overPid) idxs.push(i);
        }
        if (idxs.length === 0) break;
        const ri = idxs[Math.floor(random() * idxs.length)];
        const used = idSet(selected);
        const pool = bank.filter(
          (q) =>
            !used.has(q.id) && swapKeepsPatternCap(selected, ri, q, n, bank),
        );
        if (pool.length === 0) break;
        selected[ri] = pool[Math.floor(random() * pool.length)];
        continue;
      }

      break;
    }

    if (sessionDrawOk(selected, n, bank)) {
      assertUniqueQuestionIdsInSession(selected);
      return selected;
    }
  }

  return greedyBalancedPick(bank, random, n);
}
