import { create } from 'zustand'

/**
 * useFabActions — the mobile ⊕'s per-page action set.
 *
 * The bottom-bar ⊕ is a single global button (rendered once in MobileNav), but
 * the most useful thing to do differs per screen: create an invoice on the
 * Invoices list, add an item on Inventory, record something on Home. Pages
 * publish their real, page-owned actions here via `useRegisterFabActions`; the
 * ⊕ reads them and becomes "what you can do here".
 *
 * `actions === null` means no page has registered — the ⊕ then falls back to
 * its static route map (nav.config), and finally to the universal Capture
 * sheet, so it is never dead.
 *
 * This is presentation wiring, not accounting state: it holds UI callbacks,
 * never financial data, and is cleared when the owning page unmounts.
 */
export const useFabActions = create((set) => ({
  /** @type {null | Array<{id:string, label?:string, labelKey?:string, icon?:Function, run:Function}>} */
  actions: null,
  setActions: (actions) => set({ actions: actions && actions.length ? actions : null }),
  clearActions: () => set({ actions: null }),
}))
