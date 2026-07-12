import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { policies } from '@/lib/policies'

const host = 'https://gitdeep.com'

// Static, indexable marketing routes (path is relative to the locale
// prefix, e.g. "" -> /en, "/login" -> /en/login).
//
// Intentionally EXCLUDED from this sitemap:
//  - /forgot-password, /reset-password: transactional, token-bearing
//    pages with no unique indexable content (should also be marked
//    `noindex` at the page/layout level, not just omitted here).
//  - /dashboard/**: authenticated app, must stay out of the public
//    sitemap entirely (see src/app/robots.ts).
//  - /pricing, /about, /features, /solution: these routes no longer
//    exist (merged into in-page anchors on the homepage: #pricing,
//    #features, #solution) — the previous sitemap.ts still listed
//    them, which would have produced 404s for crawlers.
const staticRoutes: { path: string; lastModified: Date }[] = [
  { path: '', lastModified: new Date('2026-07-10') },
  { path: '/login', lastModified: new Date('2026-07-10') },
  { path: '/signup', lastModified: new Date('2026-07-10') },
]

// Policy pages are sourced dynamically from lib/policies.ts so a new
// slug (e.g. a future "terms") is picked up automatically and a
// removed slug never lingers as a stale sitemap entry.
//
// NOTE: policies.ts currently stores `lastUpdated` as a localized
// display string ("July 10, 2026" / "10 Temmuz 2026"), which can't be
// safely parsed with `new Date()`. Recommend adding a machine-readable
// `lastUpdatedISO: string` field to `PolicyContent` so this map can be
// derived instead of hand-maintained here.
const policyLastModified: Record<string, Date> = {
  licence: new Date('2026-07-10'),
  privacy: new Date('2026-07-10'),
  cookies: new Date('2026-07-10'),
  security: new Date('2026-07-10'),
}

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, `${host}/${locale}${path}`])
    ),
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${host}/${locale}${route.path}`,
        lastModified: route.lastModified,
        alternates: buildAlternates(route.path),
      })
    }

    const localePolicies = policies[locale as keyof typeof policies] ?? {}
    for (const slug of Object.keys(localePolicies)) {
      const path = `/policies/${slug}`
      entries.push({
        url: `${host}/${locale}${path}`,
        lastModified: policyLastModified[slug] ?? new Date('2026-07-10'),
        alternates: buildAlternates(path),
      })
    }
  }

  return entries
}
