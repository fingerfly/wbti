/**
 * Purpose: quizView DOM wiring (variant scene visibility).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createQuizView } from '../../js/quizView.js';
import { createMulberry32 } from '../../js/quizSession.js';

const oneQ = {
  id: 't0',
  patternId: 0,
  variantId: 0,
  balanceAxis: 'a',
  prompt: '测试题干',
  variantContext: { scene: '【测试情境】', stemVoice: '', optionLead: '' },
  options: [
    { optionId: 't0-o0', text: 'A', scores: { a: 0, b: 0, c: 0 }, quip: '' },
    { optionId: 't0-o1', text: 'B', scores: { a: 0, b: 0, c: 0 }, quip: '' },
    { optionId: 't0-o2', text: 'C', scores: { a: 0, b: 0, c: 0 }, quip: '' },
    { optionId: 't0-o3', text: 'D', scores: { a: 0, b: 0, c: 0 }, quip: '' },
  ],
};

/** All slots carry quip so shuffle order does not hide the first click. */
const oneQWithQuip = {
  ...oneQ,
  options: oneQ.options.map((o) => ({
    ...o,
    quip: '测试接梗一句',
  })),
};

function makeEls() {
  return {
    welcome: document.createElement('section'),
    quiz: document.createElement('section'),
    result: document.createElement('section'),
    btnStart: document.createElement('button'),
    btnPrev: document.createElement('button'),
    btnNext: document.createElement('button'),
    btnRetake: document.createElement('button'),
    btnShare: document.createElement('button'),
    btnCopy: document.createElement('button'),
    quizProgress: document.createElement('p'),
    questionScene: document.createElement('p'),
    quizQuip: document.createElement('p'),
    questionPrompt: document.createElement('p'),
    questionOptions: document.createElement('div'),
    resultTitle: document.createElement('h2'),
    resultSubtitle: document.createElement('p'),
    resultPortrait: document.createElement('img'),
    resultBody: document.createElement('div'),
    resultCard: document.createElement('div'),
  };
}

describe('createQuizView', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('hides variant scene by default when scene metadata exists', () => {
    const els = makeEls();
    document.body.append(els.quiz, els.questionScene);
    const view = createQuizView(els, {
      random: createMulberry32(1),
      pickSessionQuestions: () => [oneQ],
    });
    view.startQuiz();
    expect(els.questionScene.hidden).toBe(true);
    expect(els.questionScene.textContent).toBe('');
  });

  it('shows variant scene when showVariantScene is true', () => {
    const els = makeEls();
    document.body.append(els.quiz, els.questionScene);
    const view = createQuizView(els, {
      random: createMulberry32(1),
      showVariantScene: true,
      pickSessionQuestions: () => [oneQ],
    });
    view.startQuiz();
    expect(els.questionScene.hidden).toBe(false);
    expect(els.questionScene.textContent).toBe('【测试情境】');
  });

  it('keeps quiz-quip hidden when showOptionQuip is off (default)', () => {
    const els = makeEls();
    document.body.append(els.quiz, els.questionOptions, els.quizQuip);
    const view = createQuizView(els, {
      random: createMulberry32(1),
      pickSessionQuestions: () => [oneQWithQuip],
    });
    view.startQuiz();
    els.questionOptions.querySelector('button')?.click();
    expect(els.quizQuip.hidden).toBe(true);
    expect(els.quizQuip.textContent).toBe('');
  });

  it('shows quiz-quip when showOptionQuip is true and option has quip', () => {
    const els = makeEls();
    document.body.append(els.quiz, els.questionOptions, els.quizQuip);
    const view = createQuizView(els, {
      random: createMulberry32(1),
      showOptionQuip: true,
      pickSessionQuestions: () => [oneQWithQuip],
    });
    view.startQuiz();
    els.questionOptions.querySelector('button')?.click();
    expect(els.quizQuip.hidden).toBe(false);
    expect(els.quizQuip.textContent).toBe('测试接梗一句');
  });
});
