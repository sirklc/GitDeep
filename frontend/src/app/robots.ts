import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

// All app routes are locale-prefixed (e.g. /en/dashboard, /tr/dashboard)
// because routing.ts uses localePrefix: "always" (the default). Plain
// '/dashboard/' disallow rules never match those URLs, so every locale
// prefix needs its own explicit disallow entry.
const disallow = routing.locales.flatMap((locale) => [
  `/${locale}/dashboard/`,
  `/${locale}/reset-password`,
  `/${locale}/forgot-password`,
])

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...disallow, '/api/', '/admin/'],
    },
    sitemap: 'https://gitdeep.com/sitemap.xml',
  }
}
