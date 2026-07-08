'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    LayoutDashboard,
    FolderGit2,
    ScanSearch,
    CreditCard,
    GitCompare,
    Bell,
    Plug,
    Users,
    Settings,
    Menu,
    X,
} from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { mockNotifications } from '@/lib/dashboard-mock'

const mainNav = [
    { href: '/dashboard', icon: LayoutDashboard, key: 'overview' },
    { href: '/dashboard/projects', icon: FolderGit2, key: 'projects' },
    { href: '/dashboard/analyses', icon: ScanSearch, key: 'analyses' },
    { href: '/dashboard/billing', icon: CreditCard, key: 'billing' },
    { href: '/dashboard/compare', icon: GitCompare, key: 'compare' },
    { href: '/dashboard/notifications', icon: Bell, key: 'notifications' },
    { href: '/dashboard/integrations', icon: Plug, key: 'integrations' },
] as const

const bottomNav = [
    { href: '/dashboard/team', icon: Users, key: 'team', comingSoon: true },
    { href: '/dashboard/settings', icon: Settings, key: 'settings', comingSoon: false },
] as const

function stripLocale(pathname: string) {
    return pathname.replace(/^\/(en|tr)(?=\/|$)/, '') || '/'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('dashboard')
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const unreadCount = mockNotifications.filter((n) => !n.read).length

    const isActive = (href: string) => {
        const clean = stripLocale(pathname)
        if (href === '/dashboard') return clean === '/dashboard'
        return clean.startsWith(href)
    }

    const linkClass = (active: boolean) =>
        cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            active
                ? 'bg-muted/50 text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )

    const renderNav = (onNavigate?: () => void) => (
        <>
            <nav className="flex-1 space-y-1 px-4 py-4">
                {mainNav.map(({ href, icon: Icon, key }) => (
                    <Link key={href} href={href} onClick={onNavigate} className={linkClass(isActive(href))}>
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1">{t(`menu.${key}`)}</span>
                        {key === 'notifications' && unreadCount > 0 && (
                            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
            <div className="space-y-1 p-4 border-t border-border/50">
                {bottomNav.map(({ href, icon: Icon, key, comingSoon }) => (
                    <Link key={href} href={href} onClick={onNavigate} className={linkClass(isActive(href))}>
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1">{t(`menu.${key}`)}</span>
                        {comingSoon && (
                            <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                                {t('comingSoon')}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-background overflow-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800">
            {/* Background Effects */}
            <div aria-hidden className="absolute inset-0 isolate hidden opacity-50 lg:block pointer-events-none" style={{ contain: 'strict' }}>
                <div className="absolute left-1/2 top-0 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsla(0,0%,85%,.04)_0,transparent_60%)]" />
            </div>

            {/* Desktop sidebar */}
            <aside className="relative z-20 hidden w-64 flex-col border-r border-border/50 bg-background/50 backdrop-blur-xl md:flex">
                <div className="flex h-16 shrink-0 items-center px-6">
                    <Link href="/" aria-label="Home" className="flex items-center gap-2">
                        <LogoIcon className="size-6" />
                        <span className="font-semibold tracking-tight">GitDeep</span>
                    </Link>
                </div>
                {renderNav()}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-30 md:hidden">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative z-40 flex h-full w-64 flex-col bg-background border-r border-border/50">
                        <div className="flex h-16 shrink-0 items-center justify-between px-6">
                            <Link href="/" aria-label="Home" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                                <LogoIcon className="size-6" />
                                <span className="font-semibold tracking-tight">GitDeep</span>
                            </Link>
                            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-muted-foreground hover:text-foreground">
                                <X className="size-5" />
                            </button>
                        </div>
                        {renderNav(() => setMobileOpen(false))}
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-background/50 px-6 backdrop-blur-md">
                    <button
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-surface-raised text-muted-foreground hover:bg-muted/50 md:hidden"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex flex-1 items-center gap-4">
                        <div className="w-full max-w-sm relative hidden sm:block">
                            <svg className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <Input
                                type="search"
                                placeholder={t('searchPlaceholder')}
                                className="w-full bg-surface-raised pl-9 border-border/50 shadow-sm transition-all focus-visible:ring-1"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/dashboard/notifications"
                            aria-label="Notifications"
                            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <Bell className="size-4 text-muted-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/dashboard/settings" aria-label="Settings" className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-border/50" />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
