'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CreditCard, FolderGit2, TrendingUp, CalendarClock, CheckCircle2, Loader2, XCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { mockAnalyses, currentUser, type JobStatus } from '@/lib/dashboard-mock'

const statusIcon: Record<JobStatus, React.ElementType> = {
    completed: CheckCircle2,
    processing: Loader2,
    queued: Loader2,
    failed: XCircle,
    refunded: RotateCcw,
}

const statusColor: Record<JobStatus, string> = {
    completed: 'text-green-500',
    processing: 'text-yellow-500 animate-spin',
    queued: 'text-yellow-500',
    failed: 'text-red-500',
    refunded: 'text-blue-500',
}

function timeAgo(iso: string, locale: string) {
    return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function DashboardPage() {
    const t = useTranslations('dashboard')
    const ta = useTranslations('dashboardAnalyses')

    const completed = useMemo(() => mockAnalyses.filter((a) => a.overallScore !== null), [])
    const avgScore = useMemo(
        () => (completed.length ? Math.round(completed.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / completed.length) : 0),
        [completed]
    )
    const monthCount = useMemo(
        () => mockAnalyses.filter((a) => new Date(a.createdAt).getUTCMonth() === new Date().getUTCMonth()).length,
        []
    )
    const trendData = useMemo(
        () =>
            [...completed]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((a) => ({ name: a.repo.split('/')[1] ?? a.repo, score: a.overallScore })),
        [completed]
    )
    const recent = useMemo(
        () => [...mockAnalyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
        []
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('welcome')}</h1>
                    <p className="text-muted-foreground">{t('welcomeSub')}</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/billing">
                            <CreditCard className="mr-2 size-4" />
                            {t('buyCredits')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/projects/new">
                            <FolderGit2 className="mr-2 size-4" />
                            {t('newAnalysisCta')}
                        </Link>
                    </Button>
                </div>
            </div>

            {!currentUser.emailVerified && (
                <div className="rounded-xl border border-border/50 bg-surface-raised p-4 text-sm text-muted-foreground shadow-sm">
                    {t('verifyBanner')}{' '}
                    <button type="button" className="cursor-pointer font-semibold text-foreground underline hover:opacity-80 transition-opacity">
                        {t('resend')}
                    </button>
                </div>
            )}

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('metrics.creditBalance')}</CardTitle>
                        <CreditCard className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent-foreground dark:text-accent">{currentUser.creditBalance}</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('metrics.totalAnalyses')}</CardTitle>
                        <FolderGit2 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockAnalyses.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('metrics.avgScore')}</CardTitle>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}/100</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('metrics.monthAnalyses')}</CardTitle>
                        <CalendarClock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Bento Grid Content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl flex flex-col">
                    <CardHeader>
                        <CardTitle>{t('scoreTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#a1a1aa' }} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa' }} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#4ade80"
                                    strokeWidth={2}
                                    dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('recentAnalyses')}</CardTitle>
                            <CardDescription>{t('recentAnalysesDesc')}</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                            <Link href="/dashboard/analyses">{t('viewAll')}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recent.map((job) => {
                                const Icon = statusIcon[job.status]
                                return (
                                    <Link
                                        key={job.id}
                                        href={job.status === 'completed' ? `/dashboard/analyses/${job.id}` : '/dashboard/analyses'}
                                        className="flex items-center hover:opacity-80 transition-opacity"
                                    >
                                        <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted border border-border/50 items-center justify-center">
                                            <Icon className={`size-4 ${statusColor[job.status]}`} />
                                        </span>
                                        <div className="ml-4 space-y-1 overflow-hidden">
                                            <p className="text-sm font-medium leading-none truncate">{job.repo}</p>
                                            <p className="text-sm text-muted-foreground">{ta(`status.${job.status}`)}</p>
                                        </div>
                                        <div className="ml-auto pl-2 text-right shrink-0">
                                            {job.overallScore !== null && (
                                                <div className="font-mono font-medium text-sm">{job.overallScore}</div>
                                            )}
                                            <div className="text-xs text-muted-foreground">{timeAgo(job.createdAt, 'tr-TR')}</div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
