import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteStore } from '@store/site.store'
import { useBackStore } from '@store/back.store'

export default function LocationTracker() {
  const loc = useLocation()
  const prevRef = useRef<string | null>(null)
  const current = useSiteStore((s) => s.current)
  const sites = useSiteStore((s) => s.sites)
  const { setBack } = useBackStore()

  useEffect(() => {
    const prev = prevRef.current
    const now = loc.pathname + (loc.search || '')
    if (prev && prev !== now) {
      const { label } = deriveBackTarget(prev, sites, current?.slug, current?.name)
      setBack({ key: 'history-back', label, to: prev, variant: 'outlined', color: 'inherit' })
    }
    prevRef.current = now
  }, [loc.pathname, loc.search, setBack, sites, current?.slug, current?.name])

  return null
}

const SITE_PATH_REGEX = /^\/site\/([^/]+)/

function deriveBackTarget(
  prev: string,
  sites: Array<{ slug: string; name: string }>,
  currentSlug?: string,
  currentName?: string,
) {
  const [pathname] = prev.split('?', 1)

  const slugToDisplayName = (value: string) =>
    value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

  const lookupSiteName = (slug: string) => {
    if (currentSlug && currentSlug === slug && currentName) {
      return currentName
    }
    const found = sites.find((site) => site.slug === slug)
    return found?.name ?? slugToDisplayName(slug)
  }

  const sitePathMatch = pathname.match(SITE_PATH_REGEX)
  if (sitePathMatch) {
    const slug = sitePathMatch[1]
    return { label: `Back to ${lookupSiteName(slug)}` }
  }

  const adminSiteMatch = pathname.match(/^\/admin\/sites\/([^/]+)/)
  if (adminSiteMatch) {
    const slug = adminSiteMatch[1]
    return { label: `Back to ${lookupSiteName(slug)}` }
  }

  if (pathname === '/admin/sites') {
    return { label: 'Back to Sites' }
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    return { label: 'Back to Dashboard' }
  }

  return { label: 'Back' }
}
