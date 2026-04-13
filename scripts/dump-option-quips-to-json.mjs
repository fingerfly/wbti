/**
 * Purpose: Pretty-print data/option-quips.json (no logic import).
 * Run: node scripts/dump-option-quips-to-json.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'data', 'option-quips.json');
const matrix = JSON.parse(readFileSync(out, 'utf8'));
writeFileSync(out, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
process.stderr.write(`formatted ${out}\n`);
