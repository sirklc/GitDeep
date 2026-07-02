import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; theme?: string; callback: (token: string) => void; 'expired-callback'?: () => void }) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

interface Props {
  siteKey: string
  onToken: (token: string) => void
}

/** Cloudflare Turnstile widget (explicit render, dark theme). */
export default function Turnstile({ siteKey, onToken }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey || !ref.current) return
    let cancelled = false

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: onToken,
        'expired-callback': () => onToken(''),
      })
    }

    if (window.turnstile) {
      render()
    } else {
      // Script may still be loading — poll briefly
      const t = setInterval(() => {
        if (window.turnstile) {
          clearInterval(t)
          render()
        }
      }, 200)
      return () => {
        cancelled = true
        clearInterval(t)
      }
    }

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
    }
  }, [siteKey, onToken])

  return <div ref={ref} className="min-h-16" />
}
