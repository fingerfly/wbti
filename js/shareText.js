/**
 * Purpose: Build plain-text snippets for share and clipboard actions.
 * Copy from data/ui-copy.json (`share`).
 */
import { UI_COPY, interpolate } from './uiCopy.js';

/**
 * @param {string} title
 * @param {string} pageUrl
 * @returns {string}
 */
export function buildCompareBlurb(title, pageUrl) {
  return interpolate(UI_COPY.share.compareBlurbTemplate, {
    title,
    url: pageUrl,
  });
}

/**
 * @param {{
 *   title: string,
 *   paragraphs: readonly string[],
 *   reportSections?: readonly { title: string, body: string }[],
 *   gameSubtitle?: string
 * }} r
 * @param {string} [pageUrl] - when set, appends friend-compare line
 * @returns {string}
 */
export function buildShareText(r, pageUrl) {
  const sub = r.gameSubtitle?.trim();
  const lines = [`${UI_COPY.share.resultHeaderPrefix}${r.title}`];
  if (sub) {
    lines.push(sub, '');
  }
  const reportBlock =
    r.reportSections?.length > 0
      ? r.reportSections.map((s) => `${s.title}：${s.body}`).join('\n\n')
      : r.paragraphs.join('\n\n');
  lines.push(reportBlock, '', ...UI_COPY.share.disclaimerLines);
  if (pageUrl) {
    lines.push('', buildCompareBlurb(r.title, pageUrl));
  }
  return lines.join('\n');
}
