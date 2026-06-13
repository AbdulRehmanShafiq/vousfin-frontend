/**
 * Raise the readability floor. Sub-12px arbitrary text sizes are hard to read
 * (the user reported this even at 125% zoom). Bump the tiniest tiers up:
 *   text-[9px]  → text-[11px]
 *   text-[10px] → text-[12px]
 *   text-[11px] → text-[12.5px]
 * Leaves 12px+ alone. Preserves variant prefixes (sm:, hover:, etc).
 *
 * Run from vousfin-frontend-main:  node scripts/type-scale-codemod.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(process.cwd(), 'src')
const MAP = [
  [/text-\[9px\]/g, 'text-[11px]'],
  [/text-\[10px\]/g, 'text-[12px]'],
  [/text-\[11px\]/g, 'text-[12.5px]'],
]

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
  for (const [re, to] of MAP) {
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
