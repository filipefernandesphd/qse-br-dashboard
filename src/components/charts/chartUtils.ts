export const chartColors = [
  '#2563eb',
  '#0f766e',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#65a30d',
  '#be123c',
  '#4f46e5',
  '#a16207',
  '#0d9488',
  '#b45309',
]

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)}%`

export const shortLabel = (value: string, maxLength = 34) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value
