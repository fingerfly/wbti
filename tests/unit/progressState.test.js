/**
 * Purpose: Unit tests for completion counter persistence.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  bumpCompletionCount,
  getCompletionCount,
} from '../../js/progressState.js';

beforeEach(() => {
  localStorage.clear();
});

describe('progressState', () => {
  it('starts at zero', () => {
    expect(getCompletionCount()).toBe(0);
  });

  it('increments on bump', () => {
    bumpCompletionCount();
    expect(getCompletionCount()).toBe(1);
    bumpCompletionCount();
    expect(getCompletionCount()).toBe(2);
  });
});
