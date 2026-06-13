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
  { key: 'eclipse',  name: 'Eclipse',  group: 'dark',  tagline: 'Minimal',    sw: { bg: '#0C0D11', c: '#14161C', a: '#7C72FF', p: '#46D18A', n: '#FF6B6B', h: '#C9A6FF' } },
  { key: 'terminal', name: 'Terminal', group: 'dark',  tagline: 'Data desk',  sw: { bg: '#07080A', c: '#0E1013', a: '#2DE0E0', p: '#2DE07A', n: '#FF5C5C', h: '#FFB020' } },
  { key: 'maison',   name: 'Maison',   group: 'dark',  tagline: 'Editorial',  sw: { bg: '#0B0A08', c: '#16130F', a: '#E8B341', p: '#6FD8A0', n: '#E8736B', h: '#E8B341' } },
  { key: 'daybreak', name: 'Daybreak', group: 'light', tagline: 'Spacious',   sw: { bg: '#F6F7FB', c: '#FFFFFF', a: '#635BFF', p: '#1D9A5C', n: '#E5484D', h: '#F2A93B' } },
]

export const THEME_KEYS = THEMES.map((t) => t.key)
export const DEFAULT_THEME = 'eclipse'

/** Apply a theme by setting (or clearing, for the default) the data-theme attr. */
export function applyTheme(key) {
  const k = THEME_KEYS.includes(key) ? key : DEFAULT_THEME
  const el = document.documentElement
  if (k === DEFAULT_THEME) el.removeAttribute('data-theme')
  else el.dataset.theme = k
}
