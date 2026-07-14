import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import authService from '@/services/auth.service'
import { showError, showSuccess } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const verify = async () => {
    setLoading(true)
    try {
      await authService.verifyEmail(token)
      showSuccess('Email verified! You can now sign in.')
      setVerified(true)
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    try {
      await authService.resendVerification(email)
      showSuccess('Verification email sent')
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  return (
    <div className="rounded-2xl border border-glass bg-navy-2 p-8 shadow-elevated text-center">
      <h1 className="text-2xl font-bold">Verify your email</h1>
      {verified ? (
        <p className="mt-4"><Link to="/login" className="text-brand-600">Go to login</Link></p>
      ) : (
        <>
          <Input className="mt-6 text-left" label="Verification token" value={token} onChange={(e) => setToken(e.target.value)} />
          <Button className="mt-4" fullWidth loading={loading} onClick={verify}>Verify</Button>
          <div className="mt-6 border-t pt-6">
            <Input label="Resend to email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="outline" className="mt-2" fullWidth onClick={resend}>Resend email</Button>
          </div>
        </>
      )}
    </div>
  )
}
