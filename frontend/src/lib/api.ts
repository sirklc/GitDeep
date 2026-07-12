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
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export type UserOut = {
    id: number;
    email: string;
    locale: string;
    credit_balance: number;
};

export type MessageOut = {
    message: string;
};

export function getMe(): Promise<UserOut> {
    return api.get<UserOut>("/auth/me");
}

export type NotificationType = "analysis_completed" | "analysis_blocked" | "low_credit" | "credit_exhausted";

export type NotificationItem = {
    id: number;
    type: NotificationType;
    repo: string | null;
    read: boolean;
    created_at: string;
};

export function getNotifications(): Promise<NotificationItem[]> {
    return api.get<NotificationItem[]>("/notifications");
}

export function markNotificationRead(id: number): Promise<MessageOut> {
    return api.post<MessageOut>(`/notifications/${id}/read`);
}

export function reportDownloadUrl(jobId: string): string {
    return `${API_URL}/analysis/jobs/${jobId}/report`;
}

export type PushSubscriptionPayload = {
    endpoint: string;
    p256dh: string;
    auth: string;
};

export function subscribePush(payload: PushSubscriptionPayload): Promise<MessageOut> {
    return api.post<MessageOut>("/push/subscribe", payload);
}

export function unsubscribePush(endpoint: string): Promise<MessageOut> {
    return api.post<MessageOut>("/push/unsubscribe", { endpoint });
}
