/**
 * Purpose: Unit tests for deploy-time app version file bumps.
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { bumpAppReleaseFiles } from '../../scripts/deployReleaseBump.js';
import {
  WBTI_BUILD_FIELD,
  parseAppVersionState,
} from '../../scripts/appVersionDeploy.js';

function pkgFixture(version, buildNum) {
  return `${JSON.stringify(
    { name: 't', version, [WBTI_BUILD_FIELD]: buildNum },
    null,
    2,
  )}\n`;
}

describe('bumpAppReleaseFiles', () => {
  it('increments wbtiBuild on build', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-rel-'));
    mkdirSync(join(root, 'js'), { recursive: true });
    writeFileSync(join(root, 'package.json'), pkgFixture('0.1.0', 2), 'utf8');
    const label = bumpAppReleaseFiles(root, 'build');
    expect(label).toBe('v0.1.0 (build 3)');
    const next = parseAppVersionState(
      readFileSync(join(root, 'js', 'appVersion.js'), 'utf8'),
    );
    expect(next).toEqual({ appVersion: '0.1.0', appBuild: 3 });
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.1.0');
    expect(pkg[WBTI_BUILD_FIELD]).toBe(3);
    rmSync(root, { recursive: true, force: true });
  });

  it('bumps semver and resets build on patch', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbti-rel-'));
    mkdirSync(join(root, 'js'), { recursive: true });
    writeFileSync(join(root, 'package.json'), pkgFixture('0.1.0', 2), 'utf8');
    bumpAppReleaseFiles(root, 'patch');
    const next = parseAppVersionState(
      readFileSync(join(root, 'js', 'appVersion.js'), 'utf8'),
    );
    expect(next).toEqual({ appVersion: '0.1.1', appBuild: 1 });
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.1.1');
    expect(pkg[WBTI_BUILD_FIELD]).toBe(1);
    rmSync(root, { recursive: true, force: true });
  });
});
