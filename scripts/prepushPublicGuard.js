/**
 * Purpose: Block pushing public repos with risky tracked files.
 * Description:
 *   - Fails if tracked `.cursor/` files exist.
 *   - Fails if tracked non-template `.env*` files exist.
 *   - Runs `npm test` before allowing push.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function normalizeLines(text) {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function hasCursorTrackedFiles(files) {
  return files.some((f) => f.startsWith('.cursor/'));
}

export function classifyEnvFiles(files) {
  const envFiles = files.filter((f) => f.includes('.env') || f.startsWith('.env'));
  const blocked = envFiles.filter((f) => !f.endsWith('.example'));
  return { envFiles, blocked };
}

function gitLsFiles() {
  const out = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
  return normalizeLines(out);
}

function runTestsOrExit() {
  const r = spawnSync('npm', ['test'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function run() {
  const files = gitLsFiles();
  if (hasCursorTrackedFiles(files)) {
    console.error('pre-push-guard: tracked .cursor/ files detected.');
    process.exit(1);
  }
  const { blocked } = classifyEnvFiles(files);
  if (blocked.length) {
    console.error('pre-push-guard: tracked non-template .env files detected:');
    for (const file of blocked) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }
  runTestsOrExit();
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  run();
}
