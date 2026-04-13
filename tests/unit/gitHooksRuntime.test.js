/**
 * Purpose: Keep git hook launchers Node-based and cross-platform.
 */
// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..', '..');

function readHook(name) {
  return readFileSync(join(ROOT, '.githooks', name), 'utf8');
}

describe('git hook runtimes', () => {
  it('uses Node shebang for pre-commit hook', () => {
    const text = readHook('pre-commit');
    expect(text.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('uses Node shebang for pre-push hook', () => {
    const text = readHook('pre-push');
    expect(text.startsWith('#!/usr/bin/env node')).toBe(true);
  });
});
