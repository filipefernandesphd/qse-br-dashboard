import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface AutocompleteMultiSelectProps {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
}

export function AutocompleteMultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder,
}: AutocompleteMultiSelectProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const selectedKeys = useMemo(
    () => new Set(values.map((value) => value.toLocaleLowerCase())),
    [values],
  )
  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) {
      return []
    }

    return options
      .filter((option) => !selectedKeys.has(option.toLocaleLowerCase()))
      .filter((option) => option.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 12)
  }, [options, query, selectedKeys])

  const selectOption = (option: string) => {
    onChange([...values, option])
    setQuery('')
    setIsFocused(false)
  }

  const removeOption = (option: string) => {
    onChange(values.filter((value) => value !== option))
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

      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
            >
              <span className="truncate">{value}</span>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-blue-100"
                onClick={() => removeOption(value)}
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative mt-2">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 border-0 py-2 text-sm outline-none"
            value={query}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
            onChange={(event) => {
              setQuery(event.target.value)
              setIsFocused(true)
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
          />
        </div>

        {isFocused && query.trim() && (
          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {suggestions.length > 0 ? (
              suggestions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    selectOption(option)
                  }}
                >
                  {option}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No matching option.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
