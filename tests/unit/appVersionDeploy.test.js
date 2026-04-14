/**
 * Purpose: Unit tests for HLM-style app version deploy helpers.
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  nextAppReleaseState,
  parseAppVersionState,
  readPackageReleaseState,
  updateAppVersionSource,
  writePackageReleaseState,
} from '../../scripts/appVersionDeploy.js';

const SAMPLE = `export const APP_VERSION = "0.3.0";
export const APP_BUILD = 4;
`;

describe('parseAppVersionState', () => {
  it('reads version and build', () => {
    expect(parseAppVersionState(SAMPLE)).toEqual({
      appVersion: '0.3.0',
      appBuild: 4,
    });
  });

  it('throws when malformed', () => {
    expect(() => parseAppVersionState('export const x = 1')).toThrow(
      /Unable to parse/,
    );
  });
});

describe('updateAppVersionSource', () => {
  it('rewrites constants', () => {
    const out = updateAppVersionSource(SAMPLE, {
      appVersion: '0.3.1',
      appBuild: 1,
    });
    expect(out).toContain('APP_VERSION = "0.3.1"');
    expect(out).toContain('APP_BUILD = 1');
  });
});

describe('nextAppReleaseState', () => {
  it('build increments build only', () => {
    expect(
      nextAppReleaseState({ appVersion: '0.3.0', appBuild: 2 }, 'build'),
    ).toEqual({ appVersion: '0.3.0', appBuild: 3 });
  });

  it('patch bumps semver and resets build', () => {
    expect(
      nextAppReleaseState({ appVersion: '0.3.0', appBuild: 5 }, 'patch'),
    ).toEqual({ appVersion: '0.3.1', appBuild: 1 });
  });

  it('rejects unknown mode', () => {
    expect(() =>
      nextAppReleaseState({ appVersion: '0.3.0', appBuild: 1 }, 'oops'),
    ).toThrow(RangeError);
  });
});

describe('readPackageReleaseState', () => {
  it('reads version and wbtiBuild', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-pkg-'));
    writeFileSync(
      join(root, 'package.json'),
      `${JSON.stringify(
        { name: 'x', version: '0.1.0', wbtiBuild: 4 },
        null,
        2,
      )}\n`,
      'utf8',
    );
    expect(readPackageReleaseState(root)).toEqual({
      appVersion: '0.1.0',
      appBuild: 4,
    });
    rmSync(root, { recursive: true, force: true });
  });

  it('defaults wbtiBuild to 1 when absent', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-pkg-'));
    writeFileSync(
      join(root, 'package.json'),
      `${JSON.stringify({ name: 'x', version: '0.1.0' }, null, 2)}\n`,
      'utf8',
    );
    expect(readPackageReleaseState(root)).toEqual({
      appVersion: '0.1.0',
      appBuild: 1,
    });
    rmSync(root, { recursive: true, force: true });
  });
});

describe('writePackageReleaseState', () => {
  it('writes version and wbtiBuild', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-pkg-'));
    writeFileSync(
      join(root, 'package.json'),
      `${JSON.stringify(
        { name: 'x', version: '0.1.0', wbtiBuild: 2 },
        null,
        2,
      )}\n`,
      'utf8',
    );
    writePackageReleaseState(root, {
      appVersion: '0.2.0',
      appBuild: 5,
    });
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.2.0');
    expect(pkg.wbtiBuild).toBe(5);
    expect(pkg.name).toBe('x');
    rmSync(root, { recursive: true, force: true });
  });
});
