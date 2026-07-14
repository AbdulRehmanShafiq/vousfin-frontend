/**
 * Theme registry — the list the switcher renders and the apply helper.
 *
 * Ledger design language (2026-07 redesign): TWO first-class modes derived
 * from one semantic palette —
 *   atelier  → "Ledger Dark"  (warm near-black, cream ink, champagne accent)
 *   daybreak → "Ledger Light" (warm paper, bronze accent)
 * The old Eclipse / Terminal / Maison themes are Labs experiments: kept
 * working, hidden behind the Labs toggle in Settings → Appearance, excluded
 * from QA guarantees. Keys are stable so stored preferences keep working.
 */
export const THEMES = [
  { key: 'atelier',  name: 'Ledger Dark',  group: 'dark',  tagline: 'Signature',  sw: { bg: '#131110', c: '#1C1916', a: '#C8A96E', p: '#7EB5A6', n: '#E0736B', h: '#D4B87A' } },
  { key: 'daybreak', name: 'Ledger Light', group: 'light', tagline: 'Signature',  sw: { bg: '#F0EDE7', c: '#FFFEFC', a: '#8C6A3A', p: '#147A54', n: '#BE4A38', h: '#9E742F' } },
  { key: 'eclipse',  name: 'Eclipse',  group: 'dark', labs: true, tagline: 'Labs · Minimal',   sw: { bg: '#0C0D11', c: '#14161C', a: '#7C72FF', p: '#46D18A', n: '#FF6B6B', h: '#C9A6FF' } },
  { key: 'terminal', name: 'Terminal', group: 'dark', labs: true, tagline: 'Labs · Data desk', sw: { bg: '#07080A', c: '#0E1013', a: '#2DE0E0', p: '#2DE07A', n: '#FF5C5C', h: '#FFB020' } },
  { key: 'maison',   name: 'Maison',   group: 'dark', labs: true, tagline: 'Labs · Editorial', sw: { bg: '#0B0A08', c: '#16130F', a: '#E8B341', p: '#6FD8A0', n: '#E8736B', h: '#E8B341' } },
]

export const THEME_KEYS = THEMES.map((t) => t.key)
/** The two first-class Ledger modes shown by default in the switcher. */
export const PRIMARY_THEMES = THEMES.filter((t) => !t.labs)
export const LABS_THEMES = THEMES.filter((t) => t.labs)
// Default matches the public landing page (warm black + champagne) so auth +
// dashboard share the brand identity until the user picks the light mode.
export const DEFAULT_THEME = 'atelier'

/** Apply a theme by writing the data-theme attr. */
export function applyTheme(key) {
  const k = THEME_KEYS.includes(key) ? key : DEFAULT_THEME
  document.documentElement.dataset.theme = k
}
