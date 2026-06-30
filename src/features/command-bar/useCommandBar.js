import { create } from 'zustand'
import { MODULES } from '@/components/layout/nav.config.js'
import { deriveCatalog } from './catalog'
import { withActions } from './actions'
import { searchCatalog } from './matcher'
import { filterByDisabled } from './filter'

// The catalog is static for the session — build once.
const CATALOG = withActions(deriveCatalog(MODULES))

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
