import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useBreadcrumbBackAction } from './useBreadcrumbBackAction'
import { useSiteStore } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import type { Site } from '@store/site.store'
import { useTranslate } from '@i18n/useTranslate'

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
  const { t } = useTranslate()

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
    if (!derivedSlug) return buildEntityUrl('sites')
    if (isSitePath) {
      return siteRoot(derivedSlug)
    }
    // When not on a site path (enterprise route), prefer the enterprise per-site
    // URL (e.g. /admin/sites/:slug) rather than translating to the site-scoped
    // path (/site/:slug/sites). Force an empty entity so we land on the root.
    return buildEntityUrl('', undefined, {
      routeParamSlug: derivedSlug,
      preferSiteWhenPossible: false,
    })
  }, [derivedSlug, isSitePath, options?.to])

  const label = useMemo(() => {
    if (options?.label) return options.label
    if (matchedSite) {
      return t('layout.backNavigation.backToSite', { siteName: matchedSite.name })
    }
    return t('layout.backNavigation.backToSites')
  }, [matchedSite, options?.label, t])

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
    variant: 'outlined',
    color: 'inherit',
  })

  return { activeSite: matchedSite, slug: derivedSlug, isSitePath }
}
