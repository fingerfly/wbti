/**
 * Purpose: Emit js/appVersion.js from package.json release fields.
 * Description:
 *   - Stable template shared by generate, assert, and release bump.
 *   - Writes UTF-8; callers own when to invoke.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readPackageReleaseState } from './appVersionDeploy.js';

/**
 * @param {{ appVersion: string, appBuild: number }} next
 * @returns {string}
 */
export function appVersionJsTemplate(next) {
  return `/**
 * Purpose: Expose WBTI semver + build for UI and release tooling.
 * Description:
 *   - **Generated** from package.json (version + wbtiBuild). Do not edit
 *     by hand; run \`npm run generate:app-version\`.
 *   - APP_BUILD is HLM-style; increments on \`npm run release:build\`.
 */

export const APP_VERSION = "${next.appVersion}";
export const APP_BUILD = ${next.appBuild};

/**
 * Human-readable version for footer or diagnostics.
 *
 * @returns {string}
 */
export function getDisplayVersion() {
  return \`v\${APP_VERSION} (build \${APP_BUILD})\`;
}
`;
}

/**
 * @param {string} projectRoot
 * @param {{ appVersion: string, appBuild: number }} next
 */
export function writeGeneratedAppVersion(projectRoot, next) {
  const target = join(projectRoot, 'js', 'appVersion.js');
  writeFileSync(target, appVersionJsTemplate(next), 'utf8');
}

/**
 * @param {string} projectRoot
 */
export function generateAppVersionFromPackageJson(projectRoot) {
  const state = readPackageReleaseState(projectRoot);
  writeGeneratedAppVersion(projectRoot, state);
}
