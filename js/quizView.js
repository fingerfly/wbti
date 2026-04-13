/**
 * Purpose: DOM updates for WBTI screens and question rendering.
 * Description:
 *   - Toggles screen visibility without a router.
 *   - Delegates question/result/completion to sibling modules.
 *   - Each attempt uses buildQuizSession (shuffled Q + options).
 */
import { buildQuizSession } from './quizSession.js';
import {
  isFxEnabled,
  playTapIfEnabled,
  vibrateTapIfEnabled,
} from './fxSettings.js';
import {
  clearQuizQuip,
  clearQuestionScene,
  renderQuestionStep,
} from './quizViewQuestion.js';
import { showQuizScreen } from './quizViewScreens.js';
import { resolveCreateQuizViewOptions } from './quizViewOptions.js';
import { completeQuizAndShowResult } from './quizViewComplete.js';

/**
 * @param {object} els - Welcome / quiz / result shell (see index.html).
 * @param {import('./quizViewOptions.js').QuizViewUserOptions} [options]
 */
export function createQuizView(els, options = {}) {
  const { randomFn, showVariantScene, showOptionQuip, pickSessionQuestions } =
    resolveCreateQuizViewOptions(options);

  let questionIndex = 0;
  /** @type {(number|null)[]} */
  let answers = [];
  /** @type {{ questions: object[] } | null} */
  let session = null;
  /** @type {ReturnType<typeof import('./computeResult.js').computeResult> | null} */
  let lastResult = null;
  let lastShownAt = 0;
  let minSelectMs = Infinity;

  function resetQuiz() {
    questionIndex = 0;
    session = null;
    answers = [];
    lastResult = null;
    lastShownAt = 0;
    minSelectMs = Infinity;
    clearQuizQuip(els);
    clearQuestionScene(els);
  }

  function renderQuestion() {
    if (!session) return;
    const q = session.questions[questionIndex];
    const total = session.questions.length;
    renderQuestionStep(els, {
      question: q,
      questionIndex,
      total,
      selectedIndex: answers[questionIndex],
      showVariantScene,
      showOptionQuip,
      onOptionSelect: (idx) => {
        const dt = Date.now() - lastShownAt;
        if (Number.isFinite(dt) && dt >= 0) {
          minSelectMs = Math.min(minSelectMs, dt);
        }
        const fxOn = isFxEnabled();
        playTapIfEnabled(fxOn);
        vibrateTapIfEnabled(fxOn);
        answers[questionIndex] = idx;
        renderQuestion();
        if (els.btnNext) els.btnNext.disabled = false;
      },
    });
    lastShownAt = Date.now();
  }

  return {
    showWelcome: () => showQuizScreen(els, els.welcome),
    startQuiz: () => {
      resetQuiz();
      session = buildQuizSession({
        questions: pickSessionQuestions(randomFn),
        random: randomFn,
      });
      answers = Array(session.questions.length).fill(null);
      showQuizScreen(els, els.quiz);
      renderQuestion();
    },
    goPrev: () => {
      if (questionIndex <= 0) return;
      questionIndex -= 1;
      clearQuizQuip(els);
      renderQuestion();
    },
    goNext: () => {
      if (!session || answers[questionIndex] === null) return;
      const total = session.questions.length;
      if (questionIndex < total - 1) {
        questionIndex += 1;
        clearQuizQuip(els);
        renderQuestion();
        return;
      }
      lastResult = completeQuizAndShowResult({
        answers,
        session,
        els,
        randomFn,
        minSelectMs,
        showResultScreen: () => showQuizScreen(els, els.result),
      });
    },
    retake: () => {
      resetQuiz();
      showQuizScreen(els, els.welcome);
    },
    getLastResult: () => lastResult,
  };
}
