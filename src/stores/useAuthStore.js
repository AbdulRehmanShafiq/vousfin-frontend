import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

const normalizeBusinessId = (user) => {
  if (!user) return null
  const id = user.businessId?._id || user.businessId
  return id ? String(id) : null
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => {
        const businessId = normalizeBusinessId(user)
        set({
          user: user ? { ...user, businessId } : null,
          isAuthenticated: !!user,
        })
      },

      setBusinessId: (businessId) => {
        set((state) => ({
          user: state.user ? { ...state.user, businessId: businessId ? String(businessId) : null } : null,
        }))
      },

      /** Reload user from server (fixes stale businessId in localStorage). */
      refreshSession: async () => {
        const { token, isAuthenticated } = get()
        if (!token || !isAuthenticated) return null

        try {
          const { data } = await api.get('/auth/me')
          const user = data.data
          const businessId = normalizeBusinessId(user)
          set({
            user: { ...user, businessId },
            isAuthenticated: true,
          })
          return { ...user, businessId }
        } catch {
          get().logout()
          return null
        }
      },

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { user, token } = res.data.data
        const businessId = normalizeBusinessId(user)
        set({
          user: { ...user, businessId },
          token,
          isAuthenticated: true,
        })
        return { user: { ...user, businessId }, token }
      },

      register: async (userData) => {
        const res = await api.post('/auth/register', userData)
        const { user, token } = res.data.data
        set({
          user: { ...user, businessId: null },
          token,
          isAuthenticated: true,
        })
        return res.data.data
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('business-storage')
      },
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore
