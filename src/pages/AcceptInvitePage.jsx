/**
 * AcceptInvitePage — Phase 6A
 *
 * Reached from the emailed invite link (/accept-invite?token=...). Requires the
 * invitee to be logged in (the email must match the account). On success the
 * backend activates their membership and — if they had no business yet — makes
 * the invited business their active one.
 */
import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, Check, AlertTriangle, UsersRound } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import teamService from '@/services/team.service'
import { getErrorMessage } from '@/utils/errorHandler'

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const { isAuthenticated, setBusinessId } = useAuthStore()
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [message, setMessage] = useState('')

  const accept = async () => {
    if (!token) { setState('error'); setMessage('This invite link is missing its token.'); return }
    setState('loading')
    try {
      const res = await teamService.accept(token)
      const m = res.data?.data
      if (m?.businessId && setBusinessId) setBusinessId(m.businessId)
      setState('done')
    } catch (e) {
      setState('error'); setMessage(getErrorMessage(e))
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="premium-card p-7 max-w-md w-full text-center space-y-4">
        <div className="mx-auto p-2.5 rounded-xl bg-accent/15 w-fit"><UsersRound className="h-6 w-6 text-accent" /></div>
        <h1 className="text-xl font-semibold text-text-primary">Join the team</h1>

        {!isAuthenticated ? (
          <>
            <p className="text-small text-text-secondary">Please log in with the email this invite was sent to, then open the invite link again to accept.</p>
            <Link to="/login" className="btn-gradient inline-flex items-center justify-center px-4 py-2 rounded-lg text-small font-semibold">Log in</Link>
          </>
        ) : state === 'done' ? (
          <>
            <div className="mx-auto p-2 rounded-full bg-positive/15 w-fit"><Check className="h-5 w-5 text-positive" /></div>
            <p className="text-small text-text-secondary">You've joined the team. Welcome aboard!</p>
            <button onClick={() => navigate('/dashboard')} className="btn-gradient inline-flex items-center justify-center px-4 py-2 rounded-lg text-small font-semibold">Go to dashboard</button>
          </>
        ) : state === 'error' ? (
          <>
            <div className="mx-auto p-2 rounded-full bg-negative/15 w-fit"><AlertTriangle className="h-5 w-5 text-negative" /></div>
            <p className="text-small text-negative">{message}</p>
            <button onClick={accept} className="text-small text-text-muted hover:text-text-primary underline">Try again</button>
          </>
        ) : (
          <>
            <p className="text-small text-text-secondary">You've been invited to join a business on VousFin. Accept to get access.</p>
            <button onClick={accept} disabled={state === 'loading'}
              className="btn-gradient inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-small font-semibold disabled:opacity-50">
              {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept invitation
            </button>
          </>
        )}
      </div>
    </div>
  )
}
