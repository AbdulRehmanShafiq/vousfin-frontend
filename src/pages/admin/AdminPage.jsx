import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users, Building2, TrendingUp, UserCheck, UserX, Clock,
  ShieldCheck, ArrowUpCircle, ArrowDownCircle, Trash2, CheckCircle,
  Search, ChevronLeft, ChevronRight,
} from 'lucide-react'
import adminService from '@/services/admin.service'
import { getErrorMessage } from '@/utils/errorHandler'
import { SelectField } from '@/components/ui/SelectField'
import { cn } from '@/utils/cn'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent = 'text-accent' }) {
  return (
    <div className="premium-card rounded-xl border border-glass bg-charcoal p-5 flex items-start gap-4">
      <div className={cn('mt-0.5 rounded-lg p-2 bg-glass-panel', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-text-primary">
          {value === undefined || value === null ? '—' : value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  active: 'bg-positive/15 text-positive',
  pending: 'bg-amber/15 text-amber',
  suspended: 'bg-negative/15 text-negative',
  deleted: 'bg-text-muted/20 text-text-muted',
}

function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', STATUS_COLORS[status] || 'bg-glass-panel text-text-secondary')}>
      {status}
    </span>
  )
}

function RoleBadge({ role }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
      role === 'admin' ? 'bg-accent/15 text-accent' : 'bg-glass-panel text-text-secondary',
    )}>
      {role}
    </span>
  )
}

