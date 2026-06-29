import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { YearCountDatum } from '../../types/data'
import { chartColors, formatNumber } from './chartUtils'
import { EmptyChart } from './EmptyChart'

interface YearBarChartProps {
  data: YearCountDatum[]
}

export function YearBarChart({ data }: YearBarChartProps) {
  if (data.length === 0) {
    return <EmptyChart />
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value) => [formatNumber(Number(value)), 'papers']} />
          <Bar dataKey="value" name="number of papers" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
