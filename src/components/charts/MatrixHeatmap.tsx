import type { MatrixSummary } from '../../lib/aggregations'

interface MatrixHeatmapProps {
  matrix: MatrixSummary
  unit: string
}

export function MatrixHeatmap({ matrix, unit }: MatrixHeatmapProps) {
  if (matrix.rows.length === 0 || matrix.columns.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-600">
        No data available for the current filters.
      </div>
    )
  }

  const cellValue = (row: string, column: string) =>
    matrix.cells.find((cell) => cell.row === row && cell.column === column)?.value ?? 0

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-2 text-left font-medium text-slate-600">
              Category
            </th>
            {matrix.columns.map((column) => (
              <th
                key={column}
                className="min-w-28 p-2 text-left align-bottom font-medium text-slate-600"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row}>
              <th className="sticky left-0 z-10 max-w-60 bg-white p-2 text-left font-medium text-slate-800">
                {row}
              </th>
              {matrix.columns.map((column) => {
                const value = cellValue(row, column)
                const intensity = matrix.max === 0 ? 0 : value / matrix.max
                return (
                  <td key={column} className="p-0">
                    <div
                      className="flex min-h-12 items-center justify-center rounded text-sm font-semibold"
                      style={{
                        backgroundColor: `rgba(37, 99, 235, ${0.08 + intensity * 0.72})`,
                        color: intensity > 0.55 ? '#ffffff' : '#172033',
                      }}
                      title={`${row} x ${column}: ${value} ${unit}`}
                    >
                      {value}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
