import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./lib/auth"
import { TenantProvider } from "./lib/tenant"

import Layout from "./components/Layout"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Overview from "./pages/Overview"
import Admin from "./pages/Admin"
import ClientPortal from "./pages/ClientPortal"
import WorkerPortal from "./pages/WorkerPortal"
import Memory from "./pages/Memory"
import Growth from "./pages/Growth"
import Avatar from "./pages/Avatar"
import Voice from "./pages/Voice"

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="text-slate-300 text-center py-6">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/app/*"
            element={
              <Protected>
                <Layout>
                  <Routes>
                    <Route path="overview" element={<Overview />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="client" element={<ClientPortal />} />
                    <Route path="worker" element={<WorkerPortal />} />
                    <Route path="memory" element={<Memory />} />
                    <Route path="growth" element={<Growth />} />
                    <Route path="avatar" element={<Avatar />} />
                    <Route path="voice" element={<Voice />} />
                    <Route path="*" element={<Navigate to="/app/overview" replace />} />
                  </Routes>
                </Layout>
              </Protected>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </TenantProvider>
    </AuthProvider>
  )
}
