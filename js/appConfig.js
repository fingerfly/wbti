/**
 * Purpose: Product/runtime knobs from data/app-config.json (single source).
 * Description:
 * - Session length, variant row count, UI defaults (scene / option quip),
 *   scoring tie signs.
 * - Validates on load; edit JSON to retune without touching algorithm code.
 */
import raw from '../data/app-config.json' with { type: 'json' };

/**
 * @param {string} name
 * @param {unknown} v
 * @param {number} min
 */
function reqInt(name, v, min) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) {
    throw new Error(`app-config: ${name} must be integer >= ${min}`);
  }
  return n;
}

/**
 * @param {string} name
 * @param {unknown} v
 */
function reqSign(name, v) {
  if (v !== 1 && v !== -1) {
    throw new Error(`app-config: ${name} must be 1 or -1`);
  }
  return v;
}

const t = raw.tieSignByAxis;
if (!t || typeof t !== 'object') {
  throw new Error('app-config: missing tieSignByAxis');
}

/**
 * @param {string} name
 * @param {unknown} v
 */
function reqStr(name, v) {
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`app-config: ${name} must be non-empty string`);
  }
  return v;
}

/**
 * @param {string} name
 * @param {unknown} v
 */
function reqHour(name, v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 23) {
    throw new Error(`app-config: ${name} must be integer 0–23`);
  }
  return n;
}

const ach = raw.achievements;
if (!ach || typeof ach !== 'object') {
  throw new Error('app-config: missing achievements');
}

export const SESSION_SIZE = reqInt('sessionSize', raw.sessionSize, 1);
export const VARIANTS_PER_PATTERN = reqInt(
  'variantsPerPattern',
  raw.variantsPerPattern,
  1,
);
export const SHOW_VARIANT_SCENE_DEFAULT = Boolean(
  raw.showVariantSceneDefault,
);
/** Per-option quip line (`#quiz-quip`); default off for end users. */
export const SHOW_OPTION_QUIP_DEFAULT = Boolean(raw.showOptionQuipDefault);
export const TIE_SIGN_BY_AXIS = Object.freeze({
  a: reqSign('tieSignByAxis.a', t.a),
  b: reqSign('tieSignByAxis.b', t.b),
  c: reqSign('tieSignByAxis.c', t.c),
});

export const ACHIEVEMENTS_STORAGE_KEY = reqStr(
  'achievements.storageKey',
  ach.storageKey,
);
export const SPEED_RUNNER_THRESHOLD_MS = reqInt(
  'achievements.speedRunnerThresholdMs',
  ach.speedRunnerThresholdMs,
  1,
);
export const NIGHT_OWL_FROM_HOUR = reqHour(
  'achievements.nightOwlFromHour',
  ach.nightOwlFromHour,
);
export const NIGHT_OWL_TO_HOUR_INCLUSIVE = reqHour(
  'achievements.nightOwlToHourInclusive',
  ach.nightOwlToHourInclusive,
);
