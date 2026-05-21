import { useState, useEffect } from 'react'
import { useBusinessStore } from '@/stores/useBusinessStore'
import useCustomerStore from '@/stores/useCustomerStore'
import useVendorStore from '@/stores/useVendorStore'
import transactionService from '@/services/transaction.service'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'
import { showError, showSuccess } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import { ChevronDown, ChevronUp } from 'lucide-react'

const TRANSACTION_TYPES = [
  { value: 'Income', label: 'Income (Cash)' },
  { value: 'Expense', label: 'Expense (Cash)' },
  { value: 'Credit Sale', label: 'Credit Sale (Accounts Receivable)' },
  { value: 'Credit Purchase', label: 'Credit Purchase (Accounts Payable)' },
  { value: 'Transfer', label: 'Bank Transfer / Journal' },
]

export default function TransactionForm({ onSuccess }) {
  const { accounts, fetchAccounts, loading: accountsLoading } = useBusinessStore()
  const { customers, fetchCustomers, loading: customersLoading } = useCustomerStore()
  const { vendors, fetchVendors, loading: vendorsLoading } = useVendorStore()

  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    transactionType: 'Expense',
    amount: '',
    debitAccountId: '',
    creditAccountId: '',
    customerId: '',
    vendorId: '',
    dueDate: '',
    paymentTerms: '',
    notes: '',
    transactionReference: '',
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
    fetchCustomers({ limit: 100 })
    fetchVendors({ limit: 100 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const accountList = Array.isArray(accounts) ? accounts : []
  const customerList = Array.isArray(customers) ? customers : []
  const vendorList = Array.isArray(vendors) ? vendors : []

  const isCreditSale = form.transactionType === 'Credit Sale'
  const isCreditPurchase = form.transactionType === 'Credit Purchase'
  const needsParty = isCreditSale || isCreditPurchase

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (!form.debitAccountId || !form.creditAccountId) {
      return showError('Please select both debit and credit accounts')
    }
    if (form.debitAccountId === form.creditAccountId) {
      return showError('Debit and credit accounts must be different')
    }
    if (isCreditSale && (!form.customerId || !form.dueDate)) {
      return showError('Customer and Due Date are required for Credit Sales')
    }
    if (isCreditPurchase && (!form.vendorId || !form.dueDate)) {
      return showError('Vendor and Due Date are required for Credit Purchases')
    }

    setSubmitting(true)
    try {
      const payload = {
        transactionDate: form.transactionDate,
        description: form.description,
        transactionType: form.transactionType,
        amount: parseFloat(form.amount),
        debitAccountId: form.debitAccountId,
        creditAccountId: form.creditAccountId,
      }
      
      if (isCreditSale) {
        payload.customerId = form.customerId
        payload.dueDate = form.dueDate
      }
      
      if (isCreditPurchase) {
        payload.vendorId = form.vendorId
        payload.dueDate = form.dueDate
      }

      if (form.paymentTerms) payload.paymentTerms = form.paymentTerms
      if (form.notes) payload.notes = form.notes
      if (form.transactionReference) payload.transactionReference = form.transactionReference

      await transactionService.create(payload)
      showSuccess('Transaction recorded successfully')
      
      if (onSuccess) onSuccess()
      
      // Reset form
      setForm({
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        transactionType: 'Expense',
        amount: '',
        debitAccountId: '',
        creditAccountId: '',
        customerId: '',
        vendorId: '',
        dueDate: '',
        paymentTerms: '',
        notes: '',
        transactionReference: '',
      })
      setShowAdvanced(false)
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Transaction Type"
          value={form.transactionType}
          onChange={(v) => setForm({ ...form, transactionType: v, customerId: '', vendorId: '', dueDate: '' })}
          options={TRANSACTION_TYPES}
          required
        />
        
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="0.00"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={form.transactionDate}
          onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
          required
        />
        
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What was this for?"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Debit Account"
          value={form.debitAccountId}
          onChange={(v) => setForm({ ...form, debitAccountId: v })}
          options={accountList.map(acc => ({ value: acc._id, label: `${acc.accountName} (${acc.accountType})` }))}
          loading={accountsLoading}
          required
        />
        
        <Select
          label="Credit Account"
          value={form.creditAccountId}
          onChange={(v) => setForm({ ...form, creditAccountId: v })}
          options={accountList.map(acc => ({ value: acc._id, label: `${acc.accountName} (${acc.accountType})` }))}
          loading={accountsLoading}
          required
        />
      </div>

      {/* Dynamic Party Section */}
      {needsParty && (
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
          <h4 className="font-semibold text-indigo-900 text-sm">
            {isCreditSale ? 'Accounts Receivable Details' : 'Accounts Payable Details'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isCreditSale && (
              <Select
                label="Customer"
                value={form.customerId}
                onChange={(v) => setForm({ ...form, customerId: v })}
                options={customerList.map(c => ({ value: c._id, label: c.fullName }))}
                loading={customersLoading}
                required
              />
            )}
            
            {isCreditPurchase && (
              <Select
                label="Vendor"
                value={form.vendorId}
                onChange={(v) => setForm({ ...form, vendorId: v })}
                options={vendorList.map(v => ({ value: v._id, label: v.vendorName }))}
                loading={vendorsLoading}
                required
              />
            )}
            
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      {/* Advanced Options Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
          Advanced Options
        </button>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <Input
            label="Reference #"
            value={form.transactionReference}
            onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
            placeholder="Invoice or Receipt number"
          />
          <Input
            label="Payment Terms"
            value={form.paymentTerms}
            onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
            placeholder="e.g. Net 30"
          />
          <div className="md:col-span-2">
            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal notes..."
            />
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" fullWidth loading={submitting} className="py-3 text-lg font-medium">
          Record Transaction
        </Button>
      </div>
    </form>
  )
}