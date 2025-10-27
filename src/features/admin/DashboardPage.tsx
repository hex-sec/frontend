import { useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import AlarmOnOutlinedIcon from '@mui/icons-material/AlarmOnOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined'
import LaunchIcon from '@mui/icons-material/Launch'
import { KpiCard } from './dashboard/cards/KpiCard'
import { TimelineCard } from './dashboard/cards/TimelineCard'
import { AlertsCard } from './dashboard/cards/AlertsCard'
import { IncomeCard } from './dashboard/cards/IncomeCard'
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

  const billingEntries = useMemo(
    () => [
      {
        key: 'vistaAzul',
        title: t('admin.dashboard.income.billingEntries.first.title', { lng: language }),
        subtitle: t('admin.dashboard.income.billingEntries.first.subtitle', { lng: language }),
      },
      {
        key: 'losOlivos',
        title: t('admin.dashboard.income.billingEntries.second.title', { lng: language }),
        subtitle: t('admin.dashboard.income.billingEntries.second.subtitle', { lng: language }),
      },
    ],
    [language, t],
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
        <Paper
          sx={{
            ...surfaceCard,
            mb: 2,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'primary.contrastText',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="inherit" sx={{ opacity: 0.9 }}>
              {t('admin.dashboard.sections.enterpriseOverview', { lng: language })}
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h5" fontWeight={600} color="inherit">
                    12
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'success.light',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                  {t('admin.dashboard.enterprise.activeSites', { lng: language })}
                </Typography>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h5" fontWeight={600} color="inherit">
                    3.2K
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'info.light',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                  {t('admin.dashboard.enterprise.totalResidents', { lng: language })}
                </Typography>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h5" fontWeight={600} color="inherit">
                    {financialSnapshot.mrr}
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'warning.light',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                  {t('admin.dashboard.income.mrr', { lng: language })}
                </Typography>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h5" fontWeight={600} color="inherit">
                    {financialSnapshot.arr}
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'error.light',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                  {t('admin.dashboard.income.arrProjected', { lng: language })}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2} columns={12} sx={{ width: '100%' }}>
        {isTablet ? (
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
                <Paper sx={{ ...surfaceCard }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('admin.dashboard.sections.quickAccess', { lng: language })}
                    </Typography>
                    <Tooltip
                      title={t('admin.dashboard.quickActions.customizeTooltip', { lng: language })}
                    >
                      <IconButton size="small" color="primary">
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {quickActions.map((action) => (
                      <Paper
                        key={action.key}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2, borderColor: 'divider' }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white' }}>
                            {action.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {action.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="primary" href={action.href}>
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                {/* Navigation Links */}
                <Paper sx={{ ...surfaceCard }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.dashboard.sections.navigation', { lng: language })}
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {navShortcuts.map((item) => (
                      <Paper
                        key={item.key}
                        variant="outlined"
                        component={RouterLink}
                        to={item.to}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: (theme: Theme) =>
                            theme.transitions.create(['transform', 'box-shadow'], {
                              duration: theme.transitions.duration.shortest,
                            }),
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: (theme: Theme) => theme.shadows[3],
                            borderColor: (theme: Theme) => theme.palette.primary.light,
                            backgroundColor: (theme: Theme) => theme.palette.action.hover,
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.caption}
                          </Typography>
                        </Box>
                        <LaunchIcon color="action" fontSize="small" />
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                {/* Financial Summary */}
                <Paper sx={{ ...surfaceCard }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('admin.dashboard.sections.financialSummary', { lng: language })}
                  </Typography>
                  <Stack spacing={3}>
                    {/* MRR */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.dashboard.income.mrr', { lng: language })}
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {financialSnapshot.mrr}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* ARR & Renewals */}
                    <Stack direction="column" spacing={2}>
                      <MetricPill
                        label={t('admin.dashboard.income.arrProjected', { lng: language })}
                        value={financialSnapshot.arr}
                      />
                      <MetricPill
                        label={t('admin.dashboard.income.upcomingRenewals', { lng: language })}
                        value={`${financialSnapshot.upcomingRenewals} ${t('admin.dashboard.income.contractsSuffix', { lng: language })}`}
                      />
                    </Stack>

                    <Divider />

                    {/* Collection Rate */}
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {t('admin.dashboard.income.monthlyCollections', { lng: language })}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {financialSnapshot.collectionRate}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={financialSnapshot.collectionRate}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {t('admin.dashboard.income.overdueInvoices', {
                          lng: language,
                          count: financialSnapshot.overdueInvoices,
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
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
                <Paper sx={{ ...surfaceCard }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('admin.dashboard.sections.agenda', { lng: language })}
                    </Typography>
                    <Chip
                      size="small"
                      label={t('admin.dashboard.agenda.today', { lng: language })}
                      color="primary"
                    />
                  </Stack>
                  <List dense sx={{ mt: 1 }}>
                    {agendaItems.map((item, index) => (
                      <Box key={item.key} component="li" sx={{ listStyle: 'none' }}>
                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Avatar>{item.icon}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={item.primary} secondary={item.secondary} />
                        </ListItem>
                        {index === agendaItems.length - 1 ? null : (
                          <Divider flexItem component="div" />
                        )}
                      </Box>
                    ))}
                  </List>
                </Paper>

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

                {/* Income View */}
                <Paper sx={{ ...surfaceCard }}>
                  <IncomeCard
                    title={t('admin.dashboard.sections.income', { lng: language })}
                    collectionRate={financialSnapshot.collectionRate}
                    topLineVsLastMonth={financialSnapshot.topLineVsLastMonth}
                    growthNote={t('admin.dashboard.income.growthNote', { lng: language })}
                    marginVsLastMonth={t('admin.dashboard.income.marginVsLastMonth', {
                      lng: language,
                    })}
                    overdueInvoicesCount={financialSnapshot.overdueInvoices}
                    overdueInvoicesLabel={t('admin.dashboard.income.overdueInvoices', {
                      lng: language,
                    })}
                    billingEntries={billingEntries}
                    monthlyCollectionsLabel={t('admin.dashboard.income.monthlyCollections', {
                      lng: language,
                    })}
                    recentBillingLabel={t('admin.dashboard.income.recentBilling', {
                      lng: language,
                    })}
                  />
                </Paper>
              </Stack>
            </Grid>
          </>
        ) : (
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
                <Paper
                  sx={{
                    ...surfaceCard,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    color: 'primary.contrastText',
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="inherit" sx={{ opacity: 0.9 }}>
                      {t('admin.dashboard.sections.enterpriseOverview', { lng: language })}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="h5" fontWeight={600} color="inherit">
                          12
                        </Typography>
                        <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                          {t('admin.dashboard.enterprise.activeSites', { lng: language })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight={600} color="inherit">
                          3.2K
                        </Typography>
                        <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                          {t('admin.dashboard.enterprise.totalResidents', { lng: language })}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Quick Agenda */}
                <Paper sx={{ ...surfaceCard }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('admin.dashboard.sections.agenda', { lng: language })}
                    </Typography>
                    <Chip
                      size="small"
                      label={t('admin.dashboard.agenda.today', { lng: language })}
                      color="primary"
                    />
                  </Stack>
                  <List dense sx={{ mt: 1 }}>
                    {agendaItems.map((item, index) => (
                      <Box key={item.key} component="li" sx={{ listStyle: 'none' }}>
                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Avatar>{item.icon}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={item.primary} secondary={item.secondary} />
                        </ListItem>
                        {index === agendaItems.length - 1 ? null : (
                          <Divider flexItem component="div" />
                        )}
                      </Box>
                    ))}
                  </List>
                </Paper>

                {/* Quick Access */}
                <Paper sx={{ ...surfaceCard }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('admin.dashboard.sections.quickAccess', { lng: language })}
                    </Typography>
                    <Tooltip
                      title={t('admin.dashboard.quickActions.customizeTooltip', { lng: language })}
                    >
                      <IconButton size="small" color="primary">
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {quickActions.map((action) => (
                      <Paper
                        key={action.key}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2, borderColor: 'divider' }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white' }}>
                            {action.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {action.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="primary" href={action.href}>
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
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

                <Paper sx={{ ...surfaceCard }}>
                  <IncomeCard
                    title={t('admin.dashboard.sections.income', { lng: language })}
                    collectionRate={financialSnapshot.collectionRate}
                    topLineVsLastMonth={financialSnapshot.topLineVsLastMonth}
                    growthNote={t('admin.dashboard.income.growthNote', { lng: language })}
                    marginVsLastMonth={t('admin.dashboard.income.marginVsLastMonth', {
                      lng: language,
                    })}
                    overdueInvoicesCount={financialSnapshot.overdueInvoices}
                    overdueInvoicesLabel={t('admin.dashboard.income.overdueInvoices', {
                      lng: language,
                    })}
                    billingEntries={billingEntries}
                    monthlyCollectionsLabel={t('admin.dashboard.income.monthlyCollections', {
                      lng: language,
                    })}
                    recentBillingLabel={t('admin.dashboard.income.recentBilling', {
                      lng: language,
                    })}
                  />
                </Paper>

                {/* Financial Summary */}
                <Paper sx={{ ...surfaceCard }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('admin.dashboard.sections.financialSummary', { lng: language })}
                  </Typography>
                  <Stack spacing={3}>
                    {/* MRR */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.dashboard.income.mrr', { lng: language })}
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {financialSnapshot.mrr}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* ARR & Renewals */}
                    <Stack direction="column" spacing={2}>
                      <MetricPill
                        label={t('admin.dashboard.income.arrProjected', { lng: language })}
                        value={financialSnapshot.arr}
                      />
                      <MetricPill
                        label={t('admin.dashboard.income.upcomingRenewals', { lng: language })}
                        value={`${financialSnapshot.upcomingRenewals} ${t('admin.dashboard.income.contractsSuffix', { lng: language })}`}
                      />
                    </Stack>

                    <Divider />

                    {/* Collection Rate */}
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {t('admin.dashboard.income.monthlyCollections', { lng: language })}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {financialSnapshot.collectionRate}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={financialSnapshot.collectionRate}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {t('admin.dashboard.income.overdueInvoices', {
                          lng: language,
                          count: financialSnapshot.overdueInvoices,
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

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
                <Paper sx={{ ...surfaceCard }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.dashboard.sections.navigation', { lng: language })}
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {navShortcuts.map((item) => (
                      <Paper
                        key={item.key}
                        variant="outlined"
                        component={RouterLink}
                        to={item.to}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: (theme: Theme) =>
                            theme.transitions.create(['transform', 'box-shadow'], {
                              duration: theme.transitions.duration.shortest,
                            }),
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: (theme: Theme) => theme.shadows[3],
                            borderColor: (theme: Theme) => theme.palette.primary.light,
                            backgroundColor: (theme: Theme) => theme.palette.action.hover,
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.caption}
                          </Typography>
                        </Box>
                        <LaunchIcon color="action" fontSize="small" />
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        p: 1.5,
        minWidth: 0,
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  )
}
