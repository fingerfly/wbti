/**
 * Purpose: Recursively Object.freeze plain objects and arrays (content trees).
 * @param {unknown} value
 * @returns {unknown}
 */
export function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  Object.freeze(value);
  if (Array.isArray(value)) {
    for (const x of value) deepFreeze(x);
  } else {
    for (const k of Object.keys(value)) {
      const v = value[k];
      if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
        deepFreeze(v);
      }
    }
  }
  return value;
}