// ── Pagination controls ───────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="flex items-center justify-between pt-4 border-t border-glass text-[13px] text-text-muted">
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded p-1 hover:bg-glass-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-text-secondary">{page} / {totalPages}</span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="rounded p-1 hover:bg-glass-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-glass bg-charcoal p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-[13px] text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-glass text-[13px] text-text-secondary hover:bg-glass-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors',
              danger
                ? 'bg-negative/90 hover:bg-negative text-white'
                : 'bg-accent/90 hover:bg-accent text-ink-on-accent',
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.stats().then((r) => r.data.data),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-glass bg-charcoal animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={data?.totalUsers} icon={Users} accent="text-accent" />
      <StatCard label="Active" value={data?.activeCustomers} icon={UserCheck} accent="text-positive" />
      <StatCard label="Pending" value={data?.pendingCustomers} icon={Clock} accent="text-amber" />
      <StatCard label="Suspended" value={data?.suspendedCustomers} icon={UserX} accent="text-negative" />
      <StatCard label="Admins" value={data?.adminCount} icon={ShieldCheck} accent="text-accent" />
      <StatCard label="Businesses" value={data?.totalBusinesses} icon={Building2} accent="text-cyan" />
      <StatCard label="Transactions" value={data?.totalTransactions} icon={TrendingUp} accent="text-gold" />
      <StatCard label="New (30d)" value={data?.newUsersLast30Days} icon={ArrowUpCircle} accent="text-positive" />
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirm, setConfirm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, statusFilter],
    queryFn: () => adminService.listUsers({ page, limit: 20, search, status: statusFilter || undefined }).then((r) => r.data.data),
    staleTime: 30_000,
    keepPreviousData: true,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-users'] })
    qc.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const act = async (fn, successMsg) => {
    try {
      await fn()
      toast.success(successMsg)
      invalidate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleConfirm = async () => {
    if (!confirm) return
    const { type, id, extra } = confirm
    setConfirm(null)
    if (type === 'suspend')    await act(() => adminService.suspend(id, extra), 'Account suspended')
    if (type === 'reinstate')  await act(() => adminService.reinstate(id), 'Account reinstated')
    if (type === 'verify')     await act(() => adminService.verify(id), 'Account verified and activated')
    if (type === 'promote')    await act(() => adminService.setRole(id, 'admin'), 'Promoted to admin')
    if (type === 'demote')     await act(() => adminService.setRole(id, 'customer'), 'Demoted to customer')
    if (type === 'delete')     await act(() => adminService.remove(id), 'Account deleted')
  }

  const users = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/40 transition-colors"
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </SelectField>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-glass bg-charcoal overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Business</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading…</td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No users found</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{u.fullName}</td>
                <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-text-muted">
                  {u.businessId?.businessName ?? <span className="italic">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Verify — only if pending */}
                    {u.status === 'pending' && (
                      <button
                        onClick={() => setConfirm({ type: 'verify', id: u._id })}
                        title="Verify account"
                        className="rounded p-1.5 text-positive hover:bg-positive/10 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {/* Suspend / Reinstate */}
                    {u.status === 'active' && (
                      <button
                        onClick={() => setConfirm({ type: 'suspend', id: u._id })}
                        title="Suspend account"
                        className="rounded p-1.5 text-amber hover:bg-amber/10 transition-colors"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    )}
                    {u.status === 'suspended' && (
                      <button
                        onClick={() => setConfirm({ type: 'reinstate', id: u._id })}
                        title="Reinstate account"
                        className="rounded p-1.5 text-positive hover:bg-positive/10 transition-colors"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                    {/* Promote / Demote */}
                    {u.role === 'customer' && u.status !== 'deleted' && (
                      <button
                        onClick={() => setConfirm({ type: 'promote', id: u._id })}
                        title="Promote to admin"
                        className="rounded p-1.5 text-accent hover:bg-accent/10 transition-colors"
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </button>
                    )}
                    {u.role === 'admin' && (
                      <button
                        onClick={() => setConfirm({ type: 'demote', id: u._id })}
                        title="Demote to customer"
                        className="rounded p-1.5 text-text-muted hover:bg-glass-hover transition-colors"
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                      </button>
                    )}
                    {/* Delete */}
                    {u.status !== 'deleted' && (
                      <button
                        onClick={() => setConfirm({ type: 'delete', id: u._id })}
                        title="Delete account"
                        className="rounded p-1.5 text-negative/70 hover:bg-negative/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} limit={20} onPage={setPage} />

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.type === 'delete' ? 'Delete account?' :
          confirm?.type === 'suspend' ? 'Suspend account?' :
          confirm?.type === 'reinstate' ? 'Reinstate account?' :
          confirm?.type === 'verify' ? 'Verify account?' :
          confirm?.type === 'promote' ? 'Promote to admin?' :
          'Demote to customer?'
        }
        message={
          confirm?.type === 'delete' ? 'This will soft-delete the account and all associated data. This cannot be undone.' :
          confirm?.type === 'suspend' ? 'The user will lose access until reinstated.' :
          confirm?.type === 'reinstate' ? 'The account will be restored to active status.' :
          confirm?.type === 'verify' ? 'This will activate the account, bypassing email verification.' :
          confirm?.type === 'promote' ? 'This user will gain full admin access to the platform.' :
          'This will remove admin access from this user.'
        }
        danger={confirm?.type === 'delete' || confirm?.type === 'suspend'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

// ── Businesses tab ────────────────────────────────────────────────────────────
function BusinessesTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses', page, search],
    queryFn: () => adminService.listBusinesses({ page, limit: 20, search }).then((r) => r.data.data),
    staleTime: 30_000,
    keepPreviousData: true,
  })

  const businesses = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search by business name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/40 transition-colors"
        />
      </div>

      <div className="rounded-xl border border-glass bg-charcoal overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Business Name</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Currency</th>
              <th className="px-4 py-3 text-left font-semibold">Owner Email</th>
              <th className="px-4 py-3 text-left font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">Loading…</td>
              </tr>
            )}
            {!isLoading && businesses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">No businesses found</td>
              </tr>
            )}
            {businesses.map((b) => (
              <tr key={b._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{b.businessName}</td>
                <td className="px-4 py-3 text-text-secondary">{b.businessType ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{b.currency ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{b.owner?.email ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">
                  {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  )
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'businesses', label: 'Businesses' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
        <p className="mt-1 text-[13px] text-text-muted">Manage users, businesses, and platform health.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-glass">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'businesses' && <BusinessesTab />}
      </div>
    </div>
  )
}
