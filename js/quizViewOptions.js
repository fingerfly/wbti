/**
 * Purpose: Resolve createQuizView option defaults and bank picker.
 * Description:
 *   - Centralizes config fallbacks for a slimmer quizView.js.
 */

/**
 * @typedef {object} QuizViewUserOptions
 * @property {() => number} [random]
 * @property {boolean} [showVariantScene]
 * @property {boolean} [showOptionQuip]
 * @property {(r: () => number) => readonly object[]} [pickSessionQuestions]
 */
import {
  QUESTION_BANK,
  pickBalancedSessionFromBank,
} from './quizData.js';
import { createUniform01 } from './quizSession.js';
import {
  SHOW_OPTION_QUIP_DEFAULT,
  SHOW_VARIANT_SCENE_DEFAULT,
} from './appConfig.js';

const DEFAULT_SHOW_VARIANT_SCENE = SHOW_VARIANT_SCENE_DEFAULT;

/** @param {QuizViewUserOptions} [options] */
export function resolveCreateQuizViewOptions(options = {}) {
  const randomFn = options.random ?? createUniform01();
  const showVariantScene =
    options.showVariantScene ?? DEFAULT_SHOW_VARIANT_SCENE;
  const showOptionQuip =
    options.showOptionQuip ?? SHOW_OPTION_QUIP_DEFAULT;
  const pickSessionQuestions =
    options.pickSessionQuestions ??
    ((r) => pickBalancedSessionFromBank(QUESTION_BANK, r));
  return { randomFn, showVariantScene, showOptionQuip, pickSessionQuestions };
}
