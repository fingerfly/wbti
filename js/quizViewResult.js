/**
 * Purpose: Result screen DOM for WBTI (title, portrait, report body).
 * Description:
 *   - Fills #result region from a scored result object.
 *   - Keeps quizView.js small by isolating result markup.
 */
import { setResultPortrait } from './profileArt.js';

/**
 * @param {{
 *   resultTitle: HTMLElement | null,
 *   resultSubtitle: HTMLElement | null,
 *   resultPortrait: HTMLImageElement | null,
 *   resultBody: HTMLElement | null,
 * }} els
 * @param {{
 *   title: string,
 *   typeKey: string,
 *   gameSubtitle?: string,
 *   reportSections?: { title: string, body: string }[],
 *   paragraphs: string[],
 *   easterEggLine?: string,
 * }} r
 */
export function renderQuizResult(els, r) {
  if (!els.resultTitle || !els.resultBody) return;
  els.resultTitle.textContent = r.title;
  if (els.resultSubtitle) {
    const sub = r.gameSubtitle?.trim() ?? '';
    els.resultSubtitle.textContent = sub;
    els.resultSubtitle.hidden = sub.length === 0;
  }
  setResultPortrait(els.resultPortrait, r.typeKey, r.title);
  els.resultBody.replaceChildren();
  if (r.easterEggLine) {
    const note = document.createElement('p');
    note.className = 'result-easter';
    note.textContent = r.easterEggLine;
    els.resultBody.append(note);
  }
  if (r.reportSections?.length) {
    for (const sec of r.reportSections) {
      const block = document.createElement('div');
      block.className = 'result-section';
      const head = document.createElement('p');
      head.className = 'result-section__title';
      head.textContent = sec.title;
      const body = document.createElement('p');
      body.className = 'result-section__body';
      body.textContent = sec.body;
      block.append(head, body);
      els.resultBody.append(block);
    }
  } else {
    for (const line of r.paragraphs) {
      const p = document.createElement('p');
      p.textContent = line;
      els.resultBody.append(p);
    }
  }
}
