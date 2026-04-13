/**
 * Purpose: Map 8 axis-sign combos to WBTI result copy (data-driven).
 * Description:
 * - Source: data/result-catalog.json (`resultsByKey`, `reportSections`).
 * - Keys: + / − on axes a,b,c. Entertainment-only copy per SPEC.
 */
import raw from '../data/result-catalog.json' with { type: 'json' };
import { deepFreeze } from './deepFreeze.js';

const REQUIRED_KEYS = /** @type {const} */ ([
  '+++',
  '++-',
  '+-+',
  '+--',
  '-++',
  '-+-',
  '--+',
  '---',
]);

/** Hook, behavior, trade-off, mnemonic — same four titles for every type. */
const REPORT_SECTION_COUNT = 4;

/**
 * @param {readonly { title: string, body: string }[]} sections
 * @returns {string[]}
 */
export function flattenReportSections(sections) {
  return sections.map((s) => `${s.title}：${s.body}`);
}

/**
 * @param {unknown} j
 */
function assertResultCatalog(j) {
  if (!j || typeof j !== 'object' || !j.resultsByKey) {
    throw new Error('result-catalog.json: need { resultsByKey }');
  }
  const rbk = j.resultsByKey;
  if (typeof rbk !== 'object') {
    throw new Error('result-catalog: resultsByKey must be object');
  }
  for (const k of REQUIRED_KEYS) {
    const e = rbk[k];
    if (!e || typeof e !== 'object') {
      throw new Error(`result-catalog: missing entry ${k}`);
    }
    if (e.id !== k) {
      throw new Error(`result-catalog: ${k} id mismatch`);
    }
    if (typeof e.title !== 'string' || !e.title.length) {
      throw new Error(`result-catalog: ${k} needs title`);
    }
    if (typeof e.gameSubtitle !== 'string') {
      throw new Error(`result-catalog: ${k} needs gameSubtitle string`);
    }
    const rs = e.reportSections;
    if (!Array.isArray(rs) || rs.length !== REPORT_SECTION_COUNT) {
      throw new Error(
        `result-catalog: ${k} needs reportSections[${REPORT_SECTION_COUNT}]`,
      );
    }
    for (let i = 0; i < rs.length; i += 1) {
      const sec = rs[i];
      if (!sec || typeof sec !== 'object') {
        throw new Error(`result-catalog: ${k} reportSections[${i}] object`);
      }
      if (typeof sec.title !== 'string' || !sec.title.trim()) {
        throw new Error(`result-catalog: ${k} section[${i}].title`);
      }
      if (typeof sec.body !== 'string' || !sec.body.trim()) {
        throw new Error(`result-catalog: ${k} section[${i}].body`);
      }
    }
  }
  return /** @type {{ resultsByKey: Record<string, object> }} */ (j);
}

const validated = assertResultCatalog(raw);
export const RESULT_BY_KEY = deepFreeze(validated.resultsByKey);
