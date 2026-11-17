import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { formatDateTime } from '../utils/date'

export interface DatePickerProps {
  /** Selected date as `YYYY-MM-DD` (time suffix is ignored). */
  value?: string
  /** Called with `YYYY-MM-DD`, or an empty string when cleared. */
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Extra classes for the trigger wrapper. */
  className?: string
}

interface Cell {
  date: Date
  day: number
  offset: -1 | 0 | 1
  key: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

function parseDate(value?: string) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : null
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthLabel(date: Date) {
  return `${date.getFullYear()} ${MONTHS[date.getMonth()]}`
}

function isSameDay(a: Date | null, b: Date | null) {
  return Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  )
}

function buildCells(month: Date): Cell[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const first = new Date(year, monthIndex, 1)
  const gridStart = new Date(year, monthIndex, 1 - first.getDay())
  const cells: Cell[] = []

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    )
    const offset: -1 | 0 | 1 =
      date.getFullYear() === year && date.getMonth() === monthIndex
        ? 0
        : date < first
          ? -1
          : 1
    cells.push({
      date,
      day: date.getDate(),
      offset,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    })
  }

  return cells
}

function chunk(cells: Cell[]) {
  const rows: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

const navButtonClasses =
  'border-none bg-transparent p-0 text-sm leading-none text-ink transition-colors duration-200 hover:text-brand'

function DatePicker({
  value,
  onChange,
  placeholder = 'Please select a date',
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(parseDate(value) ?? new Date()),
  )
  const [panelStyle, setPanelStyle] = useState({ top: -9999, left: -9999 })
  const [openAbove, setOpenAbove] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const selected = parseDate(value)
  const display = selected ? formatDateTime(selected) : ''
  const weeks = useMemo(() => chunk(buildCells(viewMonth)), [viewMonth])

  useLayoutEffect(() => {
    if (!open) return

    const positionPanel = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return

      const triggerRect = trigger.getBoundingClientRect()
      const panelHeight = panel.offsetHeight
      const panelWidth = panel.offsetWidth
      const margin = 8
      const above = panelHeight > window.innerHeight - triggerRect.bottom - margin

      setOpenAbove(above)
      setPanelStyle({
        top: above
          ? Math.max(margin, triggerRect.top - panelHeight - margin)
          : triggerRect.bottom + margin,
        left: Math.max(
          margin,
          Math.min(
            triggerRect.left + (triggerRect.width - panelWidth) / 2,
            window.innerWidth - panelWidth - margin,
          ),
        ),
      })
    }

    positionPanel()

    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onReflow = () => positionPanel()

    document.addEventListener('mousedown', onDocMouseDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open])

  const commit = (next: string) => {
    onChange?.(next)
    setOpen(false)
  }

  const togglePanel = () => {
    if (disabled) return
    if (open) {
      setOpen(false)
      return
    }
    setViewMonth(startOfMonth(parseDate(value) ?? new Date()))
    setOpen(true)
  }

  const pickDay = (date: Date) => {
    const inView =
      date.getFullYear() === viewMonth.getFullYear() &&
      date.getMonth() === viewMonth.getMonth()
    if (!inView) setViewMonth(startOfMonth(date))
    commit(formatDate(date))
  }

  const pickToday = () => {
    const now = new Date()
    commit(
      formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate())),
    )
  }

  const clearDate = () => commit('')

  const cellClasses = (cell: Cell) =>
    cell.offset === 0
      ? 'group h-[30px] cursor-pointer p-0 text-center align-middle'
      : 'h-[30px] cursor-default p-0 text-center align-middle'

  const dayClasses = (cell: Cell) => {
    const classes = [
      'inline-block size-6 rounded-full leading-6 transition-colors duration-150',
    ]

    if (isSameDay(cell.date, selected)) {
      classes.push('bg-brand text-white group-hover:bg-brand')
    } else if (cell.offset !== 0) {
      classes.push('text-[#c0c4cc]')
    } else {
      classes.push('text-btn-ghost group-hover:bg-page')
      if (isSameDay(cell.date, new Date())) {
        classes.push('font-bold text-brand')
      }
    }

    return classes.join(' ')
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block w-[220px] max-w-full ${className}`}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        aria-disabled={disabled || undefined}
        onClick={togglePanel}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            togglePanel()
          }
        }}
        className={[
          'flex h-8 w-full items-center rounded border bg-white px-2.5',
          'transition-[border-color,box-shadow] duration-200',
          open
            ? 'border-brand shadow-[0_0_0_2px_#f0c078]'
            : 'border-btn-border hover:border-[#c0c4cc]',
          disabled ? 'cursor-not-allowed bg-page' : 'cursor-pointer',
        ].join(' ')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mr-2 shrink-0 text-[#c0c4cc]"
        >
          <circle
            cx="12"
            cy="12"
            r="8.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 7.5V12l3 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          className="min-w-0 flex-1 border-none bg-transparent p-0 text-xs leading-[30px] text-btn-ghost outline-none placeholder:text-[#c0c4cc]"
          value={display}
          placeholder={placeholder}
          readOnly
          tabIndex={-1}
          disabled={disabled}
          aria-label={placeholder}
        />
        {display && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={(event) => {
              event.stopPropagation()
              clearDate()
            }}
            className="ml-1 inline-flex shrink-0 cursor-pointer items-center text-[#c0c4cc] hover:text-ink-soft"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Choose a date"
            style={{ top: panelStyle.top, left: panelStyle.left }}
            className="fixed z-[2052] w-[322px] max-w-[calc(100vw-16px)] rounded border-[0.8px] border-card-border bg-white text-sm leading-[30px] text-btn-ghost shadow-[0_2px_12px_rgba(0,0,0,0.1)] animate-[picker-fade_0.2s_ease]"
          >
            <span
              aria-hidden="true"
              className={[
                'absolute left-[35px] size-3 rotate-45 border-card-border bg-white',
                openAbove
                  ? '-bottom-1.5 border-r-[0.8px] border-b-[0.8px]'
                  : '-top-1.5 border-t-[0.8px] border-l-[0.8px]',
              ].join(' ')}
            />
            <div className="flex h-10 items-center justify-between px-3">
              <span className="inline-flex min-w-12 items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Previous year"
                  className={navButtonClasses}
                  onClick={() => setViewMonth(addMonths(viewMonth, -12))}
                >
                  «
                </button>
                <button
                  type="button"
                  aria-label="Previous month"
                  className={navButtonClasses}
                  onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                >
                  ‹
                </button>
              </span>
              <span className="flex-1 whitespace-nowrap text-center text-sm font-medium text-ink">
                {monthLabel(viewMonth)}
              </span>
              <span className="inline-flex min-w-12 items-center justify-end gap-2.5">
                <button
                  type="button"
                  aria-label="Next month"
                  className={navButtonClasses}
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                >
                  ›
                </button>
                <button
                  type="button"
                  aria-label="Next year"
                  className={navButtonClasses}
                  onClick={() => setViewMonth(addMonths(viewMonth, 12))}
                >
                  »
                </button>
              </span>
            </div>

            <table className="w-full table-fixed border-collapse text-xs select-none">
              <tbody>
                <tr>
                  {WEEKDAYS.map((weekday) => (
                    <th
                      key={weekday}
                      className="border-b border-[#ebeef5] py-[5px] text-center text-xs font-normal text-btn-ghost"
                    >
                      {weekday}
                    </th>
                  ))}
                </tr>
                {weeks.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell) => (
                      <td
                        key={cell.key}
                        className={cellClasses(cell)}
                        onClick={() => pickDay(cell.date)}
                      >
                        <div className="box-border h-[30px] py-[3px]">
                          <span className={dayClasses(cell)}>{cell.day}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#e4e4e4] bg-white px-3 py-2">
              <button
                type="button"
                onClick={clearDate}
                className="h-7 cursor-pointer rounded border-none bg-transparent px-3 text-xs leading-none text-brand transition-colors duration-200 hover:text-brand-active"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={pickToday}
                className="h-7 cursor-pointer rounded border border-btn-border bg-white px-3 text-xs leading-none text-btn-ghost transition-colors duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default DatePicker
