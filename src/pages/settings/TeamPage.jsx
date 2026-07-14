/**
 * TeamPage — Phase 6A (Team & RBAC)
 *
 * Invite people to your business and control what each can do. Roles map to
 * permissions on the backend; the owner can do everything, an accountant records
 * but can't approve, an approver approves but can't record, a viewer is read-only.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { UsersRound, UserPlus, Trash2, Loader2, Check, Shield } from 'lucide-react'
import teamService from '@/services/team.service'
import { getErrorMessage } from '@/utils/errorHandler'

const ROLES = [
  { v: 'owner',      l: 'Owner',      desc: 'Full access, including approvals and team' },
  { v: 'accountant', l: 'Accountant', desc: 'Record transactions — cannot approve' },
  { v: 'approver',   l: 'Approver',   desc: 'Approve — cannot record' },
  { v: 'viewer',     l: 'Viewer',     desc: 'Read-only' },
]
const ROLE_LABEL = Object.fromEntries(ROLES.map(r => [r.v, r.l]))

function RolePicker({ value, onChange }) {
  const toggle = (r) => onChange(value.includes(r) ? value.filter(x => x !== r) : [...value, r])
  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map(r => (
        <button key={r.v} type="button" onClick={() => toggle(r.v)} title={r.desc}
          className={`px-2.5 py-1 rounded-lg text-xs border transition ${value.includes(r.v)
            ? 'border-accent/50 bg-accent/15 text-text-primary'
            : 'border-glass bg-glass-panel/40 text-text-muted hover:bg-glass-hover'}`}>
          {r.l}
        </button>
      ))}
    </div>
  )
}

export default function TeamPage() {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [inviteRoles, setInviteRoles] = useState(['viewer'])

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamService.list().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['team'] })

  const invite = useMutation({
    mutationFn: () => teamService.invite(email.trim(), inviteRoles),
    onSuccess: () => { invalidate(); setEmail(''); setInviteRoles(['viewer']); toast.success('Invitation sent') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const updateRoles = useMutation({
    mutationFn: ({ userId, roles }) => teamService.updateRoles(userId, roles),
    onSuccess: () => { invalidate(); toast.success('Roles updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (userId) => teamService.remove(userId),
    onSuccess: () => { invalidate(); toast.success('Member removed') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const memberUserId = (m) => (m.userId && (m.userId._id || m.userId)) || null
  const memberName = (m) => m.userId?.fullName || m.userId?.email || m.invitedEmail || '—'

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/15"><UsersRound className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Team</h1>
          <p className="text-sm text-text-secondary mt-0.5">Invite people and choose what each can do.</p>
        </div>
      </div>

      {/* Invite */}
      <form onSubmit={(e) => { e.preventDefault(); if (email.trim() && inviteRoles.length) invite.mutate() }}
        className="premium-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-small font-semibold text-text-primary"><UserPlus className="h-4 w-4 text-accent" /> Invite someone</div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com"
          className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
        <RolePicker value={inviteRoles} onChange={setInviteRoles} />
        <div className="flex justify-end">
          <button type="submit" disabled={!email.trim() || !inviteRoles.length || invite.isPending}
            className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-small font-semibold disabled:opacity-50">
            {invite.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Send invite
          </button>
        </div>
      </form>

      {/* Members */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="premium-card h-16 animate-pulse" />)}</div>
      ) : members.length === 0 ? (
        <div className="premium-card p-6 text-center text-small text-text-secondary">No team members yet — invite someone above.</div>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m._id} className="premium-card p-3.5 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-small font-semibold text-text-primary">{memberName(m)}</span>
                    {m.status !== 'active' && <span className="text-label uppercase tracking-wider text-highlight">{m.status}</span>}
                  </div>
                  {m.userId?.email && <p className="text-label text-text-muted mt-0.5">{m.userId.email}</p>}
                </div>
                <span className="inline-flex items-center gap-1 text-label text-text-muted">
                  <Shield className="h-3.5 w-3.5" /> {(m.roles || []).map(r => ROLE_LABEL[r] || r).join(', ')}
                </span>
                {memberUserId(m) && (
                  <button onClick={() => { if (confirm(`Remove ${memberName(m)} from the team?`)) remove.mutate(memberUserId(m)) }}
                    aria-label="Remove" className="p-1.5 rounded-lg text-text-muted hover:text-negative hover:bg-glass-hover"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              {memberUserId(m) && (
                <div className="flex items-center justify-between gap-2">
                  <RolePicker value={m.roles || []} onChange={(roles) => { if (roles.length) updateRoles.mutate({ userId: memberUserId(m), roles }) }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
