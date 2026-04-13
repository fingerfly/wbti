/**
 * Purpose: Unit tests for local achievement unlocks.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  listUnlockedIds,
  onQuizComplete,
} from '../../js/achievements.js';

beforeEach(() => {
  localStorage.clear();
});

describe('onQuizComplete', () => {
  it('unlocks finish_once', () => {
    onQuizComplete({
      completedAt: new Date('2020-06-15T12:00:00'),
      minSelectMs: 9999,
    });
    expect(listUnlockedIds()).toContain('finish_once');
  });

  it('unlocks night_owl for late hour', () => {
    onQuizComplete({
      completedAt: new Date('2020-06-15T23:30:00'),
      minSelectMs: 9999,
    });
    expect(listUnlockedIds()).toContain('night_owl');
  });

  it('unlocks speed_runner when minSelectMs is very low', () => {
    onQuizComplete({
      completedAt: new Date('2020-06-15T12:00:00'),
      minSelectMs: 50,
    });
    expect(listUnlockedIds()).toContain('speed_runner');
  });
});
