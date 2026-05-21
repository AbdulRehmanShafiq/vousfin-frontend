import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  theme: localStorage.getItem('vousfin_theme') || 'light',
  loadingModal: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  setTheme: (theme) => {
    localStorage.setItem('vousfin_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },

  setLoadingModal: (loadingModal) => set({ loadingModal }),
}))
