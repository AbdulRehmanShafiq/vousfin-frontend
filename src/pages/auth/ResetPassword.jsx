import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import authService from '@/services/auth.service'
import { passwordStrength } from '@/utils/validators'
import { showError, showSuccess } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ token: params.get('token') || '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const strength = passwordStrength(form.newPassword)

  const submit = async (e) => {
    e.preventDefault()
    if (!strength.valid) return showError('Password does not meet requirements')
    if (form.newPassword !== form.confirmPassword) return showError('Passwords do not match')
    setLoading(true)
    try {
      await authService.resetPassword({ token: form.token, newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      showSuccess('Password reset successful')
      navigate('/login')
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-glass bg-navy-2 p-8 shadow-elevated">
      <h1 className="text-2xl font-bold">Set new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input label="Reset token" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
        <Input label="New password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        <Button type="submit" fullWidth loading={loading}>Reset password</Button>
      </form>
      <Link to="/login" className="mt-4 block text-center text-sm text-brand-600">Back to login</Link>
    </div>
  )
}
