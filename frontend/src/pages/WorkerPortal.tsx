import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function WorkerPortal() {
  const { tenantId, role } = useTenant()
  const [title, setTitle] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [checklist, setChecklist] = useState('[{"label":"Arrive","done":false},{"label":"Complete","done":false}]')
  const [jobs, setJobs] = useState<any[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    if (!tenantId) return
    const r = await api.apiFetch('/api/ops/worker/jobs', { method:'GET', tenantId })
    setJobs(r as any[])
  }

  async function loadMessages(tid: string) {
    if (!tenantId) return
    const m = await api.apiFetch(`/api/ops/messages/worker_job/${tid}`, { method:'GET', tenantId })
    setMessages(m as any[])
  }

  useEffect(() => { (async()=>{ try{ setErr(null); await load() } catch(e:any){ setErr(e.message||'Failed') } })() }, [tenantId])

  const canCreate = role === 'owner' || role === 'admin' || role === 'manager'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Worker Portal</h1>
      {err && <div className="text-red-300">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="New Job" right={<span className="text-xs text-slate-400">{canCreate ? 'enabled' : 'manager/admin only'}</span>}>
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Job title"
              value={title} onChange={e=>setTitle(e.target.value)} disabled={!canCreate} />
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Scheduled ISO (optional)"
              value={scheduledFor} onChange={e=>setScheduledFor(e.target.value)} disabled={!canCreate} />
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[120px]" placeholder='Checklist JSON'
              value={checklist} onChange={e=>setChecklist(e.target.value)} disabled={!canCreate} />
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId || !canCreate}
              onClick={async ()=>{ try{ setErr(null); const parsed = JSON.parse(checklist); await api.apiFetch('/api/ops/worker/jobs', { method:'POST', tenantId, body: JSON.stringify({ title, scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null, checklist: parsed }) }); setTitle(''); setScheduledFor(''); await load(); } catch(e:any){ setErr(e.message||'Create failed') } }}>
              Create
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            scheduled_for accepts ISO strings (e.g. 2026-01-09T15:00:00Z).
          </div>
        </Card>

        <Card title="Jobs">
          <div className="space-y-2">
            {jobs.map(j => (
              <button key={j.id} className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/40 p-3 hover:bg-slate-900"
                onClick={async ()=>{ setThreadId(j.id); await loadMessages(j.id) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-slate-400">{j.status}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{j.id}</div>
              </button>
            ))}
            {!jobs.length && <div className="text-sm text-slate-400">No jobs yet.</div>}
          </div>
        </Card>
      </div>

      <Card title="Job Thread">
        {!threadId && <div className="text-sm text-slate-400">Select a job to open its thread.</div>}
        {threadId && (
          <div className="grid gap-3">
            <div className="text-xs text-slate-500">thread: worker_job / {threadId}</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 max-h-[260px] overflow-auto">
              {messages.map(m => (
                <div key={m.id} className="py-2 border-b border-slate-800/60 last:border-b-0">
                  <div className="text-xs text-slate-500">{m.created_at}</div>
                  <div className="text-sm text-slate-200 whitespace-pre-wrap">{m.body}</div>
                </div>
              ))}
              {!messages.length && <div className="text-sm text-slate-400">No messages yet.</div>}
            </div>
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[90px]" placeholder="Message…"
              value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium"
              onClick={async ()=>{ try{ setErr(null); await api.apiFetch('/api/ops/messages', { method:'POST', tenantId, body: JSON.stringify({ thread_type:'worker_job', thread_id: threadId, body: msg }) }); setMsg(''); await loadMessages(threadId); } catch(e:any){ setErr(e.message||'Send failed') } }}>
              Send
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
