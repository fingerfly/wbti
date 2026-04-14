#!/usr/bin/env node
/**
 * Purpose: Fail CI/dev when js/appVersion.js drifts from package.json.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPackageReleaseState } from './appVersionDeploy.js';
import { appVersionJsTemplate } from './appVersionGenerate.js';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');
const expected = appVersionJsTemplate(readPackageReleaseState(root));
const actual = readFileSync(join(root, 'js', 'appVersion.js'), 'utf8');

if (actual !== expected) {
  console.error('js/appVersion.js is out of sync with package.json.');
  console.error('Run: npm run generate:app-version');
  process.exit(1);
}
