import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTenant } from '../lib/tenant'

const navItem =
  'px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition whitespace-nowrap'
const navActive = 'text-foreground bg-white/8 glass-morphism'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { tenants, tenantId, setTenantId } = useTenant()
  const nav = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-background/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl glass-morphism flex items-center justify-center font-semibold shrink-0 glow-brand">
              1+
            </div>
            <div className="min-w-0">
              <div className="font-grotesk font-semibold leading-tight truncate">THE_ONE+</div>
              <div className="text-xs text-muted-foreground truncate">By: FanzofTheOne</div>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <select
                className="neo-morphism-inset border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground max-w-[46vw]"
                value={tenantId || ''}
                onChange={(e) => setTenantId(e.target.value)}
              >
                <option value="" disabled>
                  Select tenant
                </option>
                {tenants.map((t) => (
                  <option key={t.tenant.id} value={t.tenant.id}>
                    {t.tenant.name} ({t.membership.role})
                  </option>
                ))}
              </select>

              <button
                className="px-3 py-2 rounded-xl glass-morphism text-sm hover:bg-white/10 transition"
                onClick={() => {
                  logout()
                  nav('/login')
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {user && (
          <nav className="max-w-6xl mx-auto px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1">
              <NavLink to="/app/overview" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Overview
              </NavLink>
              <NavLink to="/app/admin" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Admin
              </NavLink>
              <NavLink to="/app/client" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Client Portal
              </NavLink>
              <NavLink to="/app/worker" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Worker Portal
              </NavLink>
              <NavLink to="/app/memory" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Memory
              </NavLink>
              <NavLink to="/app/growth" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Growth
              </NavLink>
              <NavLink to="/app/avatar" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Avatar
              </NavLink>
              <NavLink to="/app/voice" className={({ isActive }) => `${navItem} ${isActive ? navActive : ''}`}>
                Voice
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">{children}</main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-muted-foreground">
        Audit-first. Tenant-safe. Policy-enforced.
      </footer>
    </div>
  )
}
