import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTenant } from '../lib/tenant'

export default function Login() {
  const { login } = useAuth()
  const { refresh } = useTenant()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-slate-400 mb-6">Access your tenants and dashboards.</p>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <label className="block text-sm text-slate-300 mb-2">Email</label>
        <input className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-4"
          value={email} onChange={e=>setEmail(e.target.value)} />

        <label className="block text-sm text-slate-300 mb-2">Password</label>
        <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-4"
          value={password} onChange={e=>setPassword(e.target.value)} />

        {err && <div className="text-sm text-red-300 mb-3">{err}</div>}

        <button className="w-full rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-2 font-medium"
          onClick={async ()=>{ setErr(null); try { await login(email, password); await refresh(); nav('/app/overview'); } catch (e:any) { setErr(e.message || 'Login failed') } }}>
          Login
        </button>

        <div className="text-sm text-slate-400 mt-4">
          No account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}
