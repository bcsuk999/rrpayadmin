import { type ReactNode } from 'react'

export interface TableCardProps {
  className?: string
  children?: ReactNode
}

export default function TableCard({ className = '', children }: TableCardProps) {
  return (
    <section
      className={[
        'admin-card admin-table-card relative block min-h-0 rounded-xl border border-card-border bg-white p-4 text-ink',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]',
        'transition-[box-shadow,border-color,background-color] duration-[250ms]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  )
}
