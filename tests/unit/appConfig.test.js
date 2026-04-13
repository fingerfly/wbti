/**
 * Purpose: app-config.json load and invariants.
 */
import { describe, it, expect } from 'vitest';
import {
  SESSION_SIZE,
  VARIANTS_PER_PATTERN,
  SHOW_VARIANT_SCENE_DEFAULT,
  SHOW_OPTION_QUIP_DEFAULT,
  TIE_SIGN_BY_AXIS,
  ACHIEVEMENTS_STORAGE_KEY,
  SPEED_RUNNER_THRESHOLD_MS,
  NIGHT_OWL_FROM_HOUR,
  NIGHT_OWL_TO_HOUR_INCLUSIVE,
} from '../../js/appConfig.js';

describe('appConfig', () => {
  it('exports expected product defaults', () => {
    expect(SESSION_SIZE).toBe(16);
    expect(VARIANTS_PER_PATTERN).toBe(20);
    expect(SHOW_VARIANT_SCENE_DEFAULT).toBe(false);
    expect(SHOW_OPTION_QUIP_DEFAULT).toBe(false);
    expect(TIE_SIGN_BY_AXIS).toEqual({ a: 1, b: -1, c: 1 });
    expect(ACHIEVEMENTS_STORAGE_KEY).toMatch(/^wbti\./);
    expect(SPEED_RUNNER_THRESHOLD_MS).toBe(200);
    expect(NIGHT_OWL_FROM_HOUR).toBe(23);
    expect(NIGHT_OWL_TO_HOUR_INCLUSIVE).toBe(6);
  });
});
