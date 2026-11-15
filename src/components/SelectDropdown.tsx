import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export type SelectDropdownValue = string | number

export interface SelectDropdownProps {
  /** Controlled selected value. */
  value?: SelectDropdownValue
  /** Called with the chosen option value. */
  onChange?: (value: SelectDropdownValue) => void
  /** Options; strings/numbers are auto-normalized. */
  options?: Array<SelectOption | string | number>
  /** Where the panel opens relative to the trigger. @default 'bottom' */
  placement?: 'top' | 'bottom'
  placeholder?: string
  disabled?: boolean
  id?: string
  ariaLabel?: string
  /** Extra classes for the trigger wrapper. */
  className?: string
}

function normalize(
  options: SelectDropdownProps['options'],
): SelectOption[] {
  return (options ?? []).map((opt) =>
    opt !== null && typeof opt === 'object'
      ? {
          value: (opt as SelectOption).value,
          label: (opt as SelectOption).label ?? String((opt as SelectOption).value),
          disabled: Boolean((opt as SelectOption).disabled),
        }
      : { value: opt as string | number, label: String(opt), disabled: false },
  )
}

const inputClasses = [
  'relative flex h-8 w-full cursor-pointer items-center rounded border border-btn-border bg-white',
  'transition-[border-color,box-shadow] duration-200',
  'hover:border-[#c0c4cc]',
].join(' ')

export default function SelectDropdown({
  value,
  onChange,
  options,
  placement = 'bottom',
  placeholder = 'All',
  disabled = false,
  id,
  ariaLabel,
  className = '',
}: SelectDropdownProps) {
  const normalized = normalize(options)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [panelStyle, setPanelStyle] = useState<{
    top: number
    left: number
    minWidth: number
    maxHeight: number
  }>({ top: -9999, left: -9999, minWidth: 0, maxHeight: 274 })

  const selectedOption =
    normalized.find((opt) => opt.value === value) ?? null

  const openPanel = () => {
    if (disabled) return
    const selectedIndex = normalized.findIndex((opt) => opt.value === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const choose = (opt: SelectOption) => {
    if (!opt || opt.disabled || disabled) return
    onChange?.(opt.value)
    close()
    triggerRef.current?.focus()
  }

  useLayoutEffect(() => {
    if (!open) return

    const positionPanel = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const rect = trigger.getBoundingClientRect()
      const openAbove = placement === 'top'
      const availableHeight = openAbove
        ? rect.top - 8
        : window.innerHeight - rect.bottom - 8
      const panelHeight = Math.min(panel.scrollHeight, Math.max(0, availableHeight))
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 8))
      setPanelStyle({
        top: openAbove
          ? Math.max(8, rect.top - panelHeight - 5)
          : rect.bottom + 5,
        left,
        minWidth: rect.width,
        maxHeight: Math.max(0, availableHeight),
      })
    }

    const raf = requestAnimationFrame(() => positionPanel())

    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || rootRef.current?.contains(target)) return
      close()
    }
    const onDocKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onReflow = () => positionPanel()

    document.addEventListener('mousedown', onDocMouseDown, true)
    document.addEventListener('keydown', onDocKeydown)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', onDocMouseDown, true)
      document.removeEventListener('keydown', onDocKeydown)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open, placement, options, value])

  const onKeydown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    const last = normalized.length - 1
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openPanel()
        else if (activeIndex >= 0) choose(normalized[activeIndex])
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openPanel()
        else setActiveIndex((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openPanel()
        else setActiveIndex((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        if (!open) break
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        if (!open) break
        event.preventDefault()
        setActiveIndex(last)
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          close()
        }
        break
      case 'Tab':
        close()
        break
    }
  }

  const toggle = () => {
    if (open) close()
    else openPanel()
  }

  const optionId = (index: number) => `${listboxId}-option-${index}`

  return (
    <div
      ref={rootRef}
      className={['relative inline-block w-full max-w-full font-sans align-middle', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel || undefined}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onClick={toggle}
        onKeyDown={onKeydown}
        className={[
          inputClasses,
          open ? 'border-brand shadow-[0_0_0_2px_#f0c078]' : '',
          disabled ? 'cursor-not-allowed bg-page border-card-border' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'block w-full overflow-hidden whitespace-nowrap text-ellipsis px-[10px] pr-[26px] text-xs leading-[30px] text-btn-ghost',
            !selectedOption ? 'text-[#c0c4cc]' : '',
            disabled ? 'text-[#c0c4cc]' : '',
          ].join(' ')}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className="pointer-events-none absolute right-2 top-0 flex h-full items-center text-[#c0c4cc]"
          aria-hidden="true"
        >
          <svg
            className={[
              'h-3 w-3 transition-transform duration-300',
              open ? 'rotate-180' : '',
            ].join(' ')}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              top: panelStyle.top,
              left: panelStyle.left,
              minWidth: panelStyle.minWidth,
              maxHeight: panelStyle.maxHeight,
            }}
            className="fixed z-[2052] box-border w-max max-w-[calc(100vw-16px)] animate-[selectFade_0.2s_ease] rounded border-[0.8px] border-card-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
          >
            <div
              className="max-h-[274px] overflow-y-auto"
              style={{ maxHeight: 'min(274px, var(--dropdown-max-height, 274px))' }}
            >
              <ul className="m-0 list-none p-[6px_0] text-left font-sans text-sm leading-[16.1px] text-[#666]">
                {normalized.map((opt, i) => (
                  <li
                    key={String(opt.value)}
                    id={optionId(i)}
                    role="option"
                    aria-selected={opt.value === value}
                    aria-disabled={opt.disabled || undefined}
                    onClick={() => choose(opt)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={[
                      'relative box-border h-[34px] cursor-pointer overflow-hidden whitespace-nowrap px-5 leading-[34px] text-[14px] text-btn-ghost transition-colors duration-150',
                      opt.disabled ? 'cursor-not-allowed text-[#c0c4cc]' : '',
                      i === activeIndex && !opt.disabled ? 'bg-page' : '',
                      opt.value === value ? 'font-bold text-brand' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
