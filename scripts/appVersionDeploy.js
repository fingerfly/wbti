/**
 * Purpose: HLM-style APP_VERSION / APP_BUILD helpers for WBTI deploy.
 * Description:
 *   - Parse/rewrite js/appVersion.js (regex-stable shape).
 *   - Compute next state; reuse bumpSemverString for semver bumps.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bumpSemverString } from './deployLib.js';

const VALID = new Set(['build', 'patch', 'minor', 'major']);

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

/**
 * @param {string} projectRoot
 * @param {string} version - Strict x.y.z semver.
 */
export function writePackageJsonVersion(projectRoot, version) {
  const p = join(projectRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(p, 'utf8'));
  pkg.version = version;
  writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}
