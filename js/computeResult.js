/**
 * Purpose: Aggregate answers into axis scores and map to a WBTI result.
 * Description:
 * - Sums option scores a/b/c per question index.
 * - Builds an 8-way key from axis signs; zeros use fixed tie signs.
 * - Tie order: axis a, then b, then c (tie constants pick the pole).
 */
import { TIE_SIGN_BY_AXIS } from './appConfig.js';
import { QUESTIONS } from './quizData.js';
import { flattenReportSections, RESULT_BY_KEY } from './resultTypes.js';

export { TIE_SIGN_BY_AXIS };

/**
 * @param {number} sum
 * @param {number} tieSign -1 | 1
 * @returns {-1|1}
 */
export function resolveAxisSign(sum, tieSign) {
  if (sum > 0) return 1;
  if (sum < 0) return -1;
  return tieSign >= 0 ? 1 : -1;
}

/**
 * @param {{ a: number, b: number, c: number }} scores
 * @returns {string} three-char key of '+'/'-'
 */
export function typeKeyFromScores(scores) {
  const a = resolveAxisSign(scores.a, TIE_SIGN_BY_AXIS.a);
  const b = resolveAxisSign(scores.b, TIE_SIGN_BY_AXIS.b);
  const c = resolveAxisSign(scores.c, TIE_SIGN_BY_AXIS.c);
  const ch = (v) => (v > 0 ? '+' : '-');
  return `${ch(a)}${ch(b)}${ch(c)}`;
}

/**
 * @param {number[]} answers - option index per question
 * @param {readonly { options: readonly { scores: { a: number, b: number, c: number } }[] }[]} questions
 * @returns {{ a: number, b: number, c: number }}
 */
export function aggregateAxisScores(answers, questions) {
  let a = 0;
  let b = 0;
  let c = 0;
  for (let i = 0; i < answers.length; i += 1) {
    const idx = answers[i];
    const opt = questions[i].options[idx];
    a += opt.scores.a;
    b += opt.scores.b;
    c += opt.scores.c;
  }
  return { a, b, c };
}

/**
 * @param {number[]} answers
 * @param {readonly { options: readonly { scores: { a: number, b: number, c: number } }[] }[]} [questions]
 * @returns {{
 *   typeKey: string,
 *   id: string,
 *   title: string,
 *   gameSubtitle: string,
 *   reportSections: readonly { title: string, body: string }[],
 *   paragraphs: readonly string[],
 *   scores: { a: number, b: number, c: number }
 * }}
 */
export function computeResult(answers, questions = QUESTIONS) {
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new RangeError('answers length must match question count');
  }
  for (let i = 0; i < answers.length; i += 1) {
    const idx = answers[i];
    const opts = questions[i].options;
    if (!Number.isInteger(idx) || idx < 0 || idx >= opts.length) {
      throw new RangeError(`invalid option index at question ${i}`);
    }
  }
  const scores = aggregateAxisScores(answers, questions);
  const typeKey = typeKeyFromScores(scores);
  const profile = RESULT_BY_KEY[typeKey];
  if (!profile) {
    throw new Error(`missing result copy for key ${typeKey}`);
  }
  const reportSections = profile.reportSections;
  return {
    typeKey,
    id: profile.id,
    title: profile.title,
    gameSubtitle: profile.gameSubtitle ?? '',
    reportSections,
    paragraphs: flattenReportSections(reportSections),
    scores,
  };
}
