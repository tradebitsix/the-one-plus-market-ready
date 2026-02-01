import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../lib/api'

export default function Register() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [display, setDisplay] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    const e = email.trim()
    const p = password.trim()
    if (!e || !p) {
      setErr('Email and password are required.')
      return
    }
    try {
      await api.register(e, p, display.trim() || undefined)
      nav('/login')
    } catch (e: any) {
      setErr(e?.message || 'Register failed')
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl glass-morphism flex items-center justify-center font-semibold glow-brand">
            1+
          </div>
          <div className="min-w-0">
            <div className="font-grotesk text-lg font-semibold leading-tight">THE_ONE+</div>
            <div className="text-xs text-muted-foreground">By: FanzofTheOne</div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-5">
          <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Create your first identity.</p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Display name</label>
              <input
                className="w-full neo-morphism-inset border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
                placeholder="Your name"
                autoComplete="nickname"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email</label>
              <input
                className="w-full neo-morphism-inset border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                className="w-full neo-morphism-inset border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {err && (
              <div className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/40 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-95 transition glow-brand"
              onClick={submit}
            >
              Create account
            </button>

            <div className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-foreground hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
