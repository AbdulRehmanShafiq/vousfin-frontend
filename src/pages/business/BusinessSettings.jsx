import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getErrorMessage } from '@/utils/errorHandler'

export default function BusinessSettings() {
  const navigate = useNavigate()
  const { activeBusiness, fetchBusiness, updateBusiness } = useBusinessStore()
  const { user } = useAuthStore()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !user.businessId) {
      navigate('/business/setup')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.businessId) {
      fetchBusiness()
        .then((b) => {
          if (b) {
            setForm({
              businessName: b.businessName,
              currency: b.currency,
              fiscalYearStartMonth: b.fiscalYearStartMonth,
            })
          }
        })
        .catch((e) => toast.error(getErrorMessage(e)))
    }
  }, [user?.businessId, fetchBusiness])

  const save = async (e) => {
    e.preventDefault()
    if (!activeBusiness) {
      toast.error('No business profile found')
      return
    }
    setLoading(true)
    try {
      await updateBusiness(form)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Business Settings</h1>
        <p className="text-text-secondary mt-1">Update your business profile and preferences.</p>
      </div>
      <form onSubmit={save} className="premium-card space-y-6 p-6 sm:p-8">
        <Input
          label="Business Name"
          value={form.businessName || ''}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          placeholder="Your business name"
        />
        <Select
          label="Base Currency"
          value={form.currency || 'PKR'}
          onChange={(v) => setForm({ ...form, currency: v })}
          options={[
            { value: 'PKR', label: 'PKR — Pakistani Rupee' },
            { value: 'USD', label: 'USD — US Dollar' },
            { value: 'EUR', label: 'EUR — Euro' },
            { value: 'GBP', label: 'GBP — British Pound' },
          ]}
        />
        <Select
          label="Fiscal Year Start"
          value={String(form.fiscalYearStartMonth ?? 7)}
          onChange={(v) => setForm({ ...form, fiscalYearStartMonth: parseInt(v, 10) })}
          options={[
            { value: '1', label: 'January' },
            { value: '4', label: 'April' },
            { value: '7', label: 'July' },
            { value: '10', label: 'October' },
          ]}
        />
        <div className="flex justify-end pt-2 border-t border-glass">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}