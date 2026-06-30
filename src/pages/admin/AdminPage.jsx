import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users, Building2, TrendingUp, UserCheck, UserX, Clock,
  ShieldCheck, ArrowUpCircle, ArrowDownCircle, Trash2, CheckCircle,
  Search, ChevronLeft, ChevronRight,
} from 'lucide-react'
import adminService from '@/services/admin.service'
import { getErrorMessage } from '@/utils/errorHandler'
import SelectField from '@/components/ui/SelectField'
import { cn } from '@/utils/cn'
import { Star, Activity, Zap } from 'lucide-react'
import AppearanceCard from '@/components/settings/AppearanceCard'
import SearchInsightsTab from './SearchInsightsTab'

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
    if (type === 'resetMfa')   await act(() => adminService.resetMfa(id), 'MFA reset')
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
                    {/* Reset MFA */}
                    {u.role !== 'deleted' && (
                      <button
                        onClick={() => setConfirm({ type: 'resetMfa', id: u._id })}
                        title="Reset MFA"
                        className="rounded p-1.5 text-cyan hover:bg-cyan/10 transition-colors"
                      >
                        <Zap className="h-4 w-4" />
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
          confirm?.type === 'demote' ? 'Demote to customer?' :
          'Reset MFA?'
        }
        message={
          confirm?.type === 'delete' ? 'This will soft-delete the account and all associated data. This cannot be undone.' :
          confirm?.type === 'suspend' ? 'The user will lose access until reinstated.' :
          confirm?.type === 'reinstate' ? 'The account will be restored to active status.' :
          confirm?.type === 'verify' ? 'This will activate the account, bypassing email verification.' :
          confirm?.type === 'promote' ? 'This user will gain full admin access to the platform.' :
          confirm?.type === 'demote' ? 'This will remove admin access from this user.' :
          'This will reset the user\'s multi-factor authentication. They will need to set it up again on next login.'
        }
        danger={confirm?.type === 'delete' || confirm?.type === 'suspend' || confirm?.type === 'resetMfa'}
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

// ── Feedback tab ──────────────────────────────────────────────────────────────
function FeedbackTab() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [confirm, setConfirm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback', page, statusFilter, typeFilter],
    queryFn: () => adminService.listFeedback({ page, limit: 20, status: statusFilter || undefined, type: typeFilter || undefined }).then((r) => r.data.data),
    staleTime: 30_000,
    keepPreviousData: true,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-feedback'] })
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
    if (type === 'updateStatus')    await act(() => adminService.updateFeedback(id, { status: extra }), 'Feedback status updated')
    if (type === 'updateNote')      await act(() => adminService.updateFeedback(id, { adminNote: extra }), 'Note updated')
  }

  const feedbacks = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-40">
          <SelectField
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </SelectField>
        </div>
        <div className="w-full sm:w-40">
          <SelectField
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          >
            <option value="">All types</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="question">Question</option>
            <option value="other">Other</option>
          </SelectField>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setPage(1)}
            className="btn-gradient px-4 py-2 rounded-lg text-[13px] font-medium text-white hover:opacity-90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-glass bg-charcoal overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-left font-semibold">Message</th>
              <th className="px-4 py-3 text-left font-semibold">Rating</th>
              <th className="px-4 py-3 text-left font-semibold">Submitter</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-muted">Loading…</td>
              </tr>
            )}
            {!isLoading && feedbacks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-muted">No feedback found</td>
              </tr>
            )}
            {feedbacks.map((f) => (
              <tr key={f._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors">
                <td className="px-4 py-3 text-text-secondary">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    f.type === 'bug' ? 'bg-negative/20 text-negative' :
                    f.type === 'feature' ? 'bg-accent/20 text-accent' :
                    f.type === 'question' ? 'bg-cyan/20 text-cyan' :
                    'bg-text-muted/20 text-text-muted'
                  }`}>
                    {f.type.charAt(0).toUpperCase() + f.type.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">{f.subject}</td>
                <td className="px-4 py-3 text-text-secondary line-clamp-2 max-w-[200px]">{f.message}</td>
                <td className="px-4 py-3 text-center">
                  {f.rating ? (
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= f.rating ? 'text-positive' : 'text-text-muted'}`} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary">{f.userId?.email ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex>
                    {f.status === 'new' ? 'bg-amber/20 text-amber' :
                    f.status === 'reviewed' ? 'bg-cyan/20 text-cyan' :
                    f.status === 'resolved' ? 'bg-positive/20 text-positive' :
                    'bg-text-muted/20 text-text-muted'
                  }`}>
                    {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Status dropdown */}
                    <select
                      value={f.status}
                      onChange={(e) => setConfirm({ type: 'updateStatus', id: f._id, extra: e.target.value })}
                      className="border border-glass px-2 py-1 rounded-lg text-[12px] bg-glass-panel focus:outline-none focus:border-cyan/40"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {/* Note textarea */}
                    {(f.status === 'reviewed' || f.status === 'resolved') && (
                      <div className="relative mt-2 w-full">
                        <textarea
                          value={f.adminNote || ''}
                          onChange={(e) => setConfirm({ type: 'updateNote', id: f._id, extra: e.target.value })}
                          placeholder="Add admin note..."
                          className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[12px] resize-none focus:outline-none focus:border-cyan/40"
                          rows={2}
                        />
                        <button
                          onClick={() => {
                            if (confirm) {
                              const { type, id, extra } = confirm
                              if (type === 'updateNote') {
                                act(() => adminService.updateFeedback(id, { adminNote: extra }), 'Note updated')
                                setConfirm(null)
                              }
                            }
                          }}
                          className="mt-2 px-3 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 text-[12px]"
                        >
                          Save
                        </button>
                      </div>
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
          confirm?.type === 'updateStatus' ? 'Update status?' :
          confirm?.type === 'updateNote' ? 'Update note?' : ''
        }
        message={
          confirm?.type === 'updateStatus' ? 'Update the status of this feedback item?' :
          confirm?.type === 'updateNote' ? 'Save the note for this feedback item?' : ''
        }
        danger={false}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

// ── Support tab ───────────────────────────────────────────────────────────────
function SupportTab() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [ticketMessages, setTicketMessages] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', page, statusFilter, priorityFilter],
    queryFn: () => adminService.listSupport({ page, limit: 20, status: statusFilter || undefined, priority: priorityFilter || undefined }).then((r) => r.data.data),
    staleTime: 30_000,
    keepPreviousData: true,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-support'] })
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
    if (type === 'updateStatus')    await act(() => adminService.updateTicket(id, { status: extra }), 'Ticket status updated')
    if (type === 'updatePriority')  await act(() => adminService.updateTicket(id, { priority: extra }), 'Priority updated')
    if (type === 'addReply')        await act(() => adminService.replyTicket(id, { body: extra }), 'Reply sent')
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicketId || isReplying) return
    setIsReplying(true)
    try {
      await adminService.replyTicket(selectedTicketId, { body: replyText })
      setReplyText('')
      const res = await adminService.getTicket(selectedTicketId)
      setTicketMessages(res.data.data.messages || [])
      invalidate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsReplying(false)
    }
  }

  // Fetch messages for the selected ticket (admin can read any ticket)
  useEffect(() => {
    if (selectedTicketId) {
      adminService.getTicket(selectedTicketId).then((res) => {
        setTicketMessages(res.data.data.messages || [])
      }).catch((err) => {
        toast.error(getErrorMessage(err))
      })
    }
  }, [selectedTicketId])

  const tickets = data?.data ?? []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-40">
          <SelectField
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </SelectField>
        </div>
        <div className="w-full sm:w-40">
          <SelectField
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </SelectField>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setPage(1)}
            className="btn-gradient px-4 py-2 rounded-lg text-[13px] font-medium text-white hover:opacity-90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Ticket list */}
      <div className="rounded-xl border border-glass bg-charcoal">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Subject</th>
                <th className="px-4 py-3 text-left font-semibold">Requester</th>
                <th className="px-4 py-3 text-left font-semibold">Priority</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading…</td>
                </tr>
              )}
              {!isLoading && tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No tickets found</td>
                </tr>
              )}
              {tickets.map((t) => (
                <tr key={t._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicketId(t._id)}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{t.subject}</td>
                  <td className="px-4 py-3 text-text-secondary">{t.userId?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      t.priority === 'low' ? 'bg-text-muted/20 text-text-muted' :
                      t.priority === 'medium' ? 'bg-amber/20 text-amber' :
                      t.priority === 'high' ? 'bg-negative/20 text-negative' :
                      t.priority === 'urgent' ? 'bg-positive/20 text-positive' :
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      t.status === 'open' ? 'bg-amber/20 text-amber' :
                      t.status === 'in_progress' ? 'bg-cyan/20 text-cyan' :
                      t.status === 'resolved' ? 'bg-positive/20 text-positive' :
                      t.status === 'closed' ? 'bg-text-muted/20 text-text-muted' :
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <div className="flex items-center gap-1.5">
                      {/* Status dropdown */}
                      <select
                        value={t.status}
                        onChange={(e) => setConfirm({ type: 'updateStatus', id: t._id, extra: e.target.value })}
                        className="border border-glass px-2 py-1 rounded-lg text-[12px] bg-glass-panel focus:outline-none focus:border-cyan/40"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>

                      {/* Priority dropdown */}
                      <select
                        value={t.priority}
                        onChange={(e) => setConfirm({ type: 'updatePriority', id: t._id, extra: e.target.value })}
                        className="ml-2 border border-glass px-2 py-1 rounded-lg text-[12px] bg-glass-panel focus:outline-none focus:border-cyan/40"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket detail view */}
      {selectedTicketId && (
        <div className="mt-6 rounded-xl border border-glass bg-charcoal">
          <div className="flex items-center justify-between p-4 border-b border-glass">
            <h2 className="text-xl font-semibold text-text-primary">Ticket Details</h2>
            <button
              onClick={() => setSelectedTicketId(null)}
              className="px-3 py-1 rounded-lg border border-glass text-[12px] text-text-secondary hover:bg-glass-hover transition-colors"
            >
              Back to list
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-text-primary">Subject:</p>
              <p className="text-[13px] text-text-secondary">{tickets.find(t => t._id === selectedTicketId)?.subject || '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-text-primary">Description:</p>
              <p className="text-[13px] text-text-secondary">{tickets.find(t => t._id === selectedTicketId)?.message || '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-text-primary">Priority:</p>
              <p className={`text-[13px] inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  tickets.find(t => t._id === selectedTicketId)?.priority === 'low' ? 'bg-text-muted/20 text-text-muted' :
                  tickets.find(t => t._id === selectedTicketId)?.priority === 'medium' ? 'bg-amber/20 text-amber' :
                  tickets.find(t => t._id === selectedTicketId)?.priority === 'high' ? 'bg-negative/20 text-negative' :
                  tickets.find(t => t._id === selectedTicketId)?.priority === 'urgent' ? 'bg-positive/20 text-positive' :
                  'bg-text-muted/20 text-text-muted'
                }`}>
                {tickets.find(t => t._id === selectedTicketId)?.priority?.charAt(0).toUpperCase() + tickets.find(t => t._id === selectedTicketId)?.priority?.slice(1) || '—'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-text-primary">Status:</p>
              <p className={`text-[13px] inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  tickets.find(t => t._id === selectedTicketId)?.status === 'open' ? 'bg-amber/20 text-amber' :
                  tickets.find(t => t._id === selectedTicketId)?.status === 'in_progress' ? 'bg-cyan/20 text-cyan' :
                  tickets.find(t => t._id === selectedTicketId)?.status === 'resolved' ? 'bg-positive/20 text-positive' :
                  tickets.find(t => t._id === selectedTicketId)?.status === 'closed' ? 'bg-text-muted/20 text-text-muted' :
                  'bg-text-muted/20 text-text-muted'
                }`}>
                {tickets.find(t => t._id === selectedTicketId)?.status?.charAt(0).toUpperCase() + tickets.find(t => t._id === selectedTicketId)?.status?.slice(1) || '—'}
              </p>
            </div>
          </div>

          {/* Message thread */}
          <div className="border-t border-glass pt-4">
            <h3 className="text-lg font-semibold text-text-primary pb-2 border-b border-glass">Conversation</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {ticketMessages.map((msg, index) => (
                <div key={index} className={`flex flex-col gap-1 ${
                  msg.fromUser ? 'items-start' : 'items-end'
                }`}>
                  <div className={`max-w-[80%] ${
                    msg.fromUser ? 'bg-green-500/10 text-green-500 self-start' : 'bg-blue-500/10 text-blue-500 self-end'
                  } rounded-lg px-3 py-2`}>
                    <p className="text-[13px] whitespace-pre-wrap">{msg.body}</p>
                    <p className="text-[11px] opacity-70">
                      {msg.fromUser ? 'User' : 'Admin'} • {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply form */}
          <div className="mt-4 p-4 border-t border-glass">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Reply to Ticket</h3>
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[12px] resize-none focus:outline-none focus:border-cyan/40"
                rows={3}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isReplying}
                className="w-full btn-gradient py-2 px-4 text-[13px] font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isReplying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Confirm action"
        message="Apply this change to the ticket?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

// ── Announcements tab ─────────────────────────────────────────────────────────
function AnnouncementsTab() {
  const qc = useQueryClient()
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info',
    active: false,
    expiresAt: '',
  })
  const [editId, setEditId] = useState(null)
  const [confirm, setConfirm] = useState(null)

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true)
      try {
        const res = await adminService.listAnnouncements()
        setAnnouncements(res.data.data || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-announcements'] })
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
    if (type === 'toggleActive')    await act(() => adminService.updateAnnouncement(id, { active: extra }), `Announcement ${extra ? 'activated' : 'deactivated'}`)
    if (type === 'delete')          await act(() => adminService.deleteAnnouncement(id), 'Announcement deleted')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await act(() => adminService.updateAnnouncement(editId, formData), 'Announcement updated')
        setEditId(null)
        setFormData({
          title: '',
          body: '',
          type: 'info',
          active: false,
          expiresAt: '',
        })
      } else {
        await act(() => adminService.createAnnouncement(formData), 'Announcement created')
        setFormData({
          title: '',
          body: '',
          type: 'info',
          active: false,
          expiresAt: '',
        })
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    setConfirm({ type: 'toggleActive', id, extra: !currentActive })
  }

  const handleDelete = (id) => {
    setConfirm({ type: 'delete', id })
  }

  return (
    <div className="space-y-4">
      {/* Create/Edit Form */}
      <div className="rounded-xl border border-glass bg-charcoal p-4">
        <h2 className="mb-3 text-xl font-semibold text-text-primary">
          {editId ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 text-[13px] font-medium text-text-secondary">Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] focus:outline-none focus:border-cyan/40"
            />
          </div>
          <div>
            <label className="block mb-1 text-[13px] font-medium text-text-secondary">Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Announcement details"
              className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] resize-none focus:outline-none focus:border-cyan/40"
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Type</label>
              <SelectField
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </SelectField>
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Active</label>
              <SelectField
                value={formData.active.toString()}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </SelectField>
            </div>
            <div>
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Expires At (optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] focus:outline-none focus:border-cyan/40"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setEditId(null)
                setFormData({
                  title: '',
                  body: '',
                  type: 'info',
                  active: false,
                  expiresAt: '',
                })
              }}
              className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-2 btn-gradient py-2 px-4 text-[13px] font-medium text-white hover:opacity-90 transition-colors"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* Announcements list */}
      <div className="rounded-xl border border-glass bg-charcoal">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Active</th>
                <th className="px-4 py-3 text-left font-semibold">Expires At</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !announcements.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">Loading…</td>
                </tr>
              )}
              {!isLoading && announcements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">No announcements found</td>
                </tr>
              )}
              {announcements.map((a) => (
                <tr key={a._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{a.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      a.type === 'info' ? 'bg-cyan/20 text-cyan' :
                      a.type === 'warning' ? 'bg-amber/20 text-amber' :
                      a.type === 'success' ? 'bg-positive/20 text-positive' :
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      a.active ? 'bg-positive/20 text-positive' : 'bg-text-muted/20 text-text-muted'
                    }`}>
                      {a.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <div className="flex items-center gap-2">
                      {editId !== a._id && (
                        <>
                          <button
                            onClick={() => {
                              setFormData({
                                title: a.title,
                                body: a.body,
                                type: a.type,
                                active: a.active,
                                expiresAt: a.expiresAt || '',
                              })
                              setEditId(a._id)
                            }}
                            className="px-3 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="px-3 py-1 rounded-lg bg-negative/20 text-negative hover:bg-negative/30"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {editId === a._id && (
                        <>
                          <button
                            onClick={() => handleSubmit(new Event('submit'))}
                            className="px-3 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="ml-2 px-3 py-1 rounded-lg bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {!editId && (
                        <button
                          onClick={() => handleToggleActive(a._id, a.active)}
                          className={`px-3 py-1 rounded-lg ${
                            a.active ? 'bg-positive/20 text-positive hover:bg-positive/30' : 'bg-text-muted/20 text-text-muted hover:bg-gray-500/20'
                          }`}
                        >
                          {a.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Confirm"
        message="Apply this change?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        danger={confirm?.type === 'delete'}
      />
    </div>
  )
}

// ── Activity tab ──────────────────────────────────────────────────────────────
function ActivityTab() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Fetch activity logs
  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true)
      try {
        const res = await adminService.activity({ page, limit: perPage })
        setData(res.data.data || [])
        setTotal(res.data.total || 0)
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [page, perPage])

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-glass bg-charcoal p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-[13px] font-medium text-text-secondary">Loading activity log...</span>
          </div>
          <div className="mt-2 h-24 rounded-xl border border-glass bg-charcoal animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div>
          <label className="block mb-1 text-[13px] font-medium text-text-secondary">Entries per page</label>
          <SelectField
            value={perPage.toString()}
            onChange={(e) => {
              setPerPage(parseInt(e.target.value))
              setPage(1)
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </SelectField>
        </div>
      </div>

      {/* Activity table */}
      <div className="rounded-xl border border-glass bg-charcoal overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-glass text-text-muted text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Entity Type</th>
              <th className="px-4 py-3 text-left font-semibold">Performed By</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((activity) => (
                <tr key={activity._id} className="border-b border-glass/50 last:border-0 hover:bg-glass-hover/30 transition-colors">
                  <td className="px-4 py-3 text-text-secondary">{activity.action}</td>
                  <td className="px-4 py-3 text-text-secondary">{activity.entityType || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{activity.performedBy?.email || activity.performedBy || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">No activity found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-glass">
        <span className="text-[13px] text-text-muted">
          Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded-lg border border-glass hover:bg-glass-hover transition-colors"
          >
            Previous
          </button>
          <span className="text-[13px] text-text-muted">{page} of {Math.ceil(total / perPage)}</span>
          <button
            onClick={() => setPage(Math.min(Math.ceil(total / perPage), page + 1))}
            disabled={page >= Math.ceil(total / perPage) || total === 0}
            className="px-3 py-1 rounded-lg border border-glass hover:bg-glass-hover transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Appearance tab ────────────────────────────────────────────────────────────
function AppearanceTab() {
  return (
    <div className="space-y-4">
      <AppearanceCard />
    </div>
  )
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'businesses', label: 'Businesses' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'support', label: 'Support' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'activity', label: 'Activity' },
  { key: 'search', label: 'Search Insights' },
  { key: 'appearance', label: 'Appearance' },
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
        {activeTab === 'feedback' && <FeedbackTab />}
        {activeTab === 'support' && <SupportTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'search' && <SearchInsightsTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  )
}