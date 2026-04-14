#!/usr/bin/env node
/**
 * Purpose: Cross-platform WBTI release — tests, semver bump, push public mirror.
 * Description:
 *   - Same idea as Goja / HLM `deploy.js`: Node + git only.
 *   - Bumps package.json (version + wbtiBuild) and regenerates
 *     js/appVersion.js. Set `WBTI_DEPLOY_REMOTE`; optional deploy dir/env.
 */
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import {
  normalizeRemoteRepo,
  syncDeployTree,
} from './deployLib.js';
import { bumpAppReleaseFiles } from './deployReleaseBump.js';
import {
  commitAllWithAuthor,
  ensureDeployCheckout,
  gitLive,
  gitOutput,
  preflightGitRemote,
} from './deployGitOps.js';
import { loadEnvDeploy } from './deployEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const projectRoot = join(__dirname, '..');
loadEnvDeploy(projectRoot);
const VALID = ['build', 'patch', 'minor', 'major'];

function resolveDeployRemote() {
  const u = String(process.env.WBTI_DEPLOY_REMOTE ?? '').trim();
  if (!u) {
    throw new Error(
      'Set WBTI_DEPLOY_REMOTE (e.g. https://github.com/OWNER/wbti.git).',
    );
  }
  const norm = normalizeRemoteRepo(u);
  if (!norm) {
    throw new Error(`WBTI_DEPLOY_REMOTE must be a github.com repo URL: ${u}`);
  }
  return { url: u, expectedRepo: norm };
}

function runTestsOrExit() {
  const r = spawnSync('npm', ['test'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function resolveDeployDir() {
  const o = String(process.env.WBTI_DEPLOY_DIR ?? '').trim();
  if (o) return o;
  return join(tmpdir(), 'wbti-deploy');
}

/**
 * @param {string} bumpType
 */
export function runDeploy(bumpType) {
  const { url, expectedRepo } = resolveDeployRemote();
  preflightGitRemote(url);
  runTestsOrExit();

  const versionLabel = bumpAppReleaseFiles(projectRoot, bumpType);

  const deployDir = resolveDeployDir();
  ensureDeployCheckout(deployDir, url, expectedRepo);
  syncDeployTree(projectRoot, deployDir);
  gitLive(['add', '-A'], deployDir);
  const stat = gitOutput(['diff', '--cached', '--stat'], deployDir);
  if (!stat) {
    console.log('No changes to deploy.');
    return;
  }
  console.log(stat);
  commitAllWithAuthor(deployDir, `Release ${versionLabel}`);
  const originUrl = gitOutput(['remote', 'get-url', 'origin'], deployDir);
  if (normalizeRemoteRepo(originUrl) !== expectedRepo) {
    throw new Error(
      `Safety: origin is "${originUrl}", expected ${expectedRepo}.`,
    );
  }
  gitLive(['push', 'origin', 'HEAD:main'], deployDir);
  console.log(`Deployed ${versionLabel} → ${url}`);
}

const isDirectRun =
  Boolean(process.argv[1]) && resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  const raw = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flags = new Set(process.argv.filter((a) => a.startsWith('--')));
  const bump = raw[0]?.toLowerCase();
  if (!bump || !VALID.includes(bump)) {
    console.error('Usage: npm run release:patch (also :minor :major :build)');
    console.error('Requires --confirm');
    process.exit(1);
  }
  if (!flags.has('--confirm')) {
    console.error('Missing --confirm');
    process.exit(1);
  }
  try {
    runDeploy(bump);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
