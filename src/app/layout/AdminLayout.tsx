import { useCallback, useEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { Outlet, Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Toolbar, Breadcrumbs, Link, Menu, MenuItem } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import DoorFrontIcon from '@mui/icons-material/DoorFront'
import BadgeIcon from '@mui/icons-material/Badge'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import TopBar from './TopBar'
import { useAuthStore } from '@app/auth/auth.store'
import { useSiteStore } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useBackStore } from '@store/back.store'
import { formatBackLabel } from './backNavigation'
import { scrollWindowToTop } from './scrollToTop'

const CRUMB_META_MAP: Record<string, { labelKey: string; Icon?: ElementType }> = {
  admin: { labelKey: 'layout.breadcrumbs.adminDashboard', Icon: DashboardIcon },
  sites: { labelKey: 'layout.breadcrumbs.sites', Icon: DomainIcon },
  users: { labelKey: 'layout.breadcrumbs.users', Icon: PeopleIcon },
  residents: { labelKey: 'layout.breadcrumbs.residents', Icon: PersonIcon },
  residences: { labelKey: 'layout.breadcrumbs.residences', Icon: HomeWorkIcon },
  vehicles: { labelKey: 'layout.breadcrumbs.vehicles', Icon: DirectionsCarIcon },
  visitors: { labelKey: 'layout.breadcrumbs.visitors', Icon: BadgeIcon },
  policies: { labelKey: 'layout.breadcrumbs.policies', Icon: GavelIcon },
  reports: { labelKey: 'layout.breadcrumbs.reports', Icon: BarChartIcon },
  analytics: { labelKey: 'layout.breadcrumbs.analytics', Icon: AnalyticsIcon },
  visits: { labelKey: 'layout.breadcrumbs.visits', Icon: DoorFrontIcon },
  guards: { labelKey: 'layout.breadcrumbs.guards', Icon: LocalPoliceIcon },
  admins: { labelKey: 'layout.breadcrumbs.admins', Icon: ManageAccountsIcon },
}

// Sibling pages for second-level breadcrumbs (main admin sections)
const SECOND_LEVEL_SIBLINGS = [
  'sites',
  'users',
  'visits',
  'visitors',
  'vehicles',
  'reports',
  'analytics',
]

// Sibling pages for site-level breadcrumbs (site-specific pages)
const SITE_LEVEL_SIBLINGS = [
  'users',
  'admins',
  'guards',
  'residents',
  'visits',
  'vehicles',
  'visitors',
  'residences',
]

function getSiblingSegments(
  segment: string,
  breadcrumbIndex: number,
  current?: { slug: string } | null,
  allSites?: Array<{ slug: string; name: string }>,
  isSiteCrumb?: boolean,
): string[] {
  // Skip first level (enterprise dashboard)
  if (breadcrumbIndex === 0) {
    return []
  }

  // Second level: main admin sections, filter out current
  if (breadcrumbIndex === 1) {
    return SECOND_LEVEL_SIBLINGS.filter((s) => s !== segment.toLowerCase())
  }

  // Third level: if it's a site slug, show other sites
  if (breadcrumbIndex === 2 && isSiteCrumb && allSites) {
    return allSites.filter((site) => site.slug !== segment).map((site) => site.slug)
  }

  // Fourth level and beyond: site-level pages, filter out current
  if (breadcrumbIndex >= 3) {
    return SITE_LEVEL_SIBLINGS.filter((s) => s !== segment.toLowerCase())
  }

  return []
}

