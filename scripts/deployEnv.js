/**
 * Purpose: Load optional `wbti/.env.deploy` into `process.env` for releases.
 * Description:
 *   - KEY=value lines; # comments; quoted values stripped.
 *   - Does not override non-empty existing env (shell wins).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @param {string} text
 * @param {NodeJS.ProcessEnv} env
 */
export function applyEnvDeployLines(text, env) {
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!String(env[k] ?? '').trim()) {
      env[k] = v;
    }
  }
}

/**
 * @param {string} projectRoot
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {boolean} true if file was read
 */
export function loadEnvDeploy(projectRoot, env = process.env) {
  const p = join(projectRoot, '.env.deploy');
  if (!existsSync(p)) return false;
  applyEnvDeployLines(readFileSync(p, 'utf8'), env);
  return true;
}
