/**
 * Purpose: Run scoring, side effects, and result view after last answer.
 * Description:
 *   - Easter egg merge, theme, persist, achievements, then result DOM.
 */
import { computeResult } from './computeResult.js';
import { persistResult } from './persist.js';
import { pickEasterEgg } from './resultExtras.js';
import { bumpCompletionCount } from './progressState.js';
import { onQuizComplete } from './achievements.js';
import { applyRandomDropTheme } from './resultCardTheme.js';
import { renderQuizResult } from './quizViewResult.js';

/**
 * @param {{
 *   answers: (number|null)[],
 *   session: { questions: object[] },
 *   els: {
 *     resultTitle: HTMLElement | null,
 *     resultSubtitle: HTMLElement | null,
 *     resultPortrait: HTMLImageElement | null,
 *     resultBody: HTMLElement | null,
 *     resultCard: HTMLElement | null,
 *   },
 *   randomFn: () => number,
 *   minSelectMs: number,
 *   showResultScreen: () => void,
 * }} p
 * @returns {ReturnType<typeof computeResult> & { easterEggLine?: string }}
 */
export function completeQuizAndShowResult(p) {
  const { answers, session, els, randomFn, minSelectMs, showResultScreen } =
    p;
  const idxs = /** @type {number[]} */ (answers.slice());
  const base = computeResult(idxs, session.questions);
  const rawEgg =
    pickEasterEgg({ answers: idxs, session, result: base })?.trim() ?? '';
  const lastResult = rawEgg
    ? { ...base, easterEggLine: rawEgg }
    : { ...base };
  applyRandomDropTheme(els.resultCard, randomFn);
  persistResult(lastResult);
  bumpCompletionCount();
  const ms = minSelectMs === Infinity ? 99999 : minSelectMs;
  onQuizComplete({ completedAt: new Date(), minSelectMs: ms });
  renderQuizResult(els, lastResult);
  showResultScreen();
  return lastResult;
}
