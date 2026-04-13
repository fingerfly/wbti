/**
 * Purpose: Public quiz data surface for WBTI modules and tests.
 * Description:
 * - Content lives under data/*.json; knobs in data/app-config.json (see appConfig).
 * - QUESTIONS: canonical patterns from data/canonical-questions.json.
 * - QUESTION_BANK: patterns × variants; play uses pickBalancedSessionFromBank.
 */
export { CANONICAL_TEN, QUESTIONS } from './quizPatterns.js';
export {
  QUESTION_BANK,
  PATTERN_COUNT,
  VARIANTS_PER_PATTERN,
} from './quizBank.js';
export {
  SHOW_VARIANT_SCENE_DEFAULT,
  TIE_SIGN_BY_AXIS,
} from './appConfig.js';
export {
  SESSION_SIZE,
  pickBalancedSessionFromBank,
  balanceAxisHistogram,
  isPersonalityCoverageBalanced,
  axisDiscrimination,
  primaryAxisForQuestion,
  sessionBalanceAxis,
  assertUniqueQuestionIdsInSession,
  patternRepeatCap,
  patternRepeatCapOk,
  uniquePatternCountInBank,
} from './sessionBalance.js';
