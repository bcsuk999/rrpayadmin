import Button from './components/Button'

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
            <h1 className="mt-1 text-2xl font-semibold text-ink">Button</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Every variant, size and state of the shared button component.
            </p>
          </div>
          <code className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-active">
            src/components/Button.tsx
          </code>
        </header>

        <div className="flex flex-col gap-6">
          {/* Variants */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-ink">Variants</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Solid actions, quiet secondary actions and semantic feedback.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
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
          </section>

          {/* Sizes */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-ink">Sizes</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Two heights matching the reference admin: 32px and 34px.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button variant="ghost" size="sm">
                Small ghost
              </Button>
              <Button variant="ghost" size="md">
                Medium ghost
              </Button>
            </div>
          </section>

          {/* States */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-ink">States</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Disabled and loading states, with a spinner in currentColor.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
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
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
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
          </section>

          {/* Icons + full width */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-ink">Icons &amp; width</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Optional leading/trailing icons and a full-width option.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
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
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          RRPAY Admin · React + TypeScript + Tailwind CSS
        </p>
      </div>
    </main>
  )
}

export default App
