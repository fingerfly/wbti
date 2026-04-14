#!/usr/bin/env node
/**
 * Purpose: CLI — write js/appVersion.js from package.json.
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { generateAppVersionFromPackageJson } from './appVersionGenerate.js';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');
generateAppVersionFromPackageJson(root);
console.log('Wrote js/appVersion.js from package.json.');
