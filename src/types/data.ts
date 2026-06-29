export interface Affiliation {
  round: string
  id: string
  author: string
  institution: string
  institutionType: string
  publicPrivate: string
  profitNonProfit: string
  country: string
}

export interface Paper {
  round: string
  id: string
  title: string
  abstract: string
  keywords: string[]
  year: number | null
  sourceTitle: string
  documentType: string
  researchType: string
  swebok: string
  affiliations: Affiliation[]
  countries: string[]
  institutions: string[]
}

export interface IntegrityReport {
  orphanAffiliations: Affiliation[]
  papersWithoutAffiliations: Paper[]
  duplicatePaperIds: string[]
}

export interface DashboardData {
  papers: Paper[]
  affiliations: Affiliation[]
  integrity: IntegrityReport
}

export interface CountDatum {
  name: string
  value: number
}

export interface YearCountDatum {
  year: string
  value: number
}

export interface MatrixDatum {
  row: string
  column: string
  value: number
}

export interface StackedYearDatum {
  year: string
  [key: string]: string | number
}
