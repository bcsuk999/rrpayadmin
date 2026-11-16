import { useEffect, useState } from 'react'

export interface TagItem {
  path: string
  title: string
}

const defaultTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/groups': 'Groups',
  '/users': 'Users',
  '/banks': 'Banks',
  '/payin-config': 'Payin Config',
  '/deposit-addresses': 'Addresses',
  '/payins': 'Payins',
  '/transactions': 'Transactions',
  '/deposits': 'Deposits',
  '/withdrawals': 'Withdrawals',
  '/payouts': 'Payouts',
  '/bot': 'Bot',
}

export interface TagsViewProps {
  /** Controlled tag list. When omitted, the component manages its own list. */
  tags?: TagItem[]
  /** Currently active path. */
  currentPath?: string
  /** Called when a tag is clicked. */
  onNavigate?: (path: string) => void
  /** Called when a tag's close button is clicked. */
  onClose?: (path: string) => void
  /** Title resolver for new tags. */
  titleMap?: Record<string, string>
  className?: string
}

export default function TagsView({
  tags: tagsProp,
  currentPath = '/',
  onNavigate,
  onClose,
  titleMap = defaultTitleMap,
  className = '',
}: TagsViewProps) {
  const [internalTags, setInternalTags] = useState<TagItem[]>(() => [
    { path: currentPath, title: titleMap[currentPath] || currentPath },
  ])

  const isControlled = tagsProp !== undefined
  const tags = isControlled ? (tagsProp as TagItem[]) : internalTags

  // Add a tag whenever the current path changes (uncontrolled mode).
  useEffect(() => {
    if (isControlled) return
    setInternalTags((prev) => {
      if (prev.some((t) => t.path === currentPath)) return prev
      return [
        ...prev,
        {
          path: currentPath,
          title: titleMap[currentPath] || currentPath,
        },
      ]
    })
  }, [currentPath, isControlled, titleMap])

  const handleClose = (path: string) => {
    if (!isControlled) {
      setInternalTags((prev) => {
        const idx = prev.findIndex((t) => t.path === path)
        if (idx === -1 || prev.length <= 1) return prev
        const next = prev.filter((t) => t.path !== path)
        if (currentPath === path) {
          const last = next[next.length - 1]
          onNavigate?.(last ? last.path : currentPath)
        }
        return next
      })
    }
    onClose?.(path)
  }

  return (
    <div
      className={[
        'tags-view flex items-center h-[35.2px] px-2 border-b border-card-border bg-[var(--color-header-bg,#324157)] shrink-0 overflow-hidden max-h-[80px] transition-[max-height,opacity] duration-300 opacity-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="tags-view__scroll flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap h-full">
        {tags.map((tag) => {
          const active = tag.path === currentPath
          return (
            <button
              key={tag.path}
              type="button"
              onClick={() => onNavigate?.(tag.path)}
              className={[
                'tags-view-item inline-flex items-center justify-center shrink-0 gap-1.5 h-[27.2px] min-h-[27.2px] px-3.5 m-0 font-sans text-sm font-medium leading-[1.2] rounded-md border cursor-pointer select-none transition-[color,background-color,border-color,transform] duration-200',
                active
                  ? 'text-white bg-brand border-brand hover:bg-brand-hover hover:border-brand-hover'
                  : 'text-btn-ghost bg-white border-btn-border hover:text-brand hover:bg-brand-soft hover:border-brand-soft-border',
              ].join(' ')}
            >
              {tag.title}
              {tags.length > 1 && (
                <span
                  className="tags-view-item-close inline-flex items-center justify-center w-4 h-4 ml-0.5 text-sm leading-none rounded-full transition-colors duration-200 hover:bg-black/10"
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClose(tag.path)
                  }}
                >
                  ×
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
