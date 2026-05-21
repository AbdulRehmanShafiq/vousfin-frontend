import { useState, useCallback } from 'react'
import CustomerTable from '@/components/admin/CustomerTable'
import CustomerDetailModal from '@/components/admin/CustomerDetailModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import adminService from '@/services/admin.service'
import { showError, showSuccess } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'

export default function CustomersList() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [hasInit, setHasInit] = useState(false)

  const load = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await adminService.getCustomers({ page: pagination.page, limit: pagination.limit, ...params })
      const r = data.data
      setCustomers(r.customers || r.items || [])
      setPagination({ page: r.page, limit: r.limit, total: r.total, totalPages: r.totalPages })
    } catch (e) {
      showError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  // Trigger initial load without useEffect setState cascade
  if (!hasInit) {
    setHasInit(true)
    load()
  }

  const viewCustomer = async (c) => {
    try {
      const { data } = await adminService.getCustomer(c._id)
      setSelected(data.data)
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const handleSuspend = async (c, suspend = true) => {
    try {
      if (suspend) await adminService.suspendCustomer(c._id, 'Admin action')
      else await adminService.reinstateCustomer(c._id)
      showSuccess(suspend ? 'Customer suspended' : 'Customer reinstated')
      load()
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const handleDelete = async () => {
    try {
      await adminService.deleteCustomer(deleteTarget._id)
      showSuccess('Customer deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <CustomerTable
        customers={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => load({ page: p })}
        onSearch={(q) => load({ search: q })}
        onView={viewCustomer}
        onSuspend={handleSuspend}
        onDelete={setDeleteTarget}
      />
      <CustomerDetailModal open={!!selected} onClose={() => setSelected(null)} customer={selected} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} type="delete" />
    </div>
  )
}
