/**
 * Purpose: Toggle visibility among WBTI welcome / quiz / result sections.
 * Description:
 *   - No router; mutually exclusive `is-hidden` + `hidden` for a11y.
 */
/**
 * @param {{
 *   welcome: HTMLElement | null,
 *   quiz: HTMLElement | null,
 *   result: HTMLElement | null,
 *   btnStart: HTMLElement | null,
 *   btnRetake: HTMLElement | null,
 *   questionPrompt: HTMLElement | null,
 * }} els
 * @param {HTMLElement | null} target
 */
export function showQuizScreen(els, target) {
  const screens = [els.welcome, els.quiz, els.result];
  for (const el of screens) {
    if (!el) continue;
    const on = el === target;
    el.classList.toggle('is-hidden', !on);
    el.hidden = !on;
  }
  if (target === els.welcome) els.btnStart?.focus();
  else if (target === els.quiz) els.questionPrompt?.focus();
  else if (target === els.result) els.btnRetake?.focus();
}
