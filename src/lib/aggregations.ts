import type {
  Affiliation,
  CountDatum,
  MatrixDatum,
  Paper,
  StackedYearDatum,
  YearCountDatum,
} from '../types/data'

export const EMPTY_LABEL = 'N/A'

export interface KpiSummary {
  totalPapers: number
  yearRange: string
  distinctVenues: number
  distinctSwebok: number
  distinctInstitutions: number
  distinctCountries: number
  internationalCollaborationPercent: number
}

export interface StackedSeries {
  data: StackedYearDatum[]
  keys: string[]
}

export interface MatrixSummary {
  rows: string[]
  columns: string[]
  cells: MatrixDatum[]
  max: number
}

const canonical = (value: string) => value.trim().toLocaleLowerCase()

const label = (value: string | null | undefined) => {
  const cleaned = String(value ?? '').trim()
  return cleaned || EMPTY_LABEL
}

const yearLabel = (year: number | null) => (year == null ? EMPTY_LABEL : String(year))

const sortCounts = (items: CountDatum[]) =>
  [...items].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))

const addToSetMap = (map: Map<string, Set<string>>, key: string, id: string) => {
  const current = map.get(key) ?? new Set<string>()
  current.add(id)
  map.set(key, current)
}

export const uniqueSorted = (values: string[]) => {
  const byKey = new Map<string, string>()

  for (const value of values) {
    const current = label(value)
    const key = canonical(current)
    if (!byKey.has(key)) {
      byKey.set(key, current)
    }
  }

  return [...byKey.values()].sort((a, b) => a.localeCompare(b))
}

export const optionValues = (papers: Paper[], selector: (paper: Paper) => string) =>
  uniqueSorted(papers.map(selector))

export const affiliationOptionValues = (
  affiliations: Affiliation[],
  selector: (affiliation: Affiliation) => string,
) => uniqueSorted(affiliations.map(selector))

export const yearBounds = (papers: Paper[]) => {
  const years = papers
    .map((paper) => paper.year)
    .filter((year): year is number => year != null)
    .sort((a, b) => a - b)

  return {
    min: years[0] ?? null,
    max: years.at(-1) ?? null,
    years: [...new Set(years)],
  }
}

