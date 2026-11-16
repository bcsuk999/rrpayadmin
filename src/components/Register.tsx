import { useState, type FormEvent } from 'react'
import Button from './Button'
import Input from './Input'
import { adminRegister } from '../api/client'
import { useToast } from './Toast'

export interface RegisterProps {
  /** Called after a successful registration. */
  onSuccess?: (message: string) => void
  /** Controlled loading state. When omitted, the component manages its own. */
  loading?: boolean
  className?: string
}

export default function Register({
  onSuccess,
  loading: loadingProp,
  className = '',
}: RegisterProps) {
  const toast = useToast()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)

  const isControlled = loadingProp !== undefined
  const loading = isControlled ? Boolean(loadingProp) : internalLoading

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!mobile.trim() || !password) {
      toast.error('Please enter your mobile number and password.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (!isControlled) setInternalLoading(true)
    try {
      const data = await adminRegister(mobile.trim(), password, 'admin')
      const msg = (data.msg as string) || 'Admin registered successfully'
      toast.success(msg)
      onSuccess?.(msg)
    } catch (e) {
      toast.error((e as Error).message || 'Registration failed')
    } finally {
      if (!isControlled) setInternalLoading(false)
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
            RRPAY
          </span>
          <span className="login-badge rounded-full bg-brand-soft px-2.5 py-1 font-heading text-sm font-semibold text-brand-active">
            Admin
          </span>
        </div>

        <h1 className="login-title mt-4 text-center text-lg font-semibold text-ink">
          Create admin account
        </h1>

        <form className="login-form mt-4 flex flex-col gap-3" noValidate onSubmit={handleSubmit}>
          <div className="login-field flex flex-col gap-1">
            <label
              className="login-field-label text-xs font-medium text-btn-ghost"
              htmlFor="register-mobile"
            >
              Mobile number
            </label>
            <Input
              id="register-mobile"
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
              htmlFor="register-password"
            >
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Enter password (min 6 chars)"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            loadingText="Registering…"
            className="login-submit mt-2 min-h-[34px]"
          >
            Register
          </Button>
        </form>
      </section>
    </main>
  )
}
