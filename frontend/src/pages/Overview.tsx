import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function Overview() {
  const { tenantId, role, tenants, refresh } = useTenant()
  const [health, setHealth] = useState<any>(null)
  const [billing, setBilling] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setErr(null)
        const h = await api.apiFetch('/health', { method: 'GET' })
        setHealth(h)
        if (tenantId) {
          const b = await api.apiFetch('/api/billing/status', { method: 'GET', tenantId })
          setBilling(b)
        }
      } catch (e:any) {
        setErr(e.message || 'Failed to load')
      }
    })()
  }, [tenantId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <div className="text-sm text-slate-400">Tenant context + system health.</div>
        </div>
        <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm" onClick={refresh}>
          Refresh tenants
        </button>
      </div>

      {err && <div className="text-red-300">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Runtime">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(health, null, 2)}</pre>
        </Card>

        <Card title="Tenant Context">
          <div className="text-sm text-slate-300">tenantId: <span className="text-slate-100">{tenantId || '(none)'}</span></div>
          <div className="text-sm text-slate-300">role: <span className="text-slate-100">{role || '(none)'}</span></div>
          <div className="mt-3 text-xs text-slate-400">Tenants: {tenants.length}</div>
          <div className="mt-3">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(billing, null, 2)}</pre>
          </div>
        </Card>
      </div>
    </div>
  )
}
