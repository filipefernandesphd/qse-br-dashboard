import type { Affiliation, Paper } from '../types/data'

export interface Filters {
  yearFrom: number | null
  yearTo: number | null
  documentTypes: string[]
  researchTypes: string[]
  swebokAreas: string[]
  sourceTitles: string[]
  paperText: string
  countries: string[]
  institutionTypes: string[]
  publicPrivate: string[]
  profitNonProfit: string[]
  authorNames: string[]
  institutionNames: string[]
}

export interface FilteredData {
  papers: Paper[]
  affiliations: Affiliation[]
}

export const emptyFilters = (): Filters => ({
  yearFrom: null,
  yearTo: null,
  documentTypes: [],
  researchTypes: [],
  swebokAreas: [],
  sourceTitles: [],
  paperText: '',
  countries: [],
  institutionTypes: [],
  publicPrivate: [],
  profitNonProfit: [],
  authorNames: [],
  institutionNames: [],
})

const canonical = (value: string) => value.trim().toLocaleLowerCase()

const selectedHas = (selected: string[], value: string) => {
  if (selected.length === 0) {
    return true
  }

  const normalized = canonical(value)
  return selected.some((item) => canonical(item) === normalized)
}

const textIncludes = (haystack: string, needle: string) =>
  canonical(haystack).includes(canonical(needle))

const hasAffiliationFilter = (filters: Filters) =>
  filters.countries.length > 0 ||
  filters.institutionTypes.length > 0 ||
  filters.publicPrivate.length > 0 ||
  filters.profitNonProfit.length > 0 ||
  filters.authorNames.length > 0 ||
  filters.institutionNames.length > 0

const paperMatches = (paper: Paper, filters: Filters) => {
  if (filters.yearFrom != null && (paper.year == null || paper.year < filters.yearFrom)) {
    return false
  }

  if (filters.yearTo != null && (paper.year == null || paper.year > filters.yearTo)) {
    return false
  }

  if (!selectedHas(filters.documentTypes, paper.documentType)) {
    return false
  }

  if (!selectedHas(filters.researchTypes, paper.researchType)) {
    return false
  }

  if (!selectedHas(filters.swebokAreas, paper.swebok)) {
    return false
  }

  if (!selectedHas(filters.sourceTitles, paper.sourceTitle)) {
    return false
  }

  const paperText = filters.paperText.trim()
  if (paperText) {
    const searchable = [paper.title, paper.abstract, ...paper.keywords].join(' ')
    if (!textIncludes(searchable, paperText)) {
      return false
    }
  }

  return true
}

const affiliationMatches = (affiliation: Affiliation, filters: Filters) => {
  if (!selectedHas(filters.countries, affiliation.country)) {
    return false
  }

  if (!selectedHas(filters.institutionTypes, affiliation.institutionType)) {
    return false
  }

  if (!selectedHas(filters.publicPrivate, affiliation.publicPrivate)) {
    return false
  }

  if (!selectedHas(filters.profitNonProfit, affiliation.profitNonProfit)) {
    return false
  }

  if (!selectedHas(filters.authorNames, affiliation.author)) {
    return false
  }

  if (!selectedHas(filters.institutionNames, affiliation.institution)) {
    return false
  }

  return true
}

export const applyFilters = (papers: Paper[], filters: Filters): FilteredData => {
  const affiliationFilterActive = hasAffiliationFilter(filters)
  const filteredPapers = papers.filter((paper) => {
    if (!paperMatches(paper, filters)) {
      return false
    }

    if (!affiliationFilterActive) {
      return true
    }

    return paper.affiliations.some((affiliation) =>
      affiliationMatches(affiliation, filters),
    )
  })

  const filteredAffiliations = filteredPapers.flatMap((paper) =>
    affiliationFilterActive
      ? paper.affiliations.filter((affiliation) =>
          affiliationMatches(affiliation, filters),
        )
      : paper.affiliations,
  )

  return {
    papers: filteredPapers,
    affiliations: filteredAffiliations,
  }
}

export const activeFilterCount = (filters: Filters) => {
  let count = 0
  const countArray = (values: string[]) => {
    if (values.length > 0) {
      count += 1
    }
  }

  if (filters.yearFrom != null || filters.yearTo != null) {
    count += 1
  }
  countArray(filters.documentTypes)
  countArray(filters.researchTypes)
  countArray(filters.swebokAreas)
  countArray(filters.sourceTitles)
  countArray(filters.countries)
  countArray(filters.institutionTypes)
  countArray(filters.publicPrivate)
  countArray(filters.profitNonProfit)
  countArray(filters.authorNames)
  countArray(filters.institutionNames)
  if (filters.paperText.trim()) {
    count += 1
  }

  return count
}
