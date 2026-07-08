import { useTranslations } from 'next-intl'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocaleToggle } from '@/components/locale-toggle'
import Link from 'next/link'

export default function FooterSection() {
    const t = useTranslations('footer')
    const tn = useTranslations('nav')

    const links = [
        {
            group: t('groups.product'),
            items: [
                { title: t('links.features'), href: '#' },
                { title: t('links.solution'), href: '#' },
                { title: t('links.customers'), href: '#' },
                { title: t('links.pricing'), href: '#' },
                { title: t('links.help'), href: '#' },
                { title: t('links.about'), href: '#' },
            ],
        },
        {
            group: t('groups.solution'),
            items: [
                { title: t('links.startup'), href: '#' },
                { title: t('links.freelancers'), href: '#' },
                { title: t('links.organizations'), href: '#' },
                { title: t('links.students'), href: '#' },
                { title: t('links.collaboration'), href: '#' },
                { title: t('links.design'), href: '#' },
                { title: t('links.management'), href: '#' },
            ],
        },
        {
            group: t('groups.company'),
            items: [
                { title: t('links.about'), href: '#' },
                { title: t('links.careers'), href: '#' },
                { title: t('links.blog'), href: '#' },
                { title: t('links.press'), href: '#' },
                { title: t('links.contact'), href: '#' },
                { title: t('links.help'), href: '#' },
            ],
        },
        {
            group: t('groups.legal'),
            items: [
                { title: t('links.licence'), href: '/policies/licence' },
                { title: t('links.privacy'), href: '/policies/privacy' },
                { title: t('links.cookies'), href: '/policies/cookies' },
                { title: t('links.security'), href: '/policies/security' },
            ],
        },
    ]

    return (
        <footer className="bg-background pt-20">
            <div className="mb-8 md:mb-12">
                <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
                    <Link href="/" aria-label="go home" className="block size-fit">
                        <Logo />
                    </Link>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="X/Twitter" className="text-muted-foreground hover:text-foreground block transition-colors">
                            <svg className="size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z" /></svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground block transition-colors">
                            <svg className="size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" /></svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground block transition-colors">
                            <svg className="size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" /></svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground block transition-colors">
                            <svg className="size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5 md:gap-0 lg:grid-cols-4">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-5 md:row-start-1 lg:col-span-3">
                        {links.map((link, index) => (
                            <div key={index} className="space-y-4 text-sm">
                                <span className="block font-medium">{link.group}</span>
                                {link.items.map((item, i) => (
                                    <Link key={i} href={item.href} className="text-muted-foreground hover:text-foreground block duration-150 transition-colors">
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                    <form className="row-start-1 border-b pb-8 text-sm md:col-span-2 md:border-none lg:col-span-1">
                        <div className="space-y-4">
                            <Label htmlFor="mail" className="block font-medium">{t('newsletter')}</Label>
                            <div className="flex gap-2">
                                <Input type="email" id="mail" name="mail" placeholder={t('emailPlaceholder')} className="h-8 text-sm" />
                                <Button size="sm">{t('submit')}</Button>
                            </div>
                            <span className="text-muted-foreground block text-sm">{t('noMiss')}</span>
                        </div>
                    </form>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 py-6">
                    <small className="text-muted-foreground order-last block text-center text-sm md:order-first">
                        © {new Date().getFullYear()} {t('copyright')}
                    </small>
                    <LocaleToggle />
                </div>
            </div>
        </footer>
    )
}
