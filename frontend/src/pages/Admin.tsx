import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function Admin() {
  const { tenantId, role, refresh } = useTenant()
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [policyName, setPolicyName] = useState('Tenant Policy')
  const [policyRules, setPolicyRules] = useState(`[{"id":"block-delete-jobs","type":"block_action","match":{"action":"worker_job.delete"}}]`)
  const [err, setErr] = useState<string | null>(null)
  const canAdmin = useMemo(() => (role === 'owner' || role === 'admin'), [role])

  async function loadTenantAdmin() {
    if (!tenantId || !canAdmin) return
    const [u, a, s, p] = await Promise.all([
      api.apiFetch('/api/admin/users', { method:'GET', tenantId }),
      api.apiFetch('/api/admin/audit?limit=100', { method:'GET', tenantId }),
      api.apiFetch('/api/admin/settings', { method:'GET', tenantId }),
      api.apiFetch('/api/safety/policies', { method:'GET', tenantId }),
    ])
    setUsers(u as any[])
    setAudit(a as any[])
    setSettings(s as any[])
    setPolicies(p as any[])
  }

  useEffect(() => {
    (async () => {
      try { setErr(null); await loadTenantAdmin() } catch (e:any) { setErr(e.message || 'Failed') }
    })()
  }, [tenantId, canAdmin])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      {err && <div className="text-red-300">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Create Tenant (Organization)">
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Tenant name"
              value={orgName} onChange={e=>setOrgName(e.target.value)} />
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="tenant-slug (lowercase)"
              value={orgSlug} onChange={e=>setOrgSlug(e.target.value)} />
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium"
              onClick={async ()=>{ try { setErr(null); await api.createTenant(orgName, orgSlug); setOrgName(''); setOrgSlug(''); await refresh(); } catch (e:any){ setErr(e.message || 'Create failed') } }}>
              Create
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            After creation, use the tenant dropdown (top) to switch context.
          </div>
        </Card>

        <Card title="Invite Member" right={<span className="text-xs text-slate-400">{canAdmin ? 'enabled' : 'owner/admin only'}</span>}>
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="email@domain.com"
              value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} disabled={!canAdmin || !tenantId} />
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
              value={inviteRole} onChange={e=>setInviteRole(e.target.value)} disabled={!canAdmin || !tenantId}>
              <option value="member">member</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!canAdmin || !tenantId}
              onClick={async ()=>{ try { setErr(null); const inv = await api.apiFetch(`/api/tenants/${tenantId}/invites`, { method:'POST', tenantId, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) }); setInviteEmail(''); await loadTenantAdmin(); alert(`Invite token (share securely): ${(inv as any).token}`); } catch (e:any){ setErr(e.message || 'Invite failed') } }}>
              Create Invite
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            This app returns the invite token (dev mode). In production, email delivery plugs in here.
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Users">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(users, null, 2)}</pre>
        </Card>
        <Card title="Tenant Settings">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(settings, null, 2)}</pre>
        </Card>
        <Card title="Policies (SafetyManager)">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(policies, null, 2)}</pre>
        </Card>
      </div>

      <Card title="Upsert Policy (Tenant)">
        <div className="grid gap-3">
          <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={policyName} onChange={e=>setPolicyName(e.target.value)} />
          <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[140px]" value={policyRules} onChange={e=>setPolicyRules(e.target.value)} />
          <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
            disabled={!canAdmin || !tenantId}
            onClick={async ()=>{ try { setErr(null); const rules = JSON.parse(policyRules); await api.apiFetch('/api/safety/policies', { method:'POST', tenantId: tenantId || undefined, body: JSON.stringify({ name: policyName, rules }) }); await loadTenantAdmin(); } catch (e:any){ setErr(e.message || 'Policy failed') } }}>
            Save Policy
          </button>
        </div>
        <div className="text-xs text-slate-400 mt-3">
          Rule types: block_action, require_role, block_content.
        </div>
      </Card>

      <Card title="Audit Log">
        <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(audit, null, 2)}</pre>
      </Card>
    </div>
  )
}
