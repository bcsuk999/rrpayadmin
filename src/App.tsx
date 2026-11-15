import { useState } from 'react'
import Header from './components/Header'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import TagsView from './components/TagsView'
import ToastContainer, { useToast } from './components/Toast'
import GroupsView from './views/GroupsView'
import { adminLogin } from './api/client'
import { clearSession, getStoredUser, isAuthenticated, setSession } from './auth'

function App() {
  const toast = useToast()
  const [user, setUser] = useState(() =>
    isAuthenticated() ? (getStoredUser() as Record<string, unknown> | null) : null,
  )
  const [path, setPath] = useState('/groups')
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [groupsPage, setGroupsPage] = useState(1)
  const [groupsLimit, setGroupsLimit] = useState(20)

  const handleLogin = async (mobile: string, password: string) => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const data = await adminLogin(mobile, password)
      setSession(data.token ?? '', data.admin)
      setUser((data.admin as Record<string, unknown>) ?? null)
      toast.success((data.msg as string) ?? 'Login successful')
      setPath('/groups')
    } catch (e) {
      setLoginError((e as Error).message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
    setPath('/groups')
    toast.info('Logged out')
  }

  const navigate = (to?: string) => {
    setPath(to ?? '/groups')
    setMobileOpen(false)
  }

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/groups': 'Groups',
  }

  if (!user) {
    return (
      <>
        <Login
          onSubmit={handleLogin}
          loading={loginLoading}
          errorMessage={loginError}
        />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="app-layout flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        currentPath={path}
        items={[
          { key: 'groups', to: '/groups', label: 'Groups' },
        ]}
        brand="RRPAY"
        badge="Admin"
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onNavigate={(item) => navigate(item.to)}
        onNavigateChild={(parent) => {
          if (parent.to) setPath(parent.to)
          setMobileOpen(false)
        }}
      />
      <div className="main-area flex min-w-0 flex-1 flex-col">
        <Header
          collapsed={collapsed}
          pageTitle={pageTitles[path] ?? path}
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
          onLogout={handleLogout}
        />
        <TagsView
          currentPath={path}
          onNavigate={(p) => {
            setPath(p)
            setMobileOpen(false)
          }}
        />
        <main className="app-content flex flex-1 overflow-hidden">
          <div className="route-transition h-full">
            <div className="content flex h-full w-full flex-col gap-7 overflow-y-auto">
              {path === '/groups' ? (
                <GroupsView
                  page={groupsPage}
                  limit={groupsLimit}
                  onPageChange={setGroupsPage}
                  onLimitChange={setGroupsLimit}
                />
              ) : (
                <section className="admin-card admin-card p-4 text-ink">
                  <p className="text-sm text-ink-muted">No content for {path} yet.</p>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
      {mobileOpen && (
        <div
          className="sidebar-backdrop fixed inset-0 z-[999] bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  )
}

export default App
