import { notFound } from 'next/navigation'
import { policies } from '@/lib/policies'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'

export default async function PolicyPage({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params

    const localePolicies = policies[locale as keyof typeof policies]
    if (!localePolicies) notFound()

    const content = localePolicies[slug]
    if (!content) notFound()

    return (
        <div className="relative py-24 md:py-32 bg-background min-h-screen overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full"
                style={{
                    background: 'radial-gradient(125% 125% at 50% 10%, transparent 0%, var(--background) 75%)',
                }}
            />
            <div className="mx-auto max-w-4xl px-6 relative z-10">
                <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    {content.title}
                </TextEffect>
                <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.2} as="p" className="text-muted-foreground mb-16 opacity-80 border-b border-border/50 pb-8">
                    {content.lastUpdated}
                </TextEffect>
                
                <AnimatedGroup 
                    className="space-y-12"
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } },
                        item: {
                            hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.3 } },
                        },
                    }}
                >
                    {content.sections.map((section, index) => (
                        <div key={index} className="prose prose-zinc dark:prose-invert max-w-none">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">{section.heading}</h2>
                            <div className="text-muted-foreground leading-relaxed text-lg bg-surface-raised/30 p-6 md:p-8 rounded-2xl border border-border/30 backdrop-blur-sm shadow-sm ring-1 ring-white/5">
                                {section.body}
                            </div>
                        </div>
                    ))}
                </AnimatedGroup>
            </div>
        </div>
    )
}
