'use client'

import { useTranslations } from 'next-intl'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushSubscription } from '@/lib/hooks'

export function PushPermissionButton() {
    const t = useTranslations('dashboardNotifications')
    const { state, subscribe } = usePushSubscription()

    if (state === 'unsupported' || state === 'granted') return null

    return (
        <Button variant="outline" size="sm" onClick={subscribe} disabled={state === 'subscribing' || state === 'denied'}>
            {state === 'subscribing' ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
                <Bell className="mr-2 size-4" />
            )}
            {state === 'denied' ? t('pushDenied') : t('enablePush')}
        </Button>
    )
}
