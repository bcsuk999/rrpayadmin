import { useEffect, useRef, useState, type FormEvent } from 'react'
import SelectDropdown from './SelectDropdown'
import { useToast } from './Toast'

export interface PaginationProps {
  page: number
  totalPages: number
  total?: number | null
  disabled?: boolean
  directInput?: boolean
  showPageSizes?: boolean
  pageSize?: number
  pageSizes?: number[]
  onChange?: (page: number) => void
  onSizeChange?: (size: number) => void
  className?: string
}

export default function Pagination({
  page,
  totalPages,
  disabled = false,
  directInput = false,
  showPageSizes = false,
  pageSize = 10,
  pageSizes = [10, 20, 50, 100],
  onChange,
  onSizeChange,
  className = '',
}: PaginationProps) {
  const toast = useToast()
  const normalizedTotalPages = Math.max(1, Number(totalPages) || 1)
  const inputId = useRef(`pagination-page-${Math.random().toString(36).slice(2)}`)
  const sizeInputId = useRef(`pagination-size-${Math.random().toString(36).slice(2)}`)

  const [inputPage, setInputPage] = useState(String(page))
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize)

  useEffect(() => {
    setInputPage(String(page))
  }, [page])

  useEffect(() => {
    setSelectedPageSize(pageSize)
  }, [pageSize])

  const pageSizeOptions = pageSizes.map((size) => ({
    value: size,
    label: `${size}/page`,
  }))

  const limitPageInput = (event: FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const value = Number(target.value)
    if (target.value && Number.isFinite(value) && value > normalizedTotalPages) {
      const maximumPage = String(normalizedTotalPages)
      setInputPage(maximumPage)
      target.value = maximumPage
      toast.warning(`Page number cannot exceed ${maximumPage}.`)
    }
  }

  const commitPage = () => {
    const value = Number(inputPage)
    if (!inputPage || !Number.isFinite(value)) {
      setInputPage(String(page))
      return
    }
    const next = Math.min(normalizedTotalPages, Math.max(1, Math.trunc(value)))
    setInputPage(String(next))
    if (next !== page) onChange?.(next)
  }

  if (!directInput && normalizedTotalPages <= 1) return null

  return (
    <nav
      className={['pagination flex items-center justify-center gap-1 flex-wrap', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Pagination"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1 || disabled}
        onClick={() => onChange?.(page - 1)}
        className="btn btn-ghost btn-sm inline-flex items-center justify-center min-w-8 h-8 px-1 rounded border border-btn-border bg-white text-btn-ghost hover:text-brand hover:bg-brand-soft disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {page > 1 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(page - 1)}
          className="page-btn min-w-8 h-8 px-2 rounded border border-card-border bg-white text-ink text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {page - 1}
        </button>
      )}
      <button
        type="button"
        aria-current="page"
        disabled={disabled}
        className="page-btn min-w-8 h-8 px-2 rounded border border-brand bg-brand text-white text-sm font-medium"
      >
        {page}
      </button>
      {page < normalizedTotalPages && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(page + 1)}
          className="page-btn min-w-8 h-8 px-2 rounded border border-card-border bg-white text-ink text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {page + 1}
        </button>
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= normalizedTotalPages || disabled}
        onClick={() => onChange?.(page + 1)}
        className="btn btn-ghost btn-sm inline-flex items-center justify-center min-w-8 h-8 px-1 rounded border border-btn-border bg-white text-btn-ghost hover:text-brand hover:bg-brand-soft disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {showPageSizes && (
        <label className="page-size ml-2 inline-flex items-center" htmlFor={sizeInputId.current}>
          <SelectDropdown
            id={sizeInputId.current}
            value={selectedPageSize}
            onChange={(v) => {
              const n = Number(v)
              setSelectedPageSize(n)
              if (n !== pageSize) onSizeChange?.(n)
            }}
            options={pageSizeOptions}
            placement="top"
            disabled={disabled}
            ariaLabel="Rows per page"
            className="w-[110px]"
          />
        </label>
      )}
      {directInput && (
        <label className="page-jump ml-2 inline-flex items-center gap-1.5 text-xs text-ink-soft whitespace-nowrap" htmlFor={inputId.current}>
          Go to
          <input
            id={inputId.current}
            type="number"
            inputMode="numeric"
            min={1}
            max={normalizedTotalPages}
            disabled={disabled}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onInput={limitPageInput}
            onBlur={commitPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitPage()
            }}
            className="page-input w-[52px] h-[30px] px-1 border border-btn-border rounded-md bg-white text-ink font-semibold text-center"
          />
        </label>
      )}
    </nav>
  )
}
