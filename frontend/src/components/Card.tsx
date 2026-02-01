import React from 'react'

export function Card({
  title,
  children,
  right,
  className = '',
}: {
  title: string
  children: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <section className={`glass-morphism rounded-2xl p-4 ${className}`}>
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {right}
      </header>
      {children}
    </section>
  )
}
