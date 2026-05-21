import Modal from '@/components/common/Modal'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function CustomerDetailModal({ open, onClose, customer }) {
  if (!customer) return null
  const stats = customer.stats || {}

  return (
    <Modal open={open} onClose={onClose} title={customer.fullName} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={customer.status} />
          <StatusBadge status={customer.role} />
        </div>
        <p className="text-sm text-slate-600">{customer.email}</p>
        {customer.business && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="font-medium">Business</h4>
            <p className="text-sm">{customer.business.businessName} ? {customer.business.currency}</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{stats.transactionCount ?? 0}</p><p className="text-xs text-slate-500">Transactions</p></div>
          <div><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p><p className="text-xs text-slate-500">Revenue</p></div>
          <div><p className="text-2xl font-bold">{formatDate(customer.createdAt)}</p><p className="text-xs text-slate-500">Joined</p></div>
        </div>
      </div>
    </Modal>
  )
}