export default function AdminLayout() {
  useAuthStore()
  const loc = useLocation()
  const navigate = useNavigate()
  const params = useParams<{ slug?: string }>()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const parts = loc.pathname.split('/').filter(Boolean)
  const { current, hydrate, mode, setCurrent, sites } = useSiteStore()
  const isSiteMode = mode === 'site'
  const isSitePath = loc.pathname.startsWith('/site/')
  const back = useBackStore((s) => s.back)
  const setBack = useBackStore((s) => s.setBack)
  const clearBack = useBackStore((s) => s.clearBack)

  const [menuAnchor, setMenuAnchor] = useState<Record<number, HTMLElement | null>>({})

  const crumbs: Array<{ segment: string; to: string }> =
    (isSitePath && current) || (isSiteMode && current)
      ? buildSiteCrumbs(loc.pathname, current.slug, {
          includeSitesCrumb: mode === 'enterprise',
          includeAdmin: mode === 'enterprise',
        })
      : parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))

  const previousSiteSlugRef = useRef<string | undefined>()

  const handleBackClick = useCallback(() => {
    if (!back) return
    if (back.onClick) {
      back.onClick()
      return
    }
    if (back.to) {
      navigate(back.to)
      return
    }
    navigate(-1)
  }, [back, navigate])

  const handleOpenMenu = useCallback((index: number, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor((prev) => ({ ...prev, [index]: event.currentTarget }))
  }, [])

  const handleCloseMenu = useCallback((index: number) => {
    setMenuAnchor((prev) => ({ ...prev, [index]: null }))
  }, [])

  const shouldUpdateBack = useMemo(() => {
    return (
      backObj: typeof back,
      previousCrumb: { segment: string; to: string },
      label: string,
    ) => {
      if (!backObj) return true
      if (backObj.key === 'history-back') return true
      if (
        backObj.key === 'breadcrumb-default' &&
        (backObj.to !== previousCrumb.to || backObj.label !== label)
      )
        return true
      // Custom keys set by useBreadcrumbBackAction take precedence and are not overridden
      return false
    }
  }, [])

  useEffect(() => {
    if (crumbs.length < 2) {
      if (back?.key === 'breadcrumb-default') {
        clearBack()
      }
      return
    }

    const previousCrumb = crumbs[crumbs.length - 2]
    const formattedLabel = previousCrumb.segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    const label = formatBackLabel({ baseLabel: formattedLabel, t, language })

    // Back button precedence rules:
    // 1. If no back object, set default breadcrumb.
    // 2. If back.key is 'history-back', always override with breadcrumb-default.
    // 3. If back.key is 'breadcrumb-default', update if label or to changes.
    // 4. If back.key is custom, do not override.
    if (shouldUpdateBack(back, previousCrumb, label)) {
      setBack({
        key: 'breadcrumb-default',
        label,
        to: previousCrumb.to,
        variant: 'outlined',
        color: 'inherit',
      })
    }
  }, [back, clearBack, crumbs, language, setBack, t, shouldUpdateBack])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    const slug = params.slug

    if (slug && sites.length > 0) {
      const match = sites.find((site) => site.slug === slug)
      if (match && (!current || current.slug !== match.slug)) {
        setCurrent(match)
      }
    }
  }, [loc.pathname, params.slug, sites, setCurrent, current])

  useEffect(() => {
    if (mode !== 'site' || !current) return
    const base = siteRoot(current.slug)
    const adminSiteBase = buildEntityUrl('', undefined, { routeParamSlug: current.slug })
    if (!loc.pathname.startsWith(base) && !loc.pathname.startsWith(adminSiteBase)) {
      navigate(base, { replace: true })
    }
  }, [mode, current, loc.pathname, navigate])

  useEffect(() => {
    const slug = current?.slug
    if (!slug) {
      previousSiteSlugRef.current = undefined
      return
    }

    if (previousSiteSlugRef.current === slug) return
    previousSiteSlugRef.current = slug

    scrollWindowToTop()
  }, [current?.slug])

  useEffect(() => {
    scrollWindowToTop()
  }, [loc.pathname, loc.search])

  function getCrumbMeta(segment: string) {
    const s = segment.toLowerCase()
    if (current && current.slug === segment) {
      return {
        label: isSiteMode
          ? t('layout.breadcrumbs.siteDashboard', { siteName: current.name, lng: language })
          : current.name,
        Icon: DomainIcon,
      }
    }
    const mapEntry = CRUMB_META_MAP[s]
    if (mapEntry) {
      return { label: t(mapEntry.labelKey, { lng: language }), Icon: mapEntry.Icon }
    }
    const formatted = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      label: t('layout.breadcrumbs.unknown', { value: formatted, lng: language }),
      Icon: undefined,
    }
  }

  // Get translated back button aria-label
  const backAriaLabel = t('layout.backNavigation.backToShort', {
    lng: language,
    defaultValue: 'Back',
  })

  return (
    <Box>
      <TopBar />
      <Toolbar sx={{ minHeight: 64 }} />
      <Box sx={{ p: 2 }}>
        {/* Breadcrumbs for desktop with back button */}
        {crumbs.length > 1 && (
          <Box
            sx={{
              mb: 1,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
              {crumbs.map((c, index) => {
                const meta = getCrumbMeta(c.segment)
                const Icon = meta.Icon
                const isSiteCrumb = current?.slug === c.segment
                const siblings = getSiblingSegments(c.segment, index, current, sites, isSiteCrumb)
                const hasMenu = siblings.length > 0

                const contents = (
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {Icon ? <Icon fontSize="small" /> : null}
                    {meta.label}
                  </Box>
                )

                return (
                  <Box key={c.to} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <Link
                      component={RouterLink}
                      to={c.to}
                      onClick={
                        hasMenu
                          ? (e) => {
                              e.preventDefault()
                              handleOpenMenu(index, e)
                            }
                          : undefined
                      }
                      sx={{
                        color: 'text.secondary',
                        typography: 'caption',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contents}
                      {hasMenu && <ArrowDropDownIcon sx={{ fontSize: 16 }} />}
                    </Link>

                    {hasMenu && (
                      <Menu
                        anchorEl={menuAnchor[index] || null}
                        open={Boolean(menuAnchor[index])}
                        onClose={() => handleCloseMenu(index)}
                        slotProps={{
                          list: {
                            'aria-labelledby': `breadcrumb-${index}`,
                          },
                        }}
                      >
                        <MenuItem
                          component={RouterLink}
                          to={c.to}
                          onClick={() => handleCloseMenu(index)}
                          selected
                        >
                          {contents}
                        </MenuItem>
                        {siblings.map((sibling) => {
                          // Build the correct path for siblings
                          let siblingPath: string
                          let siblingLabel: string
                          let siblingIcon: ElementType | undefined

                          if (index === 2 && isSiteCrumb) {
                            // For sites (index 2), sibling is a site slug
                            siblingPath = `/admin/sites/${sibling}`
                            const siblingSite = sites.find((s) => s.slug === sibling)
                            siblingLabel = siblingSite?.name || sibling
                            siblingIcon = DomainIcon
                          } else if (index >= 3) {
                            // For site-level pages (index 3+)
                            siblingPath = `/admin/sites/${current?.slug}/${sibling}`
                            const siblingMeta = getCrumbMeta(sibling)
                            siblingLabel = siblingMeta.label
                            siblingIcon = siblingMeta.Icon
                          } else {
                            // For admin-level pages (index 1)
                            const basePath = crumbs
                              .slice(0, index)
                              .map((cr) => cr.segment)
                              .join('/')
                            siblingPath = basePath ? `/${basePath}/${sibling}` : `/${sibling}`
                            const siblingMeta = getCrumbMeta(sibling)
                            siblingLabel = siblingMeta.label
                            siblingIcon = siblingMeta.Icon
                          }

                          const Icon = siblingIcon
                          return (
                            <MenuItem
                              key={sibling}
                              component={RouterLink}
                              to={siblingPath}
                              onClick={() => handleCloseMenu(index)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {Icon ? <Icon fontSize="small" /> : null}
                                {siblingLabel}
                              </Box>
                            </MenuItem>
                          )
                        })}
                      </Menu>
                    )}
                  </Box>
                )
              })}
            </Breadcrumbs>

            {/* Back button at the right end */}
            {back ? (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                aria-label={backAriaLabel}
                startIcon={back.icon ?? <ArrowBackIcon />}
                onClick={handleBackClick}
                disabled={back.disabled}
                sx={{
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {back.label}
              </Button>
            ) : null}
          </Box>
        )}

        {/* Page content */}
        <Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

function buildSiteCrumbs(
  pathname: string,
  slug: string,
  opts?: { includeSitesCrumb?: boolean; includeAdmin?: boolean },
): Array<{ segment: string; to: string }> {
  const basePath = `/site/${slug}`
  const crumbs: Array<{ segment: string; to: string }> = []
  if (opts === undefined || opts.includeAdmin !== false) {
    crumbs.push({ segment: 'admin', to: buildEntityUrl('') })
  }

  if (opts?.includeSitesCrumb) {
    crumbs.push({ segment: 'sites', to: buildEntityUrl('sites') })
  }

  crumbs.push({ segment: slug, to: basePath })

  if (!pathname.startsWith(basePath)) {
    return crumbs
  }

  const remainder = pathname.slice(basePath.length)
  if (!remainder) {
    return crumbs
  }

  remainder
    .split('/')
    .filter(Boolean)
    .reduce((acc, segment) => {
      const next = `${acc}/${segment}`
      crumbs.push({ segment, to: next })
      return next
    }, basePath)

  return crumbs
}
