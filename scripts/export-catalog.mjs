/**
 * export-catalog.mjs — emit the searchable app catalog as plain JSON for the
 * backend semantic indexer. nav.config MODULES stays the single source of truth;
 * this is a derived, committed artifact (icons — React components — are dropped).
 *
 * Run from vousfin-frontend-main:  node scripts/export-catalog.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MODULES } from '../src/components/layout/nav.config.js'
import { deriveCatalog } from '../src/features/command-bar/catalog.js'
import { withActions } from '../src/features/command-bar/actions.js'

const here = dirname(fileURLToPath(import.meta.url))
const entries = withActions(deriveCatalog(MODULES)).map(({ icon, ...rest }) => rest)
const out = resolve(here, '../../vousfin-backend-main/data/app-catalog.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2) + '\n')
console.log(`Wrote ${entries.length} catalog entries to ${out}`)
