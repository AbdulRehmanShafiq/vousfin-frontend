/**
 * NLTab — natural-language + photo entry (Step 5: input-only, autofills the
 * structured form; no separate preview UI).
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, Loader2, Camera, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useNLPreview, useNLImagePreview } from '@/hooks/useTransactions'
import { nlResultToFormValues } from '@/utils/nlFormMapping'
import { fileToImage } from '@/utils/imageCapture'
import { formatCurrency } from '@/utils/formatters'

export default function NLTab({ currency, onParsed, onAutoPosted }) {
  const [text, setText] = useState('')
  // Clarification loop state: the AI can ask ONE follow-up question at a time
  // when a critical detail is unclear, then we re-parse with greater confidence.
  const [clarification, setClarification] = useState(null) // { field, question, options? }
  const [answers, setAnswers] = useState([])               // [{ question, answer }]
  const [answerText, setAnswerText] = useState('')
  // Set when a >=98%-confidence parse auto-posted (opt-in, see Command Center) —
  // shows a confirmation instead of the structured form, since it already saved.
  const [autoPosted, setAutoPosted] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const photoInputRef = useRef(null)
  const nlPreview = useNLPreview()
  const nlImagePreview = useNLImagePreview()

  // Shared result handling — a typed parse and a photo parse both land here.
  const applyParseResult = (result, rawTextForForm) => {
    if (!result) return
    if (result.autoPosted) {
      setClarification(null)
      setAutoPosted(result)
      return
    }
    if (result.needsClarification && result.clarification) {
      setClarification(result.clarification)
      setAnswerText('')
    } else {
      // Enough confidence (or the round cap was hit) — autofill the form.
      setClarification(null)
      onParsed(nlResultToFormValues(result, rawTextForForm))
    }
  }

  // Re-parse the original description PLUS any answers gathered so far.
  const runParse = async (collectedAnswers, attempt) => {
    const combined = collectedAnswers.length
      ? `${text}\n\nAdditional details:\n${collectedAnswers.map(a => `- ${a.question} ${a.answer}`).join('\n')}`
      : text
    const result = await nlPreview.mutateAsync({ text: combined, attempt })
    applyParseResult(result, text)
  }

  const handleParse = async () => {
    if (text.trim().length < 5) return
    setAnswers([])
    await runParse([], 0)
  }

  const submitAnswer = async (value) => {
    const answer = String(value ?? answerText).trim()
    if (!answer) return
    const next = [...answers, { question: clarification.question, answer }]
    setAnswers(next)
    await runParse(next, next.length)
  }

  // Give up on refining and fill the form with whatever we have so far.
  const skipClarify = async () => {
    setClarification(null)
    // Re-parse once at the round cap so the server returns a final (non-asking) result.
    const combined = answers.length
      ? `${text}\n\nAdditional details:\n${answers.map(a => `- ${a.question} ${a.answer}`).join('\n')}`
      : text
    const result = await nlPreview.mutateAsync({ text: combined, attempt: 5 })
    if (result) onParsed(nlResultToFormValues(result, text))
  }

  // Snap a bill — fewest-taps entry: pick/shoot a photo, AI reads it, the
  // structured form fills immediately for review + Save (same "record now"
  // flow as typing). See docs/superpowers/specs/2026-07-13-photo-receipt-entry-design.md.
  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please choose a photo'); return }
    setPhotoBusy(true)
    try {
      const { base64, mimeType } = await fileToImage(file)
      const result = await nlImagePreview.mutateAsync({ image: base64, mimeType })
      applyParseResult(result, '')
    } catch (err) {
      if (!err?.response) toast.error('Could not read that photo — try again or type it instead')
    } finally {
      setPhotoBusy(false)
    }
  }

  // ── Auto-posted confirmation ─────────────────────────────────────────────────
  if (autoPosted) {
    const pct = Math.round((autoPosted.confidence ?? 0) * 100)
    return (
      <div className="space-y-5 animate-fade-in text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-positive/12">
          <CheckCircle className="h-6 w-6 text-positive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Recorded automatically</p>
          <p className="text-small text-text-muted mt-1">
            VousFin was {pct}% sure and recorded this transaction with no review needed.
            You can undo it from the transaction list at any time.
          </p>
        </div>
        <div className="rounded-lg border border-glass bg-glass-panel px-4 py-3 text-left text-sm">
          <p className="text-text-primary font-medium">{autoPosted.description || text}</p>
          <p className="text-text-muted text-xs mt-0.5">
            {autoPosted.amount ? formatCurrency(autoPosted.amount, currency) : ''} · {autoPosted.transactionType || ''}
          </p>
        </div>
        <Button onClick={onAutoPosted}>Done</Button>
      </div>
    )
  }

  // ── Clarifying-question view ────────────────────────────────────────────────
  if (clarification) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">One quick question</p>
              <p className="text-sm text-text-primary">{clarification.question}</p>
            </div>
          </div>
        </div>

        {Array.isArray(clarification.options) && clarification.options.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {clarification.options.map(opt => (
              <button key={opt} type="button" onClick={() => submitAnswer(opt)} disabled={nlPreview.isPending}
                className="rounded-lg border border-glass bg-glass-panel px-3 py-2 text-sm text-text-primary hover:border-accent hover:bg-accent/5 transition-colors disabled:opacity-50">
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <input
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-glass-panel border border-glass text-text-primary text-sm placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              placeholder="Type your answer…"
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer() } }}
            />
          </div>
        )}

        <div className="flex justify-between gap-3 pt-2 border-t border-glass">
          <Button variant="ghost" onClick={skipClarify} disabled={nlPreview.isPending}>
            Skip &amp; fill form anyway
          </Button>
          {!(Array.isArray(clarification.options) && clarification.options.length) && (
            <Button onClick={() => submitAnswer()} loading={nlPreview.isPending} disabled={!answerText.trim()}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-secondary">
        Describe your transaction in plain English, or snap a photo of the bill —
        VousFin will parse it and autofill the structured form for review and editing.
      </p>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={pickPhoto}
      />
      <button
        type="button"
        onClick={() => photoInputRef.current?.click()}
        disabled={photoBusy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 py-3 text-sm font-semibold text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
      >
        {photoBusy ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Reading photo…</>
        ) : (
          <><Camera className="h-4 w-4" /> Snap a bill</>
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-glass" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">or type it</span>
        <div className="h-px flex-1 bg-glass" />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-text-secondary">Transaction Description</label>
        <textarea
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-glass-panel border border-glass text-text-primary text-sm placeholder:text-text-muted focus:border-accent focus:outline-none resize-none transition-colors"
          placeholder={'Examples:\n• "Paid PKR 5000 for office supplies from bank"\n• "Received PKR 25000 from Ali for consulting"\n• "Bought office furniture on installments from ABC Furnitures"\n• "Sold goods for 11700 cash including 17% GST"'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <p className="text-small text-text-muted">
          AI detects amount, accounts, taxes, installments, and parties — and asks a quick question if anything is unclear, then opens the structured form for confirmation.
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-glass">
        <Button onClick={handleParse} loading={nlPreview.isPending} disabled={text.trim().length < 5}>
          <Sparkles className="h-4 w-4 mr-1" />
          Parse &amp; Autofill Form →
        </Button>
      </div>
    </div>
  )
}
