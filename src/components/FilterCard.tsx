import { useId, useState, type ReactNode } from 'react'

export interface FilterCardProps {
  /** Header title. @default 'Filters' */
  title?: ReactNode
  /** Optional line under the title. */
  description?: ReactNode
  /** Header content on the right, e.g. buttons. */
  actions?: ReactNode
  /** Body content, usually filter fields and an actions row. */
  children?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. @default true */
  defaultOpen?: boolean
  /** Called whenever the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Show the collapse/expand toggle. @default true */
  collapsible?: boolean
  className?: string
  bodyClassName?: string
}

const chevron = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function FilterCard({
  title = 'Filters',
  description,
  actions,
  children,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  collapsible = true,
  className = '',
  bodyClassName = '',
}: FilterCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const bodyId = useId()

  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const toggle = () => {
    const next = !open
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section
      className={[
        'relative block min-w-0 overflow-hidden rounded-xl border-[0.8px] border-card-border bg-white p-[15px] text-ink',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]',
        'transition-[box-shadow,border-color,background-color] duration-[250ms]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="mb-[15px] flex items-center justify-between gap-2.5 max-sm:items-start">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {description && (
            <p className="mt-1 text-[13px] text-ink-soft">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {actions}
          {collapsible && (
            <button
              type="button"
              aria-controls={bodyId}
              aria-expanded={open}
              aria-label={open ? 'Hide filters' : 'Show filters'}
              title={open ? 'Hide filters' : 'Show filters'}
              onClick={toggle}
              className="inline-flex h-6 w-8 shrink-0 cursor-pointer items-center justify-center rounded border border-btn-border bg-page px-1 text-ink shadow-none transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand active:translate-y-0 active:border-brand-active active:text-brand-active"
            >
              <span
                className={[
                  'flex items-center justify-center transition-transform duration-200',
                  open ? 'rotate-180' : '',
                ].join(' ')}
              >
                {chevron}
              </span>
            </button>
          )}
        </div>
      </header>

      <div
        className={[
          'grid transition-[grid-template-rows] duration-[280ms] ease',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div
          id={bodyId}
          className={`min-h-0 overflow-hidden ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

export default FilterCard
