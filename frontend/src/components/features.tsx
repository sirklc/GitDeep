import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    const t = useTranslations('features')
    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">{t('sectionTitle')}</h2>
                    <p className="mt-4 text-muted-foreground">{t('sectionDescription')}</p>
                </div>
                <div className="mx-auto mt-8 grid max-w-sm gap-6 text-center md:mt-16 lg:max-w-full lg:grid-cols-3">
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
                </div>
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
