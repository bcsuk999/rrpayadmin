import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered above the field. */
  label?: ReactNode
  /** Helper text rendered below the field. */
  hint?: string
  /** Error text rendered below the field. */
  error?: string
  /** Classes for the wrapper that holds label, input and messages. */
  containerClassName?: string
}

const inputClasses =
  'h-8 w-full min-w-0 rounded border border-btn-border bg-white px-2.5 text-xs leading-[30px] text-btn-ghost ' +
  'shadow-none transition-[border-color,box-shadow] duration-200 ' +
  'placeholder:text-[#c0c4cc] ' +
  'hover:border-[#c0c4cc] ' +
  'focus:border-brand focus:shadow-[0_0_0_2px_#f0c078] focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:border-card-border disabled:bg-page disabled:text-[#c0c4cc]'

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? (label ? autoId : undefined)

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] leading-[1.35] text-btn-ghost"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={[
          inputClasses,
          error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_2px_rgba(245,108,108,0.25)]' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
