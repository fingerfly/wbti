/**
 * Purpose: Unit tests for question-step DOM helpers.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearQuizQuip,
  clearQuestionScene,
  renderQuestionStep,
} from '../../js/quizViewQuestion.js';

function makeQuestionEls() {
  return {
    quizProgress: document.createElement('p'),
    questionScene: document.createElement('p'),
    questionPrompt: document.createElement('p'),
    questionOptions: document.createElement('div'),
    quizQuip: document.createElement('p'),
    btnPrev: document.createElement('button'),
    btnNext: document.createElement('button'),
  };
}

const q = {
  id: 'q1',
  prompt: '题干',
  variantContext: { scene: '情境行' },
  options: [
    { text: 'o0', scores: { a: 0, b: 0, c: 0 }, quip: 'q0' },
    { text: 'o1', scores: { a: 0, b: 0, c: 0 }, quip: 'q1' },
    { text: 'o2', scores: { a: 0, b: 0, c: 0 }, quip: 'q2' },
    { text: 'o3', scores: { a: 0, b: 0, c: 0 }, quip: 'q3' },
  ],
};

describe('quizViewQuestion helpers', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('clearQuizQuip empties and hides quip node', () => {
    const els = makeQuestionEls();
    els.quizQuip.textContent = 'x';
    els.quizQuip.hidden = false;
    clearQuizQuip(els);
    expect(els.quizQuip.textContent).toBe('');
    expect(els.quizQuip.hidden).toBe(true);
  });

  it('renderQuestionStep hides scene when showVariantScene is false', () => {
    const els = makeQuestionEls();
    document.body.append(els.questionScene, els.questionOptions);
    renderQuestionStep(els, {
      question: q,
      questionIndex: 0,
      total: 3,
      selectedIndex: null,
      showVariantScene: false,
      showOptionQuip: false,
      onOptionSelect: () => {},
    });
    expect(els.questionScene.hidden).toBe(true);
    expect(els.questionPrompt.textContent).toBe('题干');
    expect(els.questionOptions.querySelectorAll('button').length).toBe(4);
  });

  it('renderQuestionStep shows scene when enabled and scene text exists', () => {
    const els = makeQuestionEls();
    renderQuestionStep(els, {
      question: q,
      questionIndex: 1,
      total: 3,
      selectedIndex: null,
      showVariantScene: true,
      showOptionQuip: false,
      onOptionSelect: () => {},
    });
    expect(els.questionScene.hidden).toBe(false);
    expect(els.questionScene.textContent).toBe('情境行');
    expect(els.quizProgress.textContent.length).toBeGreaterThan(0);
  });

  it('invokes onOptionSelect and toggles quip when showOptionQuip', () => {
    const els = makeQuestionEls();
    let picked = -1;
    renderQuestionStep(els, {
      question: q,
      questionIndex: 0,
      total: 1,
      selectedIndex: 2,
      showVariantScene: false,
      showOptionQuip: true,
      onOptionSelect: (idx) => {
        picked = idx;
      },
    });
    expect(els.quizQuip.textContent).toBe('q2');
    expect(els.quizQuip.hidden).toBe(false);
    els.questionOptions.querySelectorAll('button')[1].click();
    expect(picked).toBe(1);
  });
});
