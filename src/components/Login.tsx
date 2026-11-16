import { useState, type FormEvent } from 'react'
import Button from './Button'
import Input from './Input'
import { useToast } from './Toast'

export interface LoginProps {
  /** Brand name. @default 'RRPAY' */
  brand?: string
  /** Badge next to the brand. @default 'Admin' */
  badge?: string
  /** Title under the brand. @default 'Sign in to your account' */
  title?: string
  /** Controlled loading state. When omitted, the component manages its own. */
  loading?: boolean
  /** Called with (mobile, password) on submit. May be async. */
  onSubmit?: (mobile: string, password: string) => void | Promise<void>
  className?: string
}

export default function Login({
  brand = 'RRPAY',
  badge = 'Admin',
  title = 'Sign in to your account',
  loading: loadingProp,
  onSubmit,
  className = '',
}: LoginProps) {
  const toast = useToast()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)

  const isControlled = loadingProp !== undefined
  const loading = isControlled ? (loadingProp as boolean) : internalLoading

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMobile = mobile.trim()
    if (!trimmedMobile || !password) {
      toast.error('Please enter your mobile number and password.')
      return
    }

    if (onSubmit) {
      if (!isControlled) setInternalLoading(true)
      try {
        await onSubmit(trimmedMobile, password)
      } catch (err) {
        toast.error((err as Error)?.message || 'Login failed')
      } finally {
        if (!isControlled) setInternalLoading(false)
      }
      return
    }

    setInternalLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <main
      className={[
        'login-page flex min-h-[420px] items-center justify-center bg-page',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <section className="login-card w-[380px] max-w-[90vw] rounded-xl border border-card-border bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="login-brand flex items-center justify-center gap-2">
          <span className="login-logo font-heading text-2xl font-bold leading-[1.15] text-brand">
            {brand}
          </span>
          <span className="login-badge rounded-full bg-brand-soft px-2.5 py-1 font-heading text-sm font-semibold text-brand-active">
            {badge}
          </span>
        </div>

        <h1 className="login-title mt-4 text-center text-lg font-semibold text-ink">
          {title}
        </h1>

        <form className="login-form mt-4 flex flex-col gap-3" noValidate onSubmit={handleSubmit}>
          <div className="login-field flex flex-col gap-1">
            <label
              className="login-field-label text-xs font-medium text-btn-ghost"
              htmlFor="login-mobile"
            >
              Mobile number
            </label>
            <Input
              id="login-mobile"
              type="tel"
              name="mobile"
              inputMode="tel"
              autoComplete="username"
              placeholder="Enter mobile number"
              disabled={loading}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className="login-field flex flex-col gap-1">
            <label
              className="login-field-label text-xs font-medium text-btn-ghost"
              htmlFor="login-password"
            >
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            loadingText="Signing in…"
            className="login-submit mt-2 min-h-[34px]"
          >
            Sign in
          </Button>
        </form>
      </section>
    </main>
  )
}
