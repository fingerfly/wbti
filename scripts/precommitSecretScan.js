/**
 * Purpose: Block commits that contain likely secrets in staged text files.
 * Description:
 *   - Scans only staged files (ACM) from git index.
 *   - Skips lock files and common binary assets.
 *   - Uses conservative patterns with placeholder allow-list.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  /token\s*[:=]\s*['"][A-Za-z0-9._\-]{16,}['"]/i,
  /secret\s*[:=]\s*['"][^'"<>\s]{12,}['"]/i,
  /password\s*[:=]\s*['"][^'"<>\s]{8,}['"]/i,
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY-----/,
];

const SKIP_PATTERNS = [
  /^package-lock\.json$/i,
  /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip)$/i,
];

const SAFE_PLACEHOLDERS = [
  '<owner>',
  '<repo>',
  'example.com',
  'you@example.com',
  'YOUR_',
];

const ALLOWLIST_PATH = '.secret-scan-allowlist.json';

export function shouldSkipPath(filePath) {
  return SKIP_PATTERNS.some((re) => re.test(filePath));
}

export function scanTextForSecrets(text, filePath) {
  if (SAFE_PLACEHOLDERS.some((x) => text.includes(x))) {
    return [];
  }
  return SECRET_PATTERNS.filter((re) => re.test(text)).map((re) => ({
    filePath,
    rule: re.source,
  }));
}

/**
 * @param {unknown} data
 * @returns {{ filePath: string, rule: string, reason: string }[]}
 */
export function loadAllowlistEntries(data) {
  const raw = data && typeof data === 'object' ? data.entries : null;
  if (!Array.isArray(raw)) return [];
  const entries = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const filePath = String(item.filePath ?? '').trim();
    const rule = String(item.rule ?? '').trim();
    const reason = String(item.reason ?? '').trim();
    if (!filePath || !rule || !reason) continue;
    entries.push({ filePath, rule, reason });
  }
  return entries;
}

/**
 * @param {string} projectRoot
 * @returns {{ filePath: string, rule: string, reason: string }[]}
 */
function readAllowlist(projectRoot) {
  const p = join(projectRoot, ALLOWLIST_PATH);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    return loadAllowlistEntries(raw);
  } catch {
    return [];
  }
}

/**
 * @param {{ filePath: string, rule: string }} hit
 * @param {{ filePath: string, rule: string, reason: string }[]} entries
 */
export function isAllowlistedHit(hit, entries) {
  for (const e of entries) {
    if (hit.filePath !== e.filePath) continue;
    try {
      const ruleRe = new RegExp(e.rule);
      if (ruleRe.test(hit.rule)) return true;
    } catch {
      continue;
    }
  }
  return false;
}

function stagedFiles() {
  const out = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACM'],
    { encoding: 'utf8' },
  );
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function run() {
  const allowlist = readAllowlist(process.cwd());
  const files = stagedFiles().filter((f) => !shouldSkipPath(f));
  const hits = [];
  for (const filePath of files) {
    let text = '';
    try {
      text = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }
    const found = scanTextForSecrets(text, filePath).filter(
      (hit) => !isAllowlistedHit(hit, allowlist),
    );
    hits.push(...found);
  }
  if (!hits.length) {
    console.log('precommit-secret-scan: no obvious secrets found.');
    return;
  }
  console.error('precommit-secret-scan: blocked potential secrets:');
  for (const hit of hits) {
    console.error(`- ${hit.filePath} (rule: ${hit.rule})`);
  }
  process.exit(1);
}

const isDirectRun =
  Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  run();
}
