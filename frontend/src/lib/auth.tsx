import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

type User = { id: string; email: string; display_name?: string | null; is_superadmin: boolean }
type AuthState = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshMe() {
    try {
      const u = await api.me()
      setUser(u as User)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshMe() }, [])

  async function doLogin(email: string, password: string) {
    const tok = await api.login(email, password)
    localStorage.setItem('access_token', tok.access_token)
    if (tok.refresh_token) localStorage.setItem('refresh_token', tok.refresh_token)
    else localStorage.removeItem('refresh_token')
    await refreshMe()
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login: doLogin, logout }), [user, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthProvider missing')
  return v
}