// src/components/forms/SimpleEntrySection.jsx
// Plain-question entry: six chips, only the fields that matter. Composes the
// SAME react-hook-form state as the advanced form — one validation, one save
// path. Accounts are wired deterministically from the chip + payment method
// (never guessed); "Something else" hands over to the advanced form.
import { useState, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { SIMPLE_CHIPS, resolveChipAccounts } from '@/utils/simpleEntryPresets'
import { cn } from '@/utils/cn'

export default function SimpleEntrySection({ accounts, form, onSwitchToAdvanced }) {
  const { register, setValue, watch, errors } = form
  const [chipId, setChipId] = useState(null)
  const [categoryAccountId, setCategoryAccountId] = useState('')
  const chip = SIMPLE_CHIPS.find(c => c.id === chipId) || null
  const paymentMethod = watch('paymentMethod') || 'cash'

  const categoryOptions = useMemo(() => {
    const type = chipId === 'gotPaid' ? 'Revenue' : 'Expense'
    return accounts
      .filter(a => a.accountType === type)
      .map(a => ({ value: a._id, label: a.accountName }))
  }, [accounts, chipId])

  const assetAccountOptions = useMemo(() => (
    accounts.filter(a => a.accountType === 'Asset').map(a => ({ value: a._id, label: a.accountName }))
  ), [accounts])

  const wireAccounts = (c, method, category) => {
    const { debitAccountId, creditAccountId } = resolveChipAccounts(c, {
      accounts, paymentMethod: method, categoryAccountId: category,
    })
    if (debitAccountId)  setValue('debitAccountId', debitAccountId,  { shouldValidate: true })
    if (creditAccountId) setValue('creditAccountId', creditAccountId, { shouldValidate: true })
  }

  const pickChip = (c) => {
    if (c.id === 'other') { onSwitchToAdvanced(); return }
    setChipId(c.id)
    setValue('transactionType', c.transactionType)
    if (!watch('paymentMethod')) setValue('paymentMethod', 'cash')
    wireAccounts(c, watch('paymentMethod') || 'cash', categoryAccountId)
  }

  const showField = (f) => chip?.fields.includes(f)

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">What happened?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="What happened?">
        {SIMPLE_CHIPS.map(c => (
          <button key={c.id} type="button" onClick={() => pickChip(c)}
            className={cn(
              'rounded-xl border px-3 py-3 text-sm font-medium text-left transition-colors',
              chipId === c.id
                ? 'border-accent bg-accent/10 text-text-primary'
                : 'border-glass bg-glass-panel text-text-secondary hover:border-accent/50'
            )}>
            {c.label}
          </button>
        ))}
      </div>

      {chip && (
        <div className="space-y-3 animate-fade-in">
          <Input label="What was it for?" placeholder="e.g. office rent for July, 10 bags of rice"
            error={errors.description?.message} {...register('description')} />

          {showField('category') && (
            <Select label={chipId === 'gotPaid' ? 'What kind of income?' : 'What kind of cost?'}
              options={[{ value: '', label: '— pick one —' }, ...categoryOptions]}
              value={categoryAccountId}
              onChange={(v) => { setCategoryAccountId(v); wireAccounts(chip, paymentMethod, v) }}
              searchable />
          )}

          <div className="grid grid-cols-2 gap-2">
            <Input label="Amount" type="number" min="0.01" step="any"
              error={errors.amount?.message} {...register('amount', { valueAsNumber: true })} />
            <Input label="Date" type="date"
              error={errors.transactionDate?.message} {...register('transactionDate')} />
          </div>

          {showField('paymentMethod') && (
            <Select label={chipId === 'gotPaid' || chipId === 'soldStock' ? 'How did you receive it?' : 'How did you pay?'}
              options={[{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }]}
              value={paymentMethod}
              onChange={(v) => { setValue('paymentMethod', v); wireAccounts(chip, v, categoryAccountId) }} />
          )}

          {showField('fromAccount') && (
            <Select label="From account" options={assetAccountOptions}
              value={watch('creditAccountId') || ''}
              onChange={(v) => setValue('creditAccountId', v, { shouldValidate: true })} />
          )}
          {showField('toAccount') && (
            <Select label="To account" options={assetAccountOptions}
              value={watch('debitAccountId') || ''}
              onChange={(v) => setValue('debitAccountId', v, { shouldValidate: true })} />
          )}

          {(errors.debitAccountId || errors.creditAccountId) && (
            <p className="text-xs text-negative">
              We couldn't pick the accounts automatically — switch to Advanced to choose them yourself.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
