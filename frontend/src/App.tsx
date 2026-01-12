import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './lib/auth'
import { TenantProvider } from './lib/tenant'
import Login from './pages/Login'
import Register from './pages/Register'
import Overview from './pages/Overview'
import Admin from './pages/Admin'
import ClientPortal from './pages/ClientPortal'
import WorkerPortal from './pages/WorkerPortal'
import Memory from './pages/Memory'
import Growth from './pages/Growth'
import Avatar from './pages/Avatar'
import Voice from './pages/Voice'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-slate-300">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/app/overview" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/app/overview" element={<Protected><Overview /></Protected>} />
            <Route path="/app/admin" element={<Protected><Admin /></Protected>} />
            <Route path="/app/client" element={<Protected><ClientPortal /></Protected>} />
            <Route path="/app/worker" element={<Protected><WorkerPortal /></Protected>} />
            <Route path="/app/memory" element={<Protected><Memory /></Protected>} />
            <Route path="/app/growth" element={<Protected><Growth /></Protected>} />
            <Route path="/app/avatar" element={<Protected><Avatar /></Protected>} />
            <Route path="/app/voice" element={<Protected><Voice /></Protected>} />

            <Route path="*" element={<Navigate to="/app/overview" replace />} />
          </Routes>
        </Layout>
      </TenantProvider>
    </AuthProvider>
  )
}
