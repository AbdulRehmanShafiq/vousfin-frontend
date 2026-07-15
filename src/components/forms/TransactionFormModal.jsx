/**
 * TransactionFormModal — the ONE universal transaction entry point.
 *
 * Decomposed (Ledger phase 6): this shell owns only the engine toggle
 * (Manual / AI Auto-Classify), the tab routing (NL / Structured / Excel) and
 * the NL→form handoff. All entry surfaces live in ./transaction/ and every
 * path saves through the SAME hooks — one accounting engine, no shortcuts.
 */
import { useCallback, useState } from 'react'
import { MessageSquare, LayoutList, Upload, Sparkles } from 'lucide-react'
import Modal from '@/components/modals/Modal'
import AIClassifyPanel from '@/components/ai/AIClassifyPanel'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useUIStore } from '@/stores/useUIStore'
import NLTab from './transaction/NLTab'
import StructuredFormTab from './transaction/StructuredFormTab'
import ExcelTab from './transaction/ExcelTab'
import { txToInitialValues } from './transaction/constants'

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'nl',    label: 'Natural Language', icon: MessageSquare },
  { id: 'form',  label: 'Structured Form',  icon: LayoutList },
  { id: 'excel', label: 'Excel / CSV',      icon: Upload },
]

export default function TransactionFormModal({ isOpen, onClose, onSuccess, transaction = null }) {
  const isEditMode = Boolean(transaction)

  const [activeTab,  setActiveTab]  = useState('form')
  const [engineMode, setEngineMode] = useState('manual')   // 'manual' (direct post) | 'ai' (AI classify)
  const [wasOpen,    setWasOpen]    = useState(isOpen)
  const [nlPrefill,  setNlPrefill]  = useState(null)
  const currency = useBusinessStore((s) => s.currency)

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      // Mobile Easy M1 — the Capture sheet can deep-link a lane:
      //   photo/nl → the NL tab (which owns "Snap a bill" + the sentence line)
      //   simple   → the structured form (simple chips are its default)
      const intent = useUIStore.getState().txModalIntent
      setActiveTab(intent?.lane === 'photo' || intent?.lane === 'nl' ? 'nl' : 'form')
      setEngineMode('manual')
      setNlPrefill(null)
    }
  }

  const handleClose = () => { onClose() }
  // Called only on a successful save: let the parent refresh, then close.
  const handleSuccess = () => { onSuccess?.(); onClose() }

  /**
   * STEP 5 — Called by NLTab right after the AI parses the text.
   * Maps the NL preview shape to the structured form's initialValues shape
   * and switches to the form tab. The NL parser AUTOFILLS the same form —
   * there is no separate NL confirmation flow.
   */
  const handleNlParsed = useCallback((preview) => {
    setNlPrefill({
      transactionDate:      preview.transactionDate || new Date().toISOString().split('T')[0],
      description:          preview.description     || '',
      amount:               typeof preview.amount === 'number' ? preview.amount : 0,
      transactionType:      preview.transactionType || '',
      debitAccountId:       preview.debitAccountId  || '',
      creditAccountId:      preview.creditAccountId || '',
      isInstallment:        !!preview.isInstallment,
      downPayment:          preview.downPayment              || 0,
      installmentCount:     preview.installmentCount || preview.installmentPeriodMonths || null,
      installmentFrequency: preview.installmentFrequency     || 'monthly',
      interestRate:         preview.interestRate             || 0,
      firstPaymentDate:     preview.firstPaymentDate         || '',
      interestMethod:       preview.interestMethod           || 'reducing_balance',
      notes:                preview.notes                    || '',
      vendorName:           preview.vendorName               || '',
      customerName:         preview.customerName             || '',
      taxAmount:            preview.taxAmount                || 0,
      taxRate:              preview.taxRate                  || 0,
      txnCurrency:          preview.currency                 || currency,
      paymentMethod:        preview.paymentMethod            || '',
      invoiceNumber:        preview.invoiceNumber            || '',
      // AI metadata
      _aiParsed:            true,
      _confidence:          preview.confidence,
      _requiresReview:      preview.requiresReview,
      _reviewReasons:       preview.reviewReasons || [],
      _rawText:             preview._rawText || '',
      _journalLines:        Array.isArray(preview.resolvedJournalLines) ? preview.resolvedJournalLines : [],
      _aiDebitAccount:      preview.debitAccount  || null,
      _aiCreditAccount:     preview.creditAccount || null,
      // Smart entry — the parser's inventory linkage rides along so the form
      // can prefill/create the item (was dropped in the pre-decomposition
      // re-mapping, leaving the _inventory prefill unreachable from NL).
      _inventory:           preview._inventory,
      _lineItems:           preview._lineItems,
    })
    setActiveTab('form')
  }, [currency])

  // In edit mode derive pre-fill values directly from the transaction prop
  const editInitialValues = isEditMode ? txToInitialValues(transaction, currency) : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Edit Transaction` : 'Record Transaction'}
      className="sm:max-w-2xl"
    >
      {/* Engine toggle: Manual (direct post) vs AI Auto-Classify — create mode only */}
      {!isEditMode && (
        <div className="flex gap-1 p-1 rounded-xl bg-navy/40 border border-glass mb-4">
          <button
            type="button"
            onClick={() => setEngineMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              engineMode === 'manual' ? 'bg-accent text-ink-on-accent shadow-glow-accent' : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
            }`}
          >
            <LayoutList className="h-4 w-4" /> Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setEngineMode('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              engineMode === 'ai' ? 'bg-accent text-ink-on-accent shadow-glow-accent' : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
            }`}
          >
            <Sparkles className="h-4 w-4" /> AI Auto-Classify
          </button>
        </div>
      )}

      {/* Tabs — only in Manual mode, hidden in edit mode */}
      {!isEditMode && engineMode === 'manual' && (
        <div className="flex gap-1 p-1 rounded-xl bg-glass-panel border border-glass mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-accent text-ink-on-accent shadow-glow-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* AI Auto-Classify mode */}
      {!isEditMode && engineMode === 'ai' && (
        <AIClassifyPanel onClose={handleClose} />
      )}

      {/* Edit mode: always structured form, no NL/Excel tabs */}
      {isEditMode && (
        <StructuredFormTab
          currency={currency}
          onSuccess={handleSuccess}
          onCancel={handleClose}
          initialValues={editInitialValues}
          editTransactionId={transaction._id}
        />
      )}

      {/* Create mode (Manual engine): full tab routing */}
      {!isEditMode && engineMode === 'manual' && activeTab === 'nl'    && <NLTab    currency={currency} onParsed={handleNlParsed} onAutoPosted={handleSuccess} />}
      {!isEditMode && engineMode === 'manual' && activeTab === 'form'  && <StructuredFormTab currency={currency} onSuccess={handleSuccess} onCancel={handleClose} initialValues={nlPrefill} />}
      {!isEditMode && engineMode === 'manual' && activeTab === 'excel' && <ExcelTab onSuccess={handleSuccess} onCancel={handleClose} />}
    </Modal>
  )
}
