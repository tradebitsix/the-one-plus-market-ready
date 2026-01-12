const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type TokenPair = { access_token: string; refresh_token: string; token_type: 'bearer' }

export function getApiBase() { return API_BASE }

function jsonHeaders(extra?: Record<string,string>) {
  return { 'Content-Type': 'application/json', ...(extra || {}) }
}

export async function apiFetch<T>(path: string, opts: RequestInit & { tenantId?: string } = {}): Promise<T> {
  const token = localStorage.getItem('access_token')
  const headers: Record<string,string> = { ...(opts.headers as any || {}) }
  if (!headers['Content-Type'] && opts.body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (opts.tenantId) headers['X-Tenant-Id'] = opts.tenantId
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  const text = await res.text()
  if (!res.ok) {
    let detail = text
    try { detail = JSON.parse(text).detail ?? text } catch {}
    throw new Error(detail || `HTTP ${res.status}`)
  }
  return (text ? JSON.parse(text) : null) as T
}

export async function register(email: string, password: string, display_name?: string) {
  return apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ email, password, display_name }) })
}

export async function login(email: string, password: string): Promise<TokenPair> {
  return apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
}

export async function me() {
  return apiFetch('/api/auth/me', { method:'GET' })
}

export async function myTenants() {
  return apiFetch('/api/tenants', { method:'GET' })
}

export async function createTenant(name: string, slug: string) {
  return apiFetch('/api/tenants', { method:'POST', body: JSON.stringify({ name, slug }) })
}
