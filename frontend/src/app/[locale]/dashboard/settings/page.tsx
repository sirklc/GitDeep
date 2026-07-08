'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocaleToggle } from '@/components/locale-toggle'
import { currentUser } from '@/lib/dashboard-mock'

export default function SettingsPage() {
    const t = useTranslations('dashboardSettings')

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base">{t('profileTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('nameLabel')}</Label>
                        <Input id="name" name="name" defaultValue={currentUser.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('emailLabel')}</Label>
                        <Input id="email" name="email" type="email" defaultValue={currentUser.email} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('localeLabel')}</Label>
                        <div>
                            <LocaleToggle />
                        </div>
                    </div>
                    <Button>{t('saveButton')}</Button>
                </CardContent>
            </Card>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base">{t('passwordTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">{t('currentPasswordLabel')}</Label>
                        <Input id="current-password" name="current-password" type="password" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">{t('newPasswordLabel')}</Label>
                            <Input id="new-password" name="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">{t('confirmPasswordLabel')}</Label>
                            <Input id="confirm-password" name="confirm-password" type="password" />
                        </div>
                    </div>
                    <Button variant="outline">{t('updatePasswordButton')}</Button>
                </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base text-red-400">{t('dangerZoneTitle')}</CardTitle>
                    <CardDescription>{t('dangerZoneDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                        {t('deleteAccount')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
