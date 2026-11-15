import { useState } from 'react'
import Button from './components/Button'
import Card from './components/Card'
import DatePicker from './components/DatePicker'
import FilterCard from './components/FilterCard'
import Input from './components/Input'

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

function App() {
  const [date, setDate] = useState('')
  const [groupId, setGroupId] = useState('')
  const [uid, setUid] = useState('')

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
              Button, Card, Input, DatePicker and FilterCard, built to match the
              reference admin.
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
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          RRPAY Admin · React + TypeScript + Tailwind CSS
        </p>
      </div>
    </main>
  )
}

export default App
