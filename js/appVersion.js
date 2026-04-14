/**
 * Purpose: Expose WBTI semver + build for UI and release tooling.
 * Description:
 *   - APP_VERSION mirrors package.json; keep in sync on semver releases.
 *   - APP_BUILD increments on `npm run release:build`; resets to 1 on
 *     patch/minor/major (see scripts/deploy.js).
 */

export const APP_VERSION = "0.3.1";
export const APP_BUILD = 1;

/**
 * Human-readable version for footer or diagnostics.
 *
 * @returns {string}
 */
export function getDisplayVersion() {
  return `v${APP_VERSION} (build ${APP_BUILD})`;
}
