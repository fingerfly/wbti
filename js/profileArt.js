/**
 * Purpose: Map WBTI typeKey to per-type portrait image URL.
 * Description:
 * - Assets live under profiles/ as profile{typeKey}.png (e.g. profile+++.png),
 *   cropped from the 4×2 profiles.png sheet in the same order as
 *   PROFILE_GRID_ORDER.
 * - setResultPortrait wires <img> src/alt and reveals the element.
 */

/** Grid order: row0 L→R, row1 L→R (matches profiles.png layout). */
export const PROFILE_GRID_ORDER = Object.freeze([
  '+++',
  '++-',
  '+-+',
  '+--',
  '-++',
  '-+-',
  '--+',
  '---',
]);

const PREFIX = 'profiles/profile';

/** @type {Readonly<Record<string, string>>} */
export const PROFILE_SRC_BY_KEY = Object.freeze(
  Object.fromEntries(
    PROFILE_GRID_ORDER.map((k) => [k, `${PREFIX}${k}.png`]),
  ),
);

/**
 * @param {HTMLImageElement | null} el
 * @param {string} typeKey
 * @param {string} title - localized role name for a11y
 */
export function setResultPortrait(el, typeKey, title) {
  if (!el) return;
  const path = PROFILE_SRC_BY_KEY[typeKey];
  if (!path) {
    throw new RangeError(`unknown portrait typeKey: ${typeKey}`);
  }
  el.src = path;
  el.alt = `角色插画：${title}`;
  el.dataset.typeKey = typeKey;
  el.removeAttribute('hidden');
}