export const countByPaperField = (
  papers: Paper[],
  selector: (paper: Paper) => string,
) => {
  const counts = new Map<string, number>()

  for (const paper of papers) {
    const key = label(selector(paper))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return sortCounts([...counts].map(([name, value]) => ({ name, value })))
}

export const countByAffiliationField = (
  affiliations: Affiliation[],
  selector: (affiliation: Affiliation) => string,
) => {
  const counts = new Map<string, number>()

  for (const affiliation of affiliations) {
    const key = label(selector(affiliation))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return sortCounts([...counts].map(([name, value]) => ({ name, value })))
}

export const countPaperArrayField = (
  papers: Paper[],
  selector: (paper: Paper) => string[],
) => {
  const idsByValue = new Map<string, Set<string>>()

  for (const paper of papers) {
    for (const value of uniqueSorted(selector(paper))) {
      addToSetMap(idsByValue, label(value), paper.id)
    }
  }

  return sortCounts(
    [...idsByValue].map(([name, ids]) => ({ name, value: ids.size })),
  )
}

export const yearCounts = (papers: Paper[]): YearCountDatum[] => {
  const counts = new Map<string, number>()

  for (const paper of papers) {
    const key = yearLabel(paper.year)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts]
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => Number(a.year) - Number(b.year))
}

export const keywordCounts = (papers: Paper[]) => {
  const counts = new Map<string, number>()

  for (const paper of papers) {
    for (const keyword of paper.keywords) {
      const key = label(keyword)
      if (key !== EMPTY_LABEL) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }

  return sortCounts([...counts].map(([name, value]) => ({ name, value })))
}

export const kpiSummary = (papers: Paper[]): KpiSummary => {
  const years = papers
    .map((paper) => paper.year)
    .filter((year): year is number => year != null)
  const distinctVenues = uniqueSorted(papers.map((paper) => paper.sourceTitle)).length
  const distinctSwebok = uniqueSorted(papers.map((paper) => paper.swebok)).length
  const distinctInstitutions = uniqueSorted(papers.flatMap((paper) => paper.institutions))
    .filter((item) => item !== EMPTY_LABEL).length
  const distinctCountries = uniqueSorted(papers.flatMap((paper) => paper.countries))
    .filter((item) => item !== EMPTY_LABEL).length
  const international = papers.filter(
    (paper) => paper.countries.filter((country) => country !== EMPTY_LABEL).length > 1,
  ).length

  return {
    totalPapers: papers.length,
    yearRange:
      years.length === 0 ? 'N/A' : `${Math.min(...years)}-${Math.max(...years)}`,
    distinctVenues,
    distinctSwebok,
    distinctInstitutions,
    distinctCountries,
    internationalCollaborationPercent:
      papers.length === 0 ? 0 : (international / papers.length) * 100,
  }
}

export const articlesByCountryYear = (
  papers: Paper[],
  topN: number,
): StackedSeries => {
  const topCountries = countPaperArrayField(papers, (paper) => paper.countries)
    .filter((item) => item.name !== EMPTY_LABEL)
    .slice(0, topN)
    .map((item) => item.name)
  const keys = [...topCountries, 'Other']
  const byYear = new Map<string, Record<string, number>>()

  for (const paper of papers) {
    const year = yearLabel(paper.year)
    const current = byYear.get(year) ?? {}
    const countries = uniqueSorted(paper.countries).filter(
      (country) => country !== EMPTY_LABEL,
    )

    for (const country of countries) {
      const key = topCountries.includes(country) ? country : 'Other'
      current[key] = (current[key] ?? 0) + 1
    }

    byYear.set(year, current)
  }

  const data = [...byYear]
    .map(([year, values]) => {
      const row: StackedYearDatum = { year }
      for (const key of keys) {
        row[key] = values[key] ?? 0
      }
      return row
    })
    .sort((a, b) => Number(a.year) - Number(b.year))

  return {
    data,
    keys: keys.filter((key) => data.some((row) => Number(row[key] ?? 0) > 0)),
  }
}

export const swebokCountryMatrix = (
  papers: Paper[],
  topN: number,
): MatrixSummary => {
  const columns = countPaperArrayField(papers, (paper) => paper.countries)
    .filter((item) => item.name !== EMPTY_LABEL)
    .slice(0, topN)
    .map((item) => item.name)
  const rows = countByPaperField(papers, (paper) => paper.swebok).map(
    (item) => item.name,
  )
  const idsByCell = new Map<string, Set<string>>()

  for (const paper of papers) {
    for (const country of uniqueSorted(paper.countries)) {
      if (columns.includes(country)) {
        addToSetMap(idsByCell, `${paper.swebok}||${country}`, paper.id)
      }
    }
  }

  const cells = rows.flatMap((row) =>
    columns.map((column) => ({
      row,
      column,
      value: idsByCell.get(`${row}||${column}`)?.size ?? 0,
    })),
  )

  return {
    rows,
    columns,
    cells,
    max: Math.max(0, ...cells.map((cell) => cell.value)),
  }
}

export const researchTypeInstitutionMatrix = (papers: Paper[]): MatrixSummary => {
  const rows = countByPaperField(papers, (paper) => paper.researchType).map(
    (item) => item.name,
  )
  const columns = uniqueSorted(
    papers.flatMap((paper) =>
      paper.affiliations.map((affiliation) => affiliation.institutionType),
    ),
  )
  const idsByCell = new Map<string, Set<string>>()

  for (const paper of papers) {
    const institutionTypes = uniqueSorted(
      paper.affiliations.map((affiliation) => affiliation.institutionType),
    )
    for (const institutionType of institutionTypes) {
      addToSetMap(idsByCell, `${paper.researchType}||${institutionType}`, paper.id)
    }
  }

  const cells = rows.flatMap((row) =>
    columns.map((column) => ({
      row,
      column,
      value: idsByCell.get(`${row}||${column}`)?.size ?? 0,
    })),
  )

  return {
    rows,
    columns,
    cells,
    max: Math.max(0, ...cells.map((cell) => cell.value)),
  }
}

export const collaborationByYear = (papers: Paper[]) => {
  const byYear = new Map<string, { total: number; international: number }>()

  for (const paper of papers) {
    const year = yearLabel(paper.year)
    const current = byYear.get(year) ?? { total: 0, international: 0 }
    current.total += 1
    if (paper.countries.filter((country) => country !== EMPTY_LABEL).length > 1) {
      current.international += 1
    }
    byYear.set(year, current)
  }

  return [...byYear]
    .map(([year, item]) => ({
      year,
      value: item.total === 0 ? 0 : (item.international / item.total) * 100,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year))
}

export const topCountriesForSwebok = (
  papers: Paper[],
  swebok: string,
  topN: number,
) =>
  countPaperArrayField(
    papers.filter((paper) => paper.swebok === swebok),
    (paper) => paper.countries,
  )
    .filter((item) => item.name !== EMPTY_LABEL)
    .slice(0, topN)
