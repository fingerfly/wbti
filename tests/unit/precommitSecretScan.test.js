/**
 * Purpose: Verify local pre-commit secret scan helpers.
 */
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  isAllowlistedHit,
  loadAllowlistEntries,
  scanTextForSecrets,
  shouldSkipPath,
} from '../../scripts/precommitSecretScan.js';

describe('shouldSkipPath', () => {
  it('skips lock files and binary assets', () => {
    expect(shouldSkipPath('package-lock.json')).toBe(true);
    expect(shouldSkipPath('profiles/profile+++.png')).toBe(true);
  });

  it('keeps source text files in scope', () => {
    expect(shouldSkipPath('js/app.js')).toBe(false);
    expect(shouldSkipPath('README.md')).toBe(false);
  });
});

describe('scanTextForSecrets', () => {
  it('finds obvious API key assignment', () => {
    const hits = scanTextForSecrets(
      'const apiKey = "12345678901234567890123456789012";',
      'js/app.js',
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it('ignores safe placeholder values', () => {
    const hits = scanTextForSecrets(
      'WBTI_DEPLOY_REMOTE=https://github.com/<owner>/<repo>.git',
      'deploy.env.example',
    );
    expect(hits).toHaveLength(0);
  });
});

describe('allowlist', () => {
  it('loads valid entries and drops malformed ones', () => {
    const entries = loadAllowlistEntries({
      entries: [
        {
          filePath: 'tests/fixtures/demo.txt',
          rule: 'token\\s*[:=]',
          reason: 'test fixture',
        },
        { filePath: 'bad-entry' },
      ],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].filePath).toBe('tests/fixtures/demo.txt');
  });

  it('filters matching hit when entry matches file and rule', () => {
    const hit = {
      filePath: 'tests/fixtures/demo.txt',
      rule: 'token\\s*[:=]\\s*[\'"][A-Za-z0-9._\\-]{16,}[\'"]',
    };
    const entries = loadAllowlistEntries({
      entries: [
        {
          filePath: 'tests/fixtures/demo.txt',
          rule: 'token\\\\s\\*\\[:=\\]',
          reason: 'fixture token string',
        },
      ],
    });
    expect(isAllowlistedHit(hit, entries)).toBe(true);
  });

  it('does not filter non-matching file path', () => {
    const hit = {
      filePath: 'js/app.js',
      rule: 'token\\s*[:=]\\s*[\'"][A-Za-z0-9._\\-]{16,}[\'"]',
    };
    const entries = loadAllowlistEntries({
      entries: [
        {
          filePath: 'tests/fixtures/demo.txt',
          rule: 'token\\\\s\\*\\[:=\\]',
          reason: 'fixture token string',
        },
      ],
    });
    expect(isAllowlistedHit(hit, entries)).toBe(false);
  });
});
