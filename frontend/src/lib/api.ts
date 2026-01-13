/* frontend/src/lib/api.ts */

const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) ||
  "https://theo-one-market-production.up.railway.app/api";

const TENANT_ID =
  ((import.meta as any).env?.VITE_TENANT_ID as string | undefined) || "";

type ApiError = Error & {
  status?: number;
  data?: any;
};

function joinUrl(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export async function request(path: string, opts: RequestInit = {}) {
  const url = joinUrl(API_BASE, path);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };

  if (TENANT_ID) headers["X-Tenant-Id"] = TENANT_ID;

  const token = localStorage.getItem("access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...opts, headers });
  const data = await safeJson(res);

  if (!res.ok) {
    const err: ApiError = new Error(
      (data && (data.detail || data.message)) || `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function login(email: string, password: string) {
  const t = (await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as LoginResponse;

  if (t?.access_token) localStorage.setItem("access_token", t.access_token);
  if (t?.refresh_token) localStorage.setItem("refresh_token", t.refresh_token);

  return t;
}

export async function register(email: string, password: string, display_name: string) {
  return await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
}

export async function me() {
  return await request("/api/auth/me", { method: "GET" });
}

export const api = { request, login, register, me };
export default api;
