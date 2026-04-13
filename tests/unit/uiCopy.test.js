/**
 * Purpose: ui-copy templates and interpolate().
 */
import { describe, it, expect } from 'vitest';
import { personifiedProgressLine } from '../../js/quizProgressCopy.js';
import { interpolate, UI_COPY } from '../../js/uiCopy.js';

describe('interpolate', () => {
  it('replaces placeholders', () => {
    expect(interpolate('a{b}c', { b: 'X' })).toBe('aXc');
  });
});

describe('personifiedProgressLine', () => {
  it('uses ui-copy template', () => {
    expect(personifiedProgressLine(0, 16)).toContain('1 / 16');
    expect(personifiedProgressLine(0, 16)).toContain('班味');
  });
});

describe('UI_COPY', () => {
  it('has share disclaimer lines', () => {
    expect(UI_COPY.share.disclaimerLines.length).toBeGreaterThan(0);
  });
});
