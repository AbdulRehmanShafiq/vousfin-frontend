import { useState } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { useVendors } from '@/hooks/useParties'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'

import Button from '@/components/ui/Button'
import DataTable from '@/components/tables/DataTable'
import PartyFormModal from '@/components/forms/PartyFormModal'
import Badge from '@/components/ui/Badge'

export default function VendorsList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useVendors()
  const currency = useBusinessStore((s) => s.currency)

  const vendors = Array.isArray(data?.docs) 
    ? data.docs 
    : Array.isArray(data?.vendors) 
      ? data.vendors 
      : Array.isArray(data) 
        ? data 
        : []

  const columns = [
    {
      key: 'vendorName',
      header: 'Vendor',
      className: 'w-1/3',
      render: (row) => (
        <div>
          <p className="font-bold text-text-primary">{row.vendorName || '—'}</p>
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
      key: 'currentPayableBalance',
      header: 'Outstanding Payable',
      className: 'text-right',
      cellClassName: 'text-right font-bold text-text-primary',
      render: (row) => (row.currentPayableBalance || 0) > 0 ? formatCurrency(row.currentPayableBalance, currency) : '-'
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <Briefcase className="h-6 w-6 text-cyan" />
            Vendors
          </h1>
          <p className="text-text-secondary mt-1">Manage your suppliers and track accounts payable.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Add Vendor</Button>
      </div>

      <div className="premium-card">
        <DataTable
          columns={columns}
          data={vendors}
          isLoading={isLoading}
          emptyMessage="No vendors found. Click 'Add Vendor' to create one."
        />
      </div>

      <PartyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="vendor"
      />
    </div>
  )
}
