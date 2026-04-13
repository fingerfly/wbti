/**
 * Purpose: Unit tests for deploy helper functions (no git).
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  bumpSemverString,
  normalizeRemoteRepo,
  parseSemver,
  shouldDeployExclude,
  syncDeployTree,
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

describe('shouldDeployExclude', () => {
  it('excludes internal-only metadata from public mirror', () => {
    expect(shouldDeployExclude('.cursor')).toBe(true);
    expect(shouldDeployExclude('AGENTS.md')).toBe(true);
    expect(shouldDeployExclude('.env.deploy')).toBe(true);
    expect(shouldDeployExclude('README.md')).toBe(false);
  });
});

describe('syncDeployTree', () => {
  it('purges internal-only files from deploy target', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-deploylib-'));
    const src = join(root, 'src');
    const dst = join(root, 'dst');
    mkdirSync(src, { recursive: true });
    mkdirSync(dst, { recursive: true });
    writeFileSync(join(src, 'README.md'), '# ok\n', 'utf8');
    writeFileSync(join(dst, 'AGENTS.md'), 'internal only\n', 'utf8');
    writeFileSync(join(dst, '.env.deploy'), 'SECRET=x\n', 'utf8');
    syncDeployTree(src, dst);
    expect(existsSync(join(dst, 'README.md'))).toBe(true);
    expect(existsSync(join(dst, 'AGENTS.md'))).toBe(false);
    expect(existsSync(join(dst, '.env.deploy'))).toBe(false);
    rmSync(root, { recursive: true, force: true });
  });
});
