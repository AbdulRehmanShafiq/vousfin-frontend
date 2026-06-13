import { create } from 'zustand'

/*
 * useUIStore — small global UI state shared across the shell so the mobile
 * bottom bar (and anywhere else) can trigger app-wide surfaces.
 *
 *  - the universal "Create" (New Transaction) modal, rendered once in
 *    DashboardLayout and openable from any page.
 */
export const useUIStore = create((set) => ({
  txModalOpen: false,
  openTxModal: () => set({ txModalOpen: true }),
  closeTxModal: () => set({ txModalOpen: false }),
}))
