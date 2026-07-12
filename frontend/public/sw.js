self.addEventListener('push', (event) => {
    if (!event.data) return
    let payload
    try {
        payload = event.data.json()
    } catch {
        payload = { title: 'GitDeep', body: event.data.text() }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title ?? 'GitDeep', {
            body: payload.body,
            icon: '/favicon.ico',
            data: { url: payload.url ?? '/dashboard/notifications' },
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const targetUrl = event.notification.data?.url ?? '/dashboard/notifications'
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(targetUrl) && 'focus' in client) return client.focus()
            }
            if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
        })
    )
})
