import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

interface MultiSelectProps {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
  searchable?: boolean
}

export function MultiSelect({
  label,
  options,
  values,
  onChange,
  searchable = false,
}: MultiSelectProps) {
  const [query, setQuery] = useState('')
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) =>
      option.toLocaleLowerCase().includes(normalizedQuery),
    )
  }, [options, query])

  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option))
      return
    }

    onChange([...values, option])
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {values.length > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-blue-700 hover:text-blue-900"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        )}
      </div>
      {searchable && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-2">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 border-0 py-2 text-sm outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search option"
          />
        </div>
      )}
      <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1">
        {filteredOptions.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700"
              checked={values.includes(option)}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
        {filteredOptions.length === 0 && (
          <p className="px-2 py-3 text-sm text-slate-500">No option found.</p>
        )}
      </div>
    </div>
  )
}
