'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Copy, KeyRound, RotateCcw, Webhook } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MOCK_KEY = 'gd_live_51NxQb2K8vZ4mR7pW9sT3yA6c'

function maskKey(key: string) {
    return `${key.slice(0, 10)}${'•'.repeat(14)}${key.slice(-4)}`
}

export default function IntegrationsPage() {
    const t = useTranslations('dashboardIntegrations')
    const [apiKey, setApiKey] = useState(MOCK_KEY)
    const [copied, setCopied] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState('')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // clipboard API unavailable — no-op UI mock
        }
    }

    const handleRegenerate = () => {
        const random = Math.random().toString(36).slice(2, 26)
        setApiKey(`gd_live_${random}`)
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <KeyRound className="size-4 text-accent" />
                        {t('apiKeyTitle')}
                    </CardTitle>
                    <CardDescription>{t('apiKeyDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="flex-1 min-w-[220px] truncate rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs">
                            {maskKey(apiKey)}
                        </code>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? <Check className="mr-2 size-3.5 text-green-500" /> : <Copy className="mr-2 size-3.5" />}
                            {copied ? t('copied') : t('copy')}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRegenerate}>
                            <RotateCcw className="mr-2 size-3.5" />
                            {t('generateKey')}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">
                            {t('revoke')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Webhook className="size-4 text-accent" />
                        {t('webhookTitle')}
                    </CardTitle>
                    <CardDescription>{t('webhookDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder={t('webhookPlaceholder')}
                    />
                    <Button size="sm">{t('saveWebhook')}</Button>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">{t('docsNote')}</p>
        </div>
    )
}
