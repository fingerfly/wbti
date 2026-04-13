/**
 * Purpose: Write data/result-catalog.json from loaded RESULT_BY_KEY (after edits).
 * Run: node scripts/dump-result-catalog.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RESULT_BY_KEY } from '../js/resultTypes.js';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'data', 'result-catalog.json');
const payload = {
  resultsByKey: JSON.parse(JSON.stringify(RESULT_BY_KEY)),
};
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
process.stderr.write(`wrote ${out}\n`);
