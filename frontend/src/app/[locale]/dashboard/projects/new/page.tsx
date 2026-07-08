'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Github } from '@/components/ui/svgs/github'

const MOCK_REPOS = [
    { name: 'gitdeep-frontend', visibility: 'Private', updated: '2h ago' },
    { name: 'my-awesome-app', visibility: 'Public', updated: '1d ago' },
    { name: 'ecommerce-api', visibility: 'Private', updated: '3d ago' },
    { name: 'portfolio-v2', visibility: 'Public', updated: '1w ago' },
]

export default function NewProjectPage() {
    const t = useTranslations('dashboard.projects')
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)

    const handleConnect = () => {
        setIsConnecting(true)
        // Simulate OAuth flow delay
        setTimeout(() => {
            setIsConnecting(false)
            setIsConnected(true)
        }, 1500)
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('importProject')}</h1>
                    <p className="text-muted-foreground">
                        {isConnected ? t('selectRepo') : t('emptyDesc')}
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/projects">{t('back')}</Link>
                </Button>
            </div>

            {!isConnected ? (
                <Card className="bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted border border-border/50">
                            <Github className="size-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">{t('connectGithub')}</h3>
                            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
                                To import a repository, you first need to connect your GitHub account. We only ask for read-only access.
                            </p>
                        </div>
                        <Button onClick={handleConnect} disabled={isConnecting} className="w-full sm:w-auto">
                            {isConnecting ? (
                                <>
                                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    {t('connecting')}
                                </>
                            ) : (
                                <>
                                    <Github className="mr-2 size-4" />
                                    {t('connectGithub')}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
                            <div className="size-2 rounded-full bg-green-500"></div>
                            GitHub Connected
                        </div>
                    </div>
                    
                    {MOCK_REPOS.map((repo, idx) => (
                        <Card key={idx} className="bg-surface-raised border-border/50 hover:border-border transition-colors shadow-sm">
                            <CardContent className="flex items-center justify-between p-4 sm:p-6">
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md bg-muted border border-border/50">
                                        <svg className="size-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{repo.name}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] uppercase font-medium tracking-wider text-muted-foreground border border-border/50">
                                                {repo.visibility}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Updated {repo.updated}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    {t('import')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
