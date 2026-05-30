function resolveApiBase(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    let raw = import.meta.env.VITE_API_URL;
    try {
      new URL(raw);
    } catch {
      raw = `https://${raw}`;
    }
    return raw.replace(/\/+$/, "") + "/api";
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api";
  }
  return "http://localhost:4000/api";
}

const API_BASE = resolveApiBase();

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      message = errBody.message ?? errBody.status ?? message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(token) });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse<T>(res);
}
