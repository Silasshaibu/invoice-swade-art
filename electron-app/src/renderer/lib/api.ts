// All API calls go to the hosted Vercel deployment — this is how web and desktop stay in sync.
export const API_BASE = import.meta.env.VITE_API_URL || 'https://invoice.swade-art.com'

const TOKEN_KEY = 'inv_token'
const USER_KEY  = 'inv_user'

export interface AuthUser {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function isLoggedIn(): boolean { return !!getToken() }

export async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}
