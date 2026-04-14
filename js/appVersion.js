/**
 * Purpose: Expose WBTI semver + build for UI and release tooling.
 * Description:
 *   - **Generated** from package.json (version + wbtiBuild). Do not edit
 *     by hand; run `npm run generate:app-version`.
 *   - APP_BUILD is HLM-style; increments on `npm run release:build`.
 */

export const APP_VERSION = "0.3.2";
export const APP_BUILD = 1;

/**
 * Human-readable version for footer or diagnostics.
 *
 * @returns {string}
 */
export function getDisplayVersion() {
  return `v${APP_VERSION} (build ${APP_BUILD})`;
}
