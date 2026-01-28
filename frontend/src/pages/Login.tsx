import { useState } from "react";
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

      // If "/" routes back to login, change this to your real dashboard route.
      window.location.href = "/app";
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
      />
      {error && <div>{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}