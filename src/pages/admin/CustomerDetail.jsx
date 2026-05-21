import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import adminService from '@/services/admin.service'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { showError } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import Spinner from '@/components/common/Spinner'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getCustomer(id)
      .then(({ data }) => setCustomer(data.data))
      .catch((e) => showError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner size="lg" />
  if (!customer) return <p>Customer not found</p>

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="text-sm text-brand-600 hover:underline">? Back to customers</Link>
      <div className="rounded-xl border bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{customer.fullName}</h1>
          <StatusBadge status={customer.status} />
        </div>
        <p className="mt-1 text-slate-600">{customer.email}</p>
        {customer.business && (
          <p className="mt-4 text-sm">{customer.business.businessName} ? {customer.business.currency}</p>
        )}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div><p className="text-2xl font-bold">{customer.stats?.transactionCount ?? 0}</p><p className="text-xs text-slate-500">Transactions</p></div>
          <div><p className="text-2xl font-bold">{formatCurrency(customer.stats?.totalRevenue)}</p><p className="text-xs text-slate-500">Revenue</p></div>
          <div><p className="text-2xl font-bold">{formatDate(customer.createdAt)}</p><p className="text-xs text-slate-500">Joined</p></div>
        </div>
      </div>
    </div>
  )
}
