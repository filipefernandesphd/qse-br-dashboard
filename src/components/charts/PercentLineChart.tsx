import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { YearCountDatum } from '../../types/data'
import { chartColors, formatPercent } from './chartUtils'
import { EmptyChart } from './EmptyChart'

interface PercentLineChartProps {
  data: YearCountDatum[]
}

export function PercentLineChart({ data }: PercentLineChartProps) {
  if (data.length === 0) {
    return <EmptyChart />
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#475569', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip formatter={(value) => [formatPercent(Number(value)), 'papers']} />
          <Line
            type="monotone"
            dataKey="value"
            name="% international collaboration"
            stroke={chartColors[1]}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
