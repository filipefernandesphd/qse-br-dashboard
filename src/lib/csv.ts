import Papa from 'papaparse'
import type { Affiliation, DashboardData, Paper } from '../types/data'

type RawRow = Record<string, string | undefined>

const EMPTY_LABEL = 'N/A'

const normalizeCell = (value: unknown) => {
  if (value == null) {
    return ''
  }

  return String(value).trim()
}

const parseTextCsv = (text: string, fileName: string): RawRow[] => {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    delimitersToGuess: [',', '\t', ';', '|'],
    transform: normalizeCell,
  })

  if (result.errors.length > 0) {
    const firstError = result.errors[0]
    throw new Error(
      `Error while parsing ${fileName}: ${firstError.message} at row ${firstError.row ?? 'unknown'}.`,
    )
  }

  return result.data.filter((row) =>
    Object.values(row).some((value) => normalizeCell(value) !== ''),
  )
}

const get = (row: RawRow, key: string) => normalizeCell(row[key])

const category = (value: string) => value || EMPTY_LABEL

const parseYear = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

const parseKeywords = (value: string) =>
  value
    .split(';')
    .map((keyword) => keyword.trim())
    .filter(Boolean)

const uniqueValues = (values: string[]) => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const label = category(value)
    const key = label.toLocaleLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(label)
    }
  }

  return result
}

const mapAffiliation = (row: RawRow): Affiliation => ({
  round: get(row, 'Round'),
  id: get(row, 'ID'),
  author: category(get(row, 'Authors')),
  institution: category(get(row, 'Institution')),
  institutionType: category(get(row, 'Type of Institution')),
  publicPrivate: category(get(row, 'Public/Private')),
  profitNonProfit: category(get(row, 'Profit/Non-profit')),
  country: category(get(row, 'Country')),
})

const mapPaper = (row: RawRow, affiliations: Affiliation[]): Paper => ({
  round: get(row, 'Round'),
  id: get(row, 'ID'),
  title: get(row, 'TITLE'),
  abstract: get(row, 'ABSTRACT'),
  keywords: parseKeywords(get(row, 'KEYWORDS')),
  year: parseYear(get(row, 'YEAR')),
  sourceTitle: category(get(row, 'SOURCE TITLE')),
  documentType: category(get(row, 'DOCUMENT TYPE')),
  researchType: category(get(row, 'Research Type')),
  swebok: category(get(row, 'SWEBOK')),
  affiliations,
  countries: uniqueValues(affiliations.map((affiliation) => affiliation.country)),
  institutions: uniqueValues(
    affiliations.map((affiliation) => affiliation.institution),
  ),
})

const fetchCsv = async (fileName: string) => {
  const url = `${import.meta.env.BASE_URL}data/${fileName}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Unable to load ${fileName} (${response.status} ${response.statusText}).`,
    )
  }

  return response.text()
}

export const loadDashboardData = async (): Promise<DashboardData> => {
  const [papersText, affiliationsText] = await Promise.all([
    fetchCsv('papers.csv'),
    fetchCsv('affiliations.csv'),
  ])

  const paperRows = parseTextCsv(papersText, 'papers.csv')
  const affiliationRows = parseTextCsv(affiliationsText, 'affiliations.csv')
  const affiliations = affiliationRows.map(mapAffiliation).filter((row) => row.id)

  const affiliationsById = new Map<string, Affiliation[]>()
  for (const affiliation of affiliations) {
    const current = affiliationsById.get(affiliation.id) ?? []
    current.push(affiliation)
    affiliationsById.set(affiliation.id, current)
  }

  const paperIds = new Set<string>()
  const duplicatePaperIds = new Set<string>()
  const papers = paperRows
    .map((row) => {
      const id = get(row, 'ID')
      if (paperIds.has(id)) {
        duplicatePaperIds.add(id)
      }
      paperIds.add(id)
      return mapPaper(row, affiliationsById.get(id) ?? [])
    })
    .filter((paper) => paper.id)

  const orphanAffiliations = affiliations.filter(
    (affiliation) => !paperIds.has(affiliation.id),
  )
  const papersWithoutAffiliations = papers.filter(
    (paper) => paper.affiliations.length === 0,
  )

  return {
    papers,
    affiliations,
    integrity: {
      orphanAffiliations,
      papersWithoutAffiliations,
      duplicatePaperIds: [...duplicatePaperIds],
    },
  }
}
