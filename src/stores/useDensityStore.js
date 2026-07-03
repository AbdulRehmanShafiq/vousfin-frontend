import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
 * useDensityStore — surface density, persisted to localStorage (key vf-density).
 *   'calm' (default) → radical-minimal: flat borderless cards, more whitespace.
 *   'cozy'           → the richer, bordered/elevated look.
 * Writes <html data-density> immediately; the boot script in index.html applies
 * it pre-paint so there's no flash.
 */
const apply = (d) => document.documentElement.setAttribute('data-density', d === 'cozy' ? 'cozy' : 'calm')

export const useDensityStore = create(
  persist(
    (set) => ({
      density: 'calm',
      setDensity: (d) => { const v = d === 'cozy' ? 'cozy' : 'calm'; apply(v); set({ density: v }) },
      toggleDensity: () => set((s) => { const v = s.density === 'calm' ? 'cozy' : 'calm'; apply(v); return { density: v } }),
    }),
    { name: 'vf-density', onRehydrateStorage: () => (state) => { if (state) apply(state.density) } },
  ),
)
