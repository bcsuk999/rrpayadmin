import {
  useEffect,
  useRef,
  useState,
} from 'react'

export interface HeaderProps {
  collapsed?: boolean
  /** Page title shown as the second breadcrumb segment. @default 'Dashboard' */
  pageTitle?: string
  /** Home link label. @default 'Home' */
  homeLabel?: string
  /** Called when the desktop collapse toggle is pressed. */
  onToggleSidebar?: () => void
  /** Called when the mobile menu toggle is pressed. */
  onToggleMobile?: () => void
  /** Settings: show tags. */
  showTags?: boolean
  onShowTagsChange?: (value: boolean) => void
  /** Settings: show static cards / stats. */
  showStats?: boolean
  onShowStatsChange?: (value: boolean) => void
  /** Called when Logout is selected. */
  onLogout?: () => void
  className?: string
}

const titleMap: Record<string, string> = {
  home: 'Dashboard',
  users: 'Users',
  banks: 'Banks',
  'payin-config': 'Payin Config',
  'deposit-addresses': 'Addresses',
  payins: 'Payins',
  transactions: 'Transactions',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  payouts: 'Payouts',
  bot: 'Bot',
  login: 'Login',
}

export default function Header({
  collapsed = false,
  pageTitle = 'Dashboard',
  homeLabel = 'Home',
  onToggleSidebar,
  onToggleMobile,
  showTags = true,
  onShowTagsChange,
  showStats = true,
  onShowStatsChange,
  onLogout,
  className = '',
}: HeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const settingsWrapRef = useRef<HTMLDivElement>(null)
  const logoutWrapRef = useRef<HTMLDivElement>(null)

  const resolvedTitle = titleMap[pageTitle.toLowerCase()] ?? pageTitle

  const toggleFullscreen = () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
      webkitExitFullscreen?: () => Promise<void>
      mozCancelFullScreen?: () => Promise<void>
      msExitFullscreen?: () => Promise<void>
    }
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }
    const fullscreenElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement

    const requestFullscreen =
      el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    const exitFullscreen =
      doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen

    if (!fullscreenElement && requestFullscreen) {
      Promise.resolve(requestFullscreen.call(el)).catch(() => {})
    } else if (exitFullscreen) {
      Promise.resolve(exitFullscreen.call(doc)).catch(() => {})
    }
  }

  const updateFullscreenState = () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
    }
    setIsFullscreen(
      Boolean(
        doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement,
      ),
    )
  }

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (settingsOpen && settingsWrapRef.current && !settingsWrapRef.current.contains(target)) {
        setSettingsOpen(false)
      }
      if (logoutOpen && logoutWrapRef.current && !logoutWrapRef.current.contains(target)) {
        setLogoutOpen(false)
      }
    }
    document.addEventListener('click', closeOnOutside)
    document.addEventListener('fullscreenchange', updateFullscreenState)
    document.addEventListener('webkitfullscreenchange', updateFullscreenState)
    document.addEventListener('mozfullscreenchange', updateFullscreenState)
    document.addEventListener('MSFullscreenChange', updateFullscreenState)
    updateFullscreenState()
    return () => {
      document.removeEventListener('click', closeOnOutside)
      document.removeEventListener('fullscreenchange', updateFullscreenState)
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState)
      document.removeEventListener('mozfullscreenchange', updateFullscreenState)
      document.removeEventListener('MSFullscreenChange', updateFullscreenState)
    }
  }, [settingsOpen, logoutOpen])

  const handleLogout = () => {
    setLogoutOpen(false)
    onLogout?.()
  }

  return (
    <header
      className={[
        'app-header flex items-center justify-between h-[50px] bg-[var(--color-header-bg,#324157)] text-white shrink-0 sticky top-0 z-30 shadow-[0_1px_4px_rgba(21,41,0.08)] overflow-visible',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="header-left flex items-center h-full">
        <button
          type="button"
          className="sidebar-toggle hide-mobile inline-flex items-center justify-center h-full px-[10px] cursor-pointer bg-transparent border-none text-white transition-colors duration-300 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-[-2px]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleSidebar}
        >
          <svg className="hamburger inline-block align-middle w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="sidebar-toggle hide-desktop inline-flex items-center justify-center h-full px-[10px] cursor-pointer bg-transparent border-none text-white transition-colors duration-300 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-[-2px]"
          aria-label="Open menu"
          onClick={onToggleMobile}
        >
          <svg className="hamburger inline-block align-middle w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <nav className="breadcrumb inline-flex items-center text-sm leading-[50px] ml-[10px] gap-0" aria-label="Breadcrumb">
          <span className="breadcrumb__item inline-flex items-center">
            <a
              href="/"
              className="breadcrumb__link font-normal text-[#d7d7d7] no-underline hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              {homeLabel}
            </a>
          </span>
          <span className="breadcrumb__separator mx-[9px] font-bold text-white/50" aria-hidden="true">
            /
          </span>
          <span className="breadcrumb__item inline-flex items-center">
            <span className="breadcrumb__text text-white cursor-text">{resolvedTitle}</span>
          </span>
        </nav>
      </div>

      <div className="header-right flex items-center gap-3 h-full mr-6 max-[600px]:gap-2 max-[600px]:mr-2">
        <div ref={settingsWrapRef} className="settings-dropdown relative inline-flex">
          <button
            type="button"
            className="settings-toggle inline-flex items-center justify-center w-9 min-w-9 h-9 p-0 text-white bg-white/8 border border-white/25 rounded-md cursor-pointer transition-[background-color,border-color,transform] duration-200 hover:bg-white/16 hover:border-white/45 hover:-translate-y-px"
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            aria-label="Settings"
            title="Settings"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            <span className="settings-icon text-lg leading-none text-white" aria-hidden="true">
              ⚙
            </span>
          </button>
          {settingsOpen && (
            <div
              className="settings-menu absolute top-[calc(100%+6px)] right-0 min-w-[190px] p-2 bg-white border border-card-border rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-[1000] flex flex-col gap-1"
              role="menu"
            >
              <label
                className="settings-menu__item flex items-center justify-between gap-3 px-[10px] py-2 rounded-[7px] text-[#303133] text-[13px] cursor-pointer hover:bg-[#f5f7fa]"
                onClick={(e) => e.stopPropagation()}
              >
                <span>View tags</span>
                <input
                  type="checkbox"
                  checked={showTags}
                  onChange={(e) => onShowTagsChange?.(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-brand"
                />
              </label>
              <label
                className="settings-menu__item flex items-center justify-between gap-3 px-[10px] py-2 rounded-[7px] text-[#303133] text-[13px] cursor-pointer hover:bg-[#f5f7fa]"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Static cards</span>
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => onShowStatsChange?.(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-brand"
                />
              </label>
            </div>
          )}
        </div>

        <div ref={logoutWrapRef} className="logout-dropdown relative inline-flex">
          <button
            type="button"
            className="logout-toggle btn-fullscreen inline-flex items-center justify-center w-8 min-w-8 h-8 p-0 border border-white/25 rounded-md bg-white/8 text-white cursor-pointer transition-[background-color,border-color,transform] duration-200 hover:bg-white/16 hover:border-white/45 hover:-translate-y-px"
            aria-haspopup="menu"
            aria-expanded={logoutOpen}
            aria-label="Account"
            title="Account"
            onClick={() => setLogoutOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          {logoutOpen && (
            <div className="logout-menu absolute top-[calc(100%+6px)] right-0 min-w-[120px] p-[6px] bg-white border border-card-border rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-[1000]">
              <button
                type="button"
                role="menuitem"
                className="logout-menu__item flex items-center justify-start w-full px-[10px] py-2 border-0 rounded-[7px] bg-transparent text-danger text-[13px] cursor-pointer transition-[background-color,color] duration-150 hover:bg-[#fef0f0] hover:text-[#d94a4a]"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-fullscreen inline-flex items-center justify-center w-8 min-w-8 h-8 p-0 border border-white/25 rounded-md bg-white/8 text-white cursor-pointer transition-[background-color,border-color,transform] duration-200 hover:bg-white/16 hover:border-white/45 hover:-translate-y-px"
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={toggleFullscreen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            {isFullscreen ? (
              <path
                d="M8 3v3a2 2 0 0 1-2 2H3M21 8V5a2 2 0 0 1-2-2h-3M3 16h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 1 2-2v-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 0 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 1 2 2h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  )
}
