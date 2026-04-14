/**
 * Purpose: Unit tests for deploy-time app version file bumps.
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { bumpAppReleaseFiles } from '../../scripts/deployReleaseBump.js';
import { parseAppVersionState } from '../../scripts/appVersionDeploy.js';

const APP_V_SNIP = `/**
 * Purpose: Test fixture.
 */
export const APP_VERSION = "0.1.0";
export const APP_BUILD = 2;
`;

describe('bumpAppReleaseFiles', () => {
  it('increments APP_BUILD on build', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-rel-'));
    mkdirSync(join(root, 'js'), { recursive: true });
    writeFileSync(
      join(root, 'package.json'),
      `${JSON.stringify({ name: 't', version: '0.1.0' }, null, 2)}\n`,
      'utf8',
    );
    writeFileSync(join(root, 'js', 'appVersion.js'), APP_V_SNIP, 'utf8');
    const label = bumpAppReleaseFiles(root, 'build');
    expect(label).toBe('v0.1.0 (build 3)');
    const next = parseAppVersionState(
      readFileSync(join(root, 'js', 'appVersion.js'), 'utf8'),
    );
    expect(next).toEqual({ appVersion: '0.1.0', appBuild: 3 });
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.1.0');
    rmSync(root, { recursive: true, force: true });
  });

  it('bumps semver and resets build on patch', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-rel-'));
    mkdirSync(join(root, 'js'), { recursive: true });
    writeFileSync(
      join(root, 'package.json'),
      `${JSON.stringify({ name: 't', version: '0.1.0' }, null, 2)}\n`,
      'utf8',
    );
    writeFileSync(join(root, 'js', 'appVersion.js'), APP_V_SNIP, 'utf8');
    bumpAppReleaseFiles(root, 'patch');
    const next = parseAppVersionState(
      readFileSync(join(root, 'js', 'appVersion.js'), 'utf8'),
    );
    expect(next).toEqual({ appVersion: '0.1.1', appBuild: 1 });
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.1.1');
    rmSync(root, { recursive: true, force: true });
  });
});
