/**
 * Purpose: Enforce safe git commit flags in deploy helpers.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const execFileSync = vi.fn();

vi.mock('node:child_process', () => ({
  execFileSync,
}));

describe('commitAllWithAuthor', () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });

  it('does not bypass git hooks', async () => {
    const { commitAllWithAuthor } = await import('../../scripts/deployGitOps.js');
    commitAllWithAuthor('/tmp/wbti-deploy', 'Release v0.0.0');

    const commitCall = execFileSync.mock.calls.find(
      ([bin, args]) => bin === 'git' && Array.isArray(args) &&
        args.includes('commit'),
    );
    expect(commitCall).toBeTruthy();
    expect(commitCall[1]).not.toContain('--no-verify');
  });
});

describe('ensureDeployCheckout', () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });

  it('updates origin URL when reusing checkout', async () => {
    const deployDir = mkdtempSync(join(tmpdir(), 'wbti-deploy-test-'));
    mkdirSync(join(deployDir, '.git'));
    execFileSync.mockImplementation((bin, args) => {
      if (
        bin === 'git' &&
        Array.isArray(args) &&
        args[0] === 'remote' &&
        args[1] === 'get-url'
      ) {
        return 'https://github.com/fingerfly/wbti.git\n';
      }
      return '';
    });

    try {
      const { ensureDeployCheckout } = await import('../../scripts/deployGitOps.js');
      ensureDeployCheckout(
        deployDir,
        'git@github.com:fingerfly/wbti.git',
        'fingerfly/wbti',
      );
      const calls = execFileSync.mock.calls.map(([, args]) => args);
      expect(calls).toContainEqual([
        'remote',
        'set-url',
        'origin',
        'git@github.com:fingerfly/wbti.git',
      ]);
    } finally {
      rmSync(deployDir, { recursive: true, force: true });
    }
  });
});
