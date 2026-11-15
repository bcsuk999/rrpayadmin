import Button from './components/Button'
import Card from './components/Card'

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
              Button and Card, built to match the reference admin.
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
            <p className="mt-4 text-xs text-ink-muted">
              Hover, press and keyboard-focus states are live — try them.
            </p>
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
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          RRPAY Admin · React + TypeScript + Tailwind CSS
        </p>
      </div>
    </main>
  )
}

export default App
