/**
 * Purpose: Browser entry for the 牛马格测验 (WBTI) static app.
 * Description: Binds DOM controls to quizView and share/clipboard handlers.
 */
import { applyThemeToRoot } from './themeApply.js';
import { createQuizView } from './quizView.js';
import { getDisplayVersion } from './appVersion.js';
import { buildShareText } from './shareText.js';

applyThemeToRoot();

const els = {
  welcome: document.getElementById('screen-welcome'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
  btnStart: document.getElementById('btn-start'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnShare: document.getElementById('btn-share'),
  btnCopy: document.getElementById('btn-copy'),
  btnRetake: document.getElementById('btn-retake'),
  quizProgress: document.getElementById('quiz-progress'),
  questionScene: document.getElementById('question-scene'),
  quizQuip: document.getElementById('quiz-quip'),
  questionPrompt: document.getElementById('question-prompt'),
  questionOptions: document.getElementById('question-options'),
  resultTitle: document.getElementById('result-title'),
  resultSubtitle: document.getElementById('result-subtitle'),
  resultPortrait: document.getElementById('result-portrait'),
  resultBody: document.getElementById('result-body'),
  resultCard: document.getElementById('result-card'),
};

const shareStatus = document.getElementById('share-status');
const appVersionLine = document.getElementById('app-version');
if (appVersionLine) appVersionLine.textContent = getDisplayVersion();

const view = createQuizView(els, {});

els.btnStart?.addEventListener('click', () => {
  view.startQuiz();
});

els.btnPrev?.addEventListener('click', () => {
  view.goPrev();
});

els.btnNext?.addEventListener('click', () => {
  view.goNext();
});

els.btnRetake?.addEventListener('click', () => {
  view.retake();
  if (shareStatus) shareStatus.textContent = '';
});

els.btnCopy?.addEventListener('click', () => {
  const r = view.getLastResult();
  if (!r) return;
  const text = buildShareText(r, window.location.href);
  navigator.clipboard.writeText(text).then(
    () => {
      if (shareStatus) shareStatus.textContent = '已复制到剪贴板';
    },
    () => {
      if (shareStatus) shareStatus.textContent = '复制失败，请手动选择文案';
    },
  );
});

els.btnShare?.addEventListener('click', async () => {
  const r = view.getLastResult();
  if (!r) return;
  const text = buildShareText(r, window.location.href);
  const title = '我的牛马格';
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      if (shareStatus) shareStatus.textContent = '已调起分享';
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  navigator.clipboard.writeText(`${text}\n${url}`).then(
    () => {
      if (shareStatus) {
        shareStatus.textContent = '已复制文案与链接（系统分享不可用）';
      }
    },
    () => {
      if (shareStatus) shareStatus.textContent = '请使用复制文案';
    },
  );
});

view.showWelcome();
