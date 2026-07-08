'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export const HeroHeader = () => {
    const t = useTranslations('nav')
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    const menuItems = [
        { name: t('features'), href: '#features' },
        { name: t('solution'), href: '#solution' },
        { name: t('pricing'), href: '#pricing' },
        { name: t('about'), href: '#about' },
    ]

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState ? 'active' : undefined}
                className="fixed z-20 w-full px-2">
                <div className={cn(
                    'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
                    isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border border-border backdrop-blur-lg lg:px-5'
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className={cn(
                                    'm-auto size-6 duration-200',
                                    menuState && 'rotate-180 scale-0 opacity-0'
                                )} />
                                <X className={cn(
                                    'absolute inset-0 m-auto size-6 duration-200',
                                    menuState ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'
                                )} />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground block duration-150 transition-colors">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={cn(
                            'bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl shadow-zinc-950/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
                            menuState && 'flex'
                        )}>
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground block duration-150 transition-colors"
                                                onClick={() => setMenuState(false)}>
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col items-center space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <ThemeToggle />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                    asChild>
                                    <Link href="#">
                                        <span>{t('login')}</span>
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                    asChild>
                                    <Link href="#">
                                        <span>{t('signup')}</span>
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className={cn(!isScrolled && 'hidden')}
                                    asChild>
                                    <Link href="#">
                                        <span>{t('getStarted')}</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
