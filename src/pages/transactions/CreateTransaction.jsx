import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TransactionForm from '@/components/transactions/TransactionForm'
import ExcelUploader from '@/components/transactions/ExcelUploader'
import NaturalLanguageInput from '@/components/transactions/NaturalLanguageInput'
import { cn } from '@/utils/cn'

const tabs = [
  { id: 'form', label: 'Structured form' },
  { id: 'excel', label: 'Excel upload' },
  { id: 'nl', label: 'Natural language' },
]

export default function CreateTransaction() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('form')
  const onSuccess = () => navigate('/transactions')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create transaction</h1>
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-card">
        {tab === 'form' && <TransactionForm onSuccess={onSuccess} />}
        {tab === 'excel' && <ExcelUploader onSuccess={onSuccess} />}
        {tab === 'nl' && <NaturalLanguageInput onSuccess={onSuccess} />}
      </div>
    </div>
  )
}
