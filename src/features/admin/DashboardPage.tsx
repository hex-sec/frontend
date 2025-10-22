import { useMemo } from 'react'
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  Button,
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
import type { SxProps, Theme } from '@mui/material/styles'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteStore } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'

const surfaceCard: SxProps<Theme> = {
  p: 3,
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
    [language, t, mode, current, siteBase],
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
    [language, t, mode, current, siteBase],
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
    [language, t],
  )

  const navShortcuts = useMemo(
    () => [
      {
        key: 'sites',
        label: t('layout.breadcrumbs.sites', { lng: language }),
        caption: t('admin.dashboard.navigation.sites.caption', { count: 3, lng: language }),
        href: `${siteBase}/sites`,
      },
      {
        key: 'users',
        label: t('layout.breadcrumbs.users', { lng: language }),
        caption: t('admin.dashboard.navigation.users.caption', { count: 42, lng: language }),
        href: `${siteBase}/users`,
      },
      {
        key: 'reports',
        label: t('layout.breadcrumbs.reports', { lng: language }),
        caption: t('admin.dashboard.navigation.reports.caption', { lng: language }),
        href: `${siteBase}/reports`,
      },
      {
        key: 'policies',
        label: t('layout.breadcrumbs.policies', { lng: language }),
        caption: t('admin.dashboard.navigation.policies.caption', { lng: language }),
        href: buildEntityUrl('policies'),
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

  return (
    <Grid container spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
      <Grid item xs={12} md={8} lg={9}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
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

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, lg: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(0, 1fr) minmax(0, 1.6fr)',
                lg: 'minmax(0, 1fr) minmax(0, 2fr)',
              },
              alignItems: 'stretch',
            }}
          >
            <Paper sx={{ ...surfaceCard, height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('admin.dashboard.sections.kpi', { lng: language })}
                </Typography>
                <Stack spacing={1.5}>
                  {kpiData.map((kpi) => (
                    <Box
                      key={kpi.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="overline" color="text.secondary">
                          {kpi.label}
                        </Typography>
                        <Typography variant="h5">{kpi.value}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kpi.sublabel}
                        </Typography>
                      </Stack>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          size="small"
                          color="success"
                          variant="outlined"
                          label={kpi.delta}
                          icon={<TrendingUpIcon fontSize="small" />}
                          sx={{ '& .MuiChip-icon': { color: 'success.main' } }}
                        />
                        <Avatar
                          variant="rounded"
                          sx={{ bgcolor: `${kpi.accent}`, color: 'common.white' }}
                        >
                          {kpi.icon}
                        </Avatar>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Paper sx={{ ...surfaceCard, height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('admin.dashboard.sections.operationalStatus', { lng: language })}
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1">
                      {t('admin.dashboard.timeline.title', { lng: language })}
                    </Typography>
                    <List dense sx={{ mt: 1 }}>
                      {timelineItems.map((item, index) => {
                        const isLast = index === timelineItems.length - 1
                        return (
                          <Box key={item.key}>
                            <ListItem disableGutters>
                              <ListItemAvatar>
                                <Avatar sx={item.avatarSx}>{item.icon}</Avatar>
                              </ListItemAvatar>
                              <ListItemText primary={item.primary} secondary={item.secondary} />
                              <Chip size="small" color={item.chipColor} label={item.chipLabel} />
                            </ListItem>
                            {isLast ? null : <Divider flexItem variant="middle" sx={{ my: 1 }} />}
                          </Box>
                        )
                      })}
                    </List>
                  </Box>

                  <Divider />

                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {t('admin.dashboard.alerts.title', { lng: language })}
                      </Typography>
                      <Button size="small" endIcon={<ArrowForwardIcon />}>
                        {t('admin.dashboard.actions.viewBoard', { lng: language })}
                      </Button>
                    </Stack>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {alertCards.map((card) => (
                        <Box
                          key={card.key}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: card.borderColor,
                            p: 1.5,
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{card.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {card.description}
                            </Typography>
                          </Stack>
                          <Button size="small" color={card.actionColor}>
                            {card.actionLabel}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          <Paper sx={{ ...surfaceCard }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.dashboard.sections.income', { lng: language })}
                  </Typography>
                  <Typography variant="h6">
                    {financialSnapshot.mrr}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {t('admin.dashboard.income.mrr', { lng: language })}
                    </Typography>
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('admin.dashboard.income.arrProjected', { lng: language })}
                    </Typography>
                    <Typography variant="subtitle1">{financialSnapshot.arr}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('admin.dashboard.income.upcomingRenewals', { lng: language })}
                    </Typography>
                    <Typography variant="subtitle1">
                      {financialSnapshot.upcomingRenewals}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {t('admin.dashboard.income.contractsSuffix', { lng: language })}
                      </Typography>
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InsightsOutlinedIcon color="info" />
                      <Typography variant="body2">
                        {t('admin.dashboard.income.marginVsLastMonth', { lng: language })}
                      </Typography>
                    </Stack>
                    <Typography variant="h4">
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
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      </Grid>

      <Grid item xs={12} md={4} lg={3}>
        <Stack spacing={2}>
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
            <Typography variant="subtitle2" color="text.secondary">
              {t('admin.dashboard.sections.navigation', { lng: language })}
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {navShortcuts.map((item) => (
                <Paper
                  key={item.key}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                  <IconButton size="small" color="primary" href={item.href}>
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
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
    </Grid>
  )
}
