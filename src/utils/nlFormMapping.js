// src/utils/nlFormMapping.js
// Maps an NL parser preview result → the structured form's initialValues shape.
// Extracted from TransactionFormModal so it is unit-testable; the smart-entry
// fields (_inventory, _lineItems) ride along for item prefill / creation.
export function nlResultToFormValues(result, rawText) {
  return {
    transactionDate:         result.transactionDate || new Date().toISOString().split('T')[0],
    description:             result.description || rawText,
    amount:                  result.amount || 0,
    transactionType:         result.transactionType || '',
    debitAccountId:          result.debitAccountId  || '',
    creditAccountId:         result.creditAccountId || '',
    debitAccount:            result.debitAccount    || '',
    creditAccount:           result.creditAccount   || '',
    confidence:              result.confidence      ?? null,
    requiresReview:          result.requiresReview  ?? false,
    reviewReasons:           result.reviewReasons   ?? [],
    isInstallment:           result.isInstallment   || false,
    installmentPeriodMonths: result.installmentPeriodMonths || null,
    totalInstallmentAmount:  result.totalInstallmentAmount  || null,
    downPayment:             result.downPayment            || 0,
    installmentFrequency:    result.installmentFrequency   || 'monthly',
    installmentCount:        result.installmentCount       || result.installmentPeriodMonths || null,
    interestRate:            result.interestRate           || 0,
    firstPaymentDate:        result.firstPaymentDate       || '',
    interestMethod:          result.interestMethod         || 'reducing_balance',
    taxAmount:               result.taxAmount              || 0,
    taxRate:                 result.taxRate                || 0,
    currency:                result.currency               || null,
    vendorName:              result.vendorName             || result.counterpartyName || '',
    customerName:            result.customerName           || result.counterpartyName || '',
    invoiceNumber:           result.invoiceNumber          || '',
    paymentMethod:           result.paymentMethod          || '',
    notes:                   result.notes                  || '',
    resolvedJournalLines:    result.resolvedJournalLines   || [],
    _rawText:                rawText,
    // Smart entry — goods + inventory linkage from the parser
    _inventory:              result.inventory              || { mode: 'none' },
    _lineItems:              result.lineItems              || [],
  }
}
