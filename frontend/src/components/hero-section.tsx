import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { HeroHeader } from '@/components/header'
import { Github } from '@/components/ui/svgs/github'
import { SupabaseLogoIcon } from '@/components/ui/svgs/supabase-logo-icon'
import { CloudflareColor } from '@/components/ui/svgs/cloudflare-color'
import { AwsColor } from '@/components/ui/svgs/aws-color'
import { VercelIcon } from '@/components/ui/svgs/vercel-icon'
import { Firebase } from '@/components/ui/svgs/firebase'
import { HuggingfaceColor } from '@/components/ui/svgs/huggingface-color'
import { NvidiaColor } from '@/components/ui/svgs/nvidia-color'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const t = useTranslations('hero')
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 lg:block"
                    style={{ contain: 'strict' }}>
                    <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[22rem] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="absolute left-0 top-0 h-[80rem] w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="absolute left-0 top-0 h-[80rem] w-60 -translate-y-[22rem] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">


                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full"
                            style={{
                                background: 'radial-gradient(125% 125% at 50% 100%, transparent 0%, var(--background) 75%)',
                            }}
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="bg-muted hover:bg-background group mx-auto flex w-fit items-center gap-4 rounded-full border border-border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
                                        <span className="text-foreground text-sm">{t('badge')}</span>
                                        <span className="block h-4 w-0.5 bg-border"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem] leading-tight">
                                    {t('title')}
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                                    {t('description')}
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[calc(0.75rem+0.125rem)] border p-0.5">
                                        <Button
                                            size="lg"
                                            className="rounded-xl px-5 text-base"
                                            asChild>
                                            <Link href="#link">
                                                <span className="text-nowrap">{t('startBuilding')}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10 rounded-xl px-5"
                                        asChild>
                                        <Link href="#link">
                                            <span className="text-nowrap">{t('requestDemo')}</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div
                                className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 55%, transparent 90%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 90%)',
                                }}>
                                <div className="bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-white/5"
                                    style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}>
                                    {/* Dashboard mockup */}
                                    <div className="aspect-[15/8] rounded-2xl bg-background relative overflow-hidden flex text-foreground">
                                        {/* Sidebar */}
                                        <div className="w-1/4 max-w-[200px] border-r border-border/50 bg-background/50 flex flex-col p-4 gap-4 shrink-0 backdrop-blur-md hidden sm:flex">
                                            <div className="flex items-center gap-2 px-2">
                                                <div className="size-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">GD</div>
                                                <span className="font-semibold text-sm tracking-tight">GitDeep</span>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-xs font-medium text-foreground">
                                                    <svg className="size-3 text-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                                                    Overview
                                                </div>
                                                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground">
                                                    <svg className="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                                    Projects
                                                </div>
                                                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground">
                                                    <svg className="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                                    Analyses
                                                </div>
                                                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground">
                                                    <svg className="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                                    Billing
                                                </div>
                                            </div>
                                        </div>
                                        {/* Main content */}
                                        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                                            {/* Header */}
                                            <div className="h-12 border-b border-border/50 bg-background/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
                                                <div className="h-7 w-48 rounded-md bg-surface-raised border border-border/50 flex items-center px-3 shadow-sm">
                                                    <svg className="size-3 text-muted-foreground mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                                    <div className="h-2 w-16 bg-muted-foreground/30 rounded-sm" />
                                                </div>
                                                <div className="size-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-border/50" />
                                            </div>
                                            {/* Dashboard Content */}
                                            <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-hidden h-full">
                                                <div className="flex gap-4">
                                                    <div className="flex-1 rounded-xl bg-surface-raised border border-border/50 p-3 sm:p-4 shadow-xl flex flex-col justify-between backdrop-blur-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="text-[10px] text-muted-foreground font-medium">Credit Balance</div>
                                                            <svg className="size-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm sm:text-lg font-bold">1,200</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 rounded-xl bg-surface-raised border border-border/50 p-3 sm:p-4 shadow-xl flex flex-col justify-between backdrop-blur-sm hidden sm:flex">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="text-[10px] text-muted-foreground font-medium">Total Analyses</div>
                                                            <svg className="size-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm sm:text-lg font-bold">42</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 rounded-xl bg-surface-raised border border-border/50 p-3 sm:p-4 shadow-xl flex flex-col justify-between backdrop-blur-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="text-[10px] text-muted-foreground font-medium">Avg Score</div>
                                                            <svg className="size-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm sm:text-lg font-bold">85/100</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 flex-1 h-full min-h-0">
                                                    <div className="flex-[2] rounded-xl bg-surface-raised border border-border/50 p-3 sm:p-4 flex flex-col shadow-xl backdrop-blur-sm h-full">
                                                        <div className="text-[10px] text-muted-foreground font-medium mb-3">Score Trend</div>
                                                        <div className="flex-1 relative border-b border-l border-border/50">
                                                            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                                {/* Grid lines */}
                                                                <line x1="0" y1="25" x2="100" y2="25" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2 2" />
                                                                <line x1="0" y1="50" x2="100" y2="50" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2 2" />
                                                                <line x1="0" y1="75" x2="100" y2="75" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2 2" />
                                                                {/* Chart line */}
                                                                <path d="M0,80 L20,40 L40,50 L60,20 L80,30 L100,10" fill="none" stroke="#4ade80" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                                                <circle cx="0" cy="80" r="2.5" fill="#4ade80" />
                                                                <circle cx="20" cy="40" r="2.5" fill="#4ade80" />
                                                                <circle cx="40" cy="50" r="2.5" fill="#4ade80" />
                                                                <circle cx="60" cy="20" r="2.5" fill="#4ade80" />
                                                                <circle cx="80" cy="30" r="2.5" fill="#4ade80" />
                                                                <circle cx="100" cy="10" r="2.5" fill="#4ade80" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 rounded-xl bg-surface-raised border border-border/50 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 shadow-xl backdrop-blur-sm hidden md:flex">
                                                        <div className="text-[10px] text-muted-foreground font-medium">Recent Analyses</div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-6 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0">
                                                                <svg className="size-3 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="h-2 w-20 bg-muted-foreground/40 rounded-sm" />
                                                                <div className="h-1.5 w-12 bg-muted-foreground/20 rounded-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-6 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0">
                                                                <svg className="size-3 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="h-2 w-24 bg-muted-foreground/40 rounded-sm" />
                                                                <div className="h-1.5 w-16 bg-muted-foreground/20 rounded-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-6 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0">
                                                                <svg className="size-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="h-2 w-16 bg-muted-foreground/40 rounded-sm" />
                                                                <div className="h-1.5 w-10 bg-muted-foreground/20 rounded-sm" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span>{t('meetCustomers')}</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-sm sm:grid-cols-4 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex items-center justify-center">
                                <AwsColor className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <SupabaseLogoIcon className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <VercelIcon className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <Github className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <CloudflareColor className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <Firebase className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <HuggingfaceColor className="h-6 w-auto" />
                            </div>
                            <div className="flex items-center justify-center">
                                <NvidiaColor className="h-6 w-auto" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
