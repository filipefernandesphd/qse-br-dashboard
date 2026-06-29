import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import {
  affiliationOptionValues,
  optionValues,
  yearBounds,
} from '../../lib/aggregations'
import type { Filters } from '../../state/filters'
import { activeFilterCount, emptyFilters } from '../../state/filters'
import type { Affiliation, Paper } from '../../types/data'
import { formatNumber } from '../charts/chartUtils'
import { AutocompleteMultiSelect } from './AutocompleteMultiSelect'
import { MultiSelect } from './MultiSelect'

interface FiltersPanelProps {
  papers: Paper[]
  affiliations: Affiliation[]
  filters: Filters
  onChange: (filters: Filters) => void
  filteredPaperCount: number
  filteredAffiliationCount: number
}

export function FiltersPanel({
  papers,
  affiliations,
  filters,
  onChange,
  filteredPaperCount,
  filteredAffiliationCount,
}: FiltersPanelProps) {
  const bounds = yearBounds(papers)
  const activeCount = activeFilterCount(filters)
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-950">Global filters</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {activeCount} active filters · {formatNumber(filteredPaperCount)} papers ·{' '}
            {formatNumber(filteredAffiliationCount)} affiliation rows
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => onChange(emptyFilters())}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-800">Papers</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Start year
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2"
                value={filters.yearFrom ?? ''}
                onChange={(event) =>
                  update(
                    'yearFrom',
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              >
                <option value="">All</option>
                {bounds.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              End year
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2"
                value={filters.yearTo ?? ''}
                onChange={(event) =>
                  update('yearTo', event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">All</option>
                {bounds.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Search title, abstract, and keywords
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              value={filters.paperText}
              onChange={(event) => update('paperText', event.target.value)}
              placeholder="e.g., testing, architecture, LLM"
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <MultiSelect
              label="Document Type"
              options={optionValues(papers, (paper) => paper.documentType)}
              values={filters.documentTypes}
              onChange={(values) => update('documentTypes', values)}
            />
            <MultiSelect
              label="Research Type"
              options={optionValues(papers, (paper) => paper.researchType)}
              values={filters.researchTypes}
              onChange={(values) => update('researchTypes', values)}
            />
            <MultiSelect
              label="SWEBOK"
              options={optionValues(papers, (paper) => paper.swebok)}
              values={filters.swebokAreas}
              onChange={(values) => update('swebokAreas', values)}
              searchable
            />
            <MultiSelect
              label="Source Title"
              options={optionValues(papers, (paper) => paper.sourceTitle)}
              values={filters.sourceTitles}
              onChange={(values) => update('sourceTitles', values)}
              searchable
            />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-800">Affiliations</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <AutocompleteMultiSelect
              label="Authors"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.author,
              )}
              values={filters.authorNames}
              onChange={(values) => update('authorNames', values)}
              placeholder="Type an author name"
            />
            <AutocompleteMultiSelect
              label="Institutions"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.institution,
              )}
              values={filters.institutionNames}
              onChange={(values) => update('institutionNames', values)}
              placeholder="Type an institution name"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <MultiSelect
              label="Country"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.country,
              )}
              values={filters.countries}
              onChange={(values) => update('countries', values)}
              searchable
            />
            <MultiSelect
              label="Type of Institution"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.institutionType,
              )}
              values={filters.institutionTypes}
              onChange={(values) => update('institutionTypes', values)}
            />
            <MultiSelect
              label="Public/Private"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.publicPrivate,
              )}
              values={filters.publicPrivate}
              onChange={(values) => update('publicPrivate', values)}
            />
            <MultiSelect
              label="Profit/Non-profit"
              options={affiliationOptionValues(
                affiliations,
                (affiliation) => affiliation.profitNonProfit,
              )}
              values={filters.profitNonProfit}
              onChange={(values) => update('profitNonProfit', values)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
