/**
 * Purpose: Tests for optional .env.deploy parsing.
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { applyEnvDeployLines } from '../../scripts/deployEnv.js';

describe('applyEnvDeployLines', () => {
  it('sets keys and skips comments / blanks', () => {
    const env = {};
    applyEnvDeployLines(
      '# x\n\nWBTI_DEPLOY_REMOTE=https://github.com/a/b.git\n',
      env,
    );
    expect(env.WBTI_DEPLOY_REMOTE).toBe('https://github.com/a/b.git');
  });

  it('strips double quotes', () => {
    const env = {};
    applyEnvDeployLines('FOO="bar baz"\n', env);
    expect(env.FOO).toBe('bar baz');
  });

  it('does not override non-empty existing', () => {
    const env = { WBTI_DEPLOY_REMOTE: 'https://github.com/x/y.git' };
    applyEnvDeployLines('WBTI_DEPLOY_REMOTE=https://github.com/a/b.git\n', env);
    expect(env.WBTI_DEPLOY_REMOTE).toBe('https://github.com/x/y.git');
  });

  it('fills empty string from file', () => {
    const env = { WBTI_DEPLOY_REMOTE: '  ' };
    applyEnvDeployLines('WBTI_DEPLOY_REMOTE=https://github.com/a/b.git\n', env);
    expect(env.WBTI_DEPLOY_REMOTE).toBe('https://github.com/a/b.git');
  });
});
