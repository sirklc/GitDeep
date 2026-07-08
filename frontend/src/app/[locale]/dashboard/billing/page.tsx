'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Check, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { creditPackages, currentUser, mockPayments, mockTransactions, type PaymentStatus } from '@/lib/dashboard-mock'

const paymentStatusClass: Record<PaymentStatus, string> = {
    paid: 'bg-green-500/10 text-green-500 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    expired: 'bg-muted text-muted-foreground border-border/50',
}

export default function BillingPage() {
    const t = useTranslations('dashboardBilling')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="bg-surface-raised border-border/50 shadow-xl">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted border border-border/50">
                            <CreditCard className="size-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('balanceLabel')}</p>
                            <p className="text-3xl font-bold font-display">{currentUser.creditBalance}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-lg font-semibold mb-4">{t('packagesTitle')}</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {creditPackages.map((pkg) => (
                        <Card
                            key={pkg.code}
                            className={cn(
                                'bg-surface-raised border-border/50 shadow-xl relative',
                                pkg.popular && 'border-accent/50 ring-1 ring-accent/30'
                            )}
                        >
                            {pkg.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                                    {t('mostPopular')}
                                </span>
                            )}
                            <CardHeader className="text-center pt-8">
                                <CardTitle>{pkg.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div>
                                    <span className="text-4xl font-bold font-display">${pkg.price}</span>
                                </div>
                                <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                                    <Check className="size-4 text-accent" />
                                    {pkg.credits} credits
                                </p>
                                <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                                    {t('buyButton')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">{t('ledgerTitle')}</h2>
                <Card className="bg-surface-raised border-border/50 shadow-xl overflow-hidden">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/30 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">{t('colReason')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colDelta')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colBalance')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colDate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-t border-border/50">
                                        <td className="px-6 py-3">{t(`reasons.${tx.reason}`)}</td>
                                        <td className={cn('px-6 py-3 font-mono', tx.delta > 0 ? 'text-green-500' : 'text-red-400')}>
                                            {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                                        </td>
                                        <td className="px-6 py-3 font-mono">{tx.balanceAfter}</td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {new Date(tx.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">{t('paymentsTitle')}</h2>
                <Card className="bg-surface-raised border-border/50 shadow-xl overflow-hidden">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/30 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">{t('colProvider')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colPackage')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colAmount')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colStatusPayment')}</th>
                                    <th className="px-6 py-3 font-medium">{t('colDate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockPayments.map((payment) => (
                                    <tr key={payment.id} className="border-t border-border/50">
                                        <td className="px-6 py-3 capitalize">{payment.provider}</td>
                                        <td className="px-6 py-3">{payment.packageName}</td>
                                        <td className="px-6 py-3 font-mono">
                                            ${payment.amount} · {payment.credits} cr
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', paymentStatusClass[payment.status])}>
                                                {t(`paymentStatus.${payment.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {new Date(payment.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
