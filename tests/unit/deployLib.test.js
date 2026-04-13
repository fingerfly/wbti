/**
 * Purpose: Unit tests for deploy helper functions (no git).
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  bumpSemverString,
  normalizeRemoteRepo,
  parseSemver,
} from '../../scripts/deployLib.js';

describe('normalizeRemoteRepo', () => {
  it('parses HTTPS github URL', () => {
    expect(
      normalizeRemoteRepo('https://github.com/Foo/bar.git'),
    ).toBe('foo/bar');
  });

  it('parses SSH github URL', () => {
    expect(normalizeRemoteRepo('git@github.com:Foo/bar.git')).toBe('foo/bar');
  });

  it('returns null for non-GitHub', () => {
    expect(normalizeRemoteRepo('https://example.com/a/b.git')).toBeNull();
  });
});

describe('parseSemver / bumpSemverString', () => {
  it('bumps patch', () => {
    expect(bumpSemverString('0.2.1', 'patch')).toBe('0.2.2');
  });

  it('bumps minor', () => {
    expect(bumpSemverString('0.2.1', 'minor')).toBe('0.3.0');
  });

  it('bumps major', () => {
    expect(bumpSemverString('0.2.1', 'major')).toBe('1.0.0');
  });

  it('build leaves version', () => {
    expect(bumpSemverString('0.2.1', 'build')).toBe('0.2.1');
  });

  it('parseSemver rejects invalid', () => {
    expect(parseSemver('1.2')).toBeNull();
  });
});
