/**
 * Purpose: Unit tests for share/compare text builders.
 */
import { describe, it, expect } from 'vitest';
import { buildCompareBlurb, buildShareText } from '../../js/shareText.js';

describe('buildShareText', () => {
  it('appends compare blurb when pageUrl set', () => {
    const r = {
      title: '开麦实干家',
      gameSubtitle: '',
      paragraphs: ['a'],
    };
    const out = buildShareText(r, 'https://example.com/wbti');
    expect(out).toContain('开麦实干家');
    expect(out).toContain('你呢？');
    expect(out).toContain('https://example.com/wbti');
    expect(out).toContain('招聘');
    expect(out).toContain('诊断');
  });

  it('separates reportSections with blank lines', () => {
    const r = {
      title: '测试格',
      gameSubtitle: '',
      paragraphs: [],
      reportSections: [
        { title: '一眼认出你', body: 'A' },
        { title: '出手风格', body: 'B' },
      ],
    };
    const out = buildShareText(r, '');
    expect(out.indexOf('一眼认出你：A\n\n出手风格：B')).toBeGreaterThan(-1);
  });
});

describe('buildCompareBlurb', () => {
  it('includes title and url', () => {
    expect(buildCompareBlurb('淡人', 'https://x.test')).toContain('淡人');
    expect(buildCompareBlurb('淡人', 'https://x.test')).toContain(
      'https://x.test',
    );
  });
});
