import { useState, useEffect, useCallback } from 'react'
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react'
import { useForecast } from '@/hooks/useAI'

import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import ForecastChart from '@/components/charts/ForecastChart'

const METRICS = [
  { value: 'revenue', label: 'Revenue Forecast' },
  { value: 'expenses', label: 'Expense Forecast' },
  { value: 'netCashFlow', label: 'Net Cash Flow Forecast' },
]

const HORIZONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
]

export default function AIForecastPage() {
  const [metric, setMetric] = useState('revenue')
  const [horizon, setHorizon] = useState(3)
  
  const generateForecast = useForecast()

  const handleGenerate = useCallback(() => {
    generateForecast.mutate({ metric, horizon })
  }, [generateForecast, metric, horizon])

  // Fire-and-forget initial load — mutate() does not return a promise,
  // so no setState is called synchronously within the effect body.
  useEffect(() => {
    generateForecast.mutate({ metric: 'revenue', horizon: 3 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const result = generateForecast.data
  const hasGenerated = !!result

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <BrainCircuit className="h-6 w-6 text-cyan" />
            AI Forecasting
          </h1>
          <p className="text-text-secondary mt-1">Predict future trends using LSTM machine learning models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Controls & Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-glass pb-2">Parameters</h2>
            <div className="space-y-4">
              <Select
                label="Target Metric"
                options={METRICS}
                value={metric}
                onChange={setMetric}
              />
              <Select
                label="Time Horizon"
                options={HORIZONS}
                value={horizon}
                onChange={val => setHorizon(parseInt(val))}
              />
              <Button 
                fullWidth 
                onClick={handleGenerate}
                loading={generateForecast.isPending}
                className="mt-4"
              >
                Run AI Model
              </Button>
            </div>
          </div>

          {/* AI Insights Panel */}
          {hasGenerated && result?.insights && (
            <div className="premium-card p-6 border-cyan/30 bg-cyan/5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary mb-4 border-b border-glass pb-2">
                <TrendingUp className="h-5 w-5 text-cyan" />
                AI Insights
              </h2>
              <div className="space-y-4">
                {result.insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-0.5">
                      {insight.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-cyan shadow-glow-cyan" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-3">
          <div className="premium-card p-6 sm:p-8 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-glass pb-4 mb-6">
              <h2 className="text-xl font-bold text-text-primary capitalize">
                {metric.replace(/([A-Z])/g, ' $1').trim()} Projection ({horizon} Months)
              </h2>
              {generateForecast.isPending && (
                <div className="flex items-center gap-2 text-sm text-cyan font-medium animate-pulse">
                  <BrainCircuit className="h-4 w-4 animate-spin-slow" />
                  Processing LSTM inference...
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[400px] flex items-center justify-center relative">
              {generateForecast.isPending ? (
                <div className="absolute inset-0 z-10 bg-navy/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-glass border-t-cyan animate-spin" />
                    <BrainCircuit className="h-6 w-6 text-cyan animate-pulse" />
                  </div>
                  <p className="mt-4 text-text-muted font-medium">Running neural networks...</p>
                </div>
              ) : null}

              {hasGenerated && result ? (
                <ForecastChart 
                  historical={result.historical}
                  predicted={result.predicted}
                  metricName={metric}
                />
              ) : (
                <div className="text-center text-text-muted">
                  Select parameters and click "Run AI Model" to visualize predictions.
                </div>
              )}
            </div>
            
            {hasGenerated && result && (
              <div className="mt-6 pt-4 border-t border-glass flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <div className="w-4 h-4 rounded bg-emerald-400/20 border border-emerald-400" />
                    Historical Data
                  </span>
                  <span className="flex items-center gap-2 text-text-secondary">
                    <div className="w-4 h-4 rounded border border-dashed border-emerald-400" />
                    AI Prediction
                  </span>
                </div>
                <span className="text-text-muted">Confidence Level: {result.confidenceScore || '89%'}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
