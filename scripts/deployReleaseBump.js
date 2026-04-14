/**
 * Purpose: Apply HLM-style release bumps; package.json is source of truth.
 * Description:
 *   - Reads version + wbtiBuild from package.json; writes next state back;
 *     regenerates js/appVersion.js.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  nextAppReleaseState,
  readPackageReleaseState,
  writePackageReleaseState,
} from './appVersionDeploy.js';
import { writeGeneratedAppVersion } from './appVersionGenerate.js';

/**
 * Bump app version files; return release label for git commit message.
 *
 * @param {string} projectRoot
 * @param {string} bumpType - build | patch | minor | major
 * @returns {string} e.g. v0.3.0 (build 2)
 */
export function bumpAppReleaseFiles(projectRoot, bumpType) {
  const pkgPath = join(projectRoot, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error('Missing package.json (required for release labels).');
  }
  const current = readPackageReleaseState(projectRoot);
  const next = nextAppReleaseState(current, bumpType);
  writePackageReleaseState(projectRoot, next);
  mkdirSync(join(projectRoot, 'js'), { recursive: true });
  writeGeneratedAppVersion(projectRoot, next);
  return `v${next.appVersion} (build ${next.appBuild})`;
}
