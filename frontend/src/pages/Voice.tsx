import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/Card'
import { useTenant } from '../lib/tenant'
import * as api from '../lib/api'

type SpeechRec = any

function getSpeechRecognition(): SpeechRec | null {
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export default function Voice() {
  const { tenantId } = useTenant()
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('Voice engine ready. Add domain actions + policies to productionize.')
  const [err, setErr] = useState<string | null>(null)

  const recRef = useRef<SpeechRec | null>(null)

  useEffect(() => {
    const SR = getSpeechRecognition()
    setSupported(!!SR)
    if (SR) {
      const rec = new SR()
      rec.lang = 'en-US'
      rec.interimResults = true
      rec.continuous = true
      rec.onresult = (evt: any) => {
        const t = Array.from(evt.results).map((r:any) => r[0]?.transcript || '').join('')
        setTranscript(t)
      }
      rec.onerror = (e:any) => setErr(e?.error || 'speech error')
      rec.onend = () => setListening(false)
      recRef.current = rec
    }
  }, [])

  function speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.0
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch {}
  }

  async function runCommand(text: string) {
    // Deterministic command router (no LLM). Expand per project.
    const cleaned = text.trim().toLowerCase()
    if (!tenantId) return

    if (cleaned.includes('track event')) {
      await api.apiFetch('/api/growth/events', { method:'POST', tenantId, body: JSON.stringify({ event:'voice.command', properties:{ transcript: text } }) })
      setResponse('Tracked voice.command event.')
      speak('Tracked.')
      return
    }
    if (cleaned.startsWith('create note')) {
      const body = text.replace(/^create note/i, '').trim() || 'Voice note'
      await api.apiFetch('/api/memory/notes', { method:'POST', tenantId, body: JSON.stringify({ title:'Voice Note', content: body, tags: ['voice'] }) })
      setResponse('Created a memory note.')
      speak('Note created.')
      return
    }
    setResponse('No matching command. Add more routes in Voice.tsx runCommand().')
    speak('No matching command.')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Voice Engine</h1>
      {err && <div className="text-red-300">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Speech Input">
          <div className="text-sm text-slate-400 mb-3">
            Supported: {supported ? 'yes' : 'no'} • Listening: {listening ? 'yes' : 'no'}
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!supported || listening}
              onClick={()=>{ setErr(null); setTranscript(''); try{ recRef.current?.start(); setListening(true) } catch(e:any){ setErr(e.message||'start failed') } }}>
              Start
            </button>
            <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!supported || !listening}
              onClick={()=>{ try{ recRef.current?.stop(); setListening(false) } catch{} }}>
              Stop
            </button>
            <button className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium disabled:opacity-50"
              disabled={!tenantId || !transcript.trim()}
              onClick={()=>runCommand(transcript)}>
              Run Command
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-500">transcript</div>
            <div className="text-sm text-slate-200 whitespace-pre-wrap">{transcript || '—'}</div>
          </div>

          <div className="text-xs text-slate-500 mt-3">
            Commands: “create note …” • “track event …”
          </div>
        </Card>

        <Card title="Voice Response">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-500">response</div>
            <div className="text-sm text-slate-200 whitespace-pre-wrap">{response}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
