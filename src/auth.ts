const TOKEN_KEY = 'rrpay_admin_token'
const USER_KEY = 'rrpay_admin_user'
const EXPIRY_KEY = 'rrpay_admin_token_expiry'

const TOKEN_TTL_MS = 10 * 24 * 60 * 60 * 1000

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): unknown | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + TOKEN_TTL_MS))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

export function isAuthenticated(): boolean {
  if (!getToken()) return false
  const expiresAt = Number(localStorage.getItem(EXPIRY_KEY) || 0)
  if (!expiresAt || Date.now() >= expiresAt) {
    clearSession()
    return false
  }
  return true
}
