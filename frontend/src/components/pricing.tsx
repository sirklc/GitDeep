'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PricingSection() {
    const t = useTranslations('pricingPage')
    const [isAnnual, setIsAnnual] = useState(true)

    const plans = [
        {
            key: 'free',
            isPopular: false,
        },
        {
            key: 'pro',
            isPopular: true,
        },
        {
            key: 'enterprise',
            isPopular: false,
        }
    ]

    return (
        <section className="relative pt-24 pb-16 md:pt-36 md:pb-32 overflow-hidden bg-background">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full"
                style={{
                    background: 'radial-gradient(125% 125% at 50% 10%, transparent 0%, var(--background) 75%)',
                }}
            />
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-4xl font-semibold tracking-tight sm:text-5xl">{t('title')}</TextEffect>
                    <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.5} as="p" className="mt-6 text-lg leading-8 text-muted-foreground">
                        {t('description')}
                    </TextEffect>
                </div>

                <div className="mt-16 flex justify-center">
                    <div className="relative flex items-center p-1 rounded-full border border-border bg-surface-raised shadow-sm">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                'relative w-32 rounded-full py-2 text-sm font-medium transition-colors duration-200',
                                !isAnnual ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {!isAnnual && (
                                <motion.div
                                    layoutId="pricing-active-bg"
                                    className="absolute inset-0 rounded-full bg-muted border border-border"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{t('monthly')}</span>
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                'relative w-32 rounded-full py-2 text-sm font-medium transition-colors duration-200',
                                isAnnual ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {isAnnual && (
                                <motion.div
                                    layoutId="pricing-active-bg"
                                    className="absolute inset-0 rounded-full bg-muted border border-border"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{t('annually')}</span>
                            
                            {/* Bouncing Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-3 -right-6"
                            >
                                <span className="animate-bounce inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
                                    {t('discountBadge')}
                                </span>
                            </motion.div>
                        </button>
                    </div>
                </div>

                <AnimatedGroup 
                    className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.5,
                                },
                            },
                        },
                        item: {
                            hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                        },
                    }}
                >
                    {plans.map((plan) => {
                        const priceKey = isAnnual && plan.key !== 'free' ? `${plan.key}.priceAnnual` : `${plan.key}.price`
                        // Explicitly typing features as string[] to avoid issues with next-intl array mapping
                        const features = t.raw(`${plan.key}.features`) as string[]
                        
                        return (
                            <div
                                key={plan.key}
                                className={cn(
                                    plan.isPopular ? 'ring-2 ring-primary bg-surface-raised shadow-2xl' : 'ring-1 ring-border bg-background/50',
                                    'rounded-3xl p-8 xl:p-10 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm'
                                )}
                            >
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3 className="text-lg font-semibold leading-8 text-foreground">
                                        {t(`${plan.key}.name`)}
                                    </h3>
                                    {plan.isPopular && (
                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                                            Most Popular
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground h-12">
                                    {t(`${plan.key}.description`)}
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">
                                        {t(priceKey as any)}
                                    </span>
                                    {plan.key !== 'free' && (
                                        <span className="text-sm font-semibold leading-6 text-muted-foreground">
                                            /mo
                                        </span>
                                    )}
                                </p>
                                <Button
                                    variant={plan.isPopular ? 'default' : 'outline'}
                                    className="mt-6 w-full rounded-xl"
                                    size="lg"
                                >
                                    {t(`${plan.key}.cta`)}
                                </Button>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground xl:mt-10">
                                    {features.map((feature, idx) => (
                                        <li key={idx} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </AnimatedGroup>
            </div>
        </section>
    )
}
