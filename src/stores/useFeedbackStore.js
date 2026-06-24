import { create } from 'zustand'

/**
 * useFeedbackStore - Simple zustand store for managing feedback modal state
 */
export const useFeedbackStore = create((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
}))