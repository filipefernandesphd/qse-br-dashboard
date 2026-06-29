import { Building2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Affiliation } from '../../types/data'
import { formatNumber } from '../charts/chartUtils'

interface DirectoryListsProps {
  affiliations: Affiliation[]
}

interface InstitutionLink {
  institution: string
  institutionType: string
  publicPrivate: string
  profitNonProfit: string
  country: string
}

interface AuthorItem {
  author: string
  institutions: InstitutionLink[]
  paperIds: string[]
  affiliationRows: number
}

interface InstitutionItem extends InstitutionLink {
  authors: string[]
  paperIds: string[]
  affiliationRows: number
}

const canonical = (value: string) => value.trim().toLocaleLowerCase()

const linkKey = (link: InstitutionLink) =>
  [
    link.institution,
    link.institutionType,
    link.publicPrivate,
    link.profitNonProfit,
    link.country,
  ]
    .map(canonical)
    .join('||')

const makeLink = (affiliation: Affiliation): InstitutionLink => ({
  institution: affiliation.institution,
  institutionType: affiliation.institutionType,
  publicPrivate: affiliation.publicPrivate,
  profitNonProfit: affiliation.profitNonProfit,
  country: affiliation.country,
})

const formatInstitutionLink = (link: InstitutionLink) =>
  `${link.institution} (${link.country}; ${link.institutionType}; ${link.publicPrivate}; ${link.profitNonProfit})`

export function DirectoryLists({ affiliations }: DirectoryListsProps) {
  const [authorQuery, setAuthorQuery] = useState('')
  const [institutionQuery, setInstitutionQuery] = useState('')

  const authors = useMemo<AuthorItem[]>(() => {
    const byAuthor = new Map<
      string,
      {
        author: string
        institutions: Map<string, InstitutionLink>
        paperIds: Set<string>
        affiliationRows: number
      }
    >()

    for (const affiliation of affiliations) {
      const author = affiliation.author || 'N/A'
      const key = canonical(author)
      const current =
        byAuthor.get(key) ??
        {
          author,
          institutions: new Map<string, InstitutionLink>(),
          paperIds: new Set<string>(),
          affiliationRows: 0,
        }
      const link = makeLink(affiliation)
      current.institutions.set(linkKey(link), link)
      current.paperIds.add(affiliation.id)
      current.affiliationRows += 1
      byAuthor.set(key, current)
    }

    return [...byAuthor.values()]
      .map((item) => ({
        author: item.author,
        institutions: [...item.institutions.values()].sort((a, b) =>
          a.institution.localeCompare(b.institution),
        ),
        paperIds: [...item.paperIds].sort(),
        affiliationRows: item.affiliationRows,
      }))
      .sort((a, b) => a.author.localeCompare(b.author))
  }, [affiliations])

  const institutions = useMemo<InstitutionItem[]>(() => {
    const byInstitution = new Map<
      string,
      InstitutionLink & {
        authors: Set<string>
        paperIds: Set<string>
        affiliationRows: number
      }
    >()

    for (const affiliation of affiliations) {
      const link = makeLink(affiliation)
      const key = linkKey(link)
      const current =
        byInstitution.get(key) ??
        {
          ...link,
          authors: new Set<string>(),
          paperIds: new Set<string>(),
          affiliationRows: 0,
        }
      current.authors.add(affiliation.author || 'N/A')
      current.paperIds.add(affiliation.id)
      current.affiliationRows += 1
      byInstitution.set(key, current)
    }

    return [...byInstitution.values()]
      .map((item) => ({
        institution: item.institution,
        institutionType: item.institutionType,
        publicPrivate: item.publicPrivate,
        profitNonProfit: item.profitNonProfit,
        country: item.country,
        authors: [...item.authors].sort((a, b) => a.localeCompare(b)),
        paperIds: [...item.paperIds].sort(),
        affiliationRows: item.affiliationRows,
      }))
      .sort((a, b) => a.institution.localeCompare(b.institution))
  }, [affiliations])

  const filteredAuthors = authors.filter((item) => {
    const query = canonical(authorQuery)
    if (!query) {
      return true
    }

    return (
      canonical(item.author).includes(query) ||
      item.institutions.some((link) => canonical(formatInstitutionLink(link)).includes(query))
    )
  })

  const filteredInstitutions = institutions.filter((item) => {
    const query = canonical(institutionQuery)
    if (!query) {
      return true
    }

    return (
      canonical(item.institution).includes(query) ||
      canonical(item.institutionType).includes(query) ||
      canonical(item.publicPrivate).includes(query) ||
      canonical(item.profitNonProfit).includes(query) ||
      canonical(item.country).includes(query)
    )
  })

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h3 className="text-base font-semibold text-slate-950">
                Authors and linked institutions
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {formatNumber(filteredAuthors.length)} authors in the current filter.
              Authors may have more than one institutional link.
            </p>
          </div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-64"
            value={authorQuery}
            onChange={(event) => setAuthorQuery(event.target.value)}
            placeholder="Search authors or institutions"
          />
        </div>
        <div className="max-h-[34rem] overflow-y-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Author</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Linked institutions
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Papers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAuthors.map((item) => (
                <tr key={item.author} className="align-top hover:bg-slate-50">
                  <td className="min-w-48 px-3 py-3 font-medium text-slate-900">
                    {item.author}
                  </td>
                  <td className="min-w-96 px-3 py-3 text-slate-700">
                    <ul className="space-y-1">
                      {item.institutions.map((link) => (
                        <li key={linkKey(link)}>{formatInstitutionLink(link)}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {formatNumber(item.paperIds.length)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h3 className="text-base font-semibold text-slate-950">
                Institutions directory
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {formatNumber(filteredInstitutions.length)} institution records in the
              current filter.
            </p>
          </div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-64"
            value={institutionQuery}
            onChange={(event) => setInstitutionQuery(event.target.value)}
            placeholder="Search institutions"
          />
        </div>
        <div className="max-h-[34rem] overflow-y-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Institution
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Type of Institution
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Public/Private
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Profit/Non-profit
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Country</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Authors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstitutions.map((item) => (
                <tr key={linkKey(item)} className="align-top hover:bg-slate-50">
                  <td className="min-w-64 px-3 py-3 font-medium text-slate-900">
                    {item.institution}
                  </td>
                  <td className="min-w-44 px-3 py-3 text-slate-700">
                    {item.institutionType}
                  </td>
                  <td className="min-w-32 px-3 py-3 text-slate-700">
                    {item.publicPrivate}
                  </td>
                  <td className="min-w-36 px-3 py-3 text-slate-700">
                    {item.profitNonProfit}
                  </td>
                  <td className="min-w-36 px-3 py-3 text-slate-700">{item.country}</td>
                  <td className="min-w-52 px-3 py-3 text-slate-700">
                    {formatNumber(item.authors.length)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
