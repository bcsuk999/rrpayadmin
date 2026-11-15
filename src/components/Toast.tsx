import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

type Listener = () => void

let toasts: ToastItem[] = []
const listeners = new Set<Listener>()
let nextId = 0

function emit() {
  listeners.forEach((l) => l())
}

function defaultDuration(type: ToastType) {
  switch (type) {
    case 'success':
      return 3500
    case 'error':
      return 4500
    case 'warning':
      return 4000
    default:
      return 4000
  }
}

export function addToast(
  message: string,
  type: ToastType = 'info',
  duration?: number,
) {
  const id = ++nextId
  const d = duration ?? defaultDuration(type)
  const toast: ToastItem = { id, message, type, duration: d }
  toasts = [...toasts, toast]
  emit()
  if (d > 0) {
    window.setTimeout(() => dismissToast(id), d)
  }
  return id
}

export function dismissToast(id: number) {
  if (!toasts.some((t) => t.id === id)) return
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function clearToasts() {
  toasts = []
  emit()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

export function useToast() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    toasts: snapshot,
    add: addToast,
    dismiss: dismissToast,
    clear: clearToasts,
    success: (msg: string, duration?: number) =>
      addToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => addToast(msg, 'error', duration),
    warning: (msg: string, duration?: number) =>
      addToast(msg, 'warning', duration),
    info: (msg: string, duration?: number) => addToast(msg, 'info', duration),
  }
}

const iconFor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '!'
    default:
      return '●'
  }
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div
      className="toast-viewport fixed top-4 left-1/2 z-[9999] flex w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 flex-col items-center gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={[
            'toast pointer-events-auto flex w-full min-w-[260px] items-start gap-2.5 rounded-md border border-card-border bg-white p-3 text-ink shadow-[0_2px_12px_rgba(0,0,0,0.1)] animate-[toastIn_0.22s_ease]',
            t.type === 'success' ? 'border-l-[3px] border-l-success' : '',
            t.type === 'error' ? 'border-l-[3px] border-l-danger' : '',
            t.type === 'warning' ? 'border-l-[3px] border-l-warning' : '',
            t.type === 'info' ? 'border-l-[3px] border-l-brand' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              'toast-icon mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold leading-none text-white',
              t.type === 'success' ? 'bg-success' : '',
              t.type === 'error' ? 'bg-danger' : '',
              t.type === 'warning' ? 'bg-warning' : '',
              t.type === 'info' ? 'bg-brand' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            {iconFor(t.type)}
          </span>
          <p className="toast-message flex-1 break-words text-sm leading-[1.4]">
            {t.message}
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="toast-close -mt-0.5 shrink-0 cursor-pointer border-none bg-transparent p-0.5 text-lg leading-none text-ink-soft hover:text-ink"
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
