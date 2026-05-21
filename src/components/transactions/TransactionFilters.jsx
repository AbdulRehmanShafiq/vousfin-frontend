import DatePicker from '@/components/common/DatePicker'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'
import { TRANSACTION_TYPES } from '@/utils/constants'

export default function TransactionFilters({ filters, onChange, onApply, onReset, accounts = [] }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-4">
      <DatePicker
        range
        startDate={filters.startDate}
        endDate={filters.endDate}
        onRangeChange={({ startDate, endDate }) => onChange({ ...filters, startDate, endDate })}
      />
      <Select
        label="Type"
        value={filters.transactionType || ''}
        onChange={(v) => set('transactionType', v)}
        options={[{ value: '', label: 'All types' }, ...Object.values(TRANSACTION_TYPES).map((t) => ({ value: t, label: t }))]}
      />
      <Select
        label="Account"
        searchable
        value={filters.accountId || ''}
        onChange={(v) => set('accountId', v)}
        options={[{ value: '', label: 'All accounts' }, ...accounts.map((a) => ({ value: a._id, label: a.name }))]}
      />
      <Input label="Min amount" type="number" value={filters.minAmount || ''} onChange={(e) => set('minAmount', e.target.value)} />
      <Input label="Max amount" type="number" value={filters.maxAmount || ''} onChange={(e) => set('maxAmount', e.target.value)} />
      <Input label="Search" value={filters.search || ''} onChange={(e) => set('search', e.target.value)} placeholder="Description..." />
      <div className="flex items-end gap-2 md:col-span-2">
        <Button onClick={onApply}>Apply filters</Button>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>
    </div>
  )
}
