/**
 * useModulesStore — which optional modules a business shows in navigation.
 *
 * Always-on modules (Home, Sales, Purchases, Banking, Accounting, Reports) and
 * Settings can never be hidden. Optional ones (Payroll, Planning, Tax &
 * Compliance) default to ON, and the user can hide ones they don't use. Stored
 * in localStorage for now; a backend field can replace this later without
 * touching consumers.
 */
import { create } from 'zustand'
import { OPTIONAL_MODULE_KEYS } from '@/components/layout/nav.config'

const LS_KEY = 'vf-disabled-modules'

function loadDisabled() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((k) => OPTIONAL_MODULE_KEYS.includes(k)) : []
  } catch {
    return []
  }
}

export const useModulesStore = create((set, get) => ({
  disabled: loadDisabled(),
  isEnabled: (key) => !get().disabled.includes(key),
  toggle: (key) => {
    if (!OPTIONAL_MODULE_KEYS.includes(key)) return // can't disable core modules
    const next = get().disabled.includes(key)
      ? get().disabled.filter((k) => k !== key)
      : [...get().disabled, key]
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    set({ disabled: next })
  },
}))
