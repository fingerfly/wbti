/**
 * Purpose: Persist last WBTI result for optional client recall.
 * Description: Writes JSON to localStorage; fails silently on quota errors.
 */
export const STORAGE_KEY = 'wbti.lastResult.v1';

/**
 * @param {{
 *   typeKey: string,
 *   title: string,
 *   gameSubtitle?: string,
 *   paragraphs: readonly string[],
 *   reportSections?: readonly { title: string, body: string }[]
 * }} r
 */
export function persistResult(r) {
  try {
    const payload = {
      typeKey: r.typeKey,
      title: r.title,
      gameSubtitle: r.gameSubtitle?.trim() ?? '',
      paragraphs: [...r.paragraphs],
      ...(r.reportSections?.length
        ? {
            reportSections: r.reportSections.map((s) => ({
              title: s.title,
              body: s.body,
            })),
          }
        : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota or privacy mode */
  }
}
