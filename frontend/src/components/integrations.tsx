import React from 'react'
import { useTranslations } from 'next-intl'
import { ClaudeColor } from '@/components/ui/svgs/claude-color'
import { Cursor } from '@/components/ui/svgs/cursor'
import { GeminiColor } from '@/components/ui/svgs/gemini-color'
import { Openai } from '@/components/ui/svgs/openai'
import { LogoIcon } from '@/components/logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider'

export default function IntegrationsSection() {
    const t = useTranslations('integrations')
    return (
        <section>
            <div className="bg-muted dark:bg-background py-24 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="bg-muted/25 relative mx-auto max-w-[24rem] items-center justify-between space-y-6 pointer-events-none sm:max-w-lg md:max-w-xl md:space-y-10"
                        style={{ maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)' }}>
                        <div role="presentation" className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:48px_48px] opacity-50" />
                        <div>
                            <InfiniteSlider gap={32} speed={25}>
                                <IntegrationCard><Openai /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                                <IntegrationCard><Openai /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                            </InfiniteSlider>
                        </div>
                        <div>
                            <InfiniteSlider gap={32} speed={25} reverse>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                                <IntegrationCard><Openai /></IntegrationCard>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                                <IntegrationCard><Openai /></IntegrationCard>
                            </InfiniteSlider>
                        </div>
                        <div>
                            <InfiniteSlider gap={32} speed={25}>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                                <IntegrationCard><Openai /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                                <IntegrationCard><Cursor /></IntegrationCard>
                                <IntegrationCard><ClaudeColor /></IntegrationCard>
                                <IntegrationCard><Openai /></IntegrationCard>
                                <IntegrationCard><GeminiColor /></IntegrationCard>
                            </InfiniteSlider>
                        </div>
                        <div className="absolute inset-0 m-auto flex size-fit justify-center gap-2 pointer-events-auto">
                            <IntegrationCard className="shadow-black-950/10 size-20 bg-white/25 shadow-xl backdrop-blur-md backdrop-grayscale dark:border-white/10 dark:shadow-white/15" isCenter>
                                <LogoIcon />
                            </IntegrationCard>
                        </div>
                    </div>
                    <div className="mx-auto mt-12 max-w-2xl space-y-6 text-center">
                        <h2 className="text-balance text-4xl font-bold md:text-5xl">{t('title')}</h2>
                        <p className="text-lg md:text-xl text-muted-foreground">{t('description')}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

const IntegrationCard = ({ children, className, isCenter = false }: { children: React.ReactNode; className?: string; isCenter?: boolean }) => (
    <div className={cn('bg-background relative z-20 flex size-14 rounded-full border border-border', className)}>
        <div className={cn('m-auto size-fit *:size-6', isCenter && '*:size-10')}>{children}</div>
    </div>
)
