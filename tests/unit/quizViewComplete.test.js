/**
 * Purpose: Unit tests for quiz completion pipeline (no full DOM app).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { completeQuizAndShowResult } from '../../js/quizViewComplete.js';

vi.mock('../../js/resultExtras.js', () => ({
  pickEasterEgg: () => '',
}));

vi.mock('../../js/persist.js', () => ({
  persistResult: vi.fn(),
}));

vi.mock('../../js/progressState.js', () => ({
  bumpCompletionCount: vi.fn(),
}));

vi.mock('../../js/achievements.js', () => ({
  onQuizComplete: vi.fn(),
}));

vi.mock('../../js/resultCardTheme.js', () => ({
  applyRandomDropTheme: vi.fn(),
}));

describe('completeQuizAndShowResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.replaceChildren();
  });

  it('renders result and invokes showResultScreen', () => {
    const showResultScreen = vi.fn();
    const els = {
      resultTitle: document.createElement('h2'),
      resultSubtitle: document.createElement('p'),
      resultPortrait: document.createElement('img'),
      resultBody: document.createElement('div'),
      resultCard: document.createElement('div'),
    };
    const session = {
      questions: Array.from({ length: 16 }, (_, i) => ({
        id: `q${i}`,
        options: [
          { scores: { a: 1, b: 0, c: 0 } },
          { scores: { a: -1, b: 0, c: 0 } },
          { scores: { a: 0, b: 1, c: 0 } },
          { scores: { a: 0, b: -1, c: 0 } },
        ],
      })),
    };
    const answers = Array(16).fill(0);
    const r = completeQuizAndShowResult({
      answers,
      session,
      els,
      randomFn: () => 0.5,
      minSelectMs: 100,
      showResultScreen,
    });
    expect(r.title).toBeTruthy();
    expect(showResultScreen).toHaveBeenCalledOnce();
    expect(els.resultTitle.textContent).toBe(r.title);
  });
});
