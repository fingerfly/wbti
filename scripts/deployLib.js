/**
 * Purpose: Pure helpers for WBTI release/deploy (semver, tree sync, remotes).
 * Description:
 *   - No git side effects; safe for unit tests.
 *   - Mirrors patterns used in Goja/HLM deploy tooling.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

/** @type {ReadonlySet<string>} */
export const DEPLOY_EXCLUDE = new Set([
  '.git',
  'node_modules',
  'playwright-report',
  'test-results',
  '.cursor',
]);

/**
 * @param {string} name
 * @returns {boolean}
 */
export function shouldDeployExclude(name) {
  if (DEPLOY_EXCLUDE.has(name)) return true;
  if (name.startsWith('.env')) return true;
  return false;
}

/**
 * @param {string} remoteUrl
 * @returns {string | null} owner/repo lowercased
 */
export function normalizeRemoteRepo(remoteUrl) {
  const text = String(remoteUrl ?? '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '');
  const matched = text.match(/github\.com[:/]([^/]+)\/([^/]+)$/i);
  if (!matched) return null;
  return `${matched[1]}/${matched[2]}`.toLowerCase();
}

/**
 * @param {string} version
 * @returns {{ major: number, minor: number, patch: number } | null}
 */
export function parseSemver(version) {
  const m = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

const VALID_BUMP = new Set(['build', 'patch', 'minor', 'major']);

/**
 * @param {string} current
 * @param {string} bumpType
 * @returns {string}
 */
export function bumpSemverString(current, bumpType) {
  const t = String(bumpType).toLowerCase();
  if (!VALID_BUMP.has(t)) {
    throw new RangeError(`invalid bump type: ${bumpType}`);
  }
  if (t === 'build') return String(current).trim();
  const p = parseSemver(current);
  if (!p) throw new RangeError(`invalid semver: ${current}`);
  if (t === 'major') return `${p.major + 1}.0.0`;
  if (t === 'minor') return `${p.major}.${p.minor + 1}.0`;
  return `${p.major}.${p.minor}.${p.patch + 1}`;
}

/**
 * @param {string} sourceDir
 * @param {string} targetDir
 */
export function syncDeployTree(sourceDir, targetDir) {
  const entries = readdirSync(sourceDir, { withFileTypes: true });
  mkdirSync(targetDir, { recursive: true });
  const copied = new Set();
  for (const entry of entries) {
    if (shouldDeployExclude(entry.name)) continue;
    copied.add(entry.name);
    const s = join(sourceDir, entry.name);
    const d = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      syncDeployTree(s, d);
      continue;
    }
    copyFileSync(s, d);
  }
  if (!existsSync(targetDir)) return;
  const existing = readdirSync(targetDir, { withFileTypes: true });
  for (const entry of existing) {
    if (shouldDeployExclude(entry.name)) continue;
    if (copied.has(entry.name)) continue;
    rmSync(join(targetDir, entry.name), { recursive: true, force: true });
  }
}

/**
 * @param {string} projectRoot
 * @param {string} bumpType
 * @returns {string} new version
 */
export function bumpPackageJsonVersion(projectRoot, bumpType) {
  const p = join(projectRoot, 'package.json');
  const raw = readFileSync(p, 'utf8');
  const pkg = JSON.parse(raw);
  const next = bumpSemverString(pkg.version, bumpType);
  pkg.version = next;
  writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  return next;
}
