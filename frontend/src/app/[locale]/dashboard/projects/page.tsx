import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ProjectsPage() {
    const t = useTranslations('dashboard.projects')

    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md bg-surface-raised border-border/50 backdrop-blur-sm shadow-xl">
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border/50">
                        <svg className="size-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">{t('emptyTitle')}</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                            {t('emptyDesc')}
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/projects/new">
                            <svg className="mr-2 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            {t('addProject')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
