import { useState } from 'react'
import { Sparkles, AlertTriangle } from 'lucide-react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { showError, showSuccess, showWarning } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import transactionService from '@/services/transaction.service'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function NaturalLanguageInput({ onSuccess }) {
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [preview, setPreview] = useState(null)
  const [edit, setEdit] = useState(null)
  const [loading, setLoading] = useState(false)

  const parse = async () => {
    if (text.length < 5) return showError('Enter a longer description')
    setTyping(true)
    setLoading(true)
    try {
      const { data } = await transactionService.naturalLanguageParse(text)
      const parsed = data.data
      setPreview(parsed)
      setEdit({
        amount: parsed.amount,
        transactionDate: parsed.transactionDate || new Date().toISOString().split('T')[0],
        transactionType: parsed.transactionType,
        description: parsed.description,
        debitAccount: parsed.debitAccount,
        creditAccount: parsed.creditAccount,
        debitAccountId: parsed.debitAccountId,
        creditAccountId: parsed.creditAccountId,
      })
      if (parsed.requiresReview) {
        showWarning(
          parsed.reviewReasons?.length
            ? `Review recommended: ${parsed.reviewReasons.join('; ')}`
            : 'AI suggests reviewing this transaction before saving'
        )
      }
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setTimeout(() => setTyping(false), 800)
    }
  }

  const save = async () => {
    if (!edit?.debitAccountId || !edit?.creditAccountId) {
      return showError(
        'Could not resolve chart of accounts from AI preview. Check that debit/credit account names exist in your chart.'
      )
    }
    setLoading(true)
    try {
      await transactionService.naturalLanguageConfirm({
        transactionDate: edit.transactionDate,
        description: edit.description,
        transactionType: edit.transactionType,
        amount: Number(edit.amount),
        debitAccountId: edit.debitAccountId,
        creditAccountId: edit.creditAccountId,
        debitAccount: edit.debitAccount,
        creditAccount: edit.creditAccount,
      })
      showSuccess('Transaction saved')
      setText('')
      setPreview(null)
      setEdit(null)
      onSuccess?.()
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const confidencePct =
    preview?.confidence != null
      ? `${Math.round((preview.confidence <= 1 ? preview.confidence * 100 : preview.confidence))}%`
      : null

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Describe your transaction"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "Paid Rs. 8000 electricity bill yesterday"'
          icon={Sparkles}
        />
        {typing && (
          <span className="absolute right-3 top-9 flex gap-1">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="h-2 w-2 animate-bounce rounded-full bg-brand-500"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
        )}
      </div>
      <Button onClick={parse} loading={loading}>
        Parse with AI
      </Button>
      {preview && edit && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 animate-slide-up">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-slate-900">Parsed preview</h4>
            {confidencePct && (
              <span className="text-xs font-medium text-brand-700">Confidence {confidencePct}</span>
            )}
          </div>
          {preview.requiresReview && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Review recommended before saving
            </p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              value={edit.amount}
              onChange={(e) => setEdit({ ...edit, amount: e.target.value })}
            />
            <Input
              label="Type"
              value={edit.transactionType}
              onChange={(e) => setEdit({ ...edit, transactionType: e.target.value })}
            />
            <Input
              label="Debit account"
              value={edit.debitAccount || ''}
              onChange={(e) => setEdit({ ...edit, debitAccount: e.target.value })}
            />
            <Input
              label="Credit account"
              value={edit.creditAccount || ''}
              onChange={(e) => setEdit({ ...edit, creditAccount: e.target.value })}
            />
            <Input
              label="Description"
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              className="sm:col-span-2"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatCurrency(edit.amount)} · {edit.transactionType} · {formatDate(edit.transactionDate)}
            {edit.debitAccount && edit.creditAccount && (
              <> · Dr {edit.debitAccount} / Cr {edit.creditAccount}</>
            )}
          </p>
          <Button className="mt-4" onClick={save} loading={loading}>
            Confirm & save
          </Button>
        </div>
      )}
    </div>
  )
}
