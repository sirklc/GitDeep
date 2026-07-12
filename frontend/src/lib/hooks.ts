'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    getMe,
    getNotifications,
    markNotificationRead,
    subscribePush,
    type NotificationItem,
    type UserOut,
} from '@/lib/api'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribing'

export function usePushSubscription() {
    const [state, setState] = useState<PushPermissionState>('default')

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
            setState('unsupported')
            return
        }
        setState(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default')
    }, [])

    const subscribe = useCallback(async () => {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) {
            setState('unsupported')
            return
        }
        setState('subscribing')
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setState(permission === 'denied' ? 'denied' : 'default')
                return
            }
            const registration = await navigator.serviceWorker.register('/sw.js')
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
            })
            const json = subscription.toJSON()
            await subscribePush({
                endpoint: subscription.endpoint,
                p256dh: json.keys?.p256dh ?? '',
                auth: json.keys?.auth ?? '',
            })
            setState('granted')
        } catch {
            setState('default')
        }
    }, [])

    return { state, subscribe }
}

export function useCurrentUser() {
    const [user, setUser] = useState<UserOut | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        getMe()
            .then((u) => {
                if (!cancelled) setUser(u)
            })
            .catch(() => {
                if (!cancelled) setUser(null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    return { user, loading }
}

export function useNotifications() {
    const [items, setItems] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        return getNotifications()
            .then(setItems)
            .catch(() => setItems([]))
    }, [])

    useEffect(() => {
        refresh().finally(() => setLoading(false))
    }, [refresh])

    const markAllRead = useCallback(async () => {
        const unread = items.filter((n) => !n.read)
        setItems((prev) => prev.map((n) => ({ ...n, read: true })))
        await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => undefined)))
    }, [items])

    const unreadCount = items.filter((n) => !n.read).length

    return { items, loading, unreadCount, refresh, markAllRead }
}
