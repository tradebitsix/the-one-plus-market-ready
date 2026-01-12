import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTenant } from '../lib/tenant'

const navItem = "px-3 py-2 rounded-lg hover:bg-slate-800"
const navActive = "bg-slate-800"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { tenants, tenantId, role, setTenantId } = useTenant()
  const nav = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-semibold">1+</div>
            <div>
              <div className="font-semibold leading-tight">THE_ONE+</div>
              <div className="text-xs text-slate-400">By: FanzofTheOne</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm"
                  value={tenantId || ''}
                  onChange={(e) => setTenantId(e.target.value)}
                >
                  <option value="" disabled>Select tenant</option>
                  {tenants.map(t => (
                    <option key={t.tenant.id} value={t.tenant.id}>
                      {t.tenant.name} ({t.membership.role})
                    </option>
                  ))}
                </select>
                <div className="text-sm text-slate-300 hidden sm:block">{user.email}</div>
                <button
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                  onClick={() => { logout(); nav('/login') }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        {user && (
          <nav className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
            <NavLink to="/app/overview" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Overview</NavLink>
            <NavLink to="/app/admin" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Admin</NavLink>
            <NavLink to="/app/client" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Client Portal</NavLink>
            <NavLink to="/app/worker" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Worker Portal</NavLink>
            <NavLink to="/app/memory" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Memory</NavLink>
            <NavLink to="/app/growth" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Growth</NavLink>
            <NavLink to="/app/avatar" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Avatar</NavLink>
            <NavLink to="/app/voice" className={({isActive}) => `${navItem} ${isActive ? navActive : ''}`}>Voice</NavLink>
          </nav>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-slate-500">
        Audit-first. Tenant-safe. Policy-enforced.
      </footer>
    </div>
  )
}
