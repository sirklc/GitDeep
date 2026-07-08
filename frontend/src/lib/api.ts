const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.status = status;
        this.detail = detail;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    if (!res.ok) {
        let detail = res.statusText;
        try {
            const body = await res.json();
            detail = body.detail ?? detail;
        } catch {
            // yanıt gövdesi JSON değilse statusText'e düş
        }
        throw new ApiError(res.status, detail);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
};

export type UserOut = {
    id: number;
    email: string;
    locale: string;
};

export type MessageOut = {
    message: string;
};
