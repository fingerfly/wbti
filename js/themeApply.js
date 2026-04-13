/**
 * Purpose: Apply visual tokens from data/theme.json to :root.
 * Description:
 * - Call once at app startup (before paint if possible). CSS uses var(--*).
 */
import raw from '../data/theme.json' with { type: 'json' };

/**
 * @param {HTMLElement | null | undefined} [root]
 */
export function applyThemeToRoot(root) {
  const el = root ?? globalThis.document?.documentElement;
  if (!el || !raw || typeof raw !== 'object') return;
  const scheme = raw.colorScheme;
  if (scheme === 'light' || scheme === 'dark') {
    el.style.colorScheme = scheme;
  }
  const vars = raw.cssVars;
  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      if (typeof v === 'string') el.style.setProperty(k, v);
    }
  }
  if (typeof raw.fontFamily === 'string') {
    el.style.fontFamily = raw.fontFamily;
  }
  if (typeof raw.lineHeight === 'string') {
    el.style.lineHeight = raw.lineHeight;
  }
}
