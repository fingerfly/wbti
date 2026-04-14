/**
 * Purpose: HLM-style release state for WBTI (semver + build).
 * Description:
 *   - Semver + build live in package.json (version, wbtiBuild).
 *   - Parse/rewrite js/appVersion.js for tests and drift checks (regex shape).
 *   - Compute next state; reuse bumpSemverString for semver bumps.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bumpSemverString } from './deployLib.js';

const VALID = new Set(['build', 'patch', 'minor', 'major']);

/** @type {string} Custom package.json field for HLM-style build counter. */
export const WBTI_BUILD_FIELD = 'wbtiBuild';

/**
 * @param {string} projectRoot
 * @returns {{ appVersion: string, appBuild: number }}
 */
export function readPackageReleaseState(projectRoot) {
  const p = join(projectRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(p, 'utf8'));
  const appVersion = String(pkg.version ?? '').trim();
  if (!appVersion) throw new Error('package.json missing version');
  let raw = pkg[WBTI_BUILD_FIELD];
  if (raw === undefined || raw === null) {
    return { appVersion, appBuild: 1 };
  }
  const appBuild = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(appBuild) || appBuild < 1) {
    throw new RangeError(
      `package.json ${WBTI_BUILD_FIELD} must be a positive integer`,
    );
  }
  return { appVersion, appBuild };
}

/**
 * @param {string} projectRoot
 * @param {{ appVersion: string, appBuild: number }} next
 */
export function writePackageReleaseState(projectRoot, next) {
  const p = join(projectRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(p, 'utf8'));
  pkg.version = next.appVersion;
  pkg[WBTI_BUILD_FIELD] = next.appBuild;
  writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

/**
 * @param {string} source - Full appVersion.js file text.
 * @returns {{ appVersion: string, appBuild: number }}
 */
export function parseAppVersionState(source) {
  const versionMatch = source.match(/APP_VERSION = "([^"]+)"/);
  const buildMatch = source.match(/APP_BUILD = (\d+)/);
  if (!versionMatch || !buildMatch) {
    throw new Error(
      'Unable to parse APP_VERSION / APP_BUILD from js/appVersion.js',
    );
  }
  return {
    appVersion: versionMatch[1],
    appBuild: Number.parseInt(buildMatch[1], 10),
  };
}

/**
 * @param {string} source
 * @param {{ appVersion: string, appBuild: number }} next
 * @returns {string}
 */
export function updateAppVersionSource(source, next) {
  return source
    .replace(/APP_VERSION = "[^"]+"/, `APP_VERSION = "${next.appVersion}"`)
    .replace(/APP_BUILD = \d+/, `APP_BUILD = ${next.appBuild}`);
}

/**
 * @param {{ appVersion: string, appBuild: number }} current
 * @param {'build'|'patch'|'minor'|'major'} mode
 * @returns {{ appVersion: string, appBuild: number }}
 */
export function nextAppReleaseState(current, mode) {
  const t = String(mode).toLowerCase();
  if (!VALID.has(t)) {
    throw new RangeError(`invalid release mode: ${mode}`);
  }
  if (t === 'build') {
    return {
      appVersion: current.appVersion,
      appBuild: current.appBuild + 1,
    };
  }
  return {
    appVersion: bumpSemverString(current.appVersion, t),
    appBuild: 1,
  };
}

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export function appVersionFilePath(projectRoot) {
  return join(projectRoot, 'js', 'appVersion.js');
}
