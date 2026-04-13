/**
 * Purpose: One-shot export of CANONICAL_TEN → data/canonical-questions.json.
 * Run from package root: node scripts/dump-canonical-to-json.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CANONICAL_TEN } from '../js/quizPatterns.js';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'data', 'canonical-questions.json');
const payload = { patterns: JSON.parse(JSON.stringify(CANONICAL_TEN)) };
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
process.stderr.write(`wrote ${out}\n`);
