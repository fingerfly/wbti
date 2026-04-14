/**
 * Purpose: Apply HLM-style APP_VERSION / APP_BUILD file updates for release.
 * Description:
 *   - Requires js/appVersion.js; enforces APP_VERSION === package.json
 *     version before bumping.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appVersionFilePath,
  nextAppReleaseState,
  parseAppVersionState,
  updateAppVersionSource,
  writePackageJsonVersion,
} from './appVersionDeploy.js';

/**
 * @param {string} projectRoot
 * @returns {string}
 */
function readPackageVersion(projectRoot) {
  const pkg = JSON.parse(
    readFileSync(join(projectRoot, 'package.json'), 'utf8'),
  );
  return String(pkg.version);
}

/**
 * Bump app version files; return release label for git commit message.
 *
 * @param {string} projectRoot
 * @param {string} bumpType - build | patch | minor | major
 * @returns {string} e.g. v0.3.0 (build 2)
 */
export function bumpAppReleaseFiles(projectRoot, bumpType) {
  const avPath = appVersionFilePath(projectRoot);
  if (!existsSync(avPath)) {
    throw new Error('Missing js/appVersion.js (required for release labels).');
  }
  const appSource = readFileSync(avPath, 'utf8');
  const fromFile = parseAppVersionState(appSource);
  const pkgVer = readPackageVersion(projectRoot);
  if (fromFile.appVersion !== pkgVer) {
    throw new Error(
      `APP_VERSION (${fromFile.appVersion}) must match package.json (${pkgVer}).`,
    );
  }
  const next = nextAppReleaseState(fromFile, bumpType);
  const updated = updateAppVersionSource(appSource, next);
  writeFileSync(avPath, updated, 'utf8');
  if (bumpType !== 'build') {
    writePackageJsonVersion(projectRoot, next.appVersion);
  }
  return `v${next.appVersion} (build ${next.appBuild})`;
}
