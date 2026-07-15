/**
 * StructuredFormTab — the ONE editing surface for a manual/AI-prefilled
 * transaction. Owns the react-hook-form instance, AI account auto-resolution,
 * pre-save advisory check, and BOTH save paths (single + installment).
 * Extracted from TransactionFormModal (Ledger phase-6 decomposition) —
 * behavior-preserving; display sections live in sibling modules.
 */
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, X, Sparkles } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import TaxPreviewPanel from '@/components/ui/TaxPreviewPanel'
import SimpleEntrySection from '@/components/forms/SimpleEntrySection'
import { useAccounts } from '@/hooks/useAccounts'
import { useCustomers, useVendors } from '@/hooks/useParties'
import { useInventoryItems } from '@/hooks/useInventory'
import {
  useCreateTransaction,
  useCreateInstallmentTransaction,
  useUpdateTransaction,
  usePreSaveCheck,
} from '@/hooks/useTransactions'
import { useCurrentPeriod } from '@/hooks/useFiscalYear'
import { useLatestRates, useConversionPreview } from '@/hooks/useFxRates'
import { formatCurrency } from '@/utils/formatters'
import { buildGroupedAccountOptions } from '@/utils/accountOptions'
import { matchesFilter } from '@/utils/transactionPresets'
import { getTxTypeFilter } from '@/utils/accountFilterRules'
import { resolveDebitCreditPair } from '@/utils/accountResolver'
import { buildPlainSummary } from '@/utils/plainSummary'
import { cn } from '@/utils/cn'
import { formSchema, TX_TYPE_OPTIONS, generateDocNumber, applyGAAPGloss } from './constants'
import { LiveJournalPreview, SectionLabel } from './previews'
import FormBanners from './FormBanners'
import PartyInput from './PartyInput'
import InventorySection from './InventorySection'
import MoreOptionsSection from './MoreOptionsSection'
import InstallmentSection from './InstallmentSection'

