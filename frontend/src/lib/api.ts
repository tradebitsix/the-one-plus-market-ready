const API_BASE = "https://theo-one-market-production.up.railway.app";

function joinUrl(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function request(path: string, options: RequestInit = {}) {
  const url = joinUrl(API_BASE, path);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "omit",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request("/api/auth/me", { method: "GET" }),
};

export default api;
