import { useState } from 'react'
import { Search } from 'lucide-react'
import Input from '@/components/common/Input'
import Pagination from '@/components/common/Pagination'
import StatusBadge from './StatusBadge'
import Button from '@/components/common/Button'
import { formatDate } from '@/utils/formatters'

export default function CustomerTable({ customers, pagination, loading, onSearch, onPageChange, onView, onSuspend, onDelete }) {
  const [q, setQ] = useState('')

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b p-4">
        <Input icon={Search} placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch?.(q)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-slate-600">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : customers.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{c.fullName}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.business?.businessName || '?'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button variant="ghost" onClick={() => onView?.(c)}>View</Button>
                  {c.status === 'active' ? (
                    <Button variant="outline" onClick={() => onSuspend?.(c)}>Suspend</Button>
                  ) : (
                    <Button variant="outline" onClick={() => onSuspend?.(c, false)}>Reinstate</Button>
                  )}
                  <Button variant="danger" onClick={() => onDelete?.(c)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && <div className="border-t px-4 py-3"><Pagination {...pagination} onPageChange={onPageChange} /></div>}
    </div>
  )
}
