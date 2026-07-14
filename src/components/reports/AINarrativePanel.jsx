/**
 * AINarrativePanel — FR-02.2: AI-narrated financial statements.
 *
 * CFO-style plain-language briefing in English + Urdu, computed entirely from
 * the GL (zero hallucination by construction). Every cited figure links to
 * the report it came from. The follow-up box opens the global AI assistant
 * with the question pre-seeded.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles, Languages, Send, ChevronDown } from 'lucide-react'
import api from '@/services/api'
import { useAIStore } from '@/stores/useAIStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/cn'

export default function AINarrativePanel() {
  const isMobile = useIsMobile()
  const [lang, setLang] = useState('en')
  const [period, setPeriod] = useState('month')
  const [question, setQuestion] = useState('')
  // On phones the briefing is long, so it's collapsed by default — the actual
  // statement should be the first thing you see. Desktop keeps it open.
  const [open, setOpen] = useState(!isMobile)

  const { data, isLoading } = useQuery({
    queryKey: ['report-narrative', period],
    queryFn: () => api.get(`/reports/narrative?period=${period}`).then(r => r.data.data),
    staleTime: 60_000,
  })

  const segments = lang === 'ur' ? data?.urdu : data?.english

  // Follow-up goes into the same AI assistant conversation (FR-02.2 AC)
  const askFollowUp = async () => {
    if (!question.trim()) return
    const ctx = `Regarding my ${period === 'month' ? 'monthly' : 'quarterly'} financial briefing: ${question.trim()}`
    setQuestion('')
    toast('Asking the AI assistant…', { icon: '🤖' })
    try {
      await useAIStore.getState().sendMessage(ctx)
      toast.success('Answer ready — open the AI Assistant (bottom-right) to read it')
    } catch {
      toast.error('Assistant unavailable right now')
    }
  }

  return (
    <div className="premium-card p-4 sm:p-5 mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">CFO Briefing</h3>
          {data && (
            <span className="num hidden sm:inline text-small text-text-muted truncate">
              generated in {data.generatedInMs}ms · grounded in your ledger
            </span>
          )}
          <ChevronDown className={cn('ml-auto h-4 w-4 flex-shrink-0 text-text-muted transition-transform sm:hidden', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <select
              value={period} onChange={e => setPeriod(e.target.value)}
              className="bg-transparent border border-glass rounded-md text-xs px-2 py-1.5 text-text-secondary focus-ring"
            >
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
            </select>
            <button
              onClick={() => setLang(l => (l === 'en' ? 'ur' : 'en'))}
              className="flex items-center gap-1.5 text-xs border border-glass rounded-md px-2 py-1.5 text-text-secondary hover:text-text-primary hover:bg-glass-hover"
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === 'en' ? 'اردو' : 'English'}
            </button>
          </div>
        )}
      </div>

      {!open ? null : isLoading ? (
        <div className="mt-4 space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 skeleton-loader rounded w-full" />)}
        </div>
      ) : (
        <>
          <div
            className={cn('mt-4 space-y-2 text-sm leading-relaxed text-text-secondary', lang === 'ur' && 'text-right')}
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
          >
            {(segments || []).map((s, i) => <p key={i}>{s}</p>)}
          </div>

          {/* Cited figures — every number traceable to the GL (FR-02.2 AC) */}
          {(data?.figures || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-glass">
              {data.figures.map((f, i) => (
                <Link
                  key={i} to={f.link}
                  className="num text-small px-2 py-1 rounded-md bg-glass-panel border border-glass text-text-muted hover:text-accent hover:border-glass-2"
                  title={`Drill into ${f.label}`}
                >
                  {f.label}: Rs {Number(f.value).toLocaleString()}
                </Link>
              ))}
            </div>
          )}

          {/* Follow-up — same interface (FR-02.2 AC) */}
          {(
            <div className="flex gap-2 mt-4">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askFollowUp()}
                placeholder="Ask a follow-up about any figure…"
                className="flex-1 bg-transparent border border-glass rounded-md text-sm px-3 py-2 text-text-primary placeholder:text-text-muted focus-ring"
              />
              <button
                onClick={askFollowUp}
                className="btn-gradient rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Ask
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
