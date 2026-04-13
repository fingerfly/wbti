/**
 * Purpose: Optional result copy that does not affect WBTI scoring.
 * Description:
 * - Easter-egg lines use session display indices (shuffle-safe).
 * - Score-based lines read result.scores (post-compute, display-only).
 * - UI must label these as entertainment-only.
 */

/**
 * @param {{
 *   answers: number[],
 *   session: { questions: unknown[] },
 *   result?: { scores?: { a: number, b: number, c: number } },
 * }} ctx
 * @returns {string|undefined}
 */
export function pickEasterEgg(ctx) {
  const { answers, session, result } = ctx;
  if (!Array.isArray(answers) || !session?.questions) return undefined;
  if (answers.length !== session.questions.length) return undefined;

  const nQ = answers.length;

  if (answers.every((a) => a === 0)) {
    return (
      `彩蛋：${nQ} 题全选了每题的第一个选项——纯属娱乐，不影响分型。`
    );
  }
  if (answers.every((a) => a === 3)) {
    return (
      `彩蛋：${nQ} 题全选了每题的最后一个选项——节奏整齐，结果仍以算法为准。`
    );
  }
  if (answers.every((a) => a === answers[0])) {
    return `彩蛋：${nQ} 题都选了同一槽位——节奏拉满，结果仍以算法为准。`;
  }

  const zigzag = answers.every((a, i) => (i % 2 === 0 ? a === 0 : a === 3));
  if (zigzag && answers.length >= 4) {
    return (
      '彩蛋：你在第一／第四选项间反复横跳——手很秀，分型照旧按分数算。'
    );
  }

  const alt = answers.every((a, i) => (i % 2 === 0 ? a === 1 : a === 2));
  if (alt && answers.length >= 4) {
    return (
      '彩蛋：第二／第三槽位交替打卡——走位风骚，仅供娱乐不构成诊断。'
    );
  }

  const sc = result?.scores;
  const hi = Math.max(8, Math.ceil(nQ * 0.75));
  if (sc && Number.isFinite(sc.a) && Number.isFinite(sc.b) && Number.isFinite(sc.c)) {
    if (sc.a >= hi && sc.b >= hi && sc.c >= hi) {
      return (
        '彩蛋：三维分数都挺「满」——热血打工人氛围（娱乐向，非能力测评）。'
      );
    }
    if (sc.a <= -hi && sc.b <= -hi && sc.c <= -hi) {
      return (
        '彩蛋：三维分数都挺「淡」——低功耗模式拉满（娱乐向，非状态诊断）。'
      );
    }
  }

  return undefined;
}
