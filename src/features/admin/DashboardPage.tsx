import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Paper, Stack, Typography, useMediaQuery } from '@mui/material'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import AlarmOnOutlinedIcon from '@mui/icons-material/AlarmOnOutlined'
import AddIcon from '@mui/icons-material/Add'
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined'
import LaunchIcon from '@mui/icons-material/Launch'
import { KpiCard } from './dashboard/cards/KpiCard'
import { TimelineCard } from './dashboard/cards/TimelineCard'
import { AlertsCard } from './dashboard/cards/AlertsCard'
import { EnterpriseSummaryCard } from './dashboard/cards/EnterpriseSummaryCard'
import { QuickAccessCard } from './dashboard/cards/QuickAccessCard'
import { NavigationCard } from './dashboard/cards/NavigationCard'
import { QuickAgendaCard } from './dashboard/cards/QuickAgendaCard'
import Grid from '@mui/material/Grid2'
import { useTheme, type SxProps, type Theme } from '@mui/material/styles'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteStore } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { fetchDashboardData, type DashboardData } from '@services/dashboard.service'

const surfaceCard: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export default function DashboardPage() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const { mode, current } = useSiteStore()
  const siteBase = mode === 'site' && current ? siteRoot(current.slug) : buildEntityUrl('')

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchDashboardData({ mode, currentSlug: current?.slug ?? null, language })
      .then((res) => {
        if (mounted) setData(res)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [mode, current?.slug, language])

  const kpiData = useMemo(() => {
    if (!data) return []
    return data.kpis.map((k) => ({
      ...k,
      icon: k.label.toLowerCase().includes('resident') ? (
        <PeopleOutlineIcon fontSize="small" />
      ) : k.label.toLowerCase().includes('visit') ? (
        <DirectionsCarFilledOutlinedIcon fontSize="small" />
      ) : (
        <AlarmOnOutlinedIcon fontSize="small" />
      ),
      // Localize labels if desired (keeping service strings as defaults)
      label: k.label,
      sublabel: k.sublabel,
    }))
  }, [data])

  const timelineItems = useMemo(() => {
    if (!data) return []
    const mapIcon = (k: string) =>
      k === 'car' ? (
        <DirectionsCarFilledOutlinedIcon fontSize="small" />
      ) : k === 'alarm' ? (
        <AlarmOnOutlinedIcon fontSize="small" />
      ) : (
        <PeopleOutlineIcon fontSize="small" />
      )
    return data.timeline.map((it) => ({
      ...it,
      icon: mapIcon(it.iconKey),
    }))
  }, [data])

  const alertCards = useMemo(() => data?.alerts ?? [], [data])

  const quickActions = useMemo(
    () => [
      {
        key: 'createVisit',
        label: t('admin.dashboard.quickActions.createVisit.label', { lng: language }),
        description: t('admin.dashboard.quickActions.createVisit.description', { lng: language }),
        icon: <AddIcon />,
        href: buildEntityUrl('visits', undefined, {
          mode: mode,
          currentSlug: current?.slug ?? null,
        }),
      },
      {
        key: 'logIncident',
        label: t('admin.dashboard.quickActions.logIncident.label', { lng: language }),
        description: t('admin.dashboard.quickActions.logIncident.description', { lng: language }),
        icon: <AlarmOnOutlinedIcon />,
        href: buildEntityUrl('incidents', undefined, {
          mode: mode,
          currentSlug: current?.slug ?? null,
        }),
      },
      {
        key: 'inviteResident',
        label: t('admin.dashboard.quickActions.inviteResident.label', { lng: language }),
        description: t('admin.dashboard.quickActions.inviteResident.description', {
          lng: language,
        }),
        icon: <PeopleOutlineIcon />,
        href: buildEntityUrl('users', undefined, {
          mode: mode,
          currentSlug: current?.slug ?? null,
        }),
      },
    ],
    [language, t, mode, current],
  )

  const navShortcuts = useMemo(
    () => [
      {
        key: 'sites',
        label: t('layout.breadcrumbs.sites', { lng: language }),
        caption: t('admin.dashboard.navigation.sites.caption', { count: 3, lng: language }),
        to: `${siteBase}/sites`,
      },
      {
        key: 'users',
        label: t('layout.breadcrumbs.users', { lng: language }),
        caption: t('admin.dashboard.navigation.users.caption', { count: 42, lng: language }),
        to: `${siteBase}/users`,
      },
      {
        key: 'admins',
        label: t('admin.dashboard.navigation.admins.label', { lng: language }),
        caption: t('admin.dashboard.navigation.admins.caption', { count: 5, lng: language }),
        to: buildEntityUrl('users/admins'),
      },
      {
        key: 'guards',
        label: t('admin.dashboard.navigation.guards.label', { lng: language }),
        caption: t('admin.dashboard.navigation.guards.caption', { count: 12, lng: language }),
        to: buildEntityUrl('users/guards'),
      },
      {
        key: 'residents',
        label: t('admin.dashboard.navigation.residents.label', { lng: language }),
        caption: t('admin.dashboard.navigation.residents.caption', { count: 28, lng: language }),
        to: buildEntityUrl('users/residents'),
      },
      {
        key: 'residences',
        label: t('layout.breadcrumbs.residences', { lng: language }),
        caption: t('admin.dashboard.navigation.residences.caption', { count: 150, lng: language }),
        to: buildEntityUrl('residences'),
      },
      {
        key: 'visits',
        label: t('layout.breadcrumbs.visits', { lng: language }),
        caption: t('admin.dashboard.navigation.visits.caption', { lng: language }),
        to: buildEntityUrl('visits'),
      },
      {
        key: 'vehicles',
        label: t('layout.breadcrumbs.vehicles', { lng: language }),
        caption: t('admin.dashboard.navigation.vehicles.caption', { lng: language }),
        to: buildEntityUrl('vehicles'),
      },
      {
        key: 'visitors',
        label: t('layout.breadcrumbs.visitors', { lng: language }),
        caption: t('admin.dashboard.navigation.visitors.caption', { lng: language }),
        to: buildEntityUrl('visitors'),
      },
      {
        key: 'reports',
        label: t('layout.breadcrumbs.reports', { lng: language }),
        caption: t('admin.dashboard.navigation.reports.caption', { lng: language }),
        to: `${siteBase}/reports`,
      },
    ],
    [language, t, siteBase],
  )

  const agendaItems = useMemo(() => {
    if (!data) return []
    const iconFor = (k: string) =>
      k === 'people' ? (
        <PeopleOutlineIcon fontSize="small" />
      ) : k === 'currency' ? (
        <CurrencyExchangeOutlinedIcon fontSize="small" />
      ) : (
        <AlarmOnOutlinedIcon fontSize="small" />
      )
    return data.agenda.map((a) => ({ ...a, icon: iconFor(a.iconKey) }))
  }, [data])

  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up(1024))
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1024))

  const leftColumnSpan = isDesktop ? 3 : 12
  const mainColumnSpan = isDesktop ? 6 : isTablet ? 6 : 12
  const rightColumnSpan = isDesktop ? 3 : isTablet ? 6 : 12

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: { xs: 6, md: 8 } }}>
      <Paper sx={{ ...surfaceCard, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {t('admin.dashboard.title', { lng: language })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('admin.dashboard.subtitle', { lng: language })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<LaunchIcon />}
            sx={{ borderRadius: 999 }}
            disabled={loading}
          >
            {t('admin.dashboard.actions.viewLiveMonitoring', { lng: language })}
          </Button>
        </Stack>
      </Paper>

      {/* Enterprise Summary - Full width on tablet */}
      {isTablet && (
        <Box sx={{ mb: 2 }}>
          <EnterpriseSummaryCard
            activeSites={12}
            totalResidents="3.2K"
            mrr={data?.financialSnapshot.mrr ?? ''}
            arr={data?.financialSnapshot.arr ?? ''}
            isDesktop={false}
          />
        </Box>
      )}

      {isTablet ? (
        <Grid container spacing={2} columns={12} sx={{ width: '100%' }}>
          <>
            {/* Left Column - Quick Access, Navigation, Financial Summary */}
            <Grid size={6}>
              <Stack
                spacing={2}
                sx={{
                  position: isDesktop ? 'sticky' : 'static',
                  top: isDesktop ? 88 : undefined,
                  zIndex: isDesktop ? 1 : undefined,
                }}
              >
                {/* Quick Access */}
                <QuickAccessCard
                  title={t('admin.dashboard.sections.quickAccess', { lng: language })}
                  customizeTooltip={t('admin.dashboard.quickActions.customizeTooltip', {
                    lng: language,
                  })}
                  quickActions={quickActions}
                />

                {/* Navigation Links */}
                <NavigationCard
                  title={t('admin.dashboard.sections.navigation', { lng: language })}
                  navShortcuts={navShortcuts}
                />
              </Stack>
            </Grid>

            {/* Right Column - Priority Alerts, Quick Agenda, Recent Activity, Key Metrics, Income View */}
            <Grid size={6}>
              <Stack spacing={2}>
                {/* Priority Alerts */}
                <Paper sx={{ ...surfaceCard }}>
                  <AlertsCard
                    alertCards={alertCards}
                    title={t('admin.dashboard.alerts.title', { lng: language })}
                    ctaLabel={t('admin.dashboard.actions.viewBoard', { lng: language })}
                  />
                </Paper>

                {/* Quick Agenda */}
                <QuickAgendaCard
                  title={t('admin.dashboard.sections.agenda', { lng: language })}
                  todayLabel={t('admin.dashboard.agenda.today', { lng: language })}
                  agendaItems={agendaItems}
                />

                {/* Recent Activity (Timeline) */}
                <Paper sx={{ ...surfaceCard }}>
                  <TimelineCard
                    timelineItems={timelineItems}
                    title={t('admin.dashboard.timeline.title', { lng: language })}
                  />
                </Paper>

                {/* Key Metrics */}
                <Paper sx={{ ...surfaceCard }}>
                  <KpiCard
                    kpiData={kpiData}
                    title={t('admin.dashboard.sections.kpi', { lng: language })}
                  />
                </Paper>
              </Stack>
            </Grid>
          </>
        </Grid>
      ) : null}

      {/* Desktop Layout Grid */}
      {!isTablet && (
        <Grid container spacing={2} columns={12} sx={{ width: '100%' }}>
          <>
            {/* Desktop layout */}
            <Grid size={leftColumnSpan}>
              <Stack
                spacing={2}
                sx={{
                  position: isDesktop ? 'sticky' : 'static',
                  top: isDesktop ? 88 : undefined,
                  zIndex: isDesktop ? 1 : undefined,
                }}
              >
                {/* Enterprise Overview */}
                <EnterpriseSummaryCard
                  activeSites={12}
                  totalResidents="3.2K"
                  mrr={data?.financialSnapshot.mrr ?? ''}
                  arr={data?.financialSnapshot.arr ?? ''}
                  isDesktop={isDesktop}
                />

                {/* Quick Agenda */}
                <QuickAgendaCard
                  title={t('admin.dashboard.sections.agenda', { lng: language })}
                  todayLabel={t('admin.dashboard.agenda.today', { lng: language })}
                  agendaItems={agendaItems}
                />

                {/* Quick Access */}
                <QuickAccessCard
                  title={t('admin.dashboard.sections.quickAccess', { lng: language })}
                  customizeTooltip={t('admin.dashboard.quickActions.customizeTooltip', {
                    lng: language,
                  })}
                  quickActions={quickActions}
                />
              </Stack>
            </Grid>

            <Grid size={mainColumnSpan}>
              <Stack spacing={2}>
                {/* Priority Alerts */}
                <Paper sx={{ ...surfaceCard }}>
                  <AlertsCard
                    alertCards={alertCards}
                    title={t('admin.dashboard.alerts.title', { lng: language })}
                    ctaLabel={t('admin.dashboard.actions.viewBoard', { lng: language })}
                  />
                </Paper>

                <Paper sx={{ ...surfaceCard }}>
                  <TimelineCard
                    timelineItems={timelineItems}
                    title={t('admin.dashboard.timeline.title', { lng: language })}
                  />
                </Paper>

                {/* Key Metrics */}
                <Paper sx={{ ...surfaceCard }}>
                  <KpiCard
                    kpiData={kpiData}
                    title={t('admin.dashboard.sections.kpi', { lng: language })}
                  />
                </Paper>
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid size={rightColumnSpan}>
              <Stack
                spacing={2}
                sx={{
                  position: isDesktop ? 'sticky' : 'static',
                  top: isDesktop ? 88 : undefined,
                  zIndex: isDesktop ? 1 : undefined,
                }}
              >
                {/* Navigation Links */}
                <NavigationCard
                  title={t('admin.dashboard.sections.navigation', { lng: language })}
                  navShortcuts={navShortcuts}
                />
              </Stack>
            </Grid>
          </>
        </Grid>
      )}
    </Box>
  )
}
