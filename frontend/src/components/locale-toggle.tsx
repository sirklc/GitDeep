'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useState } from 'react'

export function LocaleToggle() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, setIsPending] = useState(false)

    const isEN = locale === 'en'

    const handleToggle = () => {
        if (isPending) return
        setIsPending(true)
        const nextLocale = isEN ? 'tr' : 'en'
        router.replace(pathname, { locale: nextLocale })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            aria-label="Toggle language"
            className="relative flex h-8 w-[4.5rem] items-center rounded-full border border-border bg-muted p-0.5 transition-opacity disabled:opacity-50 cursor-pointer"
        >
            {/* Sliding pill */}
            <span
                className="absolute h-7 w-[2rem] rounded-full bg-foreground transition-transform duration-300 ease-in-out"
                style={{ transform: isEN ? 'translateX(0)' : 'translateX(calc(4.5rem - 2rem - 4px))' }}
            />
            {/* Labels */}
            <span className="relative z-10 flex-1 text-center text-xs font-medium transition-colors duration-300"
                style={{ color: isEN ? 'var(--background)' : 'var(--muted-foreground)' }}>
                EN
            </span>
            <span className="relative z-10 flex-1 text-center text-xs font-medium transition-colors duration-300"
                style={{ color: !isEN ? 'var(--background)' : 'var(--muted-foreground)' }}>
                TR
            </span>
        </button>
    )
}
