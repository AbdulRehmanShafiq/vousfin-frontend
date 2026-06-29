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
    ? 'rounded-full border border-glass bg-glass px-1.5 py-0.5 text-[10.5px] text-text-muted'
    : 'rounded-full border border-glass bg-glass px-2 py-0.5 text-[11px] text-text-muted'

  if (!showFallback && !showLowConfidence && sources.length === 0) return null

  return (
    <div className={compact ? 'mt-2 space-y-2' : 'mt-3 space-y-2'}>
      {showFallback && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
          <AlertTriangle className="h-3 w-3" />
          Fallback answer
        </div>
      )}

      {showLowConfidence && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
          <AlertTriangle className="h-3 w-3" />
          Low confidence
        </div>
      )}

      {sources.length > 0 && (
        <div className="border-t border-glass pt-2">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase text-text-muted">
            <Database className="h-3 w-3 text-cyan" />
            Sources
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, idx) => (
              <span
                key={`${source.sourceRef || source.sourceId || idx}-${source.dataType || 'context'}-${source.period || 'period'}`}
                className={chipClass}
              >
                {sourceLabel(source)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
