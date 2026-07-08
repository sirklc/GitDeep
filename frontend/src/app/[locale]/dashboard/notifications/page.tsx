'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertTriangle, CreditCard, XCircle, MailCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mockNotifications as initialNotifications, type NotificationType } from '@/lib/dashboard-mock'

const typeIcon: Record<NotificationType, React.ElementType> = {
    analysis_completed: CheckCircle2,
    low_credit: AlertTriangle,
    payment_success: CreditCard,
    payment_failed: XCircle,
}

const typeColor: Record<NotificationType, string> = {
    analysis_completed: 'text-green-500',
    low_credit: 'text-yellow-500',
    payment_success: 'text-accent',
    payment_failed: 'text-red-500',
}

export default function NotificationsPage() {
    const t = useTranslations('dashboardNotifications')
    const [items, setItems] = useState(initialNotifications)

    const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={markAllRead}>
                    <MailCheck className="mr-2 size-4" />
                    {t('markAllRead')}
                </Button>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardContent className="p-0">
                    {items.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {items.map((n) => {
                                const Icon = typeIcon[n.type]
                                return (
                                    <div
                                        key={n.id}
                                        className={cn('flex items-start gap-4 px-6 py-4', !n.read && 'bg-muted/20')}
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50">
                                            <Icon className={cn('size-4', typeColor[n.type])} />
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {t(`types.${n.type}`)}
                                                {n.repo && <span className="font-mono text-muted-foreground"> — {n.repo}</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(n.createdAt).toLocaleString('tr-TR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
