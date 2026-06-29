import { AlertTriangle, BarChart3, FileText, GitBranch, Loader2, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { loadDashboardData } from './lib/csv'
import { kpiSummary } from './lib/aggregations'
import { applyFilters, emptyFilters, type Filters } from './state/filters'
import type { DashboardData } from './types/data'
import { FiltersPanel } from './components/filters/FiltersPanel'
import { KpiCards } from './components/kpis/KpiCards'
import { formatNumber } from './components/charts/chartUtils'
import { DirectoryLists } from './components/table/DirectoryLists'
import { AffiliationsView } from './pages/AffiliationsView'
import { CrossView } from './pages/CrossView'
import { PapersView } from './pages/PapersView'

type Tab = 'papers' | 'affiliations' | 'cross'

const tabs: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'papers', label: 'Papers', icon: FileText },
  { id: 'affiliations', label: 'Affiliations', icon: Users },
  { id: 'cross', label: 'Cross-analysis', icon: GitBranch },
]

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [filters, setFilters] = useState<Filters>(() => emptyFilters())
  const [activeTab, setActiveTab] = useState<Tab>('papers')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const loadedData = await loadDashboardData()
        if (!cancelled) {
          setData(loadedData)
          setError(null)
        }
      } catch (currentError) {
        if (!cancelled) {
          setError(
            currentError instanceof Error
              ? currentError.message
              : 'Unexpected error while loading the CSV files.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () => (data ? applyFilters(data.papers, filters) : { papers: [], affiliations: [] }),
    [data, filters],
  )
  const summary = useMemo(() => kpiSummary(filtered.papers), [filtered.papers])
  const integrityIssues = data
    ? data.integrity.orphanAffiliations.length +
      data.integrity.papersWithoutAffiliations.length +
      data.integrity.duplicatePaperIds.length
    : 0

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-semibold text-slate-950">Loading dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Reading `papers.csv` and `affiliations.csv` from `public/data`.
          </p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-semibold text-slate-950">
            Unable to load the data
          </h1>
          <p className="mt-2 text-sm text-slate-700">{error}</p>
          <p className="mt-3 text-sm text-slate-600">
            Check whether `public/data/papers.csv` and
            `public/data/affiliations.csv` exist in the build.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                Interactive SLR dashboard
              </div>
              <h1 className="mt-2 max-w-4xl text-2xl font-semibold text-slate-950 sm:text-3xl">
                Towards a Brazilian Research Agenda in Quantum Software Engineering
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Client-side exploration of paper metadata and affiliations, with
                global filters and explicit counting units.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:min-w-96">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="block text-slate-500">Papers</span>
                <strong className="text-lg text-slate-950">
                  {formatNumber(data.papers.length)}
                </strong>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="block text-slate-500">Affiliation rows</span>
                <strong className="text-lg text-slate-950">
                  {formatNumber(data.affiliations.length)}
                </strong>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="block text-slate-500">Filtered</span>
                <strong className="text-lg text-slate-950">
                  {formatNumber(filtered.papers.length)}
                </strong>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="block text-slate-500">Integrity</span>
                <strong className="text-lg text-slate-950">
                  {integrityIssues === 0 ? 'OK' : formatNumber(integrityIssues)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        {integrityIssues > 0 && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>
                Referential integrity: {data.integrity.orphanAffiliations.length}{' '}
                affiliation rows without a matching paper,{' '}
                {data.integrity.papersWithoutAffiliations.length} papers without
                affiliations, and {data.integrity.duplicatePaperIds.length} duplicate
                paper IDs.
              </p>
            </div>
          </section>
        )}

        <FiltersPanel
          papers={data.papers}
          affiliations={data.affiliations}
          filters={filters}
          onChange={setFilters}
          filteredPaperCount={filtered.papers.length}
          filteredAffiliationCount={filtered.affiliations.length}
        />

        <KpiCards summary={summary} />

        {filtered.papers.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">No results</h2>
            <p className="mt-2 text-sm text-slate-600">
              The current filters returned no papers. Adjust the filters or clear the
              selection.
            </p>
          </section>
        ) : (
          <>
            <nav
              className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
              aria-label="Dashboard tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`inline-flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                      active
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {activeTab === 'papers' && <PapersView papers={filtered.papers} />}
            {activeTab === 'affiliations' && (
              <AffiliationsView
                papers={filtered.papers}
                affiliations={filtered.affiliations}
              />
            )}
            {activeTab === 'cross' && <CrossView papers={filtered.papers} />}

            <DirectoryLists affiliations={filtered.affiliations} />
          </>
        )}
      </div>
    </main>
  )
}

export default App
