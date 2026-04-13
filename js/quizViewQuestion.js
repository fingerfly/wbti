/**
 * Purpose: Question-step DOM (progress, scene, options, quip).
 * Description:
 *   - Renders one question worth of controls; parent owns session state.
 *   - Option clicks delegate to onOptionSelect for timing + re-render.
 */
import { personifiedProgressLine } from './quizProgressCopy.js';

/**
 * @param {{ quizQuip: HTMLElement | null }} els
 */
export function clearQuizQuip(els) {
  if (!els.quizQuip) return;
  els.quizQuip.textContent = '';
  els.quizQuip.hidden = true;
}

/**
 * @param {{ questionScene: HTMLElement | null }} els
 */
export function clearQuestionScene(els) {
  if (!els.questionScene) return;
  els.questionScene.textContent = '';
  els.questionScene.hidden = true;
}

/**
 * @param {{
 *   quizProgress: HTMLElement | null,
 *   questionScene: HTMLElement | null,
 *   questionPrompt: HTMLElement | null,
 *   questionOptions: HTMLElement | null,
 *   quizQuip: HTMLElement | null,
 *   btnPrev: HTMLElement | null,
 *   btnNext: HTMLElement | null,
 * }} els
 * @param {{
 *   question: { prompt: string,
 *     variantContext?: { scene?: string },
 *     options: { text: string, quip?: string }[] },
 *   questionIndex: number,
 *   total: number,
 *   selectedIndex: number | null | undefined,
 *   showVariantScene: boolean,
 *   showOptionQuip: boolean,
 *   onOptionSelect: (optionIndex: number) => void,
 * }} ctx
 * @description Parent runs FX + timing before/inside onOptionSelect.
 */
export function renderQuestionStep(els, ctx) {
  const {
    question: q,
    questionIndex,
    total,
    selectedIndex,
    showVariantScene,
    showOptionQuip,
    onOptionSelect,
  } = ctx;
  if (!els.quizProgress || !els.questionPrompt || !els.questionOptions) return;
  els.quizProgress.textContent = personifiedProgressLine(
    questionIndex,
    total,
  );
  const scene =
    q.variantContext && typeof q.variantContext.scene === 'string'
      ? q.variantContext.scene.trim()
      : '';
  if (els.questionScene) {
    if (showVariantScene && scene.length > 0) {
      els.questionScene.textContent = scene;
      els.questionScene.hidden = false;
    } else {
      els.questionScene.textContent = '';
      els.questionScene.hidden = true;
    }
  }
  els.questionPrompt.textContent = q.prompt;
  els.questionOptions.replaceChildren();
  const selected = selectedIndex;
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(selected === idx));
    btn.dataset.selected = String(selected === idx);
    btn.addEventListener('click', () => {
      onOptionSelect(idx);
    });
    els.questionOptions.append(btn);
  });
  if (els.btnPrev) els.btnPrev.disabled = questionIndex === 0;
  if (els.btnNext) {
    const filled = selected !== null && selected !== undefined;
    els.btnNext.disabled = !filled;
    els.btnNext.textContent =
      questionIndex === total - 1 ? '查看结果' : '下一题';
  }
  if (showOptionQuip && els.quizQuip) {
    if (selected !== null && selected !== undefined) {
      const qu = q.options[selected].quip?.trim();
      if (qu) {
        els.quizQuip.textContent = qu;
        els.quizQuip.hidden = false;
      } else {
        clearQuizQuip(els);
      }
    } else {
      clearQuizQuip(els);
    }
  } else {
    clearQuizQuip(els);
  }
}
