'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { api, ApiError } from '@/lib/api'

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm />
        </Suspense>
    )
}

function ResetPasswordForm() {
    const t = useTranslations('auth')
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!token) {
            setError(t('resetPasswordInvalidToken'))
            return
        }
        if (password !== confirmPassword) {
            setError(t('resetPasswordMismatch'))
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password })
            setIsSubmitted(true)
        } catch (err) {
            setError(err instanceof ApiError ? err.detail : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form onSubmit={onSubmit} className="m-auto h-fit w-full max-w-sm">
                <div className="p-6">
                    <div>
                        <Link href="/" aria-label="go home">
                            <LogoIcon className="size-8" />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">{t('resetPasswordPageTitle')}</h1>
                        <p className="text-sm text-muted-foreground">{t('resetPasswordPageDescription')}</p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {isSubmitted ? (
                            <div className="rounded-md bg-green-500/15 p-4 text-center">
                                <p className="text-sm font-medium text-green-500">{t('resetPasswordSuccessMessage')}</p>
                            </div>
                        ) : !token ? (
                            <p className="text-sm text-red-400">{t('resetPasswordInvalidToken')}</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="block text-sm">{t('newPasswordLabel')}</Label>
                                    <Input
                                        type="password"
                                        required
                                        minLength={8}
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="block text-sm">{t('confirmPasswordLabel')}</Label>
                                    <Input
                                        type="password"
                                        required
                                        minLength={8}
                                        name="confirm-password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                {error && <p className="text-sm text-red-400">{error}</p>}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? '…' : t('resetPasswordSubmitButton')}
                                </Button>
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
