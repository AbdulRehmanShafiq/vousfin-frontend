import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'
import { getPostAuthPath } from '@/utils/authRedirect'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import mfaService from '@/services/mfa.service'
import authService from '@/services/auth.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // MFA challenge state
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaToken, setMfaToken] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)

  // Verification recovery state
  const [needsVerify, setNeedsVerify] = useState(null)
  const [resendLoading, setResendLoading] = useState(false)

  // Show Google error once on mount if redirected back with ?error=google
  useEffect(() => {
    if (searchParams.get('error') === 'google') {
      toast.error('Google sign-in failed. Please try again.')
    }
  }, [searchParams])

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
      const msg = getErrorMessage(err)
      if (err?.response?.status === 403 && /verify your email/i.test(msg)) {
        setNeedsVerify(data.email)
      } else {
        toast.error(msg)
      }
    }
  }

  const handleResendVerification = async () => {
    if (!needsVerify) return
    setResendLoading(true)
    try {
      await authService.resendVerification(needsVerify)
      toast.success('Verification email sent')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = authService.googleOAuthUrl()
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

      {/* Email verification recovery panel */}
      {needsVerify && (
        <div className="mb-6 rounded-lg border border-amber/30 bg-amber/5 p-4 text-sm" role="alert">
          <p className="text-text-primary font-medium mb-1">Verify your email to continue</p>
          <p className="text-text-secondary mb-3">
            We sent a link to <span className="font-semibold text-text-primary">{needsVerify}</span>. Check your inbox and click the link to activate your account.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              loading={resendLoading}
              onClick={handleResendVerification}
            >
              Resend verification email
            </Button>
            <Link
              to="/verify-email"
              className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-cyan hover:text-cyan-2 transition-colors"
            >
              Go to verify page
            </Link>
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

      {/* "or" divider + Google button */}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-glass" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-glass" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-4 w-full inline-flex items-center justify-center gap-3 rounded-md border border-glass bg-glass-panel px-4 py-2.5 text-sm font-semibold text-text-primary transition-premium hover:bg-glass-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label="Continue with Google"
      >
        {/* Google G SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-bold text-cyan hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
