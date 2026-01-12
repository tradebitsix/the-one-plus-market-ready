import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function Avatar() {
  const { tenantId } = useTenant()
  const [theme, setTheme] = useState('dark')
  const [accent, setAccent] = useState('sky')
  const [persona, setPersona] = useState('Operator')
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    if (!tenantId) return
    await api.apiFetch('/api/admin/settings', { method:'POST', tenantId, body: JSON.stringify({ key: 'avatar.profile', value: { persona, theme, accent } }) })
  }

  useEffect(() => {
    (async () => {
      try {
        setErr(null)
        if (!tenantId) return
        const s = await api.apiFetch('/api/admin/settings', { method:'GET', tenantId })
        const row = (s as any[]).find(x => x.key === 'avatar.profile')
        if (row?.value_json) {
          try {
            const v = JSON.parse(row.value_json)
            setPersona(v.persona ?? persona)
            setTheme(v.theme ?? theme)
            setAccent(v.accent ?? accent)
          } catch {}
        }
      } catch (e:any) {
        setErr(e.message || 'Failed')
      }
    })()
  }, [tenantId])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Avatar & Theme</h1>
      {err && <div className="text-red-300">{err}</div>}

      <Card title="Profile">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm text-slate-300 mb-2">Persona</div>
            <input className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={persona} onChange={e=>setPersona(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-slate-300 mb-2">Theme</div>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={theme} onChange={e=>setTheme(e.target.value)}>
              <option value="dark">dark</option>
              <option value="slate">slate</option>
              <option value="midnight">midnight</option>
            </select>
          </div>
          <div>
            <div className="text-sm text-slate-300 mb-2">Accent</div>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={accent} onChange={e=>setAccent(e.target.value)}>
              <option value="sky">sky</option>
              <option value="emerald">emerald</option>
              <option value="amber">amber</option>
              <option value="rose">rose</option>
            </select>
          </div>
        </div>

        <button className="mt-4 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
          disabled={!tenantId}
          onClick={async()=>{ try{ setErr(null); await save(); alert('Saved'); } catch(e:any){ setErr(e.message||'Save failed') } }}>
          Save
        </button>
      </Card>

      <Card title="Preview">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="text-sm text-slate-400">persona</div>
          <div className="text-xl font-semibold">{persona}</div>
          <div className="text-sm text-slate-400 mt-3">theme / accent</div>
          <div className="text-base">{theme} / {accent}</div>
        </div>
      </Card>
    </div>
  )
}
