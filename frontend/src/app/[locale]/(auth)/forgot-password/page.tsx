'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

export default function ForgotPasswordPage() {
    const t = useTranslations('auth')
    const [isSubmitted, setIsSubmitted] = useState(false)

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form onSubmit={onSubmit} className="m-auto h-fit w-full max-w-sm">
                <div className="p-6">
                    <div>
                        <Link href="/" aria-label="go home">
                            <LogoIcon className="size-8" />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">{t('forgotPasswordTitle')}</h1>
                        <p className="text-sm text-muted-foreground">{t('forgotPasswordDescription')}</p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {isSubmitted ? (
                            <div className="rounded-md bg-green-500/15 p-4 text-center">
                                <p className="text-sm font-medium text-green-500">
                                    Check your email for a reset link.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="block text-sm">{t('emailLabel')}</Label>
                                    <Input type="email" required name="email" id="email" />
                                </div>

                                <Button className="w-full">{t('resetPasswordButton')}</Button>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-accent-foreground text-center text-sm mt-4">
                    <Button asChild variant="link" className="px-2">
                        <Link href="/login">{t('backToLogin')}</Link>
                    </Button>
                </p>
            </form>
        </section>
    )
}
