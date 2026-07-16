import { useMemo } from 'react'
import { closingBalances, trendDirection } from '@/utils/cashSeries'

/**
 * CashSparkline — the shape of your cash, under the number.
 *
 * Plots the CLOSING BALANCE per period (see utils/cashSeries), so it agrees
 * with the "Cash on hand" hero directly above it. Hand-rolled SVG rather than
 * a chart library: this is decoration-weight, it must not pull recharts into
 * the phone's first paint, and it reads data the page already fetched.
 *
 * Decorative by intent — aria-hidden, because the hero states the number and
 * a screen reader gains nothing from "line goes up".
 */
export default function CashSparkline({ trend, currentBalance, className = '' }) {
  const { d, area, dir } = useMemo(() => {
    const series = closingBalances(trend, currentBalance)
    if (series.length < 2) return { d: null, area: null, dir: 'flat' }

    const W = 100
    const H = 28
    const values = series.map((p) => p.balance)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1 // a flat line divides by 1, not by 0
    const step = W / (series.length - 1)

    const pts = values.map((v, i) => {
      const x = i * step
      // Inset by 2px top and bottom so the stroke never clips at the extremes.
      const y = H - 2 - ((v - min) / span) * (H - 4)
      return [x, y]
    })

    return {
      d: pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
      area:
        `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)} ` +
        pts.slice(1).map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`).join(' ') +
        ` L${W},${H} L0,${H} Z`,
      dir: trendDirection(series),
    }
  }, [trend, currentBalance])

  if (!d) return null

  const stroke = dir === 'down' ? 'rgb(var(--c-negative))' : 'rgb(var(--c-positive))'
  const gradId = `spark-${dir}`

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={`h-7 w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
