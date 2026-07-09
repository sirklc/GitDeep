'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { Code2, Heart, Lightbulb, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReactNode } from 'react'

const CardDecorator = ({ children, isAvatar = false }: { children: ReactNode, isAvatar?: boolean }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]"
        style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 60%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 60%)' }}>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50" />
        <div className={`bg-background absolute inset-0 m-auto flex items-center justify-center border-l border-t border-border ${isAvatar ? 'size-16 rounded-full overflow-hidden' : 'size-12'}`}>{children}</div>
    </div>
)

export default function AboutSection() {
    const t = useTranslations('aboutPage')

    const team = [
        {
            name: 'John Doe',
            role: t('roles.owner'),
            initials: 'JD',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Jane Smith',
            role: t('roles.engineer'),
            initials: 'JS',
            color: 'from-purple-500 to-pink-500',
        }
    ]

    const values = [
        {
            key: 'innovation',
            icon: <Lightbulb className="size-6" aria-hidden />,
        },
        {
            key: 'quality',
            icon: <Shield className="size-6" aria-hidden />,
        },
        {
            key: 'community',
            icon: <Heart className="size-6" aria-hidden />,
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
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-24 md:space-y-32">
                
                {/* Hero Section */}
                <div className="mx-auto max-w-3xl text-center">
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-4xl font-semibold tracking-tight sm:text-5xl"
                    >
                        {t('title')}
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-6 text-lg leading-8 text-muted-foreground"
                    >
                        {t('description')}
                    </TextEffect>
                </div>

                {/* Mission Section */}
                <AnimatedGroup 
                    className="mx-auto max-w-4xl"
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } },
                        item: {
                            hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                        },
                    }}
                >
                    <div className="relative rounded-3xl bg-gradient-to-b from-zinc-700 to-transparent p-px shadow-2xl">
                        <div className="h-full w-full rounded-[23px] bg-surface-raised overflow-hidden relative p-8 md:p-12">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-5 pointer-events-none">
                                <Code2 className="w-64 h-64 text-foreground" />
                            </div>
                            <h3 className="text-3xl font-semibold mb-6 relative z-10 text-foreground">{t('missionTitle')}</h3>
                            <div className="space-y-4 relative z-10 text-muted-foreground leading-relaxed text-lg md:text-xl">
                                <p>"{t('missionBody')}"</p>
                                <p>{t('missionBody2')}</p>
                                <p>{t('missionBody3')}</p>
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>

                {/* Mockup Section */}
                <AnimatedGroup
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } },
                        item: {
                            hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                        },
                    }}
                >
                    <div className="relative mt-8 overflow-hidden px-2 sm:mt-16" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
                        <div className="bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-white/5" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}>
                            <div className="aspect-[21/9] rounded-2xl bg-surface-raised relative overflow-hidden flex flex-col text-foreground border border-border/50">
                                {/* Header */}
                                <div className="h-10 border-b border-border/50 bg-background/50 flex items-center px-4 shrink-0 backdrop-blur-md gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="size-2.5 rounded-full bg-destructive/80" />
                                        <div className="size-2.5 rounded-full bg-yellow-500/80" />
                                        <div className="size-2.5 rounded-full bg-green-500/80" />
                                    </div>
                                    <div className="h-6 px-4 bg-background border border-border/50 rounded-md mx-auto flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                                        gitdeep.dev/analyze/gitdeep-frontend
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="flex flex-1 p-4 gap-4">
                                    <div className="flex-[2] flex flex-col gap-4">
                                        <div className="text-sm font-semibold tracking-tight">System Architecture Scan</div>
                                        <div className="flex-1 rounded-xl border border-border/50 bg-background p-4 sm:p-6 relative overflow-hidden font-mono text-[10px] sm:text-xs leading-relaxed flex flex-col justify-center">
                                            <div><span className="text-primary">import</span> {'{'} <span className="text-cyan-400">GitDeep</span> {'}'} <span className="text-primary">from</span> <span className="text-green-400">'@gitdeep/core'</span>;</div>
                                            <div className="mt-4"><span className="text-primary">const</span> analyzer = <span className="text-primary">new</span> <span className="text-cyan-400">GitDeep</span>({'{'}</div>
                                            <div className="ml-4">repository: <span className="text-green-400">'gitdeep-frontend'</span>,</div>
                                            <div className="ml-4">depth: <span className="text-yellow-400">100</span>,</div>
                                            <div className="ml-4">mode: <span className="text-green-400">'full-ast'</span></div>
                                            <div>{'}'});</div>
                                            <div className="mt-4"><span className="text-primary">await</span> analyzer.<span className="text-cyan-400">generateDocs</span>();</div>
                                            <div className="mt-2 text-muted-foreground">{'// Analysis complete. 1,204 files scanned in 4.2s'}</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1 aspect-square rounded-xl border border-border/50 bg-background flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5" />
                                                <div className="text-2xl font-bold relative z-10">4.2<span className="text-sm text-muted-foreground">s</span></div>
                                                <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider relative z-10">Scan Time</div>
                                            </div>
                                            <div className="flex-1 aspect-square rounded-xl border border-border/50 bg-background flex flex-col items-center justify-center gap-1 shadow-sm relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/10" />
                                                <div className="text-2xl font-bold text-primary relative z-10">98</div>
                                                <div className="text-[9px] text-primary/80 uppercase tracking-wider font-semibold relative z-10">Health</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 rounded-xl border border-border/50 bg-background p-4 flex flex-col justify-end shadow-sm relative overflow-hidden">
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Complexity Trend</div>
                                            {/* Bar chart abstract */}
                                            <div className="flex items-end justify-between h-12 gap-1.5 mt-auto">
                                                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                                                    <div key={i} className="w-full bg-primary/40 rounded-t-sm hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>

                {/* Team Section */}
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-3xl font-semibold">{t('teamTitle')}</TextEffect>
                        <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.2} as="p" className="mt-4 text-muted-foreground">{t('teamDescription')}</TextEffect>
                    </div>
                    
                    <AnimatedGroup 
                        className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:max-w-3xl mx-auto"
                        variants={{
                            container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
                            item: {
                                hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                            },
                        }}
                    >
                        {team.map((member, index) => (
                            <Card key={index} className="group shadow-zinc-950/5">
                                <CardHeader className="pb-3 text-center">
                                    <CardDecorator isAvatar>
                                        <div className={`size-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-xl font-bold`}>
                                            {member.initials}
                                        </div>
                                    </CardDecorator>
                                    <h3 className="mt-6 font-medium text-lg">{member.name}</h3>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-sm text-primary font-medium">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </AnimatedGroup>
                </div>

                {/* Values Section */}
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-3xl font-semibold">{t('valuesTitle')}</TextEffect>
                    </div>
                    
                    <AnimatedGroup 
                        className="grid gap-6 sm:grid-cols-3"
                        variants={{
                            container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
                            item: {
                                hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                            },
                        }}
                    >
                        {values.map((value, index) => (
                            <Card key={index} className="group shadow-zinc-950/5">
                                <CardHeader className="pb-3 text-center">
                                    <CardDecorator>
                                        <div className="text-primary">{value.icon}</div>
                                    </CardDecorator>
                                    <h3 className="mt-6 font-medium">{t(`values.${value.key}.title`)}</h3>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-sm text-muted-foreground">{t(`values.${value.key}.description`)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </AnimatedGroup>
                </div>

            </div>
        </section>
    )
}
