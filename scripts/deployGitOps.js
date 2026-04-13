/**
 * Purpose: Git subprocess helpers for WBTI deploy (no semver / tree sync).
 * Description:
 *   - Uses execFileSync only (no shell string); works on Windows with git.exe.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeRemoteRepo } from './deployLib.js';

const DEFAULT_NAME = 'wbti-release';
const DEFAULT_EMAIL = 'wbti-release@local.invalid';

/**
 * @param {string[]} args
 * @param {string} cwd
 */
export function gitOutput(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

/**
 * @param {string[]} args
 * @param {string} cwd
 */
export function gitLive(args, cwd) {
  execFileSync('git', args, { cwd, stdio: 'inherit' });
}

/**
 * @param {string} url
 */
export function preflightGitRemote(url) {
  try {
    execFileSync('git', ['ls-remote', url, 'HEAD'], {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Cannot reach remote "${url}". ${msg}`);
  }
}

/**
 * @param {string} deployDir
 * @param {string} remoteUrl
 * @param {string} expectedRepo
 */
export function ensureDeployCheckout(deployDir, remoteUrl, expectedRepo) {
  let reuse = false;
  if (existsSync(join(deployDir, '.git'))) {
    try {
      const cur = gitOutput(['remote', 'get-url', 'origin'], deployDir);
      if (normalizeRemoteRepo(cur) === expectedRepo) {
        reuse = true;
        gitLive(['pull', '--ff-only', 'origin', 'main'], deployDir);
      }
    } catch {
      reuse = false;
    }
  }
  if (!reuse) {
    rmSync(deployDir, { recursive: true, force: true });
    execFileSync('git', ['clone', remoteUrl, deployDir], { stdio: 'inherit' });
  }
  try {
    gitLive(['checkout', 'main'], deployDir);
  } catch {
    gitLive(['checkout', '-B', 'main'], deployDir);
  }
}

/**
 * @param {string} deployDir
 * @param {string} message
 */
export function commitAllWithAuthor(deployDir, message) {
  const name = process.env.WBTI_DEPLOY_GIT_NAME || DEFAULT_NAME;
  const email = process.env.WBTI_DEPLOY_GIT_EMAIL || DEFAULT_EMAIL;
  const author = `${name} <${email}>`;
  execFileSync(
    'git',
    ['commit', '--author', author, '-m', message],
    {
      cwd: deployDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_COMMITTER_NAME: name,
        GIT_COMMITTER_EMAIL: email,
      },
    },
  );
}
