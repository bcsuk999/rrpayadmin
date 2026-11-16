import { type ReactNode } from 'react'
import { LineSpinner } from 'ldrs/react'
import 'ldrs/react/LineSpinner.css'

export interface DataTableProps {
  /** Use `admin-table--wide` for very wide tables. */
  wide?: boolean
  /** Use `admin-table--compact` to drop the min-width. */
  compact?: boolean
  loading?: boolean
  className?: string
  children?: ReactNode
}

export default function DataTable({
  wide = false,
  compact = false,
  loading = false,
  className = '',
  children,
}: DataTableProps) {
  return (
    <div
      aria-busy={loading || undefined}
      className={[
        'admin-table-scroll relative min-h-[320px] overflow-auto rounded-[10px] border border-[#ebeef5]',
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
      {loading && (
        <div
          role="status"
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/90"
        >
          <div className="flex flex-col items-center gap-2 text-sm text-ink-soft">
            <LineSpinner size={32} stroke={3} speed={0.8} color="currentColor" />
            <span>Loading…</span>
          </div>
        </div>
      )}
    </div>
  )
}
