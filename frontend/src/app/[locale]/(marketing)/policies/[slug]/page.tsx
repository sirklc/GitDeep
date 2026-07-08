import { notFound } from 'next/navigation'
import { policies } from '@/lib/policies'

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
        <div className="py-24 md:py-32 bg-background min-h-screen">
            <div className="mx-auto max-w-3xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-2">{content.title}</h1>
                <p className="text-muted-foreground mb-12 opacity-80">{content.lastUpdated}</p>
                
                <div className="space-y-8">
                    {content.sections.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
                            <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
