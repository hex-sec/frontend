import { useCallback, useEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { Outlet, Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Toolbar,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import ListIcon from '@mui/icons-material/List'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
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
import vehiclesSeed from '../../mocks/vehicles.json'
import visitorsSeed from '../../mocks/visitors.json'
import { USERS as USERS_DATA, PATH_ROLE_SEGMENT_MAP } from '@features/admin/users/userData'

const CRUMB_META_MAP: Record<string, { labelKey: string; Icon?: ElementType }> = {
  admin: { labelKey: 'layout.breadcrumbs.adminDashboard', Icon: DashboardIcon },
  sites: { labelKey: 'layout.breadcrumbs.sites', Icon: ListIcon },
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
  incidents: { labelKey: 'layout.breadcrumbs.incidents', Icon: ReportProblemIcon },
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
  'visits',
  'vehicles',
  'visitors',
  'residences',
  'reports',
  'policies',
  'analytics',
]

// Sibling pages under Users section
const USERS_SECTION_SIBLINGS = ['admins', 'guards', 'residents']

function getSiblingSegments(
  segment: string,
  breadcrumbIndex: number,
  current?: { slug: string } | null,
  allSites?: Array<{ slug: string; name: string }>,
  isSiteCrumb?: boolean,
  crumbs?: Array<{ segment: string; to: string }>,
  roleFromQuery?: string | null,
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

  // Check if we're on a role page at index 2 (e.g., /admin/users/admins)
  if (
    breadcrumbIndex === 2 &&
    (segment === 'admins' || segment === 'guards' || segment === 'residents')
  ) {
    return USERS_SECTION_SIBLINGS.filter((s) => s !== segment.toLowerCase())
  }

  // Third level (enterprise detail) or deeper: detail pages should expose their siblings
  if (breadcrumbIndex >= 2) {
    // If we're on a users sub-page (admins, guards, residents), show those siblings
    if (segment === 'admins' || segment === 'guards' || segment === 'residents') {
      return USERS_SECTION_SIBLINGS.filter((s) => s !== segment.toLowerCase())
    }
    // If we're on a detail page (ID), show other IDs based on context
    if (segment.match(/^[A-Za-z0-9-]+$/) && crumbs && breadcrumbIndex > 0) {
      const previousSegment = crumbs[breadcrumbIndex - 1]?.segment

      if (previousSegment === 'vehicles') {
        const vehicles = (vehiclesSeed as Array<Record<string, unknown>>).map((v) => ({
          id: String(v.id),
          siteSlug: String(v.siteSlug),
        }))
        const filteredVehicles =
          allSites && current ? vehicles.filter((v) => v.siteSlug === current.slug) : vehicles
        return filteredVehicles.map((v) => v.id).filter((id) => id !== segment)
      } else if (previousSegment === 'visitors') {
        const visitors = (visitorsSeed as Array<Record<string, unknown>>).map((v) => ({
          id: String(v.id),
          siteSlug: String(v.siteSlug),
        }))
        const filteredVisitors =
          allSites && current ? visitors.filter((v) => v.siteSlug === current.slug) : visitors
        return filteredVisitors.map((v) => v.id).filter((id) => id !== segment)
      } else if (previousSegment === 'residences') {
        const residences = [
          { id: 'UNIT-TA-1408', siteSlug: 'vista-azul' },
          { id: 'UNIT-TA-PH3', siteSlug: 'vista-azul' },
          { id: 'VIL-08', siteSlug: 'los-olivos' },
          { id: 'VIL-11', siteSlug: 'los-olivos' },
          { id: 'AMN-CLB', siteSlug: 'vista-azul' },
          { id: 'PRC-12', siteSlug: 'los-olivos' },
        ]
        const filteredResidences =
          allSites && current ? residences.filter((r) => r.siteSlug === current.slug) : residences
        return filteredResidences.map((r) => r.id).filter((id) => id !== segment)
      } else if (
        previousSegment === 'users' ||
        ((previousSegment === 'admins' ||
          previousSegment === 'guards' ||
          previousSegment === 'residents') &&
          crumbs?.[breadcrumbIndex - 2]?.segment === 'users')
      ) {
        type SiteRef = { slug: string }
        type UserLite = {
          id: string | number
          role?: string
          sites?: SiteRef[]
        }
        // Derive role from path pattern /users/:role/users/:userId, or from query (?role=)
        let effectiveRole: string | undefined
        // From path: either users -> role -> users -> id OR users -> role -> id
        if (
          (breadcrumbIndex >= 4 &&
            crumbs?.[breadcrumbIndex - 3]?.segment === 'users' &&
            crumbs?.[breadcrumbIndex - 1]?.segment === 'users') ||
          (breadcrumbIndex >= 3 &&
            (crumbs?.[breadcrumbIndex - 1]?.segment === 'admins' ||
              crumbs?.[breadcrumbIndex - 1]?.segment === 'guards' ||
              crumbs?.[breadcrumbIndex - 1]?.segment === 'residents') &&
            crumbs?.[breadcrumbIndex - 2]?.segment === 'users')
        ) {
          const rolePathSeg =
            crumbs?.[breadcrumbIndex - 2]?.segment ?? crumbs?.[breadcrumbIndex - 1]?.segment
          effectiveRole = rolePathSeg ? PATH_ROLE_SEGMENT_MAP[rolePathSeg] : undefined
        }
        // From query string
        if (!effectiveRole && roleFromQuery) {
          if (
            roleFromQuery === 'admin' ||
            roleFromQuery === 'guard' ||
            roleFromQuery === 'resident'
          ) {
            effectiveRole = roleFromQuery
          }
        }

        const users = (USERS_DATA as unknown as UserLite[]).map((u) => ({
          id: String(u.id),
          role: u.role ? String(u.role) : undefined,
          sites: Array.isArray(u.sites) ? u.sites.map((s) => String(s.slug)) : [],
        }))
        const filteredUsers =
          allSites && current ? users.filter((u) => u.sites.includes(current.slug)) : users
        const filteredByRole = effectiveRole
          ? filteredUsers.filter((u) => u.role === effectiveRole)
          : filteredUsers
        return filteredByRole.map((u) => u.id).filter((id) => id !== segment)
      }
    }
    // For deeper site-level pages, show section siblings
    if (breadcrumbIndex >= 3) {
      return SITE_LEVEL_SIBLINGS.filter((s) => s !== segment.toLowerCase())
    }
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
  const [siteSearch, setSiteSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [debouncedVehicleSearch, setDebouncedVehicleSearch] = useState('')

  const crumbs: Array<{ segment: string; to: string }> =
    (isSitePath && current) || (isSiteMode && current)
      ? buildSiteCrumbs(loc.pathname, current.slug, {
          includeSitesCrumb: mode === 'enterprise',
          includeAdmin: mode === 'enterprise',
        })
      : parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))

  const previousSiteSlugRef = useRef<string | undefined>()

  // Debounce detail search input for better UX and performance
  useEffect(() => {
    const id = setTimeout(() => setDebouncedVehicleSearch(vehicleSearch), 200)
    return () => clearTimeout(id)
  }, [vehicleSearch])

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
    setSiteSearch('')
    setVehicleSearch('')
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
                const isVehicleDetailCrumb =
                  index >= 2 &&
                  c.segment.match(/^[A-Za-z0-9-]+$/) &&
                  index > 0 &&
                  crumbs[index - 1]?.segment === 'vehicles'
                const isVisitorDetailCrumb =
                  index >= 2 &&
                  c.segment.match(/^[A-Za-z0-9-]+$/) &&
                  index > 0 &&
                  crumbs[index - 1]?.segment === 'visitors'
                const isResidenceDetailCrumb =
                  index >= 2 &&
                  c.segment.match(/^[A-Za-z0-9-]+$/) &&
                  index > 0 &&
                  crumbs[index - 1]?.segment === 'residences'
                const isUserDetailCrumb = (() => {
                  if (!(index >= 2 && c.segment.match(/^[A-Za-z0-9-]+$/) && index > 0)) return false
                  const prev = crumbs[index - 1]?.segment
                  const prev2 = crumbs[index - 2]?.segment
                  const isRoleSeg = prev === 'admins' || prev === 'guards' || prev === 'residents'
                  // Detail when .../users/:id OR .../users/:role/:id
                  const underUsers = prev === 'users' || (isRoleSeg && prev2 === 'users')
                  // Exclude when the ID segment itself is a role key
                  const idIsRole =
                    c.segment === 'admins' || c.segment === 'guards' || c.segment === 'residents'
                  return underUsers && !idIsRole
                })()
                const isDetailCrumb =
                  isVehicleDetailCrumb ||
                  isVisitorDetailCrumb ||
                  isResidenceDetailCrumb ||
                  isUserDetailCrumb
                const siblings = getSiblingSegments(
                  c.segment,
                  index,
                  current,
                  sites,
                  isSiteCrumb,
                  crumbs,
                  new URLSearchParams(loc.search).get('role'),
                )
                const hasMenu = siblings.length > 0

                const contents = (
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {isVehicleDetailCrumb ||
                    isVisitorDetailCrumb ||
                    isResidenceDetailCrumb ||
                    isUserDetailCrumb ? (
                      <ConfirmationNumberIcon fontSize="small" />
                    ) : Icon ? (
                      <Icon fontSize="small" />
                    ) : null}
                    {meta.label}
                  </Box>
                )

                return (
                  <Box key={c.to} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <Link
                      component={RouterLink}
                      to={c.to}
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
                    </Link>
                    {hasMenu && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(index, e)}
                        sx={{
                          color: 'text.secondary',
                          p: 0.25,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ArrowDropDownIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}

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
                        {index === 2 && isSiteCrumb ? (
                          <>
                            <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                              <TextField
                                size="small"
                                fullWidth
                                autoFocus
                                placeholder={t('layout.breadcrumbs.searchSites', {
                                  lng: language,
                                  defaultValue: 'Search sites...',
                                })}
                                value={siteSearch}
                                onChange={(e) => setSiteSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  // Allow arrow keys to bubble for menu item focus
                                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return
                                  e.stopPropagation()
                                }}
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Divider />
                          </>
                        ) : isDetailCrumb ? (
                          <>
                            <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                              <TextField
                                size="small"
                                fullWidth
                                autoFocus
                                placeholder={(() => {
                                  const placeholders: Record<string, string> = {
                                    vehicle: t('layout.breadcrumbs.searchVehicles', {
                                      lng: language,
                                      defaultValue: 'Search vehicles by plate or ID...',
                                    }),
                                    visitor: t('layout.breadcrumbs.searchVisitors', {
                                      lng: language,
                                      defaultValue: 'Search visitors by name or ID...',
                                    }),
                                    residence: t('layout.breadcrumbs.searchResidences', {
                                      lng: language,
                                      defaultValue: 'Search residences by unit or ID...',
                                    }),
                                    user: t('layout.breadcrumbs.searchUsers', {
                                      lng: language,
                                      defaultValue: 'Search users by name or ID...',
                                    }),
                                    generic: t('layout.breadcrumbs.searchGeneric', {
                                      lng: language,
                                      defaultValue: 'Search…',
                                    }),
                                  }
                                  const key = isVehicleDetailCrumb
                                    ? 'vehicle'
                                    : isVisitorDetailCrumb
                                      ? 'visitor'
                                      : isResidenceDetailCrumb
                                        ? 'residence'
                                        : isUserDetailCrumb
                                          ? 'user'
                                          : 'generic'
                                  return placeholders[key]
                                })()}
                                value={vehicleSearch}
                                onChange={(e) => setVehicleSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return
                                  e.stopPropagation()
                                }}
                                slotProps={{
                                  input: {
                                    startAdornment: (() => {
                                      // For user detail, show role icon; otherwise keep search icon
                                      if (isUserDetailCrumb) {
                                        let effectiveRole:
                                          | 'admin'
                                          | 'guard'
                                          | 'resident'
                                          | undefined
                                        if (
                                          index >= 4 &&
                                          crumbs[index - 3]?.segment === 'users' &&
                                          crumbs[index - 1]?.segment === 'users'
                                        ) {
                                          const roleSeg = crumbs[index - 2]?.segment
                                          const mapped = roleSeg
                                            ? PATH_ROLE_SEGMENT_MAP[roleSeg]
                                            : undefined
                                          if (mapped) effectiveRole = mapped
                                        }
                                        if (!effectiveRole) {
                                          const qRole = new URLSearchParams(loc.search).get('role')
                                          if (
                                            qRole === 'admin' ||
                                            qRole === 'guard' ||
                                            qRole === 'resident'
                                          ) {
                                            effectiveRole = qRole
                                          }
                                        }
                                        const RoleIcon =
                                          effectiveRole === 'admin'
                                            ? ManageAccountsIcon
                                            : effectiveRole === 'guard'
                                              ? LocalPoliceIcon
                                              : PersonIcon
                                        return (
                                          <InputAdornment position="start">
                                            <RoleIcon fontSize="small" />
                                          </InputAdornment>
                                        )
                                      }
                                      return (
                                        <InputAdornment position="start">
                                          <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                      )
                                    })(),
                                  },
                                }}
                              />
                            </Box>
                            <Divider />
                          </>
                        ) : (
                          <MenuItem
                            component={RouterLink}
                            to={c.to}
                            onClick={() => handleCloseMenu(index)}
                            selected
                          >
                            {contents}
                          </MenuItem>
                        )}
                        {siblings
                          .filter((sibling) => {
                            if (index === 2 && isSiteCrumb && siteSearch) {
                              const siblingSite = sites.find((s) => s.slug === sibling)
                              const searchLower = siteSearch.toLowerCase()
                              return (
                                sibling.toLowerCase().includes(searchLower) ||
                                siblingSite?.name.toLowerCase().includes(searchLower)
                              )
                            }
                            if (isDetailCrumb && vehicleSearch) {
                              if (isVehicleDetailCrumb) {
                                const vehicles = (
                                  vehiclesSeed as Array<Record<string, unknown>>
                                ).map((v) => ({
                                  id: String(v.id),
                                  plate: String(v.plate),
                                }))
                                const vehicle = vehicles.find((v) => v.id === sibling)
                                const searchLower = debouncedVehicleSearch.toLowerCase()
                                return (
                                  sibling.toLowerCase().includes(searchLower) ||
                                  vehicle?.plate.toLowerCase().includes(searchLower)
                                )
                              } else if (isVisitorDetailCrumb) {
                                const visitors = (
                                  visitorsSeed as Array<Record<string, unknown>>
                                ).map((v) => ({
                                  id: String(v.id),
                                  name: String(v.name),
                                }))
                                const visitor = visitors.find((v) => v.id === sibling)
                                const searchLower = debouncedVehicleSearch.toLowerCase()
                                return (
                                  sibling.toLowerCase().includes(searchLower) ||
                                  visitor?.name.toLowerCase().includes(searchLower)
                                )
                              } else if (isResidenceDetailCrumb) {
                                const residences = [
                                  { id: 'UNIT-TA-1408', label: 'Tower A · 1408' },
                                  { id: 'UNIT-TA-PH3', label: 'Tower A · Penthouse 3' },
                                  { id: 'VIL-08', label: 'Villa 08' },
                                  { id: 'VIL-11', label: 'Villa 11' },
                                  { id: 'AMN-CLB', label: 'Clubhouse' },
                                  { id: 'PRC-12', label: 'Parcel · 12' },
                                ]
                                const residence = residences.find((r) => r.id === sibling)
                                const searchLower = debouncedVehicleSearch.toLowerCase()
                                return (
                                  sibling.toLowerCase().includes(searchLower) ||
                                  residence?.label.toLowerCase().includes(searchLower)
                                )
                              } else if (isUserDetailCrumb) {
                                const users = USERS_DATA.map((u) => ({
                                  id: String(u.id),
                                  name: String(u.name),
                                }))
                                const user = users.find((u) => u.id === sibling)
                                const searchLower = debouncedVehicleSearch.toLowerCase()
                                return (
                                  sibling.toLowerCase().includes(searchLower) ||
                                  (user?.name.toLowerCase().includes(searchLower) ?? false)
                                )
                              }
                            }
                            return true
                          })
                          .map((sibling) => {
                            // Build the correct path for siblings
                            let siblingPath: string = ''
                            let siblingLabel: string = ''
                            let siblingIcon: ElementType | undefined

                            if (index === 2 && isSiteCrumb) {
                              // For sites (index 2), sibling is a site slug
                              siblingPath = `/admin/sites/${sibling}`
                              const siblingSite = sites.find((s) => s.slug === sibling)
                              siblingLabel = siblingSite?.name || sibling
                              siblingIcon = DomainIcon
                            } else if (index >= 3 && isDetailCrumb) {
                              // For vehicle, visitor, or residence detail pages
                              if (isVehicleDetailCrumb) {
                                const vehicles = (
                                  vehiclesSeed as Array<Record<string, unknown>>
                                ).map((v) => ({
                                  id: String(v.id),
                                  plate: String(v.plate),
                                  makeModel: String(v.makeModel),
                                }))
                                const vehicle = vehicles.find((v) => v.id === sibling)
                                const base = isSitePath
                                  ? `/site/${current?.slug}/vehicles/${sibling}`
                                  : `/admin/vehicles/${sibling}`
                                siblingPath = base
                                siblingLabel = vehicle
                                  ? `${vehicle.plate} - ${vehicle.makeModel}`
                                  : sibling
                                siblingIcon = DirectionsCarIcon
                              } else if (isVisitorDetailCrumb) {
                                const visitors = (
                                  visitorsSeed as Array<Record<string, unknown>>
                                ).map((v) => ({
                                  id: String(v.id),
                                  name: String(v.name),
                                  email: String(v.email),
                                }))
                                const visitor = visitors.find((v) => v.id === sibling)
                                const base = isSitePath
                                  ? `/site/${current?.slug}/visitors/${sibling}`
                                  : `/admin/visitors/${sibling}`
                                siblingPath = base
                                siblingLabel = visitor ? visitor.name : sibling
                                siblingIcon = PersonIcon
                              } else if (isResidenceDetailCrumb) {
                                const residences = [
                                  { id: 'UNIT-TA-1408', label: 'Tower A · 1408' },
                                  { id: 'UNIT-TA-PH3', label: 'Tower A · Penthouse 3' },
                                  { id: 'VIL-08', label: 'Villa 08' },
                                  { id: 'VIL-11', label: 'Villa 11' },
                                  { id: 'AMN-CLB', label: 'Clubhouse' },
                                  { id: 'PRC-12', label: 'Parcel · 12' },
                                ]
                                const residence = residences.find((r) => r.id === sibling)
                                const base = isSitePath
                                  ? `/site/${current?.slug}/residences/${sibling}`
                                  : `/admin/residences/${sibling}`
                                siblingPath = base
                                siblingLabel = residence ? residence.label : sibling
                                siblingIcon = HomeWorkIcon
                              } else if (isUserDetailCrumb) {
                                const users = USERS_DATA.map((u) => ({
                                  id: String(u.id),
                                  name: String(u.name),
                                }))
                                const user = users.find((u) => u.id === sibling)
                                // Preserve nested users/role/users path and query params
                                const parentUsersPath = crumbs[index - 1]?.to || ''
                                siblingPath = `${parentUsersPath}/${sibling}${loc.search}`
                                siblingLabel = user?.name || sibling
                                siblingIcon = PersonIcon
                              }
                            } else if (
                              index === 2 &&
                              (c.segment === 'admins' ||
                                c.segment === 'guards' ||
                                c.segment === 'residents')
                            ) {
                              // For role pages at index 2 (e.g., /admin/users/admins)
                              siblingPath = `/admin/users/${sibling}`
                              const siblingMeta = getCrumbMeta(sibling)
                              siblingLabel = siblingMeta.label
                              siblingIcon = siblingMeta.Icon
                            } else if (index >= 3) {
                              // For site-level pages (index 3+)
                              const currentSegment = c.segment.toLowerCase()
                              const isUsersSectionSibling =
                                sibling === 'admins' ||
                                sibling === 'guards' ||
                                sibling === 'residents'

                              // Build path based on whether we're in site mode or enterprise mode
                              if (isSiteMode && current) {
                                // Site mode: use /site/:slug paths
                                if (currentSegment === 'users' && isUsersSectionSibling) {
                                  siblingPath = `/site/${current.slug}/users/${sibling}`
                                } else if (
                                  (currentSegment === 'admins' ||
                                    currentSegment === 'guards' ||
                                    currentSegment === 'residents') &&
                                  isUsersSectionSibling
                                ) {
                                  siblingPath = `/site/${current.slug}/users/${sibling}`
                                } else {
                                  siblingPath = `/site/${current.slug}/${sibling}`
                                }
                              } else {
                                // Enterprise mode: use /admin/sites/:slug paths
                                if (currentSegment === 'users' && isUsersSectionSibling) {
                                  siblingPath = `/admin/sites/${current?.slug}/users/${sibling}`
                                } else if (
                                  (currentSegment === 'admins' ||
                                    currentSegment === 'guards' ||
                                    currentSegment === 'residents') &&
                                  isUsersSectionSibling
                                ) {
                                  siblingPath = `/admin/sites/${current?.slug}/users/${sibling}`
                                } else {
                                  siblingPath = `/admin/sites/${current?.slug}/${sibling}`
                                }
                              }
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
