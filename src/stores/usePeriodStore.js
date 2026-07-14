import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * usePeriodStore — the GLOBAL report period (Ledger spec §10.4).
 *
 * Set the period once and every statement (P&L → Balance Sheet → Cash Flow →
 * Trial Balance → …) reads the same range; switching tabs never loses it.
 * Persisted per browser session so a reporting session keeps its period, but
 * a fresh session starts back at YTD.
 *
 * `range` is { startDate, endDate } as 'YYYY-MM-DD' strings — the exact shape
 * every report hook already accepts, so wiring a page = swapping its local
 * useState for this store.
 */

/* Local-date ISO — toISOString() converts to UTC and slips a day for any
   timezone east of Greenwich (PKT is +5), so format from local parts. */
const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const today = () => iso(new Date())
const ytdStart = () => iso(new Date(new Date().getFullYear(), 0, 1))

export const PERIOD_PRESETS = [
  {
    key: 'this-month', label: 'This month',
    range: () => {
      const n = new Date()
      return { startDate: iso(new Date(n.getFullYear(), n.getMonth(), 1)), endDate: today() }
    },
  },
  {
    key: 'last-month', label: 'Last month',
    range: () => {
      const n = new Date()
      return {
        startDate: iso(new Date(n.getFullYear(), n.getMonth() - 1, 1)),
        endDate: iso(new Date(n.getFullYear(), n.getMonth(), 0)),
      }
    },
  },
  {
    key: 'this-quarter', label: 'This quarter',
    range: () => {
      const n = new Date()
      const q = Math.floor(n.getMonth() / 3) * 3
      return { startDate: iso(new Date(n.getFullYear(), q, 1)), endDate: today() }
    },
  },
  { key: 'ytd', label: 'Year to date', range: () => ({ startDate: ytdStart(), endDate: today() }) },
  {
    key: 'last-year', label: 'Last year',
    range: () => {
      const y = new Date().getFullYear() - 1
      return { startDate: iso(new Date(y, 0, 1)), endDate: iso(new Date(y, 11, 31)) }
    },
  },
]

export const usePeriodStore = create(
  persist(
    (set) => ({
      preset: 'ytd',
      range: { startDate: ytdStart(), endDate: today() },
      /** Accepts an object or an updater fn — drop-in for useState setters. */
      setRange: (next) =>
        set((s) => ({
          range: typeof next === 'function' ? next(s.range) : next,
          preset: 'custom',
        })),
      setPreset: (key) => {
        const p = PERIOD_PRESETS.find((x) => x.key === key)
        if (p) set({ preset: key, range: p.range() })
      },
    }),
    {
      name: 'vf-report-period',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