export default function StructuredFormTab({ currency, onSuccess, onCancel, initialValues, editTransactionId }) {
  const isEditMode          = Boolean(editTransactionId)
  const createTx            = useCreateTransaction()
  const createInstallmentTx = useCreateInstallmentTransaction()
  const updateTx            = useUpdateTransaction()
  const preSaveCheck        = usePreSaveCheck()
  const { data: currentPeriod } = useCurrentPeriod()

  const { data: rawAccounts }   = useAccounts()
  const { data: rawCustomers }  = useCustomers()
  const { data: rawVendors }    = useVendors()
  const { data: rawInventory }  = useInventoryItems()

  const accounts = useMemo(() => {
    const d = rawAccounts
    return Array.isArray(d?.docs) ? d.docs : Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []
  }, [rawAccounts])
  const customers = useMemo(() => {
    const d = rawCustomers
    return Array.isArray(d?.docs) ? d.docs : Array.isArray(d?.data) ? d.data : Array.isArray(d?.customers) ? d.customers : Array.isArray(d) ? d : []
  }, [rawCustomers])
  const vendors = useMemo(() => {
    const d = rawVendors
    return Array.isArray(d?.docs) ? d.docs : Array.isArray(d?.data) ? d.data : Array.isArray(d?.vendors) ? d.vendors : Array.isArray(d) ? d : []
  }, [rawVendors])

  const inventoryItems = useMemo(() => {
    const d = rawInventory
    const arr = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []
    return arr.filter(i => i.isActive !== false)
  }, [rawInventory])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionDate:      new Date().toISOString().split('T')[0],
      description:          '',
      amount:               0,
      debitAccountId:       '',
      creditAccountId:      '',
      transactionType:      '',
      referenceNumber:      '',
      invoiceNumber:        '',
      notes:                '',
      dueDate:              '',
      paymentMethod:        '',
      txnCurrency:          currency,
      exchangeRate:         1,
      taxAmount:            0,
      taxRate:              0,
      isInstallment:        false,
      firstPaymentDate:     '',
      interestMethod:       'reducing_balance',
      downPayment:          0,
      installmentCount:     3,
      installmentFrequency: 'monthly',
      interestRate:         0,
    },
  })

  const [nlAiBanner, setNlAiBanner]     = useState(false)
  const [showOptional, setShowOptional] = useState(false)

  // Track auto-resolution outcome so UI can show "AI auto-selected" badges
  const [autoResolved, setAutoResolved] = useState({ debit: null, credit: null })

  // Phase 3.5 Step 2 — party ID tracking (set when user picks existing party)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [selectedVendorId,   setSelectedVendorId]   = useState(null)
  const [nlPartyFilled,      setNlPartyFilled]      = useState(false)

  // Phase 3.5 Step 5 — Pre-save warning state
  const [preSaveWarnings,  setPreSaveWarnings]  = useState([])
  // preSaveAcknowledged = true means warnings were already shown once → bypass check on next submit
  const [preSaveAcknowledged, setPreSaveAcknowledged] = useState(false)

  // Auto-generated invoice/bill number tracking
  const [invoiceAutoGenerated, setInvoiceAutoGenerated] = useState(false)

  // Phase 3.5 Step 3 — Inventory state
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState(null)
  const [inventoryQty, setInventoryQty] = useState(1)
  // Smart entry — a consented brand-new item arriving from the NL parse.
  // Editable card; created atomically with the transaction at save time.
  const [pendingNewItem, setPendingNewItem] = useState(null) // { name, unit, quantity, unitCostPrice }

  // Simple ⇄ Advanced entry mode — persisted per user; Simple is the default.
  // Edit mode and NL prefill always use the full (advanced) form.
  const [entryMode, setEntryMode] = useState(() => localStorage.getItem('vf-entry-mode') || 'simple')
  const switchMode = (m) => { setEntryMode(m); localStorage.setItem('vf-entry-mode', m) }
  const advancedVisible = !!editTransactionId || entryMode === 'advanced' || !!initialValues?._rawText

  // Phase 5.3 — FX: load latest rates to populate currency options + auto-fill rate
  const { data: latestFxRates } = useLatestRates()

  // Build dynamic currency options from stored rates + hardcoded fallbacks
  const currencyOptions = useMemo(() => {
    const base = [
      { value: currency,  label: `${currency} — Base currency` },
      { value: 'USD', label: 'USD — US Dollar' },
      { value: 'EUR', label: 'EUR — Euro' },
      { value: 'GBP', label: 'GBP — British Pound' },
      { value: 'AED', label: 'AED — UAE Dirham' },
      { value: 'SAR', label: 'SAR — Saudi Riyal' },
    ]
    if (!latestFxRates?.length) return base
    // Merge in currencies from stored rates that aren't already listed
    const seen = new Set(base.map(o => o.value))
    latestFxRates.forEach(r => {
      if (!seen.has(r.fromCurrency)) {
        base.push({ value: r.fromCurrency, label: r.fromCurrency })
        seen.add(r.fromCurrency)
      }
    })
    return base
  }, [latestFxRates, currency])

  // Auto-fill exchange rate when currency changes
  const watchedTxnCurrency = watch('txnCurrency')
  const watchedAmount      = watch('amount')
  const watchedDate        = watch('transactionDate')

  useEffect(() => {
    if (!watchedTxnCurrency || watchedTxnCurrency === currency) return
    const match = latestFxRates?.find(
      r => r.fromCurrency === watchedTxnCurrency && r.toCurrency === currency
    ) ?? latestFxRates?.find(r => r.fromCurrency === watchedTxnCurrency)
    if (match?.rate) setValue('exchangeRate', match.rate)
  }, [watchedTxnCurrency, latestFxRates, currency, setValue])

  // Live conversion preview
  const { data: convPreview } = useConversionPreview({
    from:   watchedTxnCurrency !== currency ? watchedTxnCurrency : null,
    to:     currency,
    amount: watchedAmount,
    date:   watchedDate,
  })

  // Party objects with balance data for the combobox
  const customerParties = useMemo(() =>
    customers.map(c => ({
      id:      c._id,
      name:    c.fullName || c.businessName || '',
      balance: c.currentReceivableBalance ?? null,
    })).filter(p => p.name)
  , [customers])

  const vendorParties = useMemo(() =>
    vendors.map(v => ({
      id:      v._id,
      name:    v.vendorName || v.name || '',
      balance: v.currentPayableBalance ?? null,
    })).filter(p => p.name)
  , [vendors])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (initialValues) {
      // ── Phase 3.5 Step 1 — Auto-resolve AI account-name suggestions ──
      // If backend's fuzzy-matcher couldn't pin debit/credit account IDs but
      // returned name suggestions, run the frontend resolver against the
      // live accounts list. The resolver respects accountType filters from
      // transaction-type rules so we never silently flip DR-side / CR-side.
      let resolvedDebitId  = initialValues.debitAccountId  || ''
      let resolvedCreditId = initialValues.creditAccountId || ''
      const resolution = { debit: null, credit: null }
      if (accounts.length > 0 && (initialValues._aiDebitAccount || initialValues._aiCreditAccount)) {
        const txFilter = getTxTypeFilter(initialValues.transactionType)
        const debitType  = txFilter.debitFilter?.types?.[0]
        const creditType = txFilter.creditFilter?.types?.[0]
        const pair = resolveDebitCreditPair(
          initialValues._aiDebitAccount,
          initialValues._aiCreditAccount,
          accounts,
          { debitType, creditType }
        )
        if (!resolvedDebitId  && pair.debit.account)  { resolvedDebitId  = pair.debit.account._id;  resolution.debit  = { name: pair.debit.account.accountName, score: pair.debit.score } }
        if (!resolvedCreditId && pair.credit.account) { resolvedCreditId = pair.credit.account._id; resolution.credit = { name: pair.credit.account.accountName, score: pair.credit.score } }
      }
      setAutoResolved(resolution)

      reset({
        transactionDate:      initialValues.transactionDate      || today,
        description:          initialValues.description          || '',
        amount:               typeof initialValues.amount === 'number' ? initialValues.amount : 0,
        debitAccountId:       resolvedDebitId,
        creditAccountId:      resolvedCreditId,
        transactionType:      initialValues.transactionType      || '',
        referenceNumber:      initialValues.referenceNumber      || '',
        invoiceNumber:        initialValues.invoiceNumber        || '',
        notes:                initialValues.notes                || '',
        dueDate:              initialValues.dueDate              || '',
        paymentMethod:        initialValues.paymentMethod        || '',
        txnCurrency:          initialValues.txnCurrency          || currency,
        exchangeRate:         initialValues.exchangeRate         || 1,
        taxAmount:            initialValues.taxAmount            || 0,
        taxRate:              initialValues.taxRate              || 0,
        customerName:         initialValues.customerName         || '',
        vendorName:           initialValues.vendorName           || '',
        isInstallment:        !!initialValues.isInstallment,
        downPayment:          initialValues.downPayment          || 0,
        installmentCount:     initialValues.installmentCount     || 3,
        installmentFrequency: initialValues.installmentFrequency || 'monthly',
        interestRate:         initialValues.interestRate         || 0,
        firstPaymentDate:     initialValues.firstPaymentDate     || '',
        interestMethod:       initialValues.interestMethod       || 'reducing_balance',
      })
      setNlAiBanner(true)

      // Auto-match NLP-supplied party names to existing party IDs
      const nlCustomer = initialValues.customerName?.trim()
      const nlVendor   = initialValues.vendorName?.trim()
      if (nlCustomer) {
        const match = customerParties.find(p => p.name.toLowerCase() === nlCustomer.toLowerCase())
        setSelectedCustomerId(match ? match.id : null)
        setNlPartyFilled(true)
      } else {
        setSelectedCustomerId(null)
      }
      if (nlVendor) {
        const match = vendorParties.find(p => p.name.toLowerCase() === nlVendor.toLowerCase())
        setSelectedVendorId(match ? match.id : null)
        if (nlVendor) setNlPartyFilled(true)
      } else {
        setSelectedVendorId(null)
      }

      // Auto-open optional details if NL detected tax/currency/payment-method info
      if (initialValues.taxAmount || initialValues.taxRate ||
          (initialValues.txnCurrency && initialValues.txnCurrency !== currency) ||
          initialValues.paymentMethod) {
        setShowOptional(true)
      }

      // Smart entry — prefill the inventory linkage the parser resolved
      const inv = initialValues._inventory
      if (inv?.mode === 'existing' && inv.itemId) {
        setSelectedInventoryItemId(inv.itemId)
        setInventoryQty(inv.quantity > 0 ? inv.quantity : 1)
        setPendingNewItem(null)
      } else if (inv?.mode === 'create' && inv.itemName) {
        setSelectedInventoryItemId(null)
        setPendingNewItem({
          name: inv.itemName,
          unit: inv.unit || 'units',
          quantity: inv.quantity > 0 ? inv.quantity : 1,
          unitCostPrice: inv.unitCostPrice || null,
        })
      }
    } else {
      reset({ transactionDate: today })
      setNlAiBanner(false)
      setAutoResolved({ debit: null, credit: null })
      setSelectedCustomerId(null)
      setSelectedVendorId(null)
      setNlPartyFilled(false)
      setSelectedInventoryItemId(null)
      setInventoryQty(1)
      setPendingNewItem(null)
      setPreSaveWarnings([])
      setPreSaveAcknowledged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, accounts.length, customerParties.length, vendorParties.length])

  const allAccountOptions = useMemo(() => buildGroupedAccountOptions(accounts), [accounts])

  function buildSuggestedOptions(allOptions, filter) {
    if (!filter) return allOptions
    const suggested = allOptions.filter(o => matchesFilter(o, filter))
    const rest      = allOptions.filter(o => !matchesFilter(o, filter))
    if (suggested.length === 0) return allOptions
    const suggestedWithHeader = suggested.map(o => ({ ...o, group: '★ Suggested' }))
    return [...suggestedWithHeader, ...rest]
  }

  const txTypeWatch = watch('transactionType')
  const effectiveFilters = useMemo(() => {
    const f = getTxTypeFilter(txTypeWatch)
    return { debit: f.debitFilter, credit: f.creditFilter }
  }, [txTypeWatch])

  const debitOptions  = useMemo(
    () => buildSuggestedOptions(allAccountOptions, effectiveFilters.debit),
    [allAccountOptions, effectiveFilters.debit]
  )
  const creditOptions = useMemo(
    () => buildSuggestedOptions(allAccountOptions, effectiveFilters.credit),
    [allAccountOptions, effectiveFilters.credit]
  )

  const customerSuggestions = useMemo(() => customerParties.map(p => p.name), [customerParties])
  const vendorSuggestions   = useMemo(() => vendorParties.map(p => p.name),   [vendorParties])

  const debitAccountId  = watch('debitAccountId')
  const creditAccountId = watch('creditAccountId')
  const isInstallment   = watch('isInstallment')
  const amount          = watch('amount')
  const transactionType = watch('transactionType')   // must be declared BEFORE any useEffect that reads it

  // ── Auto-generate invoice/bill number when transaction type implies one ───────
  const watchedInvoiceNumber = watch('invoiceNumber')
  useEffect(() => {
    if (!transactionType) return
    // Don't overwrite a user-typed or AI-provided number
    if (watchedInvoiceNumber?.trim() && !invoiceAutoGenerated) return
    const generated = generateDocNumber(transactionType)
    if (generated) {
      setValue('invoiceNumber', generated)
      setInvoiceAutoGenerated(true)
    } else if (invoiceAutoGenerated) {
      setValue('invoiceNumber', '')
      setInvoiceAutoGenerated(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType])

  const requiresCustomer = useMemo(() => {
    const d = accounts.find(a => a._id === debitAccountId)
    const c = accounts.find(a => a._id === creditAccountId)
    const customerTypes = [
      'Credit Sale', 'Cash Sale', 'Inventory Sale', 'Payment Received',
      'GST Collection', 'Advance from Customer', 'Refund', 'Income',
    ]
    const isARSubtype = (acct) =>
      acct?.accountSubtype === 'Accounts Receivable' ||
      acct?.accountSubtype === 'Current Assets' ||
      acct?.accountName?.toLowerCase().includes('receivable') ||
      acct?.accountName?.toLowerCase().includes('debtor')
    return (
      isARSubtype(d) || isARSubtype(c) ||
      c?.accountType === 'Revenue' ||
      customerTypes.includes(transactionType)
    )
  }, [debitAccountId, creditAccountId, accounts, transactionType])

  const requiresVendor = useMemo(() => {
    const d = accounts.find(a => a._id === debitAccountId)
    const c = accounts.find(a => a._id === creditAccountId)
    const vendorTypes = [
      'Credit Purchase', 'Cash Purchase', 'Inventory Purchase', 'Payment Made',
      'Salary', 'WHT Payment', 'GST Payment', 'Interest Payment',
      'Prepaid Expense', 'Expense',
    ]
    const isAPSubtype = (acct) =>
      acct?.accountSubtype === 'Accounts Payable' ||
      acct?.accountSubtype === 'Current Liabilities' ||
      acct?.accountName?.toLowerCase().includes('payable') ||
      acct?.accountName?.toLowerCase().includes('creditor')
    return (
      isAPSubtype(d) || isAPSubtype(c) ||
      d?.accountType === 'Expense' ||
      vendorTypes.includes(transactionType)
    )
  }, [debitAccountId, creditAccountId, accounts, transactionType])

  const onSubmit = async (data) => {
    try {
      const {
        isInstallment, downPayment, installmentCount, installmentFrequency, interestRate,
        firstPaymentDate, interestMethod,
        transactionType, customerName, vendorName,
        referenceNumber, invoiceNumber, notes, dueDate, paymentMethod,
        txnCurrency, exchangeRate, taxAmount, taxRate,
        ...base
      } = data

      // ── EDIT MODE ────────────────────────────────────────────────────────────
      if (isEditMode) {
        // Strip account IDs from base; only include them if they are valid
        // 24-char hex ObjectIds. Empty strings from unpopulated dropdowns would
        // fail backend Joi validation and produce "Validation failed" errors.
        const { debitAccountId, creditAccountId, ...rest } = base
        const payload = { ...rest }
        const OID_RE = /^[0-9a-fA-F]{24}$/
        if (OID_RE.test(debitAccountId))  payload.debitAccountId  = debitAccountId
        if (OID_RE.test(creditAccountId)) payload.creditAccountId = creditAccountId
        if (transactionType)         payload.transactionType      = transactionType
        if (customerName?.trim())    payload.customerName         = customerName.trim()
        if (vendorName?.trim())      payload.vendorName           = vendorName.trim()
        if (selectedCustomerId)      payload.customerId           = selectedCustomerId
        if (selectedVendorId)        payload.vendorId             = selectedVendorId
        if (referenceNumber?.trim()) payload.transactionReference = referenceNumber.trim()
        if (invoiceNumber?.trim())   payload.invoiceNumber        = invoiceNumber.trim()
        payload.notes = notes?.trim() || ''
        if (dueDate)                 payload.dueDate              = dueDate
        if (paymentMethod)           payload.paymentMethod        = paymentMethod
        if (typeof taxAmount === 'number' && taxAmount > 0) payload.taxAmount = taxAmount
        if (typeof taxRate   === 'number' && taxRate   > 0) payload.taxRate   = taxRate
        await updateTx.mutateAsync({ id: editTransactionId, ...payload })
        onSuccess()
        return
      }

      // ── CREATE MODE ──────────────────────────────────────────────────────────

      // Phase 3.5 Step 5 — pre-save check (advisory only, non-blocking)
      if (!preSaveAcknowledged) {
        try {
          const checkResult = await preSaveCheck.mutateAsync({
            transactionDate:  data.transactionDate,
            amount:           data.amount,
            debitAccountId:   data.debitAccountId,
            creditAccountId:  data.creditAccountId,
            transactionType,
            taxAmount,
            taxRate,
            invoiceNumber,
            customerName,
            vendorName,
          })
          const allWarnings = checkResult?.warnings || []
          if (allWarnings.length > 0) {
            setPreSaveWarnings(allWarnings)
            setPreSaveAcknowledged(true) // next submit bypasses the check
            return // stop here — user must click submit again to confirm
          }
        } catch {
          // pre-save check network error — proceed silently
        }
      }

      const extras = {}
      if (transactionType)         extras.transactionType      = transactionType
      if (customerName?.trim())    extras.customerName         = customerName.trim()
      if (vendorName?.trim())      extras.vendorName           = vendorName.trim()
      if (selectedCustomerId)      extras.customerId           = selectedCustomerId
      if (selectedVendorId)        extras.vendorId             = selectedVendorId
      if (selectedInventoryItemId) extras.inventoryItemId      = selectedInventoryItemId
      if (selectedInventoryItemId && inventoryQty > 0) extras.inventoryQty = inventoryQty
      // Smart entry — consented new item is created atomically with the save
      if (!selectedInventoryItemId && pendingNewItem?.name?.trim() && pendingNewItem.quantity > 0) {
        extras.newInventoryItem = {
          name: pendingNewItem.name.trim(),
          unit: pendingNewItem.unit?.trim() || 'units',
          quantity: pendingNewItem.quantity,
          unitCostPrice: pendingNewItem.unitCostPrice || null,
        }
      }
      if (referenceNumber?.trim()) extras.transactionReference = referenceNumber.trim()
      if (invoiceNumber?.trim())   extras.invoiceNumber        = invoiceNumber.trim()
      if (notes?.trim())           extras.notes                = notes.trim()
      if (dueDate)                 extras.dueDate              = dueDate
      if (paymentMethod)           extras.paymentMethod        = paymentMethod
      if (txnCurrency && txnCurrency !== currency) {
        extras.currencyCode = txnCurrency        // IAS 21: foreign currency code
        extras.exchangeRate = exchangeRate || 1  // units of base per 1 foreign
      }
      if (typeof taxAmount === 'number' && taxAmount > 0) extras.taxAmount = taxAmount
      if (typeof taxRate   === 'number' && taxRate   > 0) extras.taxRate   = taxRate

      if (isInstallment) {
        await createInstallmentTx.mutateAsync({
          ...base, ...extras,
          downPayment, installmentCount, installmentFrequency, interestRate,
          interestMethod: interestMethod || 'reducing_balance',
          ...(firstPaymentDate ? { firstPaymentDate } : {}),
        })
      } else {
        await createTx.mutateAsync({ ...base, ...extras })
      }
      onSuccess()
    } catch {
      // toast handled in hooks
    }
  }

  const isPending = isSubmitting || createTx.isPending || createInstallmentTx.isPending || updateTx.isPending

  const debitAcct = accounts.find(a => a._id === debitAccountId)

  // Multi-line journal preview (>2 lines = compound entry like GST sale, payroll w/ deductions)
  const aiJournalLines = Array.isArray(initialValues?._journalLines) ? initialValues._journalLines : []
  const hasCompoundJournal = aiJournalLines.length > 2

  // Compute period status for the currently selected date — must come before isPeriodLocked
  const selectedDate = watch('transactionDate')
  const periodStatus = currentPeriod && selectedDate
    ? (new Date(selectedDate) >= new Date(currentPeriod.startDate) &&
       new Date(selectedDate) <= new Date(currentPeriod.endDate)
         ? currentPeriod.status
         : null)
    : currentPeriod?.status ?? null
  const isPeriodLocked = periodStatus === 'locked'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">

      <FormBanners
        periodStatus={periodStatus}
        currentPeriodName={currentPeriod?.name}
        nlAiBanner={nlAiBanner}
        onDismissAiBanner={() => setNlAiBanner(false)}
        initialValues={initialValues}
        autoResolved={autoResolved}
        debitAccountId={debitAccountId}
        creditAccountId={creditAccountId}
      />

      {/* Simple ⇄ Advanced entry mode (create only; NL prefill opens Advanced) */}
      {!isEditMode && !initialValues?._rawText && (
        <div className="flex gap-1 p-1 rounded-xl bg-glass-panel border border-glass">
          <button type="button" onClick={() => switchMode('simple')}
            className={cn('flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all',
              !advancedVisible ? 'bg-accent text-ink-on-accent' : 'text-text-secondary hover:text-text-primary')}>
            Simple
          </button>
          <button type="button" onClick={() => switchMode('advanced')}
            className={cn('flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all',
              advancedVisible ? 'bg-accent text-ink-on-accent' : 'text-text-secondary hover:text-text-primary')}>
            Advanced
          </button>
        </div>
      )}

      {advancedVisible ? (
      <>
      {/* ── Section: Core Details ──────────────────────────────────────── */}
      <SectionLabel label="Transaction Details" />

      {/* Date + Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date" type="date" error={errors.transactionDate?.message} {...register('transactionDate')} />
        <Input label={`Amount (${currency})`} type="number" step="0.01" min="0"
          error={errors.amount?.message} {...register('amount', { valueAsNumber: true })} />
      </div>

      <Input label="Description" placeholder="e.g., Office Supplies Purchase — paid by bank"
        error={errors.description?.message} {...register('description')} />

      <Select
        label="Transaction Type"
        options={TX_TYPE_OPTIONS}
        value={watch('transactionType') || ''}
        onChange={(v) => setValue('transactionType', v)} />
      {!txTypeWatch && (
        <p className="text-small text-text-muted px-1 -mt-3">
          💡 Select a type for smart account suggestions, or leave blank for auto-detection.
        </p>
      )}

      {/* ── Section: Double-Entry Accounts ─────────────────────────────── */}
      <SectionLabel
        label="Accounts"
        note="Debit increases assets/expenses · Credit increases liabilities/revenue"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-glass rounded-xl bg-glass-panel">
        <Select label="Debit Account (DR)" options={debitOptions}
          value={debitAccountId} onChange={(val) => setValue('debitAccountId', val)}
          error={errors.debitAccountId?.message} placeholder="Select Account" searchable />
        <Select label="Credit Account (CR)" options={creditOptions}
          value={creditAccountId} onChange={(val) => setValue('creditAccountId', val)}
          error={errors.creditAccountId?.message} placeholder="Select Account" searchable />
      </div>
      </>
      ) : (
        <SimpleEntrySection
          accounts={accounts}
          form={{ register, setValue, watch, errors }}
          onSwitchToAdvanced={() => switchMode('advanced')}
        />
      )}

      {/* Plain-language summary — what will happen, in the owner's words */}
      {(() => {
        const item = inventoryItems.find(i => i._id === selectedInventoryItemId)
        const invForSummary = pendingNewItem
          ? { mode: 'create', itemName: pendingNewItem.name, quantity: pendingNewItem.quantity, unit: pendingNewItem.unit }
          : item
            ? { mode: 'existing', itemName: item.name, quantity: inventoryQty, unit: item.unit, currentStock: item.currentStock }
            : { mode: 'none' }
        const sentence = buildPlainSummary({
          transactionType, amount, currency,
          paymentMethod: watch('paymentMethod'), inventory: invForSummary,
        })
        return sentence ? (
          <p className="text-sm text-text-secondary rounded-lg border border-glass bg-glass-panel px-4 py-3" role="note">
            {sentence}
          </p>
        ) : null
      })()}

      {/* Live Journal Preview — zero API calls, pure client-side feedback */}
      {debitAccountId && creditAccountId && amount > 0 && !hasCompoundJournal && (
        <LiveJournalPreview
          debitAccount={accounts.find(a => a._id === debitAccountId)?.accountName}
          creditAccount={accounts.find(a => a._id === creditAccountId)?.accountName}
          amount={amount}
          currency={currency}
        />
      )}
      {/* Compound (multi-line) journal preview — for GST sale, payroll w/ deductions, etc. */}
      {hasCompoundJournal && (
        <div className="rounded-lg border border-accent/25 bg-accent/5 p-3 space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide">
              Compound Journal — {aiJournalLines.length} lines
            </p>
            <span className="text-xs text-text-muted">AI-suggested · backend will validate</span>
          </div>
          <div className="divide-y divide-glass">
            {aiJournalLines.map((line, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs">
                <span className={`font-mono font-semibold w-10 ${line.type === 'debit' || line.entryType === 'debit' ? 'text-accent' : 'text-text-muted'}`}>
                  {(line.type || line.entryType) === 'debit' ? 'DR' : 'CR'}
                </span>
                <span className={`flex-1 truncate ${line.resolved !== false ? 'text-text-primary' : 'text-highlight'}`}>
                  {line.accountName || line.account}
                  {line.resolved === false && <span className="ml-1 text-xs">(unresolved)</span>}
                </span>
                <span className="text-text-secondary font-mono ml-2">
                  {formatCurrency(line.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live tax breakdown — self-hides when the business has tax disabled or
          the type isn't taxable. Fires /tax/preview as the amount changes. */}
      <TaxPreviewPanel
        amount={Number(amount) || 0}
        transactionType={transactionType}
        mode="inclusive"
        className="mt-1"
      />

      {/* Customer / Vendor + Invoice — shown when transaction type/accounts indicate AR or AP */}
      {advancedVisible && (requiresCustomer || requiresVendor) && (
        <div className="animate-fade-in p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-3 mt-1">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">
            {requiresCustomer ? 'Customer Details' : 'Vendor Details'}
          </p>
          {requiresCustomer && (
            <PartyInput
              label="Customer (optional)"
              suggestions={customerSuggestions}
              parties={customerParties}
              value={watch('customerName') || ''}
              onChange={(val) => setValue('customerName', val)}
              onSelectId={(id) => setSelectedCustomerId(id)}
              selectedBalance={customerParties.find(p => p.name.toLowerCase() === (watch('customerName') || '').toLowerCase())?.balance}
              aiSuggested={nlPartyFilled && !!initialValues?.customerName}
              placeholder="Type or select a customer name…"
            />
          )}
          {requiresVendor && (
            <PartyInput
              label="Vendor / Supplier (optional)"
              suggestions={vendorSuggestions}
              parties={vendorParties}
              value={watch('vendorName') || ''}
              onChange={(val) => setValue('vendorName', val)}
              onSelectId={(id) => setSelectedVendorId(id)}
              selectedBalance={vendorParties.find(p => p.name.toLowerCase() === (watch('vendorName') || '').toLowerCase())?.balance}
              aiSuggested={nlPartyFilled && !!initialValues?.vendorName}
              placeholder="Type or select a vendor name…"
            />
          )}
          {/* Invoice / Bill number with auto-generate indicator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-text-secondary">
                {requiresCustomer ? 'Invoice Number' : 'Bill / PO Number'}
              </label>
              {invoiceAutoGenerated && watchedInvoiceNumber?.trim() && (
                <span className="text-xs text-accent/70 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Auto-generated — type to override
                </span>
              )}
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-glass-panel border border-glass text-text-primary text-sm placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              placeholder={requiresCustomer ? 'e.g., INV-202601-00042' : 'e.g., BILL-202601-00042'}
              {...register('invoiceNumber')}
              onChange={(e) => {
                register('invoiceNumber').onChange(e)
                setInvoiceAutoGenerated(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Inventory Item Selector — next to the core details (smart entry) */}
      <InventorySection
        transactionType={transactionType}
        amount={amount}
        currency={currency}
        inventoryItems={inventoryItems}
        selectedInventoryItemId={selectedInventoryItemId}
        onSelectItem={setSelectedInventoryItemId}
        inventoryQty={inventoryQty}
        onQtyChange={setInventoryQty}
        pendingNewItem={pendingNewItem}
        onChangePendingNewItem={setPendingNewItem}
      />

      {/* Additional Details (collapsible) — advanced mode only */}
      {advancedVisible && (
        <MoreOptionsSection
          form={{ register, watch, setValue }}
          currency={currency}
          currencyOptions={currencyOptions}
          convPreview={convPreview}
          requiresCustomer={requiresCustomer}
          requiresVendor={requiresVendor}
          invoiceAutoGenerated={invoiceAutoGenerated}
          setInvoiceAutoGenerated={setInvoiceAutoGenerated}
          showOptional={showOptional}
          onToggle={() => setShowOptional(v => !v)}
        />
      )}

      {/* ── Section: Installment / EMI (optional) — hidden in edit mode + simple mode ── */}
      {advancedVisible && !isEditMode && (
        <InstallmentSection
          form={{ register, watch, setValue, errors }}
          currency={currency}
          isInstallment={isInstallment}
          amount={amount}
          debitAcctName={debitAcct?.accountName}
        />
      )}

      {/* Pre-save warnings — advisory only, shown in create mode after first submit attempt */}
      {!isEditMode && preSaveWarnings.length > 0 && (
        <div className="rounded-lg border border-highlight/30 bg-highlight/10 p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-highlight flex-shrink-0" />
              <p className="text-sm font-semibold text-highlight">Advisory warnings — review before saving</p>
            </div>
            <button type="button" onClick={() => { setPreSaveWarnings([]); setPreSaveAcknowledged(false) }} className="text-text-muted hover:text-text-primary flex-shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="text-xs text-highlight/90 list-disc list-inside space-y-1">
            {preSaveWarnings.map((w, i) => <li key={i}>{applyGAAPGloss(w)}</li>)}
          </ul>
          {/* FIX: was !preSaveAcknowledged — inverted. Now shows the hint exactly when warnings are present */}
          {preSaveAcknowledged && (
            <p className="text-xs text-highlight/70 font-medium">
              ⚠ These are advisory only — your transaction is valid. Click{' '}
              <span className="font-bold text-highlight">
                {watch('isInstallment') ? 'Create Instalment Plan' : 'Record Transaction'}
              </span>{' '}
              again to save anyway.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-glass">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" loading={isPending || preSaveCheck.isPending} disabled={isPeriodLocked}>
          {isEditMode
            ? 'Save Changes'
            : isInstallment ? 'Create Instalment Plan' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  )
}
