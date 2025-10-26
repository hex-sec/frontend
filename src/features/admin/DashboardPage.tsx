import { useMemo, type ReactNode } from 'react'
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import AlarmOnOutlinedIcon from '@mui/icons-material/AlarmOnOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import LaunchIcon from '@mui/icons-material/Launch'
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
        borderColor: 'warning.light',
        title: t('admin.dashboard.alerts.guestPasses.title', { lng: language }),
        description: t('admin.dashboard.alerts.guestPasses.description', { lng: language }),
        actionLabel: t('admin.dashboard.alerts.renew', { lng: language }),
        actionColor: 'primary' as const,
      },
      {
        key: 'cameraOffline',
        borderColor: 'error.light',
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

  const leftColumnSpan = isDesktop ? 3 : isTablet ? 6 : 12
  const mainColumnSpan = isDesktop ? 6 : isTablet ? 6 : 12
  const rightColumnSpan = isDesktop ? 3 : 12

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

      <Grid container spacing={2} columns={12} sx={{ width: '100%' }}>
        <Grid size={leftColumnSpan}>
          <Stack
            spacing={2}
            sx={{
              position: isDesktop ? 'sticky' : 'static',
              top: isDesktop ? 88 : undefined,
              zIndex: isDesktop ? 1 : undefined,
            }}
          >
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
                    {index === agendaItems.length - 1 ? null : <Divider flexItem component="div" />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={mainColumnSpan}>
          <Stack spacing={2}>
            <Paper sx={{ ...surfaceCard }}>
              <SectionHeader title={t('admin.dashboard.timeline.title', { lng: language })} />
              <List dense>
                {timelineItems.map((item, index) => (
                  <Box key={item.key}>
                    <ListItem disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={item.avatarSx}>{item.icon}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.primary} secondary={item.secondary} />
                      <Chip size="small" color={item.chipColor} label={item.chipLabel} />
                    </ListItem>
                    {index === timelineItems.length - 1 ? null : <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </List>
            </Paper>

            <Paper sx={{ ...surfaceCard }}>
              <SectionHeader
                title={t('admin.dashboard.alerts.title', { lng: language })}
                ctaLabel={t('admin.dashboard.actions.viewBoard', { lng: language })}
                ctaIcon={<ArrowForwardIcon fontSize="small" />}
              />
              <Stack spacing={1.5}>
                {alertCards.map((card) => (
                  <Stack
                    key={card.key}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: card.borderColor,
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {card.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.description}
                      </Typography>
                    </Box>
                    <Button size="small" color={card.actionColor}>
                      {card.actionLabel}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ ...surfaceCard }}>
              <SectionHeader
                title={t('admin.dashboard.sections.income', { lng: language })}
                leadingIcon={<InsightsOutlinedIcon fontSize="small" color="info" />}
              />
              <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CurrencyExchangeOutlinedIcon color="primary" />
                      <Typography variant="body2">
                        {t('admin.dashboard.income.monthlyCollections', { lng: language })}
                      </Typography>
                    </Stack>
                    <Typography variant="h5">{financialSnapshot.collectionRate}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={financialSnapshot.collectionRate}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t('admin.dashboard.income.overdueInvoices', {
                        lng: language,
                        count: financialSnapshot.overdueInvoices,
                      })}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptLongOutlinedIcon color="success" />
                      <Typography variant="body2">
                        {t('admin.dashboard.income.recentBilling', { lng: language })}
                      </Typography>
                    </Stack>
                    {billingEntries.map((entry) => (
                      <Box
                        key={entry.key}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          p: 1.5,
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="body2">{entry.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.subtitle}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2">
                      {t('admin.dashboard.income.marginVsLastMonth', { lng: language })}
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {financialSnapshot.topLineVsLastMonth}%
                    <Typography
                      component="span"
                      variant="caption"
                      color="success.main"
                      sx={{ ml: 0.5 }}
                    >
                      ↑
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.dashboard.income.growthNote', { lng: language })}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={rightColumnSpan}>
          <Stack spacing={2}>
            <Paper sx={{ ...surfaceCard }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                {t('admin.dashboard.sections.kpi', { lng: language })}
              </Typography>
              <List dense>
                {kpiData.map((kpi, index) => (
                  <Box key={kpi.label}>
                    <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: kpi.accent, color: 'common.white' }}>
                          {kpi.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="span">
                            {kpi.value}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.25}>
                            <Typography variant="caption" color="text.secondary">
                              {kpi.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kpi.sublabel}
                            </Typography>
                          </Stack>
                        }
                      />
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={kpi.delta}
                        icon={<TrendingUpIcon fontSize="small" />}
                        sx={{ '& .MuiChip-icon': { color: 'success.main' } }}
                      />
                    </ListItem>
                    {index === kpiData.length - 1 ? null : <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </List>
            </Paper>

            <Paper sx={{ ...surfaceCard }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                {t('admin.dashboard.sections.income', { lng: language })}
              </Typography>
              <Stack spacing={1.5}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">{financialSnapshot.mrr}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.dashboard.income.mrr', { lng: language })}
                  </Typography>
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ flexWrap: 'wrap' }}
                >
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
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.dashboard.income.monthlyCollections', { lng: language })}
                  </Typography>
                  <Typography variant="subtitle1">{financialSnapshot.collectionRate}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={financialSnapshot.collectionRate}
                    sx={{ height: 6, borderRadius: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.dashboard.income.overdueInvoices', {
                      lng: language,
                      count: financialSnapshot.overdueInvoices,
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

function SectionHeader({
  title,
  leadingIcon,
  ctaLabel,
  ctaIcon,
}: {
  title: string
  leadingIcon?: ReactNode
  ctaLabel?: string
  ctaIcon?: ReactNode
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {leadingIcon ? <Box sx={{ color: 'text.secondary' }}>{leadingIcon}</Box> : null}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      {ctaLabel ? (
        <Button size="small" endIcon={ctaIcon}>
          {ctaLabel}
        </Button>
      ) : null}
    </Stack>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 1.5,
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  )
}
