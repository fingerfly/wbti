/**
 * Purpose: Unit tests for WBTI per-type portrait URLs and DOM wiring.
 */
import { describe, it, expect } from 'vitest';
import {
  PROFILE_GRID_ORDER,
  PROFILE_SRC_BY_KEY,
  setResultPortrait,
} from '../../js/profileArt.js';
import { RESULT_BY_KEY } from '../../js/resultTypes.js';

describe('PROFILE_SRC_BY_KEY', () => {
  it('covers every result type key exactly once', () => {
    const keys = Object.keys(RESULT_BY_KEY).sort();
    const artKeys = Object.keys(PROFILE_SRC_BY_KEY).sort();
    expect(artKeys).toEqual(keys);
  });

  it('uses profiles/profile{typeKey}.png paths', () => {
    const re = /^profiles\/profile[+-]{3}\.png$/;
    for (const p of Object.values(PROFILE_SRC_BY_KEY)) {
      expect(p).toMatch(re);
    }
  });

  it('keeps PROFILE_GRID_ORDER aligned with eight keys', () => {
    expect(PROFILE_GRID_ORDER.length).toBe(8);
    expect([...PROFILE_GRID_ORDER].sort()).toEqual(
      Object.keys(RESULT_BY_KEY).sort(),
    );
  });
});

describe('setResultPortrait', () => {
  it('sets src, alt, data-type-key, and shows img', () => {
    const el = document.createElement('img');
    el.hidden = true;
    setResultPortrait(el, '+++', '开麦实干家');
    expect(el.getAttribute('src')).toBe('profiles/profile+++.png');
    expect(el.alt).toBe('角色插画：开麦实干家');
    expect(el.dataset.typeKey).toBe('+++');
    expect(el.hidden).toBe(false);
  });

  it('throws for unknown typeKey', () => {
    const el = document.createElement('img');
    expect(() => setResultPortrait(el, '++x', 'x')).toThrow(RangeError);
  });

  it('no-ops when el is null', () => {
    expect(() => setResultPortrait(null, '+++', 't')).not.toThrow();
  });
});
