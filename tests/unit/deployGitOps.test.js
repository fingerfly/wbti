/**
 * Purpose: Enforce safe git commit flags in deploy helpers.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
