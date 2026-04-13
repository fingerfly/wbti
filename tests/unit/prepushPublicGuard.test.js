/**
 * Purpose: Verify pre-push public repo guard helpers.
 */
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  classifyEnvFiles,
  hasCursorTrackedFiles,
  normalizeLines,
} from '../../scripts/prepushPublicGuard.js';

describe('normalizeLines', () => {
  it('returns trimmed non-empty lines', () => {
    expect(normalizeLines('a\n\n b \n')).toEqual(['a', 'b']);
  });
});

describe('hasCursorTrackedFiles', () => {
  it('detects tracked .cursor files', () => {
    expect(hasCursorTrackedFiles(['.cursor/plans/a.plan.md'])).toBe(true);
  });

  it('returns false when none found', () => {
    expect(hasCursorTrackedFiles(['README.md', 'js/app.js'])).toBe(false);
  });
});

describe('classifyEnvFiles', () => {
  it('allows env template files', () => {
    const r = classifyEnvFiles(['deploy.env.example', '.env.example']);
    expect(r.blocked).toEqual([]);
  });

  it('blocks non-template env files', () => {
    const r = classifyEnvFiles(['.env', '.env.deploy', 'x.env.local']);
    expect(r.blocked).toEqual(['.env', '.env.deploy', 'x.env.local']);
  });
});
