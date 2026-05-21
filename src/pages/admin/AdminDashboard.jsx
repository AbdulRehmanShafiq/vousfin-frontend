import { useEffect, useState } from 'react'
import SystemStats from '@/components/admin/SystemStats'
import adminService from '@/services/admin.service'
import { showError } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setStats(data.data))
      .catch((e) => showError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <SystemStats stats={stats} loading={loading} />
    </div>
  )
}
