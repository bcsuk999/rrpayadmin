import { clearSession, getToken } from '../auth'
import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
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
) {
  return request('/admin/auth/register', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  })
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
  groupId?: number
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
