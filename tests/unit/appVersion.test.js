/**
 * Purpose: Unit tests for browser app version constants.
 */
import { describe, it, expect } from 'vitest';
import {
  APP_BUILD,
  APP_VERSION,
  getDisplayVersion,
} from '../../js/appVersion.js';

describe('appVersion', () => {
  it('exposes semver-shaped APP_VERSION', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('exposes positive integer APP_BUILD', () => {
    expect(Number.isInteger(APP_BUILD)).toBe(true);
    expect(APP_BUILD).toBeGreaterThanOrEqual(1);
  });

  it('formats display string', () => {
    expect(getDisplayVersion()).toBe(
      `v${APP_VERSION} (build ${APP_BUILD})`,
    );
  });
});
