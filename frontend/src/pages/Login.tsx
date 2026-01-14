import { useState } from "react";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      await api.login(email, password);
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div>{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
