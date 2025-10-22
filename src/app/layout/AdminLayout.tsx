import { useCallback, useEffect, useMemo, type ElementType } from 'react'
import { Outlet, Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, Breadcrumbs, Link, Typography, Button } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import DoorFrontIcon from '@mui/icons-material/DoorFront'
import BadgeIcon from '@mui/icons-material/Badge'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TopNav from './TopNav'
import { useAuthStore } from '@app/auth/auth.store'
import { useSiteStore } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useBackStore } from '@store/back.store'
import { formatBackLabel } from './backNavigation'

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
  visits: { labelKey: 'layout.breadcrumbs.visits', Icon: DoorFrontIcon },
  guards: { labelKey: 'layout.breadcrumbs.guards', Icon: LocalPoliceIcon },
  admins: { labelKey: 'layout.breadcrumbs.admins', Icon: ManageAccountsIcon },
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

  const crumbs: Array<{ segment: string; to: string }> =
    (isSitePath && current) || (isSiteMode && current)
      ? buildSiteCrumbs(loc.pathname, current.slug, {
          includeSitesCrumb: mode === 'enterprise',
          includeAdmin: mode === 'enterprise',
        })
      : parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))

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
    const meta = getCrumbMeta(previousCrumb.segment)
    const baseLabel = meta.label
    const label = formatBackLabel({ baseLabel, t, language })

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
  }, [back, clearBack, crumbs, current, isSiteMode, language, setBack, t, shouldUpdateBack])

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

  function formatSegment(value: string) {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

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
    return {
      label: t('layout.breadcrumbs.unknown', { value: formatSegment(segment), lng: language }),
      Icon: undefined,
    }
  }

  return (
    <Box>
      <TopNav />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 1,
          }}
        >
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            {crumbs.map((c, index) => {
              const meta = getCrumbMeta(c.segment)
              const Icon = meta.Icon
              const isLast = index === crumbs.length - 1
              const isSiteCrumb = current?.slug === c.segment
              return (
                <BreadcrumbItem
                  key={c.to}
                  to={c.to}
                  label={meta.label}
                  Icon={Icon}
                  isLast={isLast}
                  allowLinkWhenLast={isSiteCrumb}
                />
              )
            })}
          </Breadcrumbs>
          {back ? (
            <Button
              size="small"
              variant={back.variant ?? 'text'}
              color={back.color ?? 'inherit'}
              startIcon={back.icon ?? <ArrowBackIcon fontSize="small" />}
              disabled={back.disabled}
              onClick={handleBackClick}
            >
              {back.label}
            </Button>
          ) : null}
        </Box>
        <Box sx={{ mt: 2 }}>
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

function BreadcrumbItem({
  to,
  label,
  Icon,
  isLast,
  allowLinkWhenLast,
}: {
  to: string
  label: string
  Icon?: ElementType
  isLast: boolean
  allowLinkWhenLast?: boolean
}) {
  const contents = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {Icon ? <Icon fontSize="small" /> : null}
      {label}
    </Box>
  )

  if (isLast && !allowLinkWhenLast) {
    return (
      <Typography
        color="text.primary"
        typography="caption"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        {contents}
      </Typography>
    )
  }

  return (
    <Link
      component={RouterLink}
      to={to}
      sx={{
        color: 'text.secondary',
        typography: 'caption',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {contents}
    </Link>
  )
}
