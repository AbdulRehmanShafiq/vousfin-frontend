import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useCustomers } from '@/hooks/useParties'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'

import Button from '@/components/ui/Button'
import DataTable from '@/components/tables/DataTable'
import PartyFormModal from '@/components/forms/PartyFormModal'
import Badge from '@/components/ui/Badge'

export default function CustomersList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useCustomers()
  const currency = useBusinessStore((s) => s.currency)

  const customers = Array.isArray(data?.docs) 
    ? data.docs 
    : Array.isArray(data?.customers) 
      ? data.customers 
      : Array.isArray(data) 
        ? data 
        : []

  const columns = [
    {
      key: 'fullName',
      header: 'Customer',
      className: 'w-1/3',
      render: (row) => (
        <div>
          <p className="font-bold text-text-primary">{row.fullName || row.businessName || '—'}</p>
          {(row.email || row.phone) && (
            <p className="text-xs text-text-muted mt-0.5">
              {row.email} {row.phone && `• ${row.phone}`}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive !== false ? 'success' : 'secondary'}>
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'currentReceivableBalance',
      header: 'Outstanding Receivable',
      className: 'text-right',
      cellClassName: 'text-right font-bold text-text-primary',
      render: (row) => (row.currentReceivableBalance || 0) > 0 ? formatCurrency(row.currentReceivableBalance, currency) : '-'
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <Users className="h-6 w-6 text-cyan" />
            Customers
          </h1>
          <p className="text-text-secondary mt-1">Manage your clients and track accounts receivable.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Add Customer</Button>
      </div>

      <div className="premium-card">
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          emptyMessage="No customers found. Click 'Add Customer' to create one."
        />
      </div>

      <PartyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="customer"
      />
    </div>
  )
}
