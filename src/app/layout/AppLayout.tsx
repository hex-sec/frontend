import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import { useTheme } from '@mui/material/styles'
import TopBar from './TopBar'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { scrollWindowToTop } from './scrollToTop'

const CRUMB_META: Record<string, { labelKey: string; Icon?: typeof DashboardIcon }> = {
  admin: { labelKey: 'layout.breadcrumbs.adminDashboard', Icon: DashboardIcon },
  sites: { labelKey: 'layout.breadcrumbs.sites', Icon: DomainIcon },
  users: { labelKey: 'layout.breadcrumbs.users', Icon: PeopleIcon },
  residents: { labelKey: 'layout.breadcrumbs.residents', Icon: PersonIcon },
  vehicles: { labelKey: 'layout.breadcrumbs.vehicles', Icon: DirectionsCarIcon },
  policies: { labelKey: 'layout.breadcrumbs.policies', Icon: GavelIcon },
  reports: { labelKey: 'layout.breadcrumbs.reports', Icon: BarChartIcon },
}

export default function AppLayout() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const loc = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true })
  const parts = loc.pathname.split('/').filter(Boolean)
  const crumbs = parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))
  const previousCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 2] : undefined
  const homeLabel = t('layout.breadcrumbs.home', { lng: language })
  const previousMeta = previousCrumb ? getCrumbMeta(previousCrumb.segment) : undefined
  const backHref = previousCrumb ? previousCrumb.to : '/'
  const backTargetLabel = previousMeta?.label ?? homeLabel
  const backLabel = useMemo(() => {
    console.log('isMobile:', isMobile, 'language:', language, 'backTargetLabel:', backTargetLabel)
    return buildBackLabel({
      isMobile,
      language,
      targetLabel: backTargetLabel,
      translate: t,
    })
  }, [isMobile, language, backTargetLabel, t])

  useEffect(() => {
    console.log('[AppLayout] Back label computed', {
      isMobile,
      language,
      backTargetLabel,
      backLabel,
    })
  }, [isMobile, language, backTargetLabel, backLabel])

  useEffect(() => {
    console.log('[AppLayout] Mounted')
  }, [])

  useEffect(() => {
    console.log('[AppLayout] isMobile changed', isMobile)
  }, [isMobile])

  useEffect(() => {
    console.log('[AppLayout] language changed', language)
  }, [language])

  useEffect(() => {
    console.log('[AppLayout] backTargetLabel changed', backTargetLabel)
  }, [backTargetLabel])

  useEffect(() => {
    scrollWindowToTop()
  }, [loc.pathname, loc.search])

  function getCrumbMeta(segment: string) {
    const s = segment.toLowerCase()
    if (CRUMB_META[s]) {
      const meta = CRUMB_META[s]
      return { label: t(meta.labelKey, { lng: language }), Icon: meta.Icon }
    }
    const formatted = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      label: t('layout.breadcrumbs.unknown', { value: formatted, lng: language }),
      Icon: undefined,
    }
  }

  return (
    <Box>
      <TopBar />
      <Toolbar sx={{ minHeight: 64 }} />
      <Box sx={{ p: 2 }}>
        {isMobile ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, minHeight: 32 }}>
            <IconButton
              size="small"
              component={RouterLink}
              to={backHref}
              aria-label={backLabel}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <ArrowBackIosNewRoundedIcon fontSize="inherit" />
            </IconButton>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              noWrap
              sx={{ textTransform: 'capitalize' }}
            >
              {backLabel}
            </Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 2,
              mb: 1,
            }}
          >
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  color: 'text.secondary',
                  typography: 'caption',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <HomeIcon fontSize="small" />
                <Box component="span">{homeLabel}</Box>
              </Link>
              {crumbs.map((c) => {
                const meta = getCrumbMeta(c.segment)
                const Icon = meta.Icon
                return (
                  <Link
                    key={c.to}
                    component={RouterLink}
                    to={c.to}
                    sx={{
                      color: 'text.secondary',
                      typography: 'caption',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {Icon ? <Icon fontSize="small" /> : null}
                    {meta.label}
                  </Link>
                )
              })}
            </Breadcrumbs>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

type BackLabelConfig = {
  isMobile: boolean
  language?: string
  targetLabel: string
  translate: ReturnType<typeof useTranslate>['t']
}

function buildBackLabel({ isMobile, language, targetLabel, translate }: BackLabelConfig) {
  const isSpanish = language?.toLowerCase().startsWith('es')
  const defaultShort = isSpanish ? 'Volver' : 'Back'
  const defaultLong = isSpanish ? `Volver a ${targetLabel}` : `Back to ${targetLabel}`
  const key = isMobile ? 'layout.backNavigation.backToShort' : 'layout.backNavigation.backTo'
  const defaultValue = isMobile ? defaultShort : defaultLong
  return translate(key, {
    lng: language,
    label: targetLabel,
    defaultValue,
  })
}
