import { useState } from 'react'
import { ShieldCheck, ShieldOff, Eye, EyeOff, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import mfaService from '@/services/mfa.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errorHandler'

/*
 * SecurityPage — MFA enrolment and session security settings.
 * Route: /settings/security
 * NFR-SEC-01 (TOTP) + NFR-SEC-07 (idle timeout already wired in DashboardLayout).
 */
export default function SecurityPage() {
  // MFA enrolment flow state
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [setupData, setSetupData] = useState(null) // { secret, backupCodes, otpauthUrl }
  const [confirmCode, setConfirmCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [showDisablePrompt, setShowDisablePrompt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Start setup — fetch secret from backend
  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const res = await mfaService.setup()
      setSetupData(res.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Confirm enrolment with first TOTP code
  const handleConfirm = async () => {
    if (!confirmCode || confirmCode.length < 6) {
      toast.error('Enter the 6-digit code from your authenticator app')
      return
    }
    setLoading(true)
    try {
      await mfaService.confirm(confirmCode)
      setMfaEnabled(true)
      setSetupData(null)
      setConfirmCode('')
      toast.success('Two-factor authentication is now active')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Disable MFA
  const handleDisable = async () => {
    if (!disableCode || disableCode.length < 6) {
      toast.error('Enter your current authenticator code to confirm')
      return
    }
    setLoading(true)
    try {
      await mfaService.disable(disableCode)
      setMfaEnabled(false)
      setShowDisablePrompt(false)
      setDisableCode('')
      toast.success('Two-factor authentication disabled')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (!setupData?.secret) return
    navigator.clipboard.writeText(setupData.secret).then(() => {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Security</h1>
        <p className="text-text-secondary mt-1">Protect your account with two-factor authentication and session controls.</p>
      </div>

      {/* ── MFA section ─────────────────────────────────────── */}
      <div className="rounded-xl border border-glass bg-glass-panel p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Two-Factor Authentication (2FA)
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Each time you log in, you'll also enter a code from your authenticator app (e.g. Google Authenticator, Authy).
            </p>
          </div>
          {mfaEnabled && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Active
            </span>
          )}
        </div>

        {/* Not enrolled — show enable button or setup wizard */}
        {!mfaEnabled && !setupData && (
          <Button onClick={handleStartSetup} loading={loading} variant="primary">
            Enable 2-Factor Authentication
          </Button>
        )}

        {/* Setup wizard */}
        {!mfaEnabled && setupData && (
          <div className="space-y-5">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-text-secondary space-y-1">
              <p className="font-medium text-text-primary">Step 1 — Add VousFin to your authenticator app</p>
              <p>Open Google Authenticator, Authy, or any TOTP app and choose "Enter a setup key".</p>
            </div>

            {/* Account name + secret */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Account name</p>
              <p className="text-sm text-text-primary font-mono bg-glass rounded-lg px-3 py-2">VousFin</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Setup key</p>
              <div className="flex items-center gap-2">
                <p className={`flex-1 text-sm font-mono bg-glass rounded-lg px-3 py-2 text-text-primary break-all ${!showSecret ? 'blur-sm select-none' : ''}`}>
                  {setupData.secret}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
                  className="shrink-0 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass transition-colors"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  aria-label="Copy secret key"
                  className="shrink-0 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass transition-colors"
                >
                  {copiedSecret ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-text-muted">Select "Time based" (TOTP) in your app.</p>
            </div>

            {/* Backup codes */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Backup codes — save these somewhere safe</p>
              <p className="text-xs text-text-muted">Each code can only be used once if you lose access to your authenticator app.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {setupData.backupCodes.map((code) => (
                  <span key={code} className="text-center font-mono text-xs bg-glass rounded-lg px-2 py-1.5 text-text-primary border border-glass">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm code */}
            <div className="space-y-3">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">Step 2 — Confirm it works</p>
                <p>Enter the 6-digit code from your app to finish setup.</p>
              </div>
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                aria-label="Authenticator code"
              />
              <div className="flex gap-3">
                <Button onClick={handleConfirm} loading={loading} variant="primary">
                  Confirm and Enable
                </Button>
                <Button onClick={() => { setSetupData(null); setConfirmCode('') }} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MFA already enabled — show disable option */}
        {mfaEnabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-glass bg-glass/30 px-4 py-3 text-sm text-text-secondary">
              <ShieldCheck className="h-5 w-5 text-green-400 shrink-0" />
              Your account is protected with two-factor authentication.
            </div>

            {!showDisablePrompt && (
              <button
                type="button"
                onClick={() => setShowDisablePrompt(true)}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <ShieldOff className="h-4 w-4" />
                Disable two-factor authentication
              </button>
            )}

            {showDisablePrompt && (
              <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-sm text-text-secondary">
                  Enter your current authenticator code to confirm you want to turn off 2FA.
                </p>
                <Input
                  label="Current authenticator code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-label="Current authenticator code"
                />
                <div className="flex gap-3">
                  <Button onClick={handleDisable} loading={loading} variant="danger">
                    Disable 2FA
                  </Button>
                  <Button onClick={() => { setShowDisablePrompt(false); setDisableCode('') }} variant="ghost">
                    Keep it on
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Session security info card ───────────────────────── */}
      <div className="rounded-xl border border-glass bg-glass-panel p-6 space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Session timeout</h2>
        <p className="text-sm text-text-secondary">
          VousFin automatically signs you out after <strong>15 minutes</strong> of inactivity to keep your data safe.
          Any mouse movement, click, or keystroke resets the timer.
        </p>
      </div>
    </div>
  )
}
