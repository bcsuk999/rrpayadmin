import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Card heading. */
  title?: ReactNode
  /** Secondary line under the heading. */
  subtitle?: ReactNode
  /** Right-aligned header content, e.g. buttons. */
  actions?: ReactNode
  /** Extra classes for the inner content wrapper. */
  bodyClassName?: string
}

/**
 * Surface container matching the reference admin card:
 * white background, #e4e7ed border, 8px radius and the two-layer card shadow.
 */
const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    subtitle,
    actions,
    className = '',
    bodyClassName = '',
    children,
    ...props
  },
  ref,
) {
  const hasHeader = Boolean(title || subtitle || actions)

  return (
    <section
      ref={ref}
      className={[
        'min-w-0 rounded-lg border border-card-border bg-white p-4 text-ink',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]',
        'transition-[box-shadow,border-color] duration-[250ms]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {hasHeader && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-ink">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-ink-soft">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
})

export default Card
