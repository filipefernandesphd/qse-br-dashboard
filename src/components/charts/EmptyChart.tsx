interface EmptyChartProps {
  message?: string
}

export function EmptyChart({
  message = 'No data available for the current filters.',
}: EmptyChartProps) {
  return (
    <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-600">
      {message}
    </div>
  )
}
