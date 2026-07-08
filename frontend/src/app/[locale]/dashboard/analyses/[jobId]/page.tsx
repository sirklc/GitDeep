'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Download, Link2, Check, ShieldAlert, ShieldCheck, BadgeCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnalysisById, type AnalysisAxes } from '@/lib/dashboard-mock'

const axisOrder: (keyof AnalysisAxes)[] = ['architecture', 'security', 'engagement', 'documentation']

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // clipboard API unavailable — no-op UI mock
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-2 size-3.5 text-green-500" /> : <Link2 className="mr-2 size-3.5" />}
            {copied ? copiedLabel : label}
        </Button>
    )
}

export default function ReportDetailPage() {
    const t = useTranslations('dashboardReport')
    const params = useParams<{ jobId: string }>()
    const job = getAnalysisById(params.jobId)

    if (!job || job.status !== 'completed' || !job.axes) {
        notFound()
    }

    const shareUrl = `https://gitdeep.dev/reports/${job.id}`
    const badgeMarkdown = `[![GitDeep Score](https://gitdeep.dev/badge/${job.id}.svg)](${shareUrl})`

    return (
        <div className="space-y-6">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link href="/dashboard/analyses">
                    <ArrowLeft className="mr-2 size-4" />
                    {t('back')}
                </Link>
            </Button>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-mono">{job.repo}</h1>
                    <p className="text-muted-foreground mt-1">{job.verdict}</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 size-4" />
                    {t('downloadPdf')}
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="bg-surface-raised border-border/50 shadow-xl flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">{t('overallScore')}</p>
                    <p className="mt-2 text-6xl font-bold font-display text-accent-foreground dark:text-accent">{job.overallScore}</p>
                    <p className="text-sm text-muted-foreground">/ 100</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                        {t('creditsCharged')}: <span className="font-mono">{job.creditsCharged}</span>
                    </p>
                </Card>

                <Card className="lg:col-span-2 bg-surface-raised border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base">{t('verdict')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {axisOrder.map((key) => {
                            const axis = job.axes![key]
                            const pct = Math.round((axis.score / axis.maxScore) * 100)
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="font-medium">{t(`axis.${key}`)}</span>
                                        <span className="font-mono text-muted-foreground">
                                            {axis.score}/{axis.maxScore}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="mt-1.5 text-xs text-muted-foreground">{axis.summary}</p>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-surface-raised border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BadgeCheck className="size-4 text-accent" />
                            {t('recommendations')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3 text-sm">
                            {job.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    <span className="text-muted-foreground">{rec}</span>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                <Card className="bg-surface-raised border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            {job.secretFindings.length > 0 ? (
                                <ShieldAlert className="size-4 text-red-500" />
                            ) : (
                                <ShieldCheck className="size-4 text-green-500" />
                            )}
                            {t('secretScanTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {job.secretFindings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('secretScanEmpty')}</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {job.secretFindings.map((finding, i) => (
                                    <li key={i} className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
                                        {finding}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-surface-raised border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base">{t('shareTitle')}</CardTitle>
                        <CardDescription>{t('shareDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                            <code className="flex-1 min-w-[200px] truncate rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs">
                                {shareUrl}
                            </code>
                            <CopyButton value={shareUrl} label={t('copyLink')} copiedLabel={t('copied')} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface-raised border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-base">{t('badgeTitle')}</CardTitle>
                        <CardDescription>{t('badgeDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                            <code className="flex-1 min-w-[200px] truncate rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs">
                                {badgeMarkdown}
                            </code>
                            <CopyButton value={badgeMarkdown} label={t('copyBadge')} copiedLabel={t('copied')} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
