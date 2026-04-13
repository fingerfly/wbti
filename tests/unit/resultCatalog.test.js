/**
 * Purpose: Result catalog JSON shape and eight keys.
 */
import { describe, it, expect } from 'vitest';
import {
  flattenReportSections,
  RESULT_BY_KEY,
} from '../../js/resultTypes.js';

const KEYS = ['+++', '++-', '+-+', '+--', '-++', '-+-', '--+', '---'];

const SECTION_TITLES = [
  '一眼认出你',
  '出手风格',
  '好处与代价',
  '收工口诀',
];

describe('RESULT_BY_KEY', () => {
  it('has all eight axis keys and four report sections each', () => {
    for (const k of KEYS) {
      const e = RESULT_BY_KEY[k];
      expect(e).toBeDefined();
      expect(e.id).toBe(k);
      expect(e.reportSections).toHaveLength(4);
      e.reportSections.forEach((sec, i) => {
        expect(sec.title).toBe(SECTION_TITLES[i]);
        expect(sec.body.length).toBeGreaterThan(0);
      });
      expect(flattenReportSections(e.reportSections)).toHaveLength(4);
    }
  });
});
