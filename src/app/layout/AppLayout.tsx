import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
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
  const isCompactBreadcrumb = useMediaQuery(theme.breakpoints.down('sm'))
  const parts = loc.pathname.split('/').filter(Boolean)
  const crumbs = parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))
  const previousCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 2] : undefined
  const homeLabel = t('layout.breadcrumbs.home', { lng: language })
  const previousMeta = previousCrumb ? getCrumbMeta(previousCrumb.segment) : undefined
  const mobileBackLabel = t('layout.backNavigation.backToShort', {
    lng: language,
    defaultValue: language?.toLowerCase().startsWith('es') ? 'Volver' : 'Back',
  })
  const mobileBackHref = previousCrumb ? previousCrumb.to : '/'
  const mobileBackAriaLabel = previousMeta
    ? t('layout.backNavigation.backTo', {
        lng: language,
        label: previousMeta.label,
      })
    : mobileBackLabel

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
        {isCompactBreadcrumb ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, minHeight: 32 }}>
            <IconButton
              size="small"
              component={RouterLink}
              to={mobileBackHref}
              aria-label={mobileBackAriaLabel}
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
              {mobileBackLabel}
            </Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              display: !isCompactBreadcrumb ? 'flex' : 'none',
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
