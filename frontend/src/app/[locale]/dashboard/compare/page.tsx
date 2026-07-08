'use client'

import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { mockAnalyses, type AnalysisAxes } from '@/lib/dashboard-mock'

const axisOrder: (keyof AnalysisAxes)[] = ['architecture', 'security', 'engagement', 'documentation']
const completedAnalyses = mockAnalyses.filter((a) => a.status === 'completed' && a.axes)

function SelectRepo({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string
    value: string
    onChange: (id: string) => void
    placeholder: string
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <option value="">{placeholder}</option>
                {completedAnalyses.map((job) => (
                    <option key={job.id} value={job.id}>
                        {job.repo}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default function ComparePage() {
    const t = useTranslations('dashboardCompare')
    const tr = useTranslations('dashboardReport')
    const [firstId, setFirstId] = useState('')
    const [secondId, setSecondId] = useState('')

    const first = useMemo(() => completedAnalyses.find((a) => a.id === firstId), [firstId])
    const second = useMemo(() => completedAnalyses.find((a) => a.id === secondId), [secondId])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
                    <SelectRepo label={t('selectFirst')} value={firstId} onChange={setFirstId} placeholder={t('placeholder')} />
                    <SelectRepo label={t('selectSecond')} value={secondId} onChange={setSecondId} placeholder={t('placeholder')} />
                </CardContent>
            </Card>

            {!first || !second ? (
                <p className="text-sm text-muted-foreground text-center py-12">{t('noSelection')}</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {[first, second].map((job) => (
                        <Card key={job.id} className="bg-surface-raised border-border/50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="font-mono text-base">{job.repo}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">{t('overallScore')}</p>
                                    <p className="text-4xl font-bold font-display text-accent-foreground dark:text-accent">
                                        {job.overallScore}
                                    </p>
                                </div>
                                {axisOrder.map((key) => {
                                    const axis = job.axes![key]
                                    const pct = Math.round((axis.score / axis.maxScore) * 100)
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-medium">{tr(`axis.${key}`)}</span>
                                                <span className="font-mono text-muted-foreground">
                                                    {axis.score}/{axis.maxScore}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn('h-full rounded-full', job.id === first.id ? 'bg-accent' : 'bg-primary')}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
