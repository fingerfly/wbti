/**
 * Purpose: User-facing string templates from data/ui-copy.json.
 * Description:
 * - Progress line, share/disclaimer lines.
 */
import raw from '../data/ui-copy.json' with { type: 'json' };
import { deepFreeze } from './deepFreeze.js';

/**
 * @param {string} template
 * @param {Record<string, string | number>} vars
 * @returns {string}
 */
export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/**
 * @param {unknown} j
 */
function assertUiCopy(j) {
  if (!j || typeof j !== 'object') throw new Error('ui-copy.json: root object');
  const pl = j.progressLine;
  if (!pl || typeof pl.template !== 'string') {
    throw new Error('ui-copy: progressLine.template required');
  }
  const sh = j.share;
  if (!sh || typeof sh !== 'object') throw new Error('ui-copy: share required');
  if (typeof sh.resultHeaderPrefix !== 'string') {
    throw new Error('ui-copy: share.resultHeaderPrefix required');
  }
  if (typeof sh.compareBlurbTemplate !== 'string') {
    throw new Error('ui-copy: share.compareBlurbTemplate required');
  }
  if (!Array.isArray(sh.disclaimerLines) || sh.disclaimerLines.length < 1) {
    throw new Error('ui-copy: share.disclaimerLines[] required');
  }
  return /** @type {typeof raw} */ (j);
}

export const UI_COPY = deepFreeze(assertUiCopy(raw));
