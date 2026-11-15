import { type ReactNode } from 'react'

export interface TableCardHeadingProps {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function TableCardHeading({
  title,
  subtitle,
  actions,
  className = '',
}: TableCardHeadingProps) {
  return (
    <div
      className={[
        'table-card-heading flex flex-wrap items-center justify-between gap-3 mb-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="table-card-heading__main min-w-0">
        <h3 className="title m-0 inline-block text-xl font-bold tracking-[-0.01em]">
          {title}
        </h3>
        {subtitle && (
          <div className="table-card-heading__subtitle mt-1 text-[13px] text-ink-soft">
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="table-card-heading__actions flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
