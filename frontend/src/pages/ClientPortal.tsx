import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function ClientPortal() {
  const { tenantId } = useTenant()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('normal')
  const [rows, setRows] = useState<any[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    if (!tenantId) return
    const r = await api.apiFetch('/api/ops/client/requests', { method:'GET', tenantId })
    setRows(r as any[])
  }

  async function loadMessages(tid: string) {
    if (!tenantId) return
    const m = await api.apiFetch(`/api/ops/messages/client_request/${tid}`, { method:'GET', tenantId })
    setMessages(m as any[])
  }

  useEffect(() => { (async()=>{ try{ setErr(null); await load() } catch(e:any){ setErr(e.message||'Failed') } })() }, [tenantId])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      {err && <div className="text-red-300">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="New Request">
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Title"
              value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[120px]" placeholder="Description"
              value={desc} onChange={e=>setDesc(e.target.value)} />
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId}
              onClick={async ()=>{ try{ setErr(null); await api.apiFetch('/api/ops/client/requests', { method:'POST', tenantId, body: JSON.stringify({ title, description: desc, priority }) }); setTitle(''); setDesc(''); await load(); } catch(e:any){ setErr(e.message||'Create failed') } }}>
              Submit
            </button>
          </div>
        </Card>

        <Card title="Requests">
          <div className="space-y-2">
            {rows.map(r => (
              <button key={r.id} className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/40 p-3 hover:bg-slate-900"
                onClick={async ()=>{ setThreadId(r.id); await loadMessages(r.id) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-400">{r.priority} • {r.status}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{r.id}</div>
              </button>
            ))}
            {!rows.length && <div className="text-sm text-slate-400">No requests yet.</div>}
          </div>
        </Card>
      </div>

      <Card title="Request Thread">
        {!threadId && <div className="text-sm text-slate-400">Select a request to open its thread.</div>}
        {threadId && (
          <div className="grid gap-3">
            <div className="text-xs text-slate-500">thread: client_request / {threadId}</div>
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
              onClick={async ()=>{ try{ setErr(null); await api.apiFetch('/api/ops/messages', { method:'POST', tenantId, body: JSON.stringify({ thread_type:'client_request', thread_id: threadId, body: msg }) }); setMsg(''); await loadMessages(threadId); } catch(e:any){ setErr(e.message||'Send failed') } }}>
              Send
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
