/**
 * Purpose: Unit tests for result-step DOM rendering.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderQuizResult } from '../../js/quizViewResult.js';

function makeResultEls() {
  return {
    resultTitle: document.createElement('h2'),
    resultSubtitle: document.createElement('p'),
    resultPortrait: document.createElement('img'),
    resultBody: document.createElement('div'),
  };
}

describe('renderQuizResult', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('renders title, subtitle trim, portrait, and paragraph fallback', () => {
    const els = makeResultEls();
    renderQuizResult(els, {
      title: '角色甲',
      typeKey: '+++',
      gameSubtitle: '  副标题  ',
      reportSections: null,
      paragraphs: ['第一段', '第二段'],
      easterEggLine: '',
    });
    expect(els.resultTitle.textContent).toBe('角色甲');
    expect(els.resultSubtitle.textContent).toBe('副标题');
    expect(els.resultSubtitle.hidden).toBe(false);
    expect(els.resultPortrait.getAttribute('src')).toContain('profile+++.png');
    expect(els.resultBody.querySelectorAll('p').length).toBe(2);
  });

  it('hides empty subtitle and prefers reportSections over paragraphs', () => {
    const els = makeResultEls();
    renderQuizResult(els, {
      title: 'X',
      typeKey: '+--',
      gameSubtitle: '   ',
      reportSections: [
        { title: 'A', body: 'a' },
        { title: 'B', body: 'b' },
      ],
      paragraphs: ['ignored'],
      easterEggLine: '',
    });
    expect(els.resultSubtitle.hidden).toBe(true);
    const blocks = els.resultBody.querySelectorAll('.result-section');
    expect(blocks.length).toBe(2);
    expect(blocks[0].querySelector('.result-section__title')?.textContent).toBe(
      'A',
    );
  });

  it('prepends easter egg line when present', () => {
    const els = makeResultEls();
    renderQuizResult(els, {
      title: 'X',
      typeKey: '---',
      gameSubtitle: '',
      reportSections: null,
      paragraphs: ['body'],
      easterEggLine: '彩蛋一句',
    });
    const first = els.resultBody.firstElementChild;
    expect(first?.className).toBe('result-easter');
    expect(first?.textContent).toBe('彩蛋一句');
  });
});
