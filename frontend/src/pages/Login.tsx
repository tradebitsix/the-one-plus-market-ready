import { useState } from "react";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");

    const eTrim = email.trim();
    const pTrim = password.trim();

    // Block the empty-submit that triggers FastAPI/Pydantic "valid dictionary" errors
    if (!eTrim || !pTrim) {
      setError("Email and password are required.");
      return;
    }

    try {
      await api.login(eTrim, pTrim);
      window.location.href = "/"; // change to "/app" if your dashboard route is /app
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
```0