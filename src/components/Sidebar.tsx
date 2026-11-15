import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

export interface SidebarNavItem {
  key: string
  label: string
  to?: string
  /** Optional icon; falls back to a built-in icon by key. */
  icon?: ReactNode
  children?: Array<{ key: string; label: string }>
}

export interface SidebarProps {
  collapsed?: boolean
  mobileOpen?: boolean
  /** Brand name shown in the header. @default 'RRPAY' */
  brand?: string
  /** Badge next to the brand. @default 'Admin' */
  badge?: string
  /** Footer title. @default '{brand} Admin Panel' */
  footerTitle?: string
  /** Footer subtitle. */
  footerSubtitle?: string
  items?: SidebarNavItem[]
  /** Current route path used for active highlighting. */
  currentPath?: string
  /** Current tab query value used for child active highlighting. */
  currentTab?: string
  className?: string
  onClose?: () => void
  onToggleCollapse?: () => void
  onNavigate?: (item: SidebarNavItem) => void
  onNavigateChild?: (
    parent: SidebarNavItem,
    child: { key: string; label: string },
  ) => void
}

const POPUP_ITEM_HEIGHT = 56
const POPUP_PADDING_Y = 5
const CLOSE_DELAY = 140

const defaultNavItems: SidebarNavItem[] = [
  { key: 'dashboard', to: '/dashboard', label: 'Dashboard' },
  { key: 'users', to: '/users', label: 'Users' },
  { key: 'banks', to: '/banks', label: 'Banks' },
  {
    key: 'payin-config',
    to: '/payin-config',
    label: 'Payin Config',
    children: [
      { key: 'usdt', label: 'USDT' },
      { key: 'inr', label: 'INR' },
    ],
  },
  {
    key: 'agents',
    to: '/agents',
    label: 'Agents',
    children: [
      { key: 'config', label: 'Config' },
      { key: 'stats', label: 'Stats' },
    ],
  },
  { key: 'payins', to: '/payins', label: 'Payins' },
  { key: 'transactions', to: '/transactions', label: 'Transactions' },
  { key: 'deposits', to: '/deposits', label: 'Deposits' },
  { key: 'withdrawals', to: '/withdrawals', label: 'Withdrawals' },
  {
    key: 'payouts',
    to: '/payouts',
    label: 'Payouts',
    children: [
      { key: 'users', label: 'Payout Users' },
      { key: 'payouts', label: 'All Payouts' },
      { key: 'simplypay', label: 'SimplyPay Payout' },
    ],
  },
  {
    key: 'bot',
    to: '/bot',
    label: 'Bot',
    children: [
      { key: 'groups', label: 'Groups' },
      { key: 'transactions', label: 'Transactions' },
      { key: 'orders', label: 'Deposit Records' },
      { key: 'blocked', label: 'Blocked UPIs' },
      { key: 'payout', label: 'Payout' },
      { key: 'pnl', label: 'Profit Loss' },
    ],
  },
]

function iconFor(key: string): ReactNode {
  const cls = 'h-5 w-5'
  const common = { className: cls, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (key) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 12l9-9 9 9M5 10v10h14V10" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'banks':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
        </svg>
      )
    case 'payin-config':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    case 'agents':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'payins':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3v18M5 12l7 7 7-7" />
        </svg>
      )
    case 'transactions':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      )
    case 'deposits':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      )
    case 'withdrawals':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
      )
    case 'payouts':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M2 5h20v14H2zM2 10h20M6 15h4" />
        </svg>
      )
    case 'bot':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2v2M7 8h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4zM9 14h.01M15 14h.01M9 18h6" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}

function isItemActive(item: SidebarNavItem, currentPath?: string) {
  if (!item.to || !currentPath) return false
  if (item.to === '/') return currentPath === '/'
  return currentPath === item.to || currentPath.startsWith(item.to + '/')
}

