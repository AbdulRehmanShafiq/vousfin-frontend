import { create } from 'zustand'
import { MODULES } from '@/components/layout/nav.config.js'
import { deriveCatalog } from './catalog'
import { withActions } from './actions'
import { searchCatalog } from './matcher'
import { filterByDisabled } from './filter'

// The catalog is static for the session — build once.
const CATALOG = withActions(deriveCatalog(MODULES))
const CATALOG_BY_ID = new Map(CATALOG.map((e) => [e.id, e]))

/** Resolve a (possibly semantic) result id back to the full local entry (with icon). */
export function getCatalogEntryById(id) {
  return CATALOG_BY_ID.get(id) || null
}

/**
 * Rank catalog entries for a query, hiding modules the business has disabled.
 * @param {string} query
 * @param {string[]} disabledModuleKeys  e.g. useModulesStore().disabled
 * @param {number} limit
 */
export function getResults(query, disabledModuleKeys = [], limit = 8) {
  const visible = filterByDisabled(CATALOG, disabledModuleKeys)
  return searchCatalog(visible, query, { limit })
}

export const useCommandBar = create((set) => ({
  open: false,
  query: '',
  openBar: () => set({ open: true }),
  closeBar: () => set({ open: false, query: '' }),
  setQuery: (query) => set({ query }),
}))
