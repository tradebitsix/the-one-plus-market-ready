import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from './api'

type Tenant = { id: string; name: string; slug: string; plan: string; status: string }
type Membership = { id: string; tenant_id: string; user_id: string; role: string }
type TenantRow = { tenant: Tenant; membership: Membership }

type TenantState = {
  tenantId: string | null
  role: string | null
  tenants: TenantRow[]
  refresh: () => Promise<void>
  setTenantId: (id: string) => void
}

const Ctx = createContext<TenantState | null>(null)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string | null>(localStorage.getItem('tenant_id'))
  const [role, setRole] = useState<string | null>(localStorage.getItem('tenant_role'))
  const [tenants, setTenants] = useState<TenantRow[]>([])

  async function refresh() {
    try {
      const rows = await api.myTenants()
      setTenants(rows as TenantRow[])
      if (!tenantId && rows?.length) {
        const first = (rows as TenantRow[])[0]
        setTenant(first.tenant.id, first.membership.role)
      } else if (tenantId) {
        const found = (rows as TenantRow[]).find(r => r.tenant.id === tenantId)
        if (found) setTenant(tenantId, found.membership.role)
      }
    } catch {
      setTenants([])
    }
  }

  function setTenant(id: string, r: string) {
    setTenantIdState(id)
    setRole(r)
    localStorage.setItem('tenant_id', id)
    localStorage.setItem('tenant_role', r)
  }

  function setTenantId(id: string) {
    const found = tenants.find(t => t.tenant.id === id)
    setTenant(id, found?.membership.role || 'member')
  }

  useEffect(() => { refresh() }, [])

  const value = useMemo(() => ({ tenantId, role, tenants, refresh, setTenantId }), [tenantId, role, tenants])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTenant() {
  const v = useContext(Ctx)
  if (!v) throw new Error('TenantProvider missing')
  return v
}
