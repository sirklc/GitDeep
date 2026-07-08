'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    // Prevent hydration mismatch
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-surface-raised" />
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex size-8 items-center justify-center rounded-full border border-border/50 bg-surface-raised text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            aria-label="Toggle theme"
        >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
    )
}
