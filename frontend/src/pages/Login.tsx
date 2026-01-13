import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-slate-700 rounded-xl bg-slate-900">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <input
        className="w-full p-2 mb-3 bg-slate-800 border border-slate-600 rounded"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-2 mb-3 bg-slate-800 border border-slate-600 rounded"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {err && <div className="text-red-400 mb-3">{err}</div>}

      <button
        className="w-full bg-sky-600 hover:bg-sky-700 p-2 rounded text-white"
        onClick={async () => {
          setErr(null)
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/auth/login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              }
            )

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
              setErr(data?.detail || "Login failed")
              return
            }

            if (!data.access_token) {
              setErr("No token returned")
              return
            }

            localStorage.setItem("access_token", data.access_token)
            nav("/")
          } catch (e: any) {
            setErr(e.message || "Network error")
          }
        }}
      >
        Login
      </button>

      <div className="mt-4 text-slate-400">
        No account? <Link to="/register">Register</Link>
      </div>
    </div>
  )
}
