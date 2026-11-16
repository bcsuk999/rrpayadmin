import { clearSession, getToken } from '../auth'
import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export interface PublicIpResponse {
  success: boolean
  ipv4: string | null
  ipv6: string | null
  errors?: Record<string, string>
}

export async function getPublicIp(): Promise<PublicIpResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/ip`)
  } catch {
    throw new ApiError('Cannot reach the server. Please try again.', 0)
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new ApiError(`Invalid IP lookup response (${res.status})`, res.status)
  }

  if ((!res.ok && res.status !== 502) || !data || typeof data !== 'object') {
    const body = data as Record<string, unknown> | null
    const message = typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  const result = data as Record<string, unknown>
  if (
    typeof result.success !== 'boolean' ||
    (result.ipv4 !== null && typeof result.ipv4 !== 'string') ||
    (result.ipv6 !== null && typeof result.ipv6 !== 'string')
  ) {
    throw new ApiError('Invalid IP lookup response', res.status)
  }

  const errors = result.errors
  if (
    errors !== undefined &&
    (!errors ||
      typeof errors !== 'object' ||
      Array.isArray(errors) ||
      Object.values(errors).some((message) => typeof message !== 'string'))
  ) {
    throw new ApiError('Invalid IP lookup errors', res.status)
  }

  return {
    success: result.success,
    ipv4: result.ipv4,
    ipv6: result.ipv6,
    ...(errors ? { errors: errors as Record<string, string> } : {}),
  }
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Cannot reach the server. Please try again.', 0)
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    if (res.status === 401) {
      clearSession()
    }
    const message =
      (data.error as string) || (data.msg as string) || `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }
  return data as AdminResponse
}

export interface AdminResponse {
  success?: boolean
  msg?: string
  token?: string
  admin?: Record<string, unknown>
  count?: number
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  groups?: AdminGroup[]
}

export interface AdminGroup {
  _id: string
  uid: string
  groupId: number
  groupName: string
  status: string
  remark: string
  exchangeRate: number
  balance: string
  createdAt?: string
  updatedAt?: string
}

export async function adminRegister(
  mobile: string,
  password: string,
  role?: string,
) {
  const body: Record<string, unknown> = { mobile, password }
  if (role) body.role = role
  const data = await request('/admin/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data as AdminResponse & { group?: AdminGroup }
}

export async function adminLogin(mobile: string, password: string) {
  const data = await request('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  })
  return data
}

export interface GroupFilters {
  page?: number
  limit?: number
  uid?: string
  groupId?: number | string
  status?: string
  search?: string
}

export async function getAdminGroups(params: GroupFilters = {}) {
  const qs = new URLSearchParams()
  if (params.uid) qs.set('uid', params.uid)
  if (params.groupId) qs.set('groupId', String(params.groupId))
  if (params.status) qs.set('status', params.status)
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  const data = await request(`/admin/groups${suffix}`, { method: 'GET' })
  return data as AdminResponse & { groups: AdminGroup[] }
}

export async function updateAdminGroup(
  id: string,
  body: Record<string, unknown>,
) {
  const data = await request(`/admin/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data as AdminResponse & { group: AdminGroup }
}

export async function registerGroup(
  groupId: number,
  groupName?: string,
  uid?: string,
) {
  const data = await request('/groups/register', {
    method: 'POST',
    body: JSON.stringify({ groupId, groupName, uid }),
  })
  return data as AdminResponse & { group?: AdminGroup }
}

export async function getGroupById(id: string) {
  const data = await request(`/groups/${id}`, { method: 'GET' })
  return data as AdminResponse & { group: AdminGroup }
}

export interface PayinGroupSummary {
  _id?: string
  uid?: string
  groupId?: number
  groupName?: string
  status?: string
  exchangeRate?: number | null | { $numberDecimal?: string }
}

export interface AdminPayin {
  _id: string
  payOrderNo?: string
  outTradeNo?: string
  merNo?: string
  uid?: string
  groupId?: number
  upiId?: string
  totalAmount?: string
  deeplinkAmount?: string
  currencyCode?: string
  payType?: string
  status?: string
  payState?: string | null
  payURL?: string
  utrCode?: string | null
  paidAt?: string | null
  createdAt?: string
  updatedAt?: string
  group?: PayinGroupSummary | null
  [key: string]: unknown
}

export interface PayinFilters {
  q?: string
  groupId?: number | string
  orderId?: string
  payOrderNo?: string
  outTradeNo?: string
  uid?: string
  upi?: string
  upiId?: string
  amount?: string
  status?: string
  payUrl?: string
  payURL?: string
  payState?: string
  currencyCode?: string
  payType?: string
  merNo?: string
  createdFrom?: string
  from?: string
  createdTo?: string
  to?: string
  updatedFrom?: string
  updatedTo?: string
  page?: number
  limit?: number
}

export async function getAdminPayins(params: PayinFilters = {}) {
  const qs = new URLSearchParams()
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return
    qs.set(key, String(value))
  }
  set('q', params.q)
  set('groupId', params.groupId)
  set('orderId', params.orderId ?? params.payOrderNo)
  set('outTradeNo', params.outTradeNo)
  set('uid', params.uid)
  set('upi', params.upi ?? params.upiId)
  set('amount', params.amount)
  set('status', params.status)
  set('payUrl', params.payUrl ?? params.payURL)
  set('payState', params.payState)
  set('currencyCode', params.currencyCode)
  set('payType', params.payType)
  set('merNo', params.merNo)
  set('createdFrom', params.createdFrom ?? params.from)
  set('createdTo', params.createdTo ?? params.to)
  set('updatedFrom', params.updatedFrom)
  set('updatedTo', params.updatedTo)
  set('page', params.page)
  set('limit', params.limit)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  const data = await request(`/admin/payins${suffix}`, { method: 'GET' })
  return data as AdminResponse & {
    payins: AdminPayin[]
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export async function approveAdminPayin(id: string, utrCode?: string) {
  const body = utrCode ? { utrCode } : {}
  const data = await request(`/admin/payins/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data as AdminResponse & { payin: AdminPayin }
}

export async function getAdminPayin(id: string) {
  const data = await request(`/admin/payins/${encodeURIComponent(id)}`, { method: 'GET' })
  return data as AdminResponse & { payin: AdminPayin }
}
