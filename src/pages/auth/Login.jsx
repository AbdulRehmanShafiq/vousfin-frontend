import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'
import { getPostAuthPath } from '@/utils/authRedirect'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import mfaService from '@/services/mfa.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // MFA challenge state
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaToken, setMfaToken] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password)

      // MFA challenge — the login store returns data.mfaRequired when server asks for it
      if (result?.mfaRequired) {
        setMfaToken(result.mfaToken)
        setMfaStep(true)
        return
      }

      toast.success('Successfully logged in')
      navigate(getPostAuthPath(result.user), { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleMfaVerify = async () => {
    if (!mfaCode || mfaCode.length < 6) {
      toast.error('Enter the 6-digit code from your authenticator app')
      return
    }
    setMfaLoading(true)
    try {
      const res = await mfaService.verifyChallenge(mfaToken, mfaCode)
      const { user: verifiedUser, token } = res.data.data
      // Hydrate the auth store manually
      useAuthStore.setState({ user: verifiedUser, token, isAuthenticated: true })
      toast.success('Successfully logged in')
      navigate(getPostAuthPath(verifiedUser), { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setMfaLoading(false)
    }
  }

  const handleContinue = () => {
    navigate(getPostAuthPath(user), { replace: true })
  }

  const handleSignOut = () => {
    logout()
    toast.success('Signed out')
  }

  // MFA challenge step
  if (mfaStep) {
    return (
      <div className="w-full">
        <div className="mb-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-accent mb-3" />
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Two-factor check</h1>
          <p className="mt-2 text-text-secondary text-sm">Open your authenticator app and enter the 6-digit code.</p>
        </div>
        <div className="space-y-5">
          <Input
            label="Authenticator code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-label="6-digit authenticator code"
            autoFocus
          />
          <Button fullWidth onClick={handleMfaVerify} loading={mfaLoading}>
            Verify
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
            onClick={() => { setMfaStep(false); setMfaToken(null); setMfaCode('') }}
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">Welcome back</h1>
        <p className="mt-2 text-text-secondary">Log in to manage your finances</p>
      </div>

      {isAuthenticated && (
        <div className="mb-6 rounded-lg border border-cyan/30 bg-cyan/5 p-4 text-sm text-text-secondary">
          <p>You are already signed in{user?.fullName ? ` as ${user.fullName}` : ''}.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleContinue}>
              Continue to app
            </Button>
            <Button type="button" variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          error={errors.email?.message}
          aria-label="Email address"
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          aria-label="Password"
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-between mt-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" className="rounded border-glass bg-glass-panel text-cyan focus:ring-cyan/50" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-cyan hover:text-cyan-2 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-bold text-cyan hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
