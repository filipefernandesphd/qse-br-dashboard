import { useEffect, useMemo, useState } from 'react'
import {
  articlesByCountryYear,
  collaborationByYear,
  countByPaperField,
  researchTypeInstitutionMatrix,
  swebokCountryMatrix,
  topCountriesForSwebok,
} from '../lib/aggregations'
import type { Paper } from '../types/data'
import { ChartCard } from '../components/charts/ChartCard'
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart'
import { MatrixHeatmap } from '../components/charts/MatrixHeatmap'
import { PercentLineChart } from '../components/charts/PercentLineChart'
import { StackedBarChart } from '../components/charts/StackedBarChart'

interface CrossViewProps {
  papers: Paper[]
}

export function CrossView({ papers }: CrossViewProps) {
  const [topN, setTopN] = useState(10)
  const swebokOptions = useMemo(
    () => countByPaperField(papers, (paper) => paper.swebok).map((item) => item.name),
    [papers],
  )
  const [selectedSwebok, setSelectedSwebok] = useState('')

  useEffect(() => {
    if (swebokOptions.length === 0) {
      setSelectedSwebok('')
      return
    }

    if (!selectedSwebok || !swebokOptions.includes(selectedSwebok)) {
      setSelectedSwebok(swebokOptions[0])
    }
  }, [selectedSwebok, swebokOptions])

  const countryYear = articlesByCountryYear(papers, topN)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Papers by country x year"
          subtitle="Unit: distinct papers by country and year. International papers count once per country."
          action={
            <label className="text-sm font-medium text-slate-700">
              Top countries
              <select
                className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1"
                value={topN}
                onChange={(event) => setTopN(Number(event.target.value))}
              >
                {[5, 10, 15].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          <StackedBarChart data={countryYear.data} keys={countryYear.keys} unit="papers" />
        </ChartCard>
        <ChartCard
          title="International collaboration over time"
          subtitle="Unit: % of yearly papers with authors from more than one country."
        >
          <PercentLineChart data={collaborationByYear(papers)} />
        </ChartCard>
      </div>

      <ChartCard
        title="SWEBOK x country"
        subtitle="Unit: distinct papers. Columns are limited to the most frequent countries."
      >
        <MatrixHeatmap matrix={swebokCountryMatrix(papers, topN)} unit="papers" />
      </ChartCard>

      <ChartCard
        title="Research Type x Type of Institution"
        subtitle="Unit: distinct papers by combination derived from affiliations."
      >
        <MatrixHeatmap matrix={researchTypeInstitutionMatrix(papers)} unit="papers" />
      </ChartCard>

      <ChartCard
        title="Top countries by SWEBOK area"
        subtitle="Unit: distinct papers for the selected SWEBOK area."
        action={
          <label className="text-sm font-medium text-slate-700">
            SWEBOK
            <select
              className="ml-2 max-w-72 rounded-md border border-slate-300 bg-white px-2 py-1"
              value={selectedSwebok}
              onChange={(event) => setSelectedSwebok(event.target.value)}
            >
              {swebokOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <HorizontalBarChart
          data={topCountriesForSwebok(papers, selectedSwebok, topN)}
          unit="papers"
        />
      </ChartCard>
    </div>
  )
}
