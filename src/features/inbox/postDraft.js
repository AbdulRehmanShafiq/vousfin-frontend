import classifierApi from '@/services/ai/classifierService'
import transactionService from '@/services/transaction.service'

/**
 * postDraft — THE one path from an AI-classified draft to a real journal
 * entry. Extracted from the review queue so the desktop queue, its keyboard
 * session, and the mobile Inbox all post identically:
 *   claim (idempotent) → transaction.create (full accounting pipeline)
 *   → markConfirmed; release on failure.
 *
 * Throws on unresolved accounts — callers must refuse, never guess.
 */
export async function postDraft(d) {
  const isExpense = d.tx_type === 'DEBIT'
  const categoryId = isExpense ? d.debit_account_id : d.credit_account_id
  const bankId = isExpense ? d.credit_account_id : d.debit_account_id
  if (!categoryId || !bankId) throw new Error('unresolved accounts')
  // Claim atomically — skip silently if already taken (idempotency)
  try { await classifierApi.claim(d.draft_id) }
  catch (e) { if (e?.response?.status === 409) return; throw e }
  try {
    const res = await transactionService.create({
      transactionDate: d.tx_date,
      description: (d.narration_raw || d.payee_raw || 'AI transaction').slice(0, 200),
      amount: Number(d.amount),
      debitAccountId: isExpense ? categoryId : bankId,
      creditAccountId: isExpense ? bankId : categoryId,
    })
    const posted = res?.data?.data
    const jeId = posted?.status === 'pending' ? null : (posted?._id || res?.data?._id)
    await classifierApi.markConfirmed(d.draft_id, { journal_entry_id: jeId })
  } catch (e) {
    try { await classifierApi.release(d.draft_id) } catch { /* ignore */ }
    throw e
  }
}

/** True when a draft has both sides resolved and may be posted. */
export const draftIsResolvable = (d) => !!(d?.debit_account_id && d?.credit_account_id)
