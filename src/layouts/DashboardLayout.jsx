import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import RailPanel from '@/components/layout/RailPanel'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import GlobalAIWidget from '@/components/ai/GlobalAIWidget'
import TransactionFormModal from '@/components/forms/TransactionFormModal'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import FeedbackModal from '@/components/FeedbackModal'
import { useAuthStore } from '@/stores/useAuthStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useUIStore } from '@/stores/useUIStore'
import { useIdleLogout } from '@/hooks/useIdleLogout'

export default function DashboardLayout() {
  useIdleLogout()
  const { user } = useAuthStore()
  const { activeBusiness, fetchBusiness } = useBusinessStore()
  const queryClient = useQueryClient()
  const txModalOpen = useUIStore((s) => s.txModalOpen)
  const closeTxModal = useUIStore((s) => s.closeTxModal)

  useEffect(() => {
    if (user?.businessId && !activeBusiness) {
      fetchBusiness()
    }
  }, [user?.businessId, activeBusiness, fetchBusiness])

  // After a global "Create" succeeds, refresh everything a new transaction
  // can change so any page reflects it immediately.
  const handleTxSuccess = () => {
    closeTxModal()
    ;['transactions', 'dashboard', 'healthScore', 'healthOutlook', 'financialInsights', 'reports']
      .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
  }

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Desktop hybrid navigation — icon rail + contextual module panel (hidden < lg) */}
      <RailPanel />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {/* Announcement Banner */}
        <AnnouncementBanner />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-navy scrollbar-thin">
          {/* pb-24 on small screens leaves room for the fixed MobileNav bottom bar */}
          <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — the only mobile nav surface (< lg) */}
      <MobileNav />

      {/* Global AI Assistant widget — persists across all route changes */}
      <GlobalAIWidget />

      {/* Universal Create modal — openable from the bottom bar on any page */}
      <TransactionFormModal
        isOpen={txModalOpen}
        onClose={closeTxModal}
        onSuccess={handleTxSuccess}
        transaction={null}
      />

      {/* Global feedback modal — opened from the user menu (useFeedbackStore) */}
      <FeedbackModal />
    </div>
  )
}
