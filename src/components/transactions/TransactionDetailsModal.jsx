import Modal from '@/components/common/Modal'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters'

export default function TransactionDetailsModal({ open, onClose, transaction }) {
  if (!transaction) return null
  const entries = transaction.journalEntries || transaction.entries || []

  return (
    <Modal open={open} onClose={onClose} title="Transaction details" size="lg">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Description</dt><dd className="font-medium">{transaction.description}</dd></div>
        <div><dt className="text-slate-500">Amount</dt><dd className="font-medium">{formatCurrency(transaction.amount)}</dd></div>
        <div><dt className="text-slate-500">Type</dt><dd>{transaction.transactionType}</dd></div>
        <div><dt className="text-slate-500">Date</dt><dd>{formatDate(transaction.transactionDate)}</dd></div>
        <div><dt className="text-slate-500">Status</dt><dd className="capitalize">{transaction.status}</dd></div>
        <div><dt className="text-slate-500">Method</dt><dd>{transaction.inputMethod}</dd></div>
      </dl>
      {entries.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 font-medium">Journal entries</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="py-2">Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b"><td className="py-2">{e.accountName || e.account?.name}</td><td>{e.debit ? formatCurrency(e.debit) : '?'}</td><td>{e.credit ? formatCurrency(e.credit) : '?'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {transaction.auditTrail?.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 font-medium">Audit trail</h4>
          <ul className="space-y-2 text-xs text-slate-600">
            {transaction.auditTrail.map((a, i) => (
              <li key={i}>{formatDateTime(a.timestamp)} ? {a.action} by {a.userEmail || a.userId}</li>
            ))}
          </ul>
        </div>
      )}
      {transaction.reversalOf && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Reversal of transaction {transaction.reversalOf}
        </p>
      )}
    </Modal>
  )
}
