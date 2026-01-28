// frontend/src/lib/api.ts
const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

if (!rawBase) {
  throw new Error("Missing VITE_API_URL. Set it in Vercel → Project → Settings → Environment Variables.");
}

const BASE = String(rawBase).replace(/\/+$/, "");

function join(path: string) {
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  // Only set JSON Content-Type when sending JSON bodies
  const hasBody = typeof options.body !== "undefined";
  const isForm = headers["Content-Type"] === "application/x-www-form-urlencoded";
  if (hasBody && !isForm && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(join(path), {
    ...options,
    headers,
    credentials: "omit",
  });

  const data: any = await readJson(res);

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

type TokenPair = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export const api = {
  health() {
    return request<{ status: string }>("/health", { method: "GET" });
  },

  // Login tries JSON first; if backend expects OAuth2 form, it retries with form payload.
  async login(email: string, password: string): Promise<TokenPair> {
    // Attempt 1: JSON (matches your current swagger JSON body pattern)
    try {
      const data = await request<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const access =
        data?.access_token ||
        data?.token ||
        data?.accessToken ||
        data?.access;

      if (!access) throw new Error("Login response missing token.");
      return {
        access_token: access,
        refresh_token: data?.refresh_token,
        token_type: data?.token_type || "bearer",
      };
    } catch (e: any) {
      // If JSON schema mismatch causes 422, retry with OAuth2PasswordRequestForm style:
      // Content-Type: application/x-www-form-urlencoded
      // fields: username, password
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);

      const res = await fetch(join("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        credentials: "omit",
      });

      const data: any = await readJson(res);

      if (!res.ok) {
        const msg =
          data?.detail?.[0]?.msg ||
          data?.detail ||
          data?.message ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const access =
        data?.access_token ||
        data?.token ||
        data?.accessToken ||
        data?.access;

      if (!access) throw new Error("Login response missing token.");
      return {
        access_token: access,
        refresh_token: data?.refresh_token,
        token_type: data?.token_type || "bearer",
      };
    }
  },

  me() {
    return request<any>("/auth/me", { method: "GET" });
  },
};