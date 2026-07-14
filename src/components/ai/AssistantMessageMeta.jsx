import { AlertTriangle, Database } from 'lucide-react'

function sourceLabel(source) {
  const type = String(source?.dataType || 'context').replace(/_/g, ' ')
  return source?.period ? `${type} - ${source.period}` : type
}

export default function AssistantMessageMeta({ meta, compact = false }) {
  const sources = Array.isArray(meta?.sources) ? meta.sources : []
  const showFallback = meta?.fallback
  const showLowConfidence = meta?.confident === false && !showFallback
  const chipClass = compact
    ? 'rounded-full border border-glass bg-glass px-1.5 py-0.5 text-label text-text-muted'
    : 'rounded-full border border-glass bg-glass px-2 py-0.5 text-label text-text-muted'

  if (!showFallback && !showLowConfidence && sources.length === 0) return null

  return (
    <div className={compact ? 'mt-2 space-y-2' : 'mt-3 space-y-2'}>
      {showFallback && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-label font-medium text-warning">
          <AlertTriangle className="h-3 w-3" />
          Fallback answer
        </div>
      )}

      {showLowConfidence && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-label font-medium text-warning">
          <AlertTriangle className="h-3 w-3" />
          Low confidence
        </div>
      )}

      {sources.length > 0 && (
        <div className="border-t border-glass pt-2">
          <div className="mb-1 flex items-center gap-1.5 text-label font-medium uppercase text-text-muted">
            <Database className="h-3 w-3 text-accent" />
            Sources
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(
              sources.reduce((acc, source) => {
                const key = `${source.dataType || 'context'}|${source.period || ''}`
                if (acc[key]) { acc[key].count += 1 } else { acc[key] = { ...source, count: 1 } }
                return acc
              }, {})
            ).map((source) => (
              <span
                key={`${source.dataType || 'context'}-${source.period || 'period'}`}
                className={chipClass}
              >
                {sourceLabel(source)}{source.count > 1 ? ` ×${source.count}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
