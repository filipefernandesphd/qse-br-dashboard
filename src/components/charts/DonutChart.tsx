import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { CountDatum } from '../../types/data'
import { chartColors, formatNumber } from './chartUtils'
import { EmptyChart } from './EmptyChart'

interface DonutChartProps {
  data: CountDatum[]
  unit: string
  height?: number
}

export function DonutChart({ data, unit, height = 300 }: DonutChartProps) {
  if (data.length === 0) {
    return <EmptyChart />
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="82%"
            paddingAngle={1}
          >
            {data.map((item, index) => (
              <Cell
                key={item.name}
                fill={chartColors[index % chartColors.length]}
                stroke="#ffffff"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const numericValue = Number(value)
              const percent = total === 0 ? 0 : (numericValue / total) * 100
              return [`${formatNumber(numericValue)} (${percent.toFixed(1)}%)`, unit]
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
