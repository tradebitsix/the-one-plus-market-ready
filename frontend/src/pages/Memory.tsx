import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

export default function Memory() {
  const { tenantId } = useTenant()
  const [notes, setNotes] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')

  const [stype, setStype] = useState('url')
  const [stitle, setStitle] = useState('')
  const [surl, setSurl] = useState('')
  const [serr, setSerr] = useState<string | null>(null)

  async function load() {
    if (!tenantId) return
    const [n, s] = await Promise.all([
      api.apiFetch('/api/memory/notes', { method:'GET', tenantId }),
      api.apiFetch('/api/memory/sources', { method:'GET', tenantId }),
    ])
    setNotes(n as any[])
    setSources(s as any[])
  }

  useEffect(() => { (async()=>{ try{ setSerr(null); await load() } catch(e:any){ setSerr(e.message||'Failed') } })() }, [tenantId])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Memory</h1>
      {serr && <div className="text-red-300">{serr}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Create Note (MemoryCore)">
          <div className="grid gap-3">
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Title"
              value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[140px]" placeholder="Content"
              value={content} onChange={e=>setContent(e.target.value)} />
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="tags (comma separated)"
              value={tags} onChange={e=>setTags(e.target.value)} />
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId}
              onClick={async()=>{ try{ setSerr(null); const t = tags.split(',').map(x=>x.trim()).filter(Boolean); await api.apiFetch('/api/memory/notes', { method:'POST', tenantId, body: JSON.stringify({ title, content, tags: t }) }); setTitle(''); setContent(''); setTags(''); await load(); } catch(e:any){ setSerr(e.message||'Create failed') } }}>
              Save
            </button>
          </div>
        </Card>

        <Card title="Ingest Source (MemoryCore)">
          <div className="grid gap-3">
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={stype} onChange={e=>setStype(e.target.value)}>
              <option value="url">url</option>
              <option value="text">text</option>
              <option value="doc">doc</option>
            </select>
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="Source title"
              value={stitle} onChange={e=>setStitle(e.target.value)} />
            <input className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" placeholder="URL (optional)"
              value={surl} onChange={e=>setSurl(e.target.value)} />
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId}
              onClick={async()=>{ try{ setSerr(null); await api.apiFetch('/api/memory/sources', { method:'POST', tenantId, body: JSON.stringify({ source_type: stype, title: stitle, url: surl || null, content: null, meta: null }) }); setStitle(''); setSurl(''); await load(); } catch(e:any){ setSerr(e.message||'Ingest failed') } }}>
              Add
            </button>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Notes">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(notes, null, 2)}</pre>
        </Card>
        <Card title="Sources">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(sources, null, 2)}</pre>
        </Card>
      </div>
    </div>
  )
}
