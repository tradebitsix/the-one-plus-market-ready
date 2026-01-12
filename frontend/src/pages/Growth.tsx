import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function Growth() {
  const { tenantId, role } = useTenant()
  const [events, setEvents] = useState<any[]>([])
  const [experiments, setExperiments] = useState<any[]>([])
  const [eventName, setEventName] = useState('page.view')
  const [props, setProps] = useState('{"page":"growth"}')
  const [exName, setExName] = useState('Onboarding CTA Test')
  const [hyp, setHyp] = useState('Changing CTA copy increases activation.')
  const [variants, setVariants] = useState('[{"id":"A","copy":"Start now"},{"id":"B","copy":"Build your system"}]')
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    if (!tenantId) return
    const [e, x] = await Promise.all([
      api.apiFetch('/api/growth/events?limit=200', { method:'GET', tenantId }),
      api.apiFetch('/api/growth/experiments?limit=100', { method:'GET', tenantId }),
    ])
    setEvents(e as any[])
    setExperiments(x as any[])
  }

  useEffect(() => { (async()=>{ try{ setErr(null); await load() } catch(e:any){ setErr(e.message||'Failed') } })() }, [tenantId])

  const can = role === 'owner' || role === 'admin'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Growth</h1>
      {err && <div className="text-red-300">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Track Event (GrowthEngine)">
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={eventName} onChange={e=>setEventName(e.target.value)} />
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[110px]" value={props} onChange={e=>setProps(e.target.value)} />
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId}
              onClick={async()=>{ try{ setErr(null); const p = JSON.parse(props); await api.apiFetch('/api/growth/events', { method:'POST', tenantId, body: JSON.stringify({ event: eventName, properties: p }) }); await load(); } catch(e:any){ setErr(e.message||'Track failed') } }}>
              Track
            </button>
          </div>
        </Card>

        <Card title="Create Experiment" right={<span className="text-xs text-slate-400">{can ? 'enabled' : 'owner/admin only'}</span>}>
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={exName} onChange={e=>setExName(e.target.value)} disabled={!can} />
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={hyp} onChange={e=>setHyp(e.target.value)} disabled={!can} />
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[110px]" value={variants} onChange={e=>setVariants(e.target.value)} disabled={!can} />
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId || !can}
              onClick={async()=>{ try{ setErr(null); const v = JSON.parse(variants); await api.apiFetch('/api/growth/experiments', { method:'POST', tenantId, body: JSON.stringify({ name: exName, hypothesis: hyp, variants: v }) }); await load(); } catch(e:any){ setErr(e.message||'Create failed') } }}>
              Save
            </button>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Recent Events">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(events, null, 2)}</pre>
        </Card>
        <Card title="Experiments">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(experiments, null, 2)}</pre>
        </Card>
      </div>
    </div>
  )
}
