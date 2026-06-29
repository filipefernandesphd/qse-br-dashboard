import Papa from 'papaparse'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Paper } from '../../types/data'
import { formatNumber } from '../charts/chartUtils'

type SortKey =
  | 'id'
  | 'year'
  | 'title'
  | 'sourceTitle'
  | 'documentType'
  | 'researchType'
  | 'swebok'

interface DataTableProps {
  papers: Paper[]
}

const pageSize = 12

const sortValue = (paper: Paper, key: SortKey) => {
  const value = paper[key]
  return value == null ? '' : String(value)
}

const uniqueSorted = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const paperAuthors = (paper: Paper) =>
  uniqueSorted(paper.affiliations.map((affiliation) => affiliation.author)).join('; ')

export function DataTable({ papers }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('year')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set())

  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) => {
      const aValue = sortValue(a, sortKey)
      const bValue = sortValue(b, sortKey)
      const comparison =
        sortKey === 'year'
          ? Number(a.year ?? 0) - Number(b.year ?? 0)
          : aValue.localeCompare(bValue)

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [papers, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedPapers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visiblePapers = sortedPapers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortKey(key)
    setSortDirection(key === 'year' ? 'desc' : 'asc')
  }

  const toggleAbstract = (id: string) => {
    const next = new Set(expandedAbstracts)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedAbstracts(next)
  }

  const exportCsv = () => {
    const rows = sortedPapers.map((paper) => ({
      Round: paper.round,
      ID: paper.id,
      TITLE: paper.title,
      ABSTRACT: paper.abstract,
      KEYWORDS: paper.keywords.join('; '),
      YEAR: paper.year ?? '',
      'SOURCE TITLE': paper.sourceTitle,
      'DOCUMENT TYPE': paper.documentType,
      'Research Type': paper.researchType,
      SWEBOK: paper.swebok,
      Authors: paperAuthors(paper),
      Countries: paper.countries.join('; '),
      Institutions: paper.institutions.join('; '),
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qse-filtered-papers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: 'id', label: 'ID' },
    { key: 'year', label: 'Year' },
    { key: 'title', label: 'Title' },
    { key: 'sourceTitle', label: 'Venue' },
    { key: 'documentType', label: 'Document' },
    { key: 'researchType', label: 'Research Type' },
    { key: 'swebok', label: 'SWEBOK' },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Papers table</h3>
          <p className="mt-1 text-sm text-slate-600">
            {formatNumber(sortedPapers.length)} filtered papers, with authors,
            countries, and institutions derived from the join.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          onClick={exportCsv}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="px-3 py-2 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => changeSort(header.key)}
                  >
                    {header.label}
                    {sortKey === header.key &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-3 w-3" aria-hidden="true" />
                      ))}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Authors</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Countries</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">
                Institutions
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Abstract</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visiblePapers.map((paper) => {
              const expanded = expandedAbstracts.has(paper.id)
              const abstract =
                paper.abstract || 'No abstract is available in the CSV for this paper.'
              const shouldTruncate = abstract.length > 180
              return (
                <tr key={paper.id} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">
                    {paper.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{paper.year ?? 'N/A'}</td>
                  <td className="min-w-72 px-3 py-3 text-slate-900">{paper.title}</td>
                  <td className="min-w-64 px-3 py-3">{paper.sourceTitle}</td>
                  <td className="min-w-36 px-3 py-3">{paper.documentType}</td>
                  <td className="min-w-44 px-3 py-3">{paper.researchType}</td>
                  <td className="min-w-56 px-3 py-3">{paper.swebok}</td>
                  <td className="min-w-64 px-3 py-3">{paperAuthors(paper)}</td>
                  <td className="min-w-48 px-3 py-3">{paper.countries.join('; ')}</td>
                  <td className="min-w-64 px-3 py-3">
                    {paper.institutions.join('; ')}
                  </td>
                  <td className="min-w-80 px-3 py-3 text-slate-600">
                    {expanded || !shouldTruncate ? abstract : `${abstract.slice(0, 180)}...`}
                    {shouldTruncate && (
                      <button
                        type="button"
                        className="ml-2 font-medium text-blue-700 hover:text-blue-900"
                        onClick={() => toggleAbstract(paper.id)}
                      >
                        {expanded ? 'collapse' : 'expand'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
