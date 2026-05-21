import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { getErrorMessage } from '@/utils/errorHandler'
import { Building2, Briefcase, DollarSign, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const businessSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  registrationNumber: z.string().optional(),
  type: z.string().min(1, 'Business type is required'),
  baseCurrency: z.string().min(3, 'Currency is required'),
  fiscalYearStartMonth: z.coerce.number().min(1).max(12),
})

const STEPS = [
  { id: 1, title: 'Profile', icon: Building2 },
  { id: 2, title: 'Type', icon: Briefcase },
  { id: 3, title: 'Financials', icon: DollarSign },
]

const TYPE_OPTIONS = [
  { key: 'saas', label: 'SaaS / Software' },
  { key: 'service', label: 'Service' },
  { key: 'agency', label: 'Agency' },
  { key: 'retail', label: 'Retail' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'other', label: 'Other' },
]

export default function BusinessSetup() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const setAuthBusinessId = useAuthStore((s) => s.setBusinessId)
  const setBusiness = useBusinessStore((s) => s.setBusiness)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      registrationNumber: '',
      type: 'saas',
      baseCurrency: 'PKR',
      fiscalYearStartMonth: 7,
    },
  })

  const formValues = watch()

  const handleNext = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['name', 'registrationNumber'])
    if (step === 2) isValid = await trigger(['type'])
    if (isValid) setStep((s) => Math.min(s + 1, 3))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data) => {
    try {
      const typeMapping = {
        retail: 'Sole Proprietorship',
        service: 'Sole Proprietorship',
        saas: 'Private Limited',
        manufacturing: 'Private Limited',
        agency: 'Partnership',
        other: 'Sole Proprietorship',
      }

      const payload = {
        businessName: data.name,
        registrationNumber: data.registrationNumber?.trim() || undefined,
        businessType: typeMapping[data.type] || 'Private Limited',
        currency: data.baseCurrency || 'PKR',
        fiscalYearStartMonth: Number(data.fiscalYearStartMonth) || 7,
      }

      const res = await api.post('/business', payload)
      const businessData = res.data.data

      setAuthBusinessId(businessData._id || businessData.id)
      setBusiness(businessData)
      toast.success('Business setup complete!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-navy p-4 text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="premium-card relative z-10 w-full max-w-2xl p-8 sm:p-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-cyan">vousFin Setup</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text-primary">
            Set up your business
          </h1>
          <p className="mt-2 text-text-secondary">Tailor accounting for your company</p>
        </div>

        <div className="relative mb-10 flex items-center justify-between px-4">
          {STEPS.map((stepItem) => {
            const Icon = stepItem.icon
            return (
              <div key={stepItem.id} className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-premium ${
                    step >= stepItem.id
                      ? 'border-cyan bg-cyan/10 text-cyan shadow-glow-cyan'
                      : 'border-glass bg-glass-panel text-text-muted'
                  }`}
                >
                  {step > stepItem.id ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-3 text-sm font-bold ${
                    step >= stepItem.id ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {stepItem.title}
                </span>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-6">
              <Input
                label="Legal Business Name"
                placeholder="Code Hub"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Registration Number (Optional)"
                placeholder="e.g. SEC-2024-00123 — unique to your company"
                error={errors.registrationNumber?.message}
                {...register('registrationNumber')}
              />
              <p className="-mt-3 text-xs text-text-muted">
                Multiple users can share the same business name; use a unique registration number for your company.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-text-secondary">Industry / type</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {TYPE_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('type', key, { shouldValidate: true })}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-premium ${
                      formValues.type === key
                        ? 'border-cyan bg-cyan/5 text-cyan shadow-glow-cyan/20'
                        : 'border-glass bg-glass-panel text-text-secondary hover:bg-glass-hover'
                    }`}
                  >
                    <span className="font-bold">{label}</span>
                    {formValues.type === key && <CheckCircle2 className="h-5 w-5" />}
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-sm text-red-400">{errors.type.message}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Select
                label="Base Currency"
                value={formValues.baseCurrency}
                onChange={(val) => setValue('baseCurrency', val)}
                error={errors.baseCurrency?.message}
                options={[
                  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'GBP', label: 'GBP - British Pound' },
                ]}
              />
              <Select
                label="Fiscal Year Start"
                value={String(formValues.fiscalYearStartMonth ?? 7)}
                onChange={(val) => setValue('fiscalYearStartMonth', parseInt(val, 10))}
                error={errors.fiscalYearStartMonth?.message}
                options={[
                  { value: '1', label: 'January' },
                  { value: '4', label: 'April' },
                  { value: '7', label: 'July' },
                  { value: '10', label: 'October' },
                ]}
              />
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-glass pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={step === 1 ? 'invisible' : ''}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting}>
                Complete Setup
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
