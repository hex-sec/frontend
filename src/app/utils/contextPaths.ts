import { type SiteMode } from '@store/site.store'

export function buildEntityUrl(
  entity: string,
  id?: string,
  opts?: {
    mode?: SiteMode
    currentSlug?: string | null
    routeParamSlug?: string | null
    preferSiteWhenPossible?: boolean
  },
) {
  const mode = opts?.mode ?? 'enterprise'
  const routeSlug = opts?.routeParamSlug ?? null
  const currentSlug = opts?.currentSlug ?? null
  const slug = routeSlug ?? (mode === 'site' ? currentSlug : null)

  const resource = `${entity}${id ? `/${id}` : ''}`
  // Normalize resource: if empty, avoid extra trailing slashes in returned paths
  const hasResource = resource.length > 0

  // Prefer explicit site route (site mode) when requested / available
  if (slug && opts?.preferSiteWhenPossible !== false) {
    return hasResource ? `/site/${slug}/${resource}` : `/site/${slug}`
  }

  // If a route-specific slug exists but not using site path, use enterprise per-site path
  if (routeSlug) {
    return hasResource ? `/admin/sites/${routeSlug}/${resource}` : `/admin/sites/${routeSlug}`
  }

  return hasResource ? `/admin/${resource}` : '/admin'
}

export default buildEntityUrl

// Small helpers to centralize common checks/roots so callers don't use '/site' or '/admin' literals
export function isSitePath(pathname: string) {
  return pathname.startsWith('/site/')
}

export function siteRoot(slug: string) {
  return `/site/${slug}`
}
