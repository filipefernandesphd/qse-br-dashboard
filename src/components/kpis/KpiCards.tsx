import { Building2, CalendarRange, Globe2, Library, Network, Tags } from 'lucide-react'
import type { KpiSummary } from '../../lib/aggregations'
import { formatNumber, formatPercent } from '../charts/chartUtils'

interface KpiCardsProps {
  summary: KpiSummary
}

const cardClass = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'

export function KpiCards({ summary }: KpiCardsProps) {
  const cards = [
    {
      label: 'Total papers',
      value: formatNumber(summary.totalPapers),
      icon: Library,
    },
    {
      label: 'Year range',
      value: summary.yearRange,
      icon: CalendarRange,
    },
    {
      label: 'Distinct venues',
      value: formatNumber(summary.distinctVenues),
      icon: Tags,
    },
    {
      label: 'SWEBOK areas',
      value: formatNumber(summary.distinctSwebok),
      icon: Network,
    },
    {
      label: 'Institutions / countries',
      value: `${formatNumber(summary.distinctInstitutions)} / ${formatNumber(
        summary.distinctCountries,
      )}`,
      icon: Building2,
    },
    {
      label: 'International collaboration',
      value: formatPercent(summary.internationalCollaborationPercent),
      icon: Globe2,
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <Icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{card.value}</p>
          </div>
        )
      })}
    </section>
  )
}
