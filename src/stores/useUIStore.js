import { create } from 'zustand'

/*
 * useUIStore — small global UI state shared across the shell so the mobile
 * bottom bar (and anywhere else) can trigger app-wide surfaces.
 *
 *  - the universal "Create" (New Transaction) modal, rendered once in
 *    DashboardLayout and openable from any page.
 *  - txModalIntent (Mobile Easy M1): which lane of the modal to open on —
 *    { lane: 'photo' | 'nl' | 'simple' }. The Capture sheet sets it; the
 *    modal consumes + clears it. null = default behavior.
 *  - the mobile Capture sheet (the ⊕ tab's landing surface).
 */
export const useUIStore = create((set) => ({
  txModalOpen: false,
  txModalIntent: null,
  openTxModal: (intent = null) => set({ txModalOpen: true, txModalIntent: intent }),
  closeTxModal: () => set({ txModalOpen: false, txModalIntent: null }),

  captureOpen: false,
  openCapture: () => set({ captureOpen: true }),
  closeCapture: () => set({ captureOpen: false }),
}))
