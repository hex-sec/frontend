import { useMemo } from 'react'
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

  const financialSnapshot = {
    mrr: '$18,450',
    arr: '$219K',
    overdueInvoices: 3,
    collectionRate: 97,
    topLineVsLastMonth: 6.4,
    upcomingRenewals: 8,
  }

  const kpiData = useMemo(
    () => [
      {
        label: t('admin.dashboard.kpis.activeResidents.label', { lng: language }),
        value: '1,284',
        delta: '+3.2%',
        sublabel: t('admin.dashboard.kpis.activeResidents.sublabel', { lng: language }),
        icon: <PeopleOutlineIcon fontSize="small" />,
        accent: 'primary.main',
      },
      {
        label: t('admin.dashboard.kpis.scheduledVisits.label', { lng: language }),
        value: '86',
        delta: '+12',
        sublabel: t('admin.dashboard.kpis.scheduledVisits.sublabel', { lng: language }),
        icon: <DirectionsCarFilledOutlinedIcon fontSize="small" />,
        accent: 'info.main',
      },
      {
        label: t('admin.dashboard.kpis.openIncidents.label', { lng: language }),
        value: '5',
        delta: '-2',
        sublabel: t('admin.dashboard.kpis.openIncidents.sublabel', { lng: language }),
        icon: <AlarmOnOutlinedIcon fontSize="small" />,
        accent: 'warning.main',
      },
    ],
    [language, t],
  )

  const timelineItems = useMemo(
    () => [
      {
        key: 'authorizedEntry',
        avatarSx: { bgcolor: 'primary.main', color: 'common.white' } as SxProps<Theme>,
        icon: <DirectionsCarFilledOutlinedIcon fontSize="small" />,
        primary: t('admin.dashboard.timeline.authorizedEntry.primary', { lng: language }),
        secondary: t('admin.dashboard.timeline.authorizedEntry.secondary', { lng: language }),
        chipLabel: t('admin.dashboard.timeline.authorizedEntry.chip', { lng: language }),
        chipColor: 'default' as const,
      },
      {
        key: 'incidentResolved',
        avatarSx: { bgcolor: 'warning.main', color: 'common.black' } as SxProps<Theme>,
        icon: <AlarmOnOutlinedIcon fontSize="small" />,
        primary: t('admin.dashboard.timeline.incidentResolved.primary', { lng: language }),
        secondary: t('admin.dashboard.timeline.incidentResolved.secondary', { lng: language }),
        chipLabel: t('admin.dashboard.timeline.incidentResolved.chip', { lng: language }),
        chipColor: 'success' as const,
      },
      {
        key: 'residentRegistered',
        avatarSx: { bgcolor: 'info.main', color: 'common.white' } as SxProps<Theme>,
        icon: <PeopleOutlineIcon fontSize="small" />,
        primary: t('admin.dashboard.timeline.residentRegistered.primary', { lng: language }),
        secondary: t('admin.dashboard.timeline.residentRegistered.secondary', { lng: language }),
        chipLabel: t('admin.dashboard.timeline.residentRegistered.chip', { lng: language }),
        chipColor: 'default' as const,
      },
    ],
    [language, t],
  )

  const alertCards = useMemo(
    () => [
      {
        key: 'guestPasses',
        borderColor: 'warning.light' as const,
        title: t('admin.dashboard.alerts.guestPasses.title', { lng: language }),
        description: t('admin.dashboard.alerts.guestPasses.description', { lng: language }),
        actionLabel: t('admin.dashboard.alerts.renew', { lng: language }),
        actionColor: 'primary' as const,
      },
      {
        key: 'cameraOffline',
        borderColor: 'error.light' as const,
        title: t('admin.dashboard.alerts.cameraOffline.title', { lng: language }),
        description: t('admin.dashboard.alerts.cameraOffline.description', { lng: language }),
        actionLabel: t('admin.dashboard.alerts.assignGuard', { lng: language }),
        actionColor: 'primary' as const,
      },
    ],
    [language, t],
  )

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
      {
        key: 'policies',
        label: t('layout.breadcrumbs.policies', { lng: language }),
        caption: t('admin.dashboard.navigation.policies.caption', { lng: language }),
        to: buildEntityUrl('policies'),
      },
    ],
    [language, t, siteBase],
  )

  const agendaItems = useMemo(
    () => [
      {
        key: 'securityCommittee',
        icon: <PeopleOutlineIcon fontSize="small" />,
        primary: t('admin.dashboard.agenda.items.securityCommittee.primary', { lng: language }),
        secondary: t('admin.dashboard.agenda.items.securityCommittee.secondary', { lng: language }),
      },
      {
        key: 'billingReview',
        icon: <CurrencyExchangeOutlinedIcon fontSize="small" />,
        primary: t('admin.dashboard.agenda.items.billingReview.primary', { lng: language }),
        secondary: t('admin.dashboard.agenda.items.billingReview.secondary', { lng: language }),
      },
      {
        key: 'guardOnboarding',
        icon: <AlarmOnOutlinedIcon fontSize="small" />,
        primary: t('admin.dashboard.agenda.items.guardOnboarding.primary', { lng: language }),
        secondary: t('admin.dashboard.agenda.items.guardOnboarding.secondary', { lng: language }),
      },
    ],
    [language, t],
  )

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
          <Button variant="contained" endIcon={<LaunchIcon />} sx={{ borderRadius: 999 }}>
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
            mrr={financialSnapshot.mrr}
            arr={financialSnapshot.arr}
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
                  mrr={financialSnapshot.mrr}
                  arr={financialSnapshot.arr}
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
