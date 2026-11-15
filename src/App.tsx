import { useState } from 'react'
import Button from './components/Button'
import Card from './components/Card'
import DatePicker from './components/DatePicker'
import FilterCard from './components/FilterCard'
import Header from './components/Header'
import Input from './components/Input'
import Login from './components/Login'
import TableCard from './components/TableCard'
import TableCardHeading from './components/TableCardHeading'
import DataTable from './components/DataTable'
import TableFooter from './components/TableFooter'
import SelectDropdown from './components/SelectDropdown'
import Sidebar from './components/Sidebar'
import TagsView from './components/TagsView'
import ToastContainer from './components/Toast'
import { useToast } from './components/Toast'

const PlusIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const ArrowIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const CheckIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const dropdownOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
  { value: 'disabled', label: 'Disabled option', disabled: true },
]

function App() {
  const [date, setDate] = useState('')
  const toast = useToast()
  const [groupId, setGroupId] = useState('')
  const [uid, setUid] = useState('')

  const [dropdownValue, setDropdownValue] = useState<string | number>('all')
  const [topDropdownValue, setTopDropdownValue] = useState<string | number>('')

  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/dashboard')
  const [currentTab, setCurrentTab] = useState('groups')

  const [pageTitle, setPageTitle] = useState('dashboard')
  const [showTags, setShowTags] = useState(true)
  const [showStats, setShowStats] = useState(true)

  const [tablePage, setTablePage] = useState(1)
  const [tablePageSize, setTablePageSize] = useState(10)

  const tableRows = [
    { uid: '1001', mobile: '9876543210', status: 'Active', balance: '1,250.00' },
    { uid: '1002', mobile: '9876543211', status: 'Active', balance: '890.50' },
    { uid: '1003', mobile: '9876543212', status: 'Suspended', balance: '0.00' },
    { uid: '1004', mobile: '9876543213', status: 'Banned', balance: '42.10' },
    { uid: '1005', mobile: '9876543214', status: 'Active', balance: '3,400.00' },
    { uid: '1006', mobile: '9876543215', status: 'Active', balance: '120.00' },
    { uid: '1007', mobile: '9876543216', status: 'Suspended', balance: '5.00' },
    { uid: '1008', mobile: '9876543217', status: 'Active', balance: '777.77' },
    { uid: '1009', mobile: '9876543218', status: 'Active', balance: '2,100.00' },
    { uid: '1010', mobile: '9876543219', status: 'Banned', balance: '0.00' },
    { uid: '1011', mobile: '9876543220', status: 'Active', balance: '560.00' },
    { uid: '1012', mobile: '9876543221', status: 'Active', balance: '999.99' },
  ]

  const resetFilters = () => {
    setGroupId('')
    setUid('')
    setDate('')
  }

  return (
    <main className="min-h-svh px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              RRPAY Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">Components</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Button, Card, Input, DatePicker, FilterCard, SelectDropdown,
              Sidebar and Header, built to match the reference admin.
            </p>
          </div>
          <code className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-active">
            src/components/
          </code>
        </header>

        <div className="flex flex-col gap-6">
          <Card
            title="Button variants"
            subtitle="Solid actions, quiet secondary actions and semantic feedback."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
            </div>
          </Card>

          <Card
            title="Sizes"
            subtitle="Two heights matching the reference admin: 32px and 34px."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button variant="ghost" size="sm">
                Small ghost
              </Button>
              <Button variant="ghost" size="md">
                Medium ghost
              </Button>
            </div>
          </Card>

          <Card
            title="States"
            subtitle="Disabled and loading states. Loading uses the ldrs LineSpinner."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-[#f8f9fb] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Disabled
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Primary</Button>
                  <Button variant="ghost" disabled>
                    Ghost
                  </Button>
                  <Button variant="danger" disabled>
                    Danger
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#f8f9fb] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Loading
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button loading loadingText="Saving…">
                    Save
                  </Button>
                  <Button variant="success" loading>
                    Processing
                  </Button>
                  <Button variant="ghost" loading>
                    Loading
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Icons & width"
            subtitle="Optional leading/trailing icons and a full-width option."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button leftIcon={PlusIcon}>Add user</Button>
              <Button variant="ghost" rightIcon={ArrowIcon}>
                Next
              </Button>
              <Button variant="success" leftIcon={CheckIcon}>
                Approved
              </Button>
            </div>
            <div className="mt-5 max-w-sm">
              <Button fullWidth rightIcon={ArrowIcon}>
                Continue
              </Button>
            </div>
          </Card>

          <Card
            title="Card"
            subtitle="White surface, #e4e7ed border, 8px radius and the reference shadow."
            actions={
              <Button variant="ghost" size="sm">
                Header action
              </Button>
            }
          >
            <p className="text-sm text-ink-muted">
              Pass <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">title</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">subtitle</code> and{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">actions</code> for
              the optional header, or use it as a plain padded surface. This
              entire section is one Card.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="sm">
                Primary action
              </Button>
              <Button variant="ghost" size="sm">
                Secondary
              </Button>
            </div>
          </Card>

          <Card
            title="Input & date picker"
            subtitle="32px fields with the reference border, focus ring and calendar panel."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Group ID"
                placeholder="Please enter group ID to search"
              />
              <Input
                label="UID"
                placeholder="Please enter UID to search"
                defaultValue="10245"
                inputMode="numeric"
              />
              <Input
                label="Disabled"
                placeholder="Please enter a value"
                disabled
              />
              <Input
                label="With error"
                defaultValue="abc"
                error="Enter a valid number"
              />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Date picker
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <DatePicker value={date} onChange={setDate} />
                <span className="text-xs text-ink-muted">
                  Selected: {date || 'none'}
                </span>
                <DatePicker placeholder="Disabled picker" disabled />
              </div>
            </div>
          </Card>

          <FilterCard
            title="Group filters"
            description="Inline labels, 32px fields and a collapsible body."
            actions={
              <Button variant="ghost" size="sm">
                Export
              </Button>
            }
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-[18px] max-sm:flex-col max-sm:items-stretch">
              <div className="flex items-center max-sm:flex-col max-sm:items-stretch">
                <label
                  htmlFor="filter-group-id"
                  className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0"
                >
                  Group ID
                </label>
                <div className="w-[150px] max-sm:w-full">
                  <Input
                    id="filter-group-id"
                    placeholder="Please enter group ID"
                    value={groupId}
                    onChange={(event) => setGroupId(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center max-sm:flex-col max-sm:items-stretch">
                <label
                  htmlFor="filter-uid"
                  className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0"
                >
                  UID
                </label>
                <div className="w-[150px] max-sm:w-full">
                  <Input
                    id="filter-uid"
                    placeholder="Please enter UID"
                    maxLength={5}
                    inputMode="numeric"
                    value={uid}
                    onChange={(event) => setUid(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center max-sm:flex-col max-sm:items-stretch">
                <span className="pr-3 text-sm whitespace-nowrap text-btn-ghost max-sm:pb-1.5 max-sm:pr-0">
                  Date
                </span>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>

            <div className="mt-[18px] flex flex-wrap items-center justify-end gap-2.5 border-t border-card-border pt-[15px]">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm">Search</Button>
            </div>
          </FilterCard>

          <Card
            title="Select dropdown"
            subtitle="Custom select: 32px trigger, options panel, keyboard nav, top/bottom placement."
          >
            <div className="flex flex-wrap items-end gap-6">
              <div className="w-[160px]">
                <p className="mb-1.5 text-[13px] text-btn-ghost">Status (bottom)</p>
                <SelectDropdown
                  value={dropdownValue}
                  onChange={setDropdownValue}
                  options={dropdownOptions}
                  placeholder="All"
                />
              </div>
              <div className="w-[160px]">
                <p className="mb-1.5 text-[13px] text-btn-ghost">Placement top</p>
                <SelectDropdown
                  value={topDropdownValue}
                  onChange={setTopDropdownValue}
                  options={['Option A', 'Option B', 'Option C']}
                  placeholder="Choose"
                  placement="top"
                />
              </div>
              <div className="w-[160px]">
                <p className="mb-1.5 text-[13px] text-btn-ghost">Disabled</p>
                <SelectDropdown
                  value=""
                  options={dropdownOptions}
                  placeholder="Disabled"
                  disabled
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Selected: {String(dropdownValue || 'none')} /{' '}
              {String(topDropdownValue || 'none')}
            </p>
          </Card>

          <Card
            title="Login page"
            subtitle="Full-page sign-in card: brand, mobile + password, validation and loading."
          >
            <div className="overflow-hidden rounded-lg border border-card-border">
              <Login
                onSubmit={async (mobile, _password) => {
                  // Demo: accept any non-empty credentials.
                  await new Promise((r) => setTimeout(r, 600))
                  if (mobile === 'fail') {
                    throw new Error('Invalid credentials')
                  }
                  toast.success(`Welcome, ${mobile}`)
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Try submitting empty fields, or mobile "fail" for an error toast.
            </p>
          </Card>
          <Card
            title="Toast"
            subtitle="Viewport toasts: success, error, warning, info with auto-dismiss."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="success"
                size="sm"
                onClick={() => toast.success('Action completed successfully')}
              >
                Success
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => toast.error('Something went wrong. Please try again.')}
              >
                Error
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => toast.warning('Please review before continuing.')}
              >
                Warning
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info('Logged out')}
              >
                Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.clear()
                }}
              >
                Clear all
              </Button>
            </div>
          </Card>
          <Card
            title="Table"
            subtitle="TableCard, gradient heading, scrollable DataTable and paginated footer."
          >
            <TableCard>
              <TableCardHeading
                title={`Users (${tableRows.length})`}
                subtitle={`Page ${tablePage} / ${Math.max(1, Math.ceil(tableRows.length / tablePageSize))}`}
                actions={
                  <Button variant="ghost" size="sm">
                    Export
                  </Button>
                }
              />
              <DataTable>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows
                    .slice(
                      (tablePage - 1) * tablePageSize,
                      tablePage * tablePageSize,
                    )
                    .map((row) => (
                      <tr key={row.uid}>
                        <td className="mono">{row.uid}</td>
                        <td className="mono">{row.mobile}</td>
                        <td>
                          <span
                            className={[
                              'badge',
                              row.status === 'Active'
                                ? 'badge--success'
                                : row.status === 'Banned'
                                  ? 'badge--danger'
                                  : 'badge--warning',
                            ].join(' ')}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="mono">{row.balance}</td>
                        <td>
                          <div className="cell-actions flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </DataTable>
              <TableFooter
                page={tablePage}
                totalPages={Math.max(1, Math.ceil(tableRows.length / tablePageSize))}
                total={tableRows.length}
                pageSize={tablePageSize}
                onChange={setTablePage}
                onSizeChange={(size) => {
                  setTablePageSize(size)
                  setTablePage(1)
                }}
              />
            </TableCard>
          </Card>
          <Card
            title="Sidebar & Header shell"
            subtitle="Integrated layout preview: collapsible rail and mobile drawer."
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? 'Close drawer' : 'Open drawer'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted">Page title</span>
                <SelectDropdown
                  value={pageTitle}
                  onChange={(v: string | number) => setPageTitle(String(v))}
                  options={[
                    { value: 'dashboard', label: 'Dashboard' },
                    { value: 'users', label: 'Users' },
                    { value: 'banks', label: 'Banks' },
                    { value: 'bot', label: 'Bot' },
                  ]}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-card-border">
              <div
                className="flex h-[420px]"
                style={{
                  ['--sidebar-width' as string]: '242px',
                  ['--layout-sidebar-width' as string]: '242px',
                  ['--layout-sidebar-collapsed-width' as string]: '64px',
                }}
              >
                <Sidebar
                  collapsed={collapsed}
                  mobileOpen={mobileOpen}
                  currentPath={currentPath}
                  currentTab={currentTab}
                  brand="RRPAY"
                  badge="Admin"
                  onClose={() => setMobileOpen(false)}
                  onToggleCollapse={() => setCollapsed((v) => !v)}
                  onNavigate={(item) => {
                    if (item.to) setCurrentPath(item.to)
                    setMobileOpen(false)
                  }}
                  onNavigateChild={(parent, child) => {
                    if (parent.to) setCurrentPath(parent.to)
                    setCurrentTab(child.key)
                    setMobileOpen(false)
                  }}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Header
                    collapsed={collapsed}
                    pageTitle={pageTitle}
                    showTags={showTags}
                    showStats={showStats}
                    onToggleSidebar={() => setCollapsed((v) => !v)}
                    onToggleMobile={() => setMobileOpen((v) => !v)}
                    onShowTagsChange={setShowTags}
                    onShowStatsChange={setShowStats}
                    onLogout={() => alert('Logged out')}
                  />
                  {showTags && (
                    <div
                      className={[
                        'tags-view-wrap transition-[max-height] duration-200 overflow-hidden',
                        showTags ? '' : 'max-h-0',
                      ].join(' ')}
                    >
                      <TagsView
                        currentPath={currentPath}
                        onNavigate={(p) => setCurrentPath(p)}
                      />
                    </div>
                  )}
                  <div className="flex-1 overflow-auto bg-page p-4">
                    <p className="text-sm text-ink-muted">
                      Content area. Current path:{' '}
                      <code className="rounded bg-white px-1 py-0.5 text-xs">
                        {currentPath}
                      </code>{' '}
                      {currentPath === '/bot' && (
                        <>
                          · tab{' '}
                          <code className="rounded bg-white px-1 py-0.5 text-xs">
                            {currentTab}
                          </code>
                        </>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-ink-soft">
                      Tags view: {showTags ? 'on' : 'off'} · Static cards:{' '}
                      {showStats ? 'on' : 'off'}
                    </p>
                  </div>
                </div>
              </div>
              {mobileOpen && (
                <div
                  className="fixed inset-0 z-[999] bg-black/40"
                  onClick={() => setMobileOpen(false)}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              On screens ≤880px the sidebar becomes a fixed drawer. Try
              resizing the browser or use the mobile toggle.
            </p>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          RRPAY Admin · React + TypeScript + Tailwind CSS
        </p>
      </div>
      <ToastContainer />
    </main>
  )
}

export default App
