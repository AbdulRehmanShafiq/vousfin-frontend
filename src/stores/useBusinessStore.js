import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

export const useBusinessStore = create(
  persist(
    (set) => ({
      activeBusiness: null,
      currency: 'PKR',
      fiscalYearStart: 7, // Default July

      setBusiness: (business) => {
        set({ 
          activeBusiness: business,
          currency: business?.currency || business?.baseCurrency || 'PKR',
          fiscalYearStart: business?.fiscalYearStartMonth || 7
        })
      },

      clearBusiness: () => {
        set({ activeBusiness: null })
      },

      fetchBusiness: async () => {
        try {
          const res = await api.get('/business')
          const business = res.data.data
          set({ 
            activeBusiness: business,
            currency: business?.currency || business?.baseCurrency || 'PKR',
            fiscalYearStart: business?.fiscalYearStartMonth || 7
          })
          return business
        } catch (err) {
          console.error('Failed to fetch business:', err)
          return null
        }
      },

      updateBusiness: async (businessData) => {
        const res = await api.put('/business', businessData)
        const business = res.data.data
        set({ 
          activeBusiness: business,
          currency: business?.currency || business?.baseCurrency || 'PKR',
          fiscalYearStart: business?.fiscalYearStartMonth || 7
        })
        return business
      },
    }),
    { name: 'business-storage' }
  )
)

export default useBusinessStore