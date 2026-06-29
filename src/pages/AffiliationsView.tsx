import { useState } from 'react'
import {
  countByAffiliationField,
  countPaperArrayField,
} from '../lib/aggregations'
import type { Affiliation, Paper } from '../types/data'
import { ChartCard } from '../components/charts/ChartCard'
import { DonutChart } from '../components/charts/DonutChart'
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart'

interface AffiliationsViewProps {
  papers: Paper[]
  affiliations: Affiliation[]
}

function TopNControl({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      Top N
      <select
        className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {[5, 10, 15, 20].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function AffiliationsView({ papers, affiliations }: AffiliationsViewProps) {
  const [topN, setTopN] = useState(10)

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard
        title="Papers by country"
        subtitle="Unit: distinct papers. An international paper counts once for each country."
        action={<TopNControl value={topN} onChange={setTopN} />}
      >
        <HorizontalBarChart
          data={countPaperArrayField(papers, (paper) => paper.countries).slice(0, topN)}
          unit="papers"
          height={420}
        />
      </ChartCard>
      <ChartCard
        title="Authors by country"
        subtitle="Unit: filtered affiliation rows."
        action={<TopNControl value={topN} onChange={setTopN} />}
      >
        <HorizontalBarChart
          data={countByAffiliationField(
            affiliations,
            (affiliation) => affiliation.country,
          ).slice(0, topN)}
          unit="authors/affiliation rows"
          height={420}
        />
      </ChartCard>
      <ChartCard
        title="Type of Institution"
        subtitle="Unit: filtered affiliation rows."
      >
        <DonutChart
          data={countByAffiliationField(
            affiliations,
            (affiliation) => affiliation.institutionType,
          )}
          unit="affiliation rows"
        />
      </ChartCard>
      <ChartCard title="Public vs Private" subtitle="Unit: filtered affiliation rows.">
        <DonutChart
          data={countByAffiliationField(
            affiliations,
            (affiliation) => affiliation.publicPrivate,
          )}
          unit="affiliation rows"
        />
      </ChartCard>
      <ChartCard
        title="Profit vs Non-profit"
        subtitle="Unit: filtered affiliation rows."
      >
        <DonutChart
          data={countByAffiliationField(
            affiliations,
            (affiliation) => affiliation.profitNonProfit,
          )}
          unit="affiliation rows"
        />
      </ChartCard>
      <ChartCard
        title="Top institutions"
        subtitle="Unit: distinct papers by institution."
        action={<TopNControl value={topN} onChange={setTopN} />}
      >
        <HorizontalBarChart
          data={countPaperArrayField(papers, (paper) => paper.institutions).slice(
            0,
            topN,
          )}
          unit="papers"
          height={420}
        />
      </ChartCard>
    </div>
  )
}
