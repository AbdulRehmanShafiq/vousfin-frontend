import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { MODULES } from '@/components/layout/nav.config.js'
import { deriveCatalog } from './catalog'
import { withActions } from './actions'

// The backend semantic indexer reads a committed JSON manifest generated from
// nav.config (npm run catalog:export). If nav.config changes but the manifest
// isn't regenerated, Tier-2/3 search silently goes stale. This guard fails loudly.
const manifestPath = path.resolve(process.cwd(), '../vousfin-backend-main/data/app-catalog.json')

describe('catalog manifest drift guard', () => {
  it('committed app-catalog.json equals deriveCatalog(MODULES) — run `npm run catalog:export` if this fails', () => {
    if (!existsSync(manifestPath)) {
      // Backend repo not checked out alongside — skip rather than fail spuriously.
      expect(true).toBe(true)
      return
    }
    const live = withActions(deriveCatalog(MODULES)).map(({ icon, ...rest }) => rest)
    const committed = JSON.parse(readFileSync(manifestPath, 'utf8')).entries
    expect(committed).toEqual(live)
  })
})
