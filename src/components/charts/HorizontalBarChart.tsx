import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CountDatum } from '../../types/data'
import { chartColors, formatNumber, shortLabel } from './chartUtils'
import { EmptyChart } from './EmptyChart'

interface HorizontalBarChartProps {
  data: CountDatum[]
  unit: string
  height?: number
}

export function HorizontalBarChart({
  data,
  unit,
  height = 340,
}: HorizontalBarChartProps) {
  if (data.length === 0) {
    return <EmptyChart />
  }

  const chartData = data.map((item) => ({
    ...item,
    shortName: shortLabel(item.name),
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis
            dataKey="shortName"
            type="category"
            width={180}
            tick={{ fill: '#334155', fontSize: 12 }}
            interval={0}
          />
          <Tooltip
            formatter={(value) => [formatNumber(Number(value)), unit]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
          />
          <Bar dataKey="value" name={unit} fill={chartColors[0]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
