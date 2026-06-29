import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { StackedYearDatum } from '../../types/data'
import { chartColors, formatNumber } from './chartUtils'
import { EmptyChart } from './EmptyChart'

interface StackedBarChartProps {
  data: StackedYearDatum[]
  keys: string[]
  unit: string
}

export function StackedBarChart({ data, keys, unit }: StackedBarChartProps) {
  if (data.length === 0 || keys.length === 0) {
    return <EmptyChart />
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value) => [formatNumber(Number(value)), unit]} />
          <Legend />
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
