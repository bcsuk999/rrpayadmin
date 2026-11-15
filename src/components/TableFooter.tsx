import Pagination from './Pagination'

export interface TableFooterProps {
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

export default function TableFooter({
  page,
  totalPages,
  total = null,
  disabled = false,
  directInput = true,
  showPageSizes = true,
  pageSize = 10,
  pageSizes = [10, 20, 50, 100, 200, 500],
  onChange,
  onSizeChange,
  className = '',
}: TableFooterProps) {
  if (total === null && !directInput && (totalPages ?? 0) <= 1) return null

  return (
    <div
      className={[
        'tbl-footer flex justify-center mt-5',
        className,
      ].join(' ')}
    >
      <div className="tbl-footer-row flex items-center justify-center gap-0">
        {total !== null && total !== undefined && (
          <span className="tbl-total-pages mr-2.5 text-sm text-ink whitespace-nowrap">
            Total {total.toLocaleString()}
          </span>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          disabled={disabled}
          directInput={directInput}
          showPageSizes={showPageSizes}
          pageSize={pageSize}
          pageSizes={pageSizes}
          onChange={onChange}
          onSizeChange={onSizeChange}
        />
      </div>
    </div>
  )
}
