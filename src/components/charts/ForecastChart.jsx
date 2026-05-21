import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import { useBusinessStore } from '@/stores/useBusinessStore'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-charcoal border border-glass p-3 rounded-lg shadow-glow-cyan/10">
        <p className="text-text-secondary text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-bold text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/**
 * ForecastChart handles stitching historical data and predicted data
 * together into a unified AreaChart.
 */
export default function ForecastChart({ historical = [], predicted = [], metricName = 'Value' }) {
  const currency = useBusinessStore((s) => s.currency)

  const chartData = useMemo(() => {
    // We want to link the last historical point to the first predicted point
    // so the chart line doesn't break.
    let combined = []

    if (historical.length > 0) {
      combined = historical.map(item => ({
        ...item,
        actual: item.value,
        forecast: null,
      }))
    }

    if (predicted.length > 0) {
      // Connect the lines by copying the last actual value as the start of the forecast
      if (historical.length > 0) {
        const lastHistorical = historical[historical.length - 1]
        combined.push({
          date: lastHistorical.date,
          actual: null,
          forecast: lastHistorical.value, // start the dashed line from here
          isProjected: true
        })
      }

      predicted.forEach(item => {
        combined.push({
          date: item.date,
          actual: null,
          forecast: item.value,
          isProjected: true
        })
      })
    }

    return combined
  }, [historical, predicted])

  // Determine colors based on metric
  const colorMap = {
    revenue: '#34d399', // Emerald
    expenses: '#f87171', // Red
    netCashFlow: '#06b6d4', // Cyan
    default: '#06b6d4',
  }
  const themeColor = colorMap[metricName.toLowerCase()] || colorMap.default

  // Find the point where projection begins to draw a reference line
  const projectionStartPoint = useMemo(() => {
    return chartData.find(d => d.isProjected)?.date
  }, [chartData])

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted border border-glass border-dashed rounded-xl">
        No forecast data available. Generate a forecast to begin.
      </div>
    )
  }

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Actual Gradient */}
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
            </linearGradient>
            {/* Forecast Gradient (Lighter, dashed feel in CSS usually, but we lower opacity) */}
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748B" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => {
              // Basic formatter e.g., "Jan 26"
              if (!val) return ''
              const d = new Date(val)
              return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(-2)}`
            }}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => {
               // format millions/thousands
               if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
               if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
               return val
            }}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          
          {projectionStartPoint && (
            <ReferenceLine x={projectionStartPoint} stroke="#64748B" strokeDasharray="3 3" label={{ position: 'top', value: 'Forecast', fill: '#64748B', fontSize: 10 }} />
          )}

          <Area 
            type="monotone" 
            dataKey="actual" 
            name="Actual"
            stroke={themeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            connectNulls
          />
          <Area 
            type="monotone" 
            dataKey="forecast" 
            name="Predicted"
            stroke={themeColor} 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
