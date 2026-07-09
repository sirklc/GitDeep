import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap } from 'lucide-react'
import { ReactNode } from 'react'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'

export default function Features() {
    const t = useTranslations('features')
    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-balance text-4xl font-semibold lg:text-5xl">{t('sectionTitle')}</TextEffect>
                    <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.5} as="p" className="mt-4 text-muted-foreground">{t('sectionDescription')}</TextEffect>
                </div>
                <AnimatedGroup
                    className="mx-auto mt-8 grid max-w-sm gap-6 text-center md:mt-16 lg:max-w-full lg:grid-cols-3"
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } },
                        item: {
                            hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                        },
                    }}
                >
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator><Zap className="size-6" aria-hidden /></CardDecorator>
                            <h3 className="mt-6 font-medium">{t('customizable.title')}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{t('customizable.description')}</p>
                        </CardContent>
                    </Card>
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator><Settings2 className="size-6" aria-hidden /></CardDecorator>
                            <h3 className="mt-6 font-medium">{t('control.title')}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">{t('control.description')}</p>
                        </CardContent>
                    </Card>
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator><Sparkles className="size-6" aria-hidden /></CardDecorator>
                            <h3 className="mt-6 font-medium">{t('ai.title')}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">{t('ai.description')}</p>
                        </CardContent>
                    </Card>
                </AnimatedGroup>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]"
        style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 60%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 60%)' }}>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50" />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t border-border">{children}</div>
    </div>
)
