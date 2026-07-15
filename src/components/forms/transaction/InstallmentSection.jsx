/**
 * InstallmentSection — the Installment / EMI toggle + plan fields + GAAP
 * compound-journal preview. Advanced create-mode only.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { InstallmentJournalPreview } from './previews'

export default function InstallmentSection({
  form: { register, watch, setValue, errors },
  currency, isInstallment, amount, debitAcctName,
}) {
  const fDown  = watch('downPayment')          || 0
  const fCount = watch('installmentCount')     || 1
  const fRate  = watch('interestRate')         || 0
  const fFreq  = watch('installmentFrequency') || 'monthly'
  return (
    <div className="pt-3 border-t border-glass">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center">
          <input type="checkbox" className="peer sr-only" {...register('isInstallment')} />
          <div className="h-6 w-11 rounded-full bg-charcoal border border-glass peer-checked:bg-accent peer-checked:border-accent transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-navy-2 after:transition-all peer-checked:after:translate-x-full" />
        </div>
        <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
          Set up as Installment / EMI Plan
        </span>
      </label>

      {isInstallment && (
        <div className="mt-4 space-y-4 animate-fade-in p-4 border border-glass rounded-xl bg-glass-hover">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input label={`Down Payment (${currency})`} type="number" step="0.01" min="0"
              error={errors.downPayment?.message} {...register('downPayment', { valueAsNumber: true })} />
            <Input label="No. of Instalments" type="number" min="1"
              error={errors.installmentCount?.message} {...register('installmentCount', { valueAsNumber: true })} />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Frequency</label>
              <Select options={[
                { value: 'weekly',    label: 'Weekly' },
                { value: 'biweekly',  label: 'Bi-weekly' },
                { value: 'monthly',   label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
              ]} value={fFreq} onChange={(val) => setValue('installmentFrequency', val)} />
            </div>
            <Input label="Interest Rate (% p.a.)" type="number" step="0.1" min="0" max="100"
              placeholder="0 = interest-free" error={errors.interestRate?.message}
              {...register('interestRate', { valueAsNumber: true })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="First Payment Date (optional)" type="date"
              placeholder="defaults to one period after purchase" {...register('firstPaymentDate')} />
            {(watch('interestRate') || 0) > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Interest Method</label>
                <Select options={[
                  { value: 'reducing_balance', label: 'Reducing Balance (standard EMI)' },
                  { value: 'flat',             label: 'Flat Interest (simple)' },
                ]} value={watch('interestMethod') || 'reducing_balance'}
                  onChange={(val) => setValue('interestMethod', val)} />
              </div>
            )}
          </div>

          <InstallmentJournalPreview
            total={amount} downPayment={fDown}
            installmentCount={fCount} installmentFrequency={fFreq}
            interestRate={fRate} interestMethod={watch('interestMethod') || 'reducing_balance'}
            firstPaymentDate={watch('firstPaymentDate') || ''}
            assetName={debitAcctName} currency={currency} />
        </div>
      )}
    </div>
  )
}
