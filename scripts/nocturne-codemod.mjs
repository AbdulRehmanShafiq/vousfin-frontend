/**
 * One-shot codemod for the "Nocturne Ledger" redesign.
 * Rewrites light-theme Tailwind classes (whites, grays, -50 pastels,
 * dark-on-light text, solid light buttons) to dark-native token classes.
 * Run from vousfin-frontend-main:  node scripts/nocturne-codemod.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(process.cwd(), 'src')

/* Ordered: suffixed/hover variants before their plain counterparts. */
const MAP = [
  // explicit suffixed forms first
  ['bg-green-50/40', 'bg-emerald-500/10'],
  ['hover:bg-blue-50/40', 'hover:bg-cyan/10'],

  // plain white surfaces (alpha whites like bg-white/[0.04] are untouched)
  ['bg-white', 'bg-navy-2'],

  // gray/slate/zinc text → text hierarchy
  ['text-gray-900', 'text-text-primary'],
  ['text-gray-800', 'text-text-primary'],
  ['text-gray-700', 'text-text-secondary'],
  ['text-gray-600', 'text-text-secondary'],
  ['text-gray-500', 'text-text-muted'],
  ['text-gray-400', 'text-text-muted'],
  ['text-gray-300', 'text-text-muted'],
  ['text-slate-900', 'text-text-primary'],
  ['text-slate-700', 'text-text-secondary'],
  ['text-slate-500', 'text-text-muted'],
  ['text-slate-400', 'text-text-muted'],
  ['text-slate-300', 'text-text-muted'],
  ['text-zinc-400', 'text-text-muted'],
  ['hover:text-gray-900', 'hover:text-text-primary'],
  ['hover:text-gray-800', 'hover:text-text-primary'],
  ['hover:text-gray-700', 'hover:text-text-primary'],
  ['hover:text-gray-600', 'hover:text-text-secondary'],
  ['hover:text-slate-600', 'hover:text-text-secondary'],

  // gray surfaces → glass
  ['hover:bg-gray-50', 'hover:bg-glass-hover'],
  ['hover:bg-gray-100', 'hover:bg-glass-hover'],
  ['hover:bg-gray-200', 'hover:bg-glass-hover'],
  ['bg-gray-50', 'bg-glass-panel'],
  ['bg-gray-100', 'bg-glass-panel'],
  ['bg-gray-200', 'bg-glass-hover'],
  ['bg-slate-50', 'bg-glass-panel'],
  ['bg-slate-200', 'bg-glass-hover'],
  ['bg-slate-500/10', 'bg-glass-panel'],
  ['bg-slate-500/15', 'bg-glass-panel'],
  ['bg-zinc-500/15', 'bg-glass-panel'],

  // gray borders → hairlines
  ['hover:border-gray-300', 'hover:border-glass-2'],
  ['border-gray-100', 'border-glass'],
  ['border-gray-200', 'border-glass'],
  ['border-gray-300', 'border-glass-2'],
  ['border-slate-100', 'border-glass'],
  ['border-slate-200', 'border-glass'],
  ['border-slate-300', 'border-glass-2'],
  ['border-slate-500/20', 'border-glass'],
  ['border-slate-500/30', 'border-glass-2'],
  ['border-zinc-500/30', 'border-glass-2'],
  ['divide-gray-100', 'divide-glass'],

  // pastel -50 chips → dark alpha chips
  ['hover:bg-emerald-50', 'hover:bg-emerald-500/15'],
  ['bg-emerald-50', 'bg-emerald-500/10'],
  ['border-emerald-50', 'border-emerald-500/25'],
  ['bg-green-50', 'bg-emerald-500/10'],
  ['border-green-200', 'border-emerald-500/30'],
  ['hover:bg-amber-50', 'hover:bg-amber-500/15'],
  ['bg-amber-50', 'bg-amber-500/10'],
  ['border-amber-50', 'border-amber-500/25'],
  ['border-amber-200', 'border-amber-500/30'],
  ['bg-orange-50', 'bg-orange-500/10'],
  ['border-orange-50', 'border-orange-500/25'],
  ['hover:bg-red-50', 'hover:bg-red-500/15'],
  ['bg-red-50', 'bg-red-500/10'],
  ['border-red-50', 'border-red-500/25'],
  ['hover:border-red-200', 'hover:border-red-500/40'],
  ['border-red-200', 'border-red-500/30'],
  ['bg-rose-50', 'bg-rose-500/10'],
  ['border-rose-50', 'border-rose-500/25'],
  ['hover:bg-sky-50', 'hover:bg-sky-500/15'],
  ['bg-sky-50', 'bg-sky-500/10'],
  ['border-sky-50', 'border-sky-500/25'],
  ['bg-blue-50', 'bg-sky-500/10'],
  ['border-blue-50', 'border-sky-500/25'],
  ['bg-violet-50', 'bg-violet-500/10'],
  ['border-violet-50', 'border-violet-500/25'],
  ['bg-purple-50', 'bg-purple-500/10'],
  ['border-purple-50', 'border-purple-500/25'],
  ['bg-indigo-50', 'bg-indigo-500/10'],
  ['border-indigo-50', 'border-indigo-500/25'],

  // dark-on-light text → light-on-dark
  ['text-green-700', 'text-emerald-400'],
  ['text-green-600', 'text-emerald-400'],
  ['text-emerald-800', 'text-emerald-300'],
  ['text-emerald-600', 'text-emerald-400'],
  ['text-emerald-50', 'text-emerald-300'],
  ['text-blue-700', 'text-sky-400'],
  ['text-blue-600', 'text-sky-400'],
  ['text-amber-700', 'text-amber-400'],
  ['text-amber-600', 'text-amber-400'],
  ['text-red-800', 'text-red-300'],
  ['hover:text-red-700', 'hover:text-red-400'],
  ['text-red-700', 'text-red-400'],
  ['text-red-600', 'text-red-400'],
  ['hover:text-red-50', 'hover:text-red-200'],
  ['text-red-50', 'text-red-200'],

  // solid light-era buttons → palette
  ['hover:bg-green-700', 'hover:bg-emerald'],
  ['bg-green-600', 'bg-emerald-2'],
  ['hover:bg-blue-700', 'hover:bg-sky-500'],
  ['bg-blue-600', 'bg-sky-600'],
  ['border-blue-600', 'border-sky-600'],
]

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const RULES = MAP.map(([from, to]) => [
  new RegExp(`(?<![\\w-])${esc(from)}(?![\\w/\\[-])`, 'g'),
  to,
])

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, files)
    else if (/\.(jsx|js)$/.test(name)) files.push(p)
  }
  return files
}

let totalFiles = 0
let totalHits = 0
for (const file of walk(ROOT)) {
  const before = readFileSync(file, 'utf8')
  let after = before
  let hits = 0
  for (const [re, to] of RULES) {
    after = after.replace(re, () => { hits++; return to })
  }
  if (hits > 0) {
    writeFileSync(file, after)
    totalFiles++
    totalHits += hits
    console.log(`${hits.toString().padStart(4)}  ${file.replace(process.cwd(), '')}`)
  }
}
console.log(`\n${totalHits} replacements across ${totalFiles} files`)
