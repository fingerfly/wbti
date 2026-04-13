/**
 * Purpose: WBTI question bank (patterns × variant rows from data/).
 * Description:
 * - Mother stems/options: data/canonical-questions.json via CANONICAL_TEN.
 * - Scene / option lead / stem voice: data/variant-tables.json.
 * - Option quips: data/option-quips.json via quizOptionQuips.
 * - Knobs: data/app-config.json via appConfig (session size, variant count).
 */
import { CANONICAL_TEN } from './quizPatterns.js';
import {
  assertOptionQuipsMatrix,
  getOptionQuip,
  OPTION_QUIP_VARIANTS,
} from './quizOptionQuips.js';
import { VARIANTS_PER_PATTERN } from './appConfig.js';
import variantRaw from '../data/variant-tables.json' with { type: 'json' };
import { deepFreeze } from './deepFreeze.js';

export const PATTERN_COUNT = CANONICAL_TEN.length;

const variantTables = deepFreeze(variantRaw);
const SCENES = variantTables.scenes;
const OPT_LEAD = variantTables.optLead;
const STEM_VOICE = variantTables.stemVoice;

/**
 * @param {number} patternIdx
 * @param {number} variantIdx
 * @returns {object}
 */
function buildVariant(patternIdx, variantIdx) {
  const base = CANONICAL_TEN[patternIdx];
  const v = variantIdx;
  const scene = SCENES[v];
  const lead = OPT_LEAD[v];
  const id = `p${patternIdx}-v${v}`;
  const voice = STEM_VOICE[v];
  /** @type {'a'|'b'|'c'} */
  const balanceAxis = ['a', 'b', 'c'][patternIdx % 3];
  return {
    id,
    patternId: patternIdx,
    variantId: v,
    balanceAxis,
    prompt: base.prompt,
    variantContext: Object.freeze({
      scene,
      stemVoice: voice,
      optionLead: lead,
    }),
    options: base.options.map((o, oi) => ({
      optionId: `${id}-o${oi}`,
      text: o.text,
      scores: { ...o.scores },
      quip: getOptionQuip(patternIdx, oi, v),
    })),
  };
}

function assertVariantTablesShape() {
  const n = VARIANTS_PER_PATTERN;
  if (!Array.isArray(SCENES) || SCENES.length !== n) {
    throw new Error(`variant-tables.json: scenes must be length ${n}`);
  }
  if (!Array.isArray(OPT_LEAD) || OPT_LEAD.length !== n) {
    throw new Error(`variant-tables.json: optLead must be length ${n}`);
  }
  if (!Array.isArray(STEM_VOICE) || STEM_VOICE.length !== n) {
    throw new Error(`variant-tables.json: stemVoice must be length ${n}`);
  }
  for (let i = 0; i < n; i += 1) {
    if (typeof SCENES[i] !== 'string') {
      throw new Error(`variant-tables.json: scenes[${i}] must be string`);
    }
    if (typeof OPT_LEAD[i] !== 'string') {
      throw new Error(`variant-tables.json: optLead[${i}] must be string`);
    }
    if (typeof STEM_VOICE[i] !== 'string') {
      throw new Error(`variant-tables.json: stemVoice[${i}] must be string`);
    }
  }
  if (OPTION_QUIP_VARIANTS !== VARIANTS_PER_PATTERN) {
    throw new Error('quizBank: OPTION_QUIP_VARIANTS !== VARIANTS_PER_PATTERN');
  }
  assertOptionQuipsMatrix();
}

function buildQuestionBank() {
  assertVariantTablesShape();
  const out = [];
  for (let p = 0; p < PATTERN_COUNT; p += 1) {
    for (let v = 0; v < VARIANTS_PER_PATTERN; v += 1) {
      const q = buildVariant(p, v);
      out.push(
        Object.freeze({
          ...q,
          options: Object.freeze(q.options.map((o) => Object.freeze({ ...o }))),
        }),
      );
    }
  }
  return Object.freeze(out);
}

export { VARIANTS_PER_PATTERN };
export const QUESTION_BANK = buildQuestionBank();
