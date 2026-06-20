/**
 * Theme registry — the list the switcher renders and the apply helper.
 *
 * 4 curated themes, each a distinct design language (color + radius + display
 * font live in src/index.css [data-theme] blocks). Keys must match those.
 *   eclipse  (default, dark) — Linear minimal · iris
 *   terminal (dark)          — Bloomberg data desk · electric cyan
 *   maison   (dark)          — editorial luxury · gold · serif
 *   daybreak (light)         — Stripe/Apple spacious · vivid purple
 */
export const THEMES = [
  { key: 'atelier',  name: 'Atelier',  group: 'dark',  tagline: 'Signature',  sw: { bg: '#12100E', c: '#1A1714', a: '#C8A96E', p: '#7EB5A6', n: '#E0736B', h: '#D4B87A' } },
  { key: 'eclipse',  name: 'Eclipse',  group: 'dark',  tagline: 'Minimal',    sw: { bg: '#0C0D11', c: '#14161C', a: '#7C72FF', p: '#46D18A', n: '#FF6B6B', h: '#C9A6FF' } },
  { key: 'terminal', name: 'Terminal', group: 'dark',  tagline: 'Data desk',  sw: { bg: '#07080A', c: '#0E1013', a: '#2DE0E0', p: '#2DE07A', n: '#FF5C5C', h: '#FFB020' } },
  { key: 'maison',   name: 'Maison',   group: 'dark',  tagline: 'Editorial',  sw: { bg: '#0B0A08', c: '#16130F', a: '#E8B341', p: '#6FD8A0', n: '#E8736B', h: '#E8B341' } },
  { key: 'daybreak', name: 'Daybreak', group: 'light', tagline: 'Spacious',   sw: { bg: '#F6F7FB', c: '#FFFFFF', a: '#635BFF', p: '#1D9A5C', n: '#E5484D', h: '#F2A93B' } },
]

export const THEME_KEYS = THEMES.map((t) => t.key)
// Default matches the public landing page (luxury gold) so auth + dashboard share
// the brand identity until the user picks another theme in Settings.
export const DEFAULT_THEME = 'atelier'

/** Apply a theme by writing the data-theme attr. 'eclipse' has no [data-theme]
 *  block — it intentionally falls through to the :root tokens. */
export function applyTheme(key) {
  const k = THEME_KEYS.includes(key) ? key : DEFAULT_THEME
  document.documentElement.dataset.theme = k
}
