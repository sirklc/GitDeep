'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Search, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mockAnalyses, type JobStatus } from '@/lib/dashboard-mock'

const filters = ['all', 'completed', 'processing', 'failed'] as const
type Filter = (typeof filters)[number]

const filterLabelKey: Record<Filter, 'filterAll' | 'filterCompleted' | 'filterProcessing' | 'filterFailed'> = {
    all: 'filterAll',
    completed: 'filterCompleted',
    processing: 'filterProcessing',
    failed: 'filterFailed',
}

const statusBadgeClass: Record<JobStatus, string> = {
    completed: 'bg-green-500/10 text-green-500 border-green-500/20',
    processing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    refunded: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

export default function AnalysesPage() {
    const t = useTranslations('dashboardAnalyses')
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState<Filter>('all')

    const rows = useMemo(() => {
        return [...mockAnalyses]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .filter((job) => {
                if (filter !== 'all' && job.status !== filter) return false
                if (query && !job.repo.toLowerCase().includes(query.toLowerCase())) return false
                return true
            })
    }, [query, filter])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="pl-9 bg-surface-raised border-border/50"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                filter === f
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border/50 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {t(filterLabelKey[f])}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">{t('colRepo')}</th>
                                        <th className="px-6 py-3 font-medium">{t('colStatus')}</th>
                                        <th className="px-6 py-3 font-medium">{t('colScore')}</th>
                                        <th className="px-6 py-3 font-medium">{t('colCredits')}</th>
                                        <th className="px-6 py-3 font-medium">{t('colDate')}</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((job) => (
                                        <tr key={job.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-mono">{job.repo}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', statusBadgeClass[job.status])}>
                                                    {t(`status.${job.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{job.overallScore ?? '—'}</td>
                                            <td className="px-6 py-4 font-mono text-muted-foreground">{job.creditsCharged}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {job.status === 'completed' && (
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link href={`/dashboard/analyses/${job.id}`}>
                                                            {t('viewReport')}
                                                            <ArrowUpRight className="ml-1 size-3.5" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
