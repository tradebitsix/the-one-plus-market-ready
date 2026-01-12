import React from 'react'

export function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  )
}
