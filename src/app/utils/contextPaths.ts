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

  // Prefer explicit site route (site mode) when requested / available
  if (slug && opts?.preferSiteWhenPossible !== false) {
    return `/site/${slug}/${resource}`
  }

  // If a route-specific slug exists but not using site path, use enterprise per-site path
  if (routeSlug) {
    return `/admin/sites/${routeSlug}/${resource}`
  }

  return `/admin/${resource}`
}

export default buildEntityUrl
