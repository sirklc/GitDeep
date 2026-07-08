import React from 'react'
import { useTranslations } from 'next-intl'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TeamPage() {
    const t = useTranslations('dashboardTeam')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted border border-border/50">
                        <Users className="size-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t('comingSoonTitle')}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t('comingSoonDesc')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
