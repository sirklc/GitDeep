import { useTranslations } from 'next-intl'
import { Github } from '@/components/ui/svgs/github'

export default function ContentSection() {
    const t = useTranslations('content')
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">{t('title')}</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0">
                        <div className="relative aspect-[76/59] rounded-2xl bg-gradient-to-b from-zinc-700 to-transparent p-px">
                            <div className="h-full w-full rounded-[15px] bg-surface overflow-hidden">
                                <div className="flex h-full flex-col gap-3 p-4">
                                    <div className="flex items-center gap-2 border-b border-border pb-3">
                                        <div className="size-3 rounded-full bg-destructive/60" />
                                        <div className="size-3 rounded-full bg-yellow-500/60" />
                                        <div className="size-3 rounded-full bg-green-500/60" />
                                        <div className="ml-auto h-3 w-24 rounded bg-muted" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden pt-2">
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <div className="text-[10px] font-semibold text-foreground/80">Notifications</div>
                                            <div className="text-[8px] text-muted-foreground/60 cursor-pointer hover:text-foreground">Mark all as read</div>
                                        </div>
                                        <div className="flex flex-col gap-2 overflow-hidden">
                                            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-primary/5 p-3">
                                                <div className="mt-0.5 size-7 shrink-0 rounded-full border border-border/50 bg-primary/20 flex items-center justify-center">
                                                    <svg className="size-3 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                                </div>
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="text-[10px] font-semibold text-foreground/90">Security scan complete</div>
                                                    <div className="text-[8px] text-muted-foreground line-clamp-1">No critical vulnerabilities found in gitdeep-frontend.</div>
                                                    <div className="text-[7px] text-muted-foreground/60 mt-1">2m ago</div>
                                                </div>
                                                <div className="size-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-raised p-3">
                                                <div className="mt-0.5 size-7 shrink-0 rounded-full border border-border/50 bg-muted flex items-center justify-center">
                                                    <svg className="size-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/></svg>
                                                </div>
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="text-[10px] font-medium text-foreground/80">New Pull Request</div>
                                                    <div className="text-[8px] text-muted-foreground line-clamp-1">John Doe opened PR #42 in nextjs-template.</div>
                                                    <div className="text-[7px] text-muted-foreground/60 mt-1">1h ago</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-raised p-3">
                                                <div className="mt-0.5 size-7 shrink-0 rounded-full border border-border/50 bg-muted flex items-center justify-center">
                                                    <svg className="size-3 text-destructive/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                                </div>
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="text-[10px] font-medium text-foreground/80">Build Failed</div>
                                                    <div className="text-[8px] text-muted-foreground line-clamp-1">Deployment failed for staging environment.</div>
                                                    <div className="text-[7px] text-muted-foreground/60 mt-1">3h ago</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-raised p-3">
                                                <div className="mt-0.5 size-7 shrink-0 rounded-full border border-border/50 bg-muted flex items-center justify-center">
                                                    <svg className="size-3 text-yellow-500/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                </div>
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="text-[10px] font-medium text-foreground/80">New Star</div>
                                                    <div className="text-[8px] text-muted-foreground line-clamp-1">Alice starred your repository.</div>
                                                    <div className="text-[7px] text-muted-foreground/60 mt-1">1d ago</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            {t('p1')}{' '}
                            <span className="text-foreground font-bold">{t('p1Bold')}</span>{' '}
                            {t('p1Suffix')}
                        </p>
                        <p className="text-muted-foreground">{t('p2')}</p>
                        <div className="pt-6">
                            <blockquote className="border-l-4 border-primary pl-4">
                                <p className="text-muted-foreground italic">{t('quote')}</p>
                                <div className="mt-6 space-y-3">
                                    <cite className="block font-medium not-italic">{t('quoteAuthor')}</cite>
                                    <Github height={24} width={80} className="fill-foreground" />
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
