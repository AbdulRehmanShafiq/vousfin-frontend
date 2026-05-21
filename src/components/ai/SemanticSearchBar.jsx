import { useState } from 'react'
import { Search } from 'lucide-react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useAIStore } from '@/stores/useAIStore'
import { showError } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'

export default function SemanticSearchBar() {
  const [query, setQuery] = useState('')
  const { searchResults, semanticSearch, loading } = useAIStore()

  const search = async () => {
    try {
      await semanticSearch(query)
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="flex-1"
          icon={Search}
          placeholder='e.g. "Show fuel expenses from last month"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <Button onClick={search} loading={loading}>Search</Button>
      </div>
      {searchResults.length > 0 && (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {searchResults.map((r, i) => (
            <li key={r._id || i} className="flex justify-between px-4 py-3 text-sm hover:bg-slate-50">
              <span>{r.description}</span>
              <span className="text-slate-500">{formatDate(r.transactionDate)} ? {formatCurrency(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
