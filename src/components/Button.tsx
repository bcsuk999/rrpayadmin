import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { LineSpinner } from 'ldrs/react'
import 'ldrs/react/LineSpinner.css'

export type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'outline'
  | 'success'
  | 'danger'
  | 'warning'

export type ButtonSize = 'sm' | 'md'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant
  /** Height / padding scale. @default 'md' */
  size?: ButtonSize
  /** Shows a spinner and disables the button. @default false */
  loading?: boolean
  /** Text shown while loading (falls back to children). */
  loadingText?: string
  /** Stretch to the full width of the parent. @default false */
  fullWidth?: boolean
  /** Icon rendered before the label. */
  leftIcon?: ReactNode
  /** Icon rendered after the label. */
  rightIcon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-0.5 whitespace-nowrap rounded-md border font-medium ' +
  'transition-[color,background-color,border-color,transform] duration-200 ' +
  'active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
  'disabled:cursor-not-allowed disabled:active:scale-100'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-brand bg-brand text-white hover:border-brand-hover hover:bg-brand-hover ' +
    'active:border-brand-active active:bg-brand-active ' +
    'disabled:border-brand-disabled disabled:bg-brand-disabled disabled:text-white',
  ghost:
    'border-btn-border bg-white text-btn-ghost hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand ' +
    'active:bg-brand-soft disabled:border-btn-border disabled:bg-white disabled:text-btn-ghost/60',
  outline:
    'border-btn-border bg-white text-btn-ghost hover:border-brand-soft-border hover:bg-brand-soft hover:text-brand ' +
    'active:bg-brand-soft disabled:border-btn-border disabled:bg-white disabled:text-btn-ghost/60',
  success:
    'border-success bg-success text-white hover:border-success-hover hover:bg-success-hover ' +
    'active:border-success-active active:bg-success-active disabled:opacity-60',
  danger:
    'border-danger bg-danger text-white hover:border-danger-hover hover:bg-danger-hover ' +
    'active:border-danger-active active:bg-danger-active disabled:opacity-60',
  warning:
    'border-warning bg-warning text-white hover:border-warning-hover hover:bg-warning-hover ' +
    'active:border-warning-active active:bg-warning-active disabled:opacity-60',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-[34px] px-3.5 text-sm',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        base,
        sizes[size],
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <LineSpinner
            size={size === 'sm' ? 14 : 16}
            stroke={2}
            speed={1.3}
            color="currentColor"
          />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
})

export default Button
