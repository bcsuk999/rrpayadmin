import { type ReactNode } from 'react'

export interface DataTableProps {
  /** Use `admin-table--wide` for very wide tables. */
  wide?: boolean
  /** Use `admin-table--compact` to drop the min-width. */
  compact?: boolean
  className?: string
  children?: ReactNode
}

export default function DataTable({
  wide = false,
  compact = false,
  className = '',
  children,
}: DataTableProps) {
  return (
    <div
      className={[
        'admin-table-scroll overflow-auto rounded-[10px] border border-[#ebeef5]',
        className,
      ].join(' ')}
    >
      <table
        className={[
          'admin-table w-full min-w-[760px] border-collapse text-xs text-btn-ghost',
          wide ? 'admin-table--wide min-w-[1150px]' : '',
          compact ? 'admin-table--compact min-w-0' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </table>
    </div>
  )
}
