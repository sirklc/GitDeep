const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

function csrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)gd_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(method !== "GET" ? { "X-CSRF-Token": csrfToken() } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retryOn401 && path !== "/auth/refresh") {
    // Access token süresi dolmuş olabilir — bir kez refresh dene.
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": csrfToken() },
    });
    if (refreshed.ok) {
      return request<T>(path, options, false);
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      // gövde JSON değilse statusText yeter
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};

// --- Tipler (backend şemalarıyla eş) ---

export interface UserOut {
  id: number;
  email: string;
  locale: string;
  email_verified: boolean;
  credit_balance: number;
  created_at: string;
}

export interface TransactionOut {
  id: number;
  delta: number;
  balance_after: number;
  reason: string;
  job_id: string | null;
  created_at: string;
}
