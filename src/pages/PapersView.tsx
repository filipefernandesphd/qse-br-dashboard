import { useState } from 'react'
import {
  countByPaperField,
  keywordCounts,
  yearCounts,
} from '../lib/aggregations'
import type { Paper } from '../types/data'
import { ChartCard } from '../components/charts/ChartCard'
import { DonutChart } from '../components/charts/DonutChart'
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart'
import { YearBarChart } from '../components/charts/YearBarChart'
import { DataTable } from '../components/table/DataTable'

interface PapersViewProps {
  papers: Paper[]
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

export function PapersView({ papers }: PapersViewProps) {
  const [topN, setTopN] = useState(10)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Publications by year"
          subtitle="Unit: distinct papers."
        >
          <YearBarChart data={yearCounts(papers)} />
        </ChartCard>
        <ChartCard
          title="Document Type distribution"
          subtitle="Unit: distinct papers."
        >
          <DonutChart
            data={countByPaperField(papers, (paper) => paper.documentType)}
            unit="papers"
          />
        </ChartCard>
        <ChartCard
          title="Research Type distribution"
          subtitle="Unit: distinct papers."
        >
          <HorizontalBarChart
            data={countByPaperField(papers, (paper) => paper.researchType)}
            unit="papers"
          />
        </ChartCard>
        <ChartCard
          title="SWEBOK area distribution"
          subtitle="Unit: distinct papers."
        >
          <HorizontalBarChart
            data={countByPaperField(papers, (paper) => paper.swebok)}
            unit="papers"
          />
        </ChartCard>
        <ChartCard
          title="Top venues"
          subtitle="Unit: distinct papers by SOURCE TITLE."
          action={<TopNControl value={topN} onChange={setTopN} />}
        >
          <HorizontalBarChart
            data={countByPaperField(papers, (paper) => paper.sourceTitle).slice(
              0,
              topN,
            )}
            unit="papers"
            height={380}
          />
        </ChartCard>
        <ChartCard
          title="Top keywords"
          subtitle="Unit: occurrences after splitting by ';'. Empty keywords are ignored."
          action={<TopNControl value={topN} onChange={setTopN} />}
        >
          <HorizontalBarChart
            data={keywordCounts(papers).slice(0, topN)}
            unit="occurrences"
            height={380}
          />
        </ChartCard>
      </div>
      <DataTable papers={papers} />
    </div>
  )
}