function isChildActive(
  parent: SidebarNavItem,
  child: { key: string },
  currentPath?: string,
  currentTab?: string,
) {
  const tab = currentTab || parent.children?.[0]?.key
  return currentPath === parent.to && tab === child.key
}

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  brand = 'RRPAY',
  badge = 'Admin',
  footerTitle,
  footerSubtitle = 'Manage users & transactions',
  items,
  currentPath = '/',
  currentTab = '',
  className = '',
  onClose,
  onNavigate,
  onNavigateChild,
}: SidebarProps) {
  const navItems = items ?? defaultNavItems
  const mark = brand.charAt(0).toUpperCase()
  const resolvedFooterTitle = footerTitle ?? `${brand} Admin Panel`

  const [openSubmenuKey, setOpenSubmenuKey] = useState('')
  const [popup, setPopup] = useState({ top: 0, left: 0 })
  const closeTimerRef = useRef<number | null>(null)
  const lastTriggerRef = useRef<HTMLElement | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const activeSubmenu =
    navItems.find((it) => it.key === openSubmenuKey && it.children) ?? null

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const closeSubmenu = useCallback(
    (restoreFocus = false) => {
      cancelClose()
      setOpenSubmenuKey('')
      if (restoreFocus && lastTriggerRef.current) {
        lastTriggerRef.current.focus()
      }
    },
    [cancelClose],
  )

  const openSubmenu = useCallback(
    (item: SidebarNavItem, event?: { currentTarget?: HTMLElement | null }) => {
      if (!item.children) return
      cancelClose()
      const trigger =
        (event?.currentTarget as HTMLElement | null) ?? lastTriggerRef.current
      if (!trigger) return
      lastTriggerRef.current = trigger
      const rect = trigger.getBoundingClientRect()
      const height = item.children.length * POPUP_ITEM_HEIGHT + POPUP_PADDING_Y * 2
      const maxTop = window.innerHeight - height - 8
      const maxLeft = window.innerWidth - 210 - 8
      setPopup({
        left: Math.round(Math.max(8, Math.min(rect.right, maxLeft))),
        top: Math.round(Math.max(8, Math.min(rect.top, maxTop))),
      })
      setOpenSubmenuKey(item.key)
    },
    [cancelClose],
  )

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      setOpenSubmenuKey('')
      closeTimerRef.current = null
    }, CLOSE_DELAY)
  }, [cancelClose])

  const goTo = (item: SidebarNavItem) => {
    closeSubmenu()
    onClose?.()
    onNavigate?.(item)
  }

  const goToChild = (parent: SidebarNavItem, child: { key: string; label: string }) => {
    closeSubmenu()
    onClose?.()
    onNavigateChild?.(parent, child)
  }

  const onSubmenuTitleClick = (item: SidebarNavItem, event: React.MouseEvent) => {
    if (window.matchMedia('(max-width: 880px)').matches) {
      openSubmenu(item, { currentTarget: event.currentTarget as HTMLElement })
      return
    }
    goTo(item)
  }

  const onTriggerKeydown = (event: React.KeyboardEvent, item: SidebarNavItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goTo(item)
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      openSubmenu(item, { currentTarget: event.currentTarget as HTMLElement })
    } else if (event.key === 'Escape') {
      closeSubmenu()
    }
  }

  const focusPopupItem = (index: number) => {
    const items = Array.from(
      document.querySelectorAll('#sidebar-submenu [role="menuitem"]'),
    ) as HTMLElement[]
    if (!items.length) return
    const next = index < 0 ? items.length - 1 : index % items.length
    items[next]?.focus()
  }

  const onPopupKeydown = (event: React.KeyboardEvent) => {
    const items = Array.from(
      document.querySelectorAll('#sidebar-submenu [role="menuitem"]'),
    ) as HTMLElement[]
    const current = items.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusPopupItem(current < 0 ? 0 : current + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusPopupItem(current < 0 ? 0 : current - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusPopupItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusPopupItem(items.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const target = items[current]
      if (target) target.click()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeSubmenu(true)
    } else if (event.key === 'Tab') {
      closeSubmenu()
    }
  }

  useEffect(() => {
    const onViewportChange = () => {
      if (openSubmenuKey) closeSubmenu()
    }
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [openSubmenuKey, closeSubmenu])

  useEffect(() => {
    return () => {
      cancelClose()
    }
  }, [cancelClose])

  const collapsedClasses = collapsed ? 'collapsed' : ''
  const mobileClasses = mobileOpen ? 'mobile-open' : ''

  return (
    <aside
      className={[
        'sidebar flex flex-col shrink-0 h-full overflow-hidden z-40 transition-[width] duration-250 ease',
        collapsedClasses,
        mobileClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Main navigation"
      style={{
        width: collapsed ? 'var(--layout-sidebar-collapsed-width, 64px)' : 'var(--layout-sidebar-width, 242px)',
        backgroundColor: 'var(--theme-sidebar, #324157)',
      }}
    >
      <div className="sidebar-brand flex items-center justify-center shrink-0 h-[50px] border-b border-white/8">
        <span className="sidebar-logo font-heading text-lg font-bold tracking-[0.3px] whitespace-nowrap text-white">
          {brand}
        </span>
        <span className="sidebar-badge ml-2 px-2 py-[3px] rounded-full bg-amber-400/15 text-brand text-[11px] font-semibold whitespace-nowrap font-heading">
          {badge}
        </span>
        <span
          className="sidebar-mark hidden items-center justify-center w-8 h-8 rounded-lg bg-amber-400/15 text-brand font-heading text-base font-bold"
          aria-hidden="true"
        >
          {mark}
        </span>
      </div>

      <ul
        className={[
          'sidebar-el-menu flex-1 min-h-0 overflow-y-auto font-sans text-sm text-left text-[#666] bg-[var(--theme-sidebar,#324157)] cursor-crosshair',
          collapsed ? 'el-menu--collapse' : '',
        ].join(' ')}
        role="menubar"
        style={{ width: collapsed ? 'var(--layout-sidebar-collapsed-width, 64px)' : 'var(--layout-sidebar-width, 242px)' }}
      >
        {navItems.map((item) => {
          if (item.children) {
            const active = isItemActive(item, currentPath)
            return (
              <li
                key={item.key}
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={openSubmenuKey === item.key}
                aria-controls={openSubmenuKey === item.key ? 'sidebar-submenu' : undefined}
                tabIndex={collapsed ? 0 : -1}
                className={[
                  'el-submenu list-none',
                  active ? 'is-active' : '',
                ].join(' ')}
                onMouseEnter={(e) => openSubmenu(item, { currentTarget: e.currentTarget as HTMLElement })}
                onMouseLeave={scheduleClose}
                onFocus={(e) => openSubmenu(item, { currentTarget: e.currentTarget as HTMLElement })}
                onBlur={scheduleClose}
                onKeyDown={(e) => onTriggerKeydown(e, item)}
              >
                <div
                  className="el-submenu__title flex items-center h-14 px-5 font-sans text-base font-normal leading-14 text-[#bfcbd9] bg-[var(--theme-sidebar,#324157)] whitespace-nowrap cursor-pointer transition-colors duration-300 hover:bg-[#283441]"
                  onClick={(e) => onSubmenuTitleClick(item, e)}
                >
                  <span className="icon inline-flex items-center justify-center shrink-0 w-5 h-5 mr-3 text-inherit">
                    {item.icon ?? iconFor(item.key)}
                  </span>
                  <span className="el-menu-item__label overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                  <svg
                    className={[
                      'el-menu-item__arrow el-submenu__icon-arrow shrink-0 ml-auto opacity-70 transition-transform duration-150',
                      openSubmenuKey === item.key ? 'is-open rotate-90' : '',
                    ].join(' ')}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </li>
            )
          }
          const active = isItemActive(item, currentPath)
          return (
            <li
              key={item.key}
              role="menuitem"
              tabIndex={collapsed ? 0 : -1}
              className={[
                'el-menu-item flex items-center h-14 px-5 font-sans text-base font-normal leading-14 text-[#bfcbd9] bg-[var(--theme-sidebar,#324157)] whitespace-nowrap cursor-pointer transition-colors duration-300 hover:bg-[#283441]',
                active ? 'is-active text-brand bg-[var(--theme-sidebar,#324157)]' : '',
              ].join(' ')}
              onClick={() => goTo(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goTo(item)
                }
              }}
            >
              <span className="icon inline-flex items-center justify-center shrink-0 w-5 h-5 mr-3 text-inherit">
                {item.icon ?? iconFor(item.key)}
              </span>
              <span className="el-menu-item__label overflow-hidden text-ellipsis">
                {item.label}
              </span>
            </li>
          )
        })}
      </ul>

      {activeSubmenu &&
        createPortal(
          <div
            ref={popupRef}
            id="sidebar-submenu"
            className="el-menu--vertical fixed z-[2068] w-[210px] font-sans text-sm text-left text-[#666] cursor-crosshair"
            style={{
              top: popup.top,
              left: popup.left,
              transformOrigin: 'left center',
            }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onFocusCapture={cancelClose}
            onBlurCapture={scheduleClose}
            onKeyDown={onPopupKeydown}
          >
            <ul
              role="menu"
              aria-label={activeSubmenu.label}
              className="el-menu--popup relative z-[100] min-w-[200px] mx-[5px] py-[5px] list-none font-sans text-sm text-[#666] bg-[var(--theme-sidebar,#324157)] rounded-[2px] shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            >
              {activeSubmenu.children?.map((child, index) => {
                const active = isChildActive(activeSubmenu, child, currentPath, currentTab)
                return (
                  <li
                    key={child.key}
                    role="menuitem"
                    tabIndex={-1}
                    style={{ ['--item-index' as string]: index }}
                    className={[
                      'el-menu-item flex items-center h-14 px-5 list-none font-sans text-sm leading-14 whitespace-nowrap text-[#bfcbd9] bg-[rgb(50,65,87)] cursor-pointer transition-colors duration-300 hover:bg-[#283441]',
                      'animate-[submenu-item-in_240ms_cubic-bezier(0.22,0.61,0.36,1)_both]',
                      active ? 'is-active text-brand bg-[rgb(50,65,87)]' : '',
                    ].join(' ')}
                    onClick={() => goToChild(activeSubmenu, child)}
                  >
                    {child.label}
                  </li>
                )
              })}
            </ul>
          </div>,
          document.body,
        )}

      <div className="sidebar-footer shrink-0 px-5 py-3 border-t border-white/8 text-sm text-[#bfcbd9]">
        <p>{resolvedFooterTitle}</p>
        <p className="sidebar-footer-sub mt-0.5 opacity-60 text-sm">
          {footerSubtitle}
        </p>
      </div>
    </aside>
  )
}
