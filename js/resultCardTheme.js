/**
 * Purpose: Random visual theme on result card (screenshot variety).
 * @param {HTMLElement | null} cardEl
 * @param {() => number} randomFn
 */
export function applyRandomDropTheme(cardEl, randomFn) {
  if (!cardEl) return;
  const themes = ['drop1', 'drop2', 'drop3', 'drop4'];
  const pick = themes[Math.floor(randomFn() * themes.length)];
  for (const t of themes) {
    cardEl.classList.remove(`result-card--${t}`);
  }
  cardEl.classList.add(`result-card--${pick}`);
}
