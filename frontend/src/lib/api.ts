// frontend/src/lib/api.ts
const rawBase = import.meta.env.VITE_API_URL;

// Vercel builds can succeed even if env is missing; fail loudly at runtime.
if (!rawBase) {
  throw new Error("VITE_API_URL is missing. Set it in Vercel → Project → Settings → Environment Variables.");
}

// Normalize: no trailing slash
const BASE = rawBase.replace(/\/+$/, "");

type LoginResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
};

function join(path: string) {
  // path must start with "/"
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(join(path), {
    ...options,
    headers,
    // If you are NOT using cookies, keep credentials OFF.
    // Turning it on can trigger stricter CORS rules.
    credentials: "omit",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  async health() {
    return request<{ status: string }>("/health", { method: "GET" });
  },

  // frontend/src/lib/api.ts
const rawBase = import.meta.env.VITE_API_URL;

// Vercel builds can succeed even if env is missing; fail loudly at runtime.
if (!rawBase) {
  throw new Error("VITE_API_URL is missing. Set it in Vercel → Project → Settings → Environment Variables.");
}

// Normalize: no trailing slash
const BASE = rawBase.replace(/\/+$/, "");

type LoginResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
};

function join(path: string) {
  // path must start with "/"
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(join(path), {
    ...options,
    headers,
    // If you are NOT using cookies, keep credentials OFF.
    // Turning it on can trigger stricter CORS rules.
    credentials: "omit",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  async health() {
    return request<{ status: string }>("/health", { method: "GET" });
  },

  async login(email: string, password: string) {
    // Backend route per your router.py: /auth/login (NOT /api/auth/login)
    const data = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const tok = data.access_token || data.token;
    if (!tok) throw new Error("Login succeeded but no token returned.");

    localStorage.setItem("token", tok);
    return tok;
  },

  async me() {
    return request<any>("/auth/me", { method: "GET" });
  },
};