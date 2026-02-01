import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");

    const eTrim = email.trim();
    const pTrim = password.trim();

    if (!eTrim || !pTrim) {
      setError("Email and password are required.");
      return;
    }

    try {
      await login(eTrim, pTrim);
      window.location.href = "/app/overview";
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

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
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Enter your credentials to access the platform.
          </p>

          <form onSubmit={submit} className="space-y-3">
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
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/40 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-95 transition glow-brand"
            >
              Login
            </button>

            <div className="text-sm text-muted-foreground">
              Need an account? <Link to="/register" className="text-foreground hover:underline">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
