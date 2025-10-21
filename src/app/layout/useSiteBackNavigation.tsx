import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useBreadcrumbBackAction } from './useBreadcrumbBackAction'
import { useSiteStore } from '@store/site.store'
import type { Site } from '@store/site.store'

export type SiteBackNavigationOptions = {
  slug?: string
  label?: string
  to?: string
  key?: string
  enabled?: boolean
}

export function useSiteBackNavigation(options?: SiteBackNavigationOptions) {
  const params = useParams<{ slug?: string }>()
  const location = useLocation()
  const { mode, current, sites, hydrate } = useSiteStore()

  useEffect(() => {
    if (sites.length === 0) {
      hydrate()
    }
  }, [hydrate, sites.length])

  const derivedSlug = useMemo(() => {
    if (options?.slug) return options.slug
    if (params.slug) return params.slug
    if (mode === 'site' && current) return current.slug
    return undefined
  }, [current, mode, options?.slug, params.slug])

  const matchedSite = useMemo<Site | undefined>(() => {
    if (!derivedSlug) return undefined
    if (current && current.slug === derivedSlug) return current
    return sites.find((site) => site.slug === derivedSlug)
  }, [current, derivedSlug, sites])

  const isSitePath = useMemo(() => location.pathname.startsWith('/site/'), [location.pathname])

  const target = useMemo(() => {
    if (options?.to) return options.to
    if (!derivedSlug) return '/admin/sites'
    if (isSitePath) {
      return `/site/${derivedSlug}`
    }
    return `/admin/sites/${derivedSlug}`
  }, [derivedSlug, isSitePath, options?.to])

  const label = useMemo(() => {
    if (options?.label) return options.label
    return matchedSite ? `Back to ${matchedSite.name}` : 'Back to Sites'
  }, [matchedSite, options?.label])

  const isEnabled = useMemo(() => {
    if (typeof options?.enabled === 'boolean') {
      return options.enabled
    }
    return Boolean(derivedSlug)
  }, [derivedSlug, options?.enabled])

  useBreadcrumbBackAction({
    label,
    to: target,
    key: options?.key ?? 'back-to-site',
    enabled: isEnabled,
  })

  return { activeSite: matchedSite, slug: derivedSlug, isSitePath }
}
