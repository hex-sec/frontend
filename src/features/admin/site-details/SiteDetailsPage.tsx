import { useEffect, useMemo, type ReactNode, type ElementType } from 'react'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  SpeedDial,
  SpeedDialAction,
  LinearProgress,
} from '@mui/material'
import type { ChipProps } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import EmailIcon from '@mui/icons-material/Email'
import GroupsIcon from '@mui/icons-material/Groups'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DoorFrontIcon from '@mui/icons-material/DoorFront'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import BadgeIcon from '@mui/icons-material/Badge'
import BusinessIcon from '@mui/icons-material/Business'
import LaunchIcon from '@mui/icons-material/Launch'
import BarChartIcon from '@mui/icons-material/BarChart'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { alpha, type Theme } from '@mui/material/styles'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
import buildEntityUrl from '@app/utils/contextPaths'
import { useSiteBySlugQuery } from '../sites.api'
import { useSiteStore } from '@store/site.store'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

const HERO_METRICS = [
  { key: 'activeResidents', Icon: GroupsIcon },
  { key: 'scheduledVisits', Icon: DoorFrontIcon },
  { key: 'openIncidents', Icon: ReportProblemIcon },
  { key: 'guardCoverage', Icon: LocalPoliceIcon },
]

const RESIDENT_METRICS = [
  { key: 'portalAdoption', value: 82, color: 'primary' as const },
  { key: 'amenityBookings', value: 64, color: 'secondary' as const },
  { key: 'broadcastReach', value: 91, color: 'success' as const },
]

type ScopedPath = string | ((slug: string) => string)

type QuickLinkConfig = {
  key: string
  Icon: ElementType
  sitePath?: ScopedPath
  enterprisePath?: ScopedPath
}

const QUICK_LINKS: QuickLinkConfig[] = [
  {
    key: 'createVisitorPass',
    Icon: DoorFrontIcon,
    sitePath: 'visits',
    enterprisePath: (slug) => `/admin/sites/${slug}/visits`,
  },
  {
    key: 'registerVehicle',
    Icon: DirectionsCarFilledIcon,
    sitePath: 'vehicles',
    enterprisePath: (slug) => `/admin/sites/${slug}/vehicles`,
  },
  {
    key: 'addRecurringVisitor',
    Icon: BadgeIcon,
    sitePath: 'visitors',
    enterprisePath: (slug) => `/admin/sites/${slug}/visitors`,
  },
  {
    key: 'inviteResident',
    Icon: PersonAddIcon,
    sitePath: 'users/residents',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/residents`,
  },
  {
    key: 'logIncident',
    Icon: ReportProblemIcon,
    sitePath: 'reports',
    enterprisePath: '/admin/reports',
  },
  {
    key: 'automations',
    Icon: TrendingUpIcon,
    sitePath: 'reports',
    enterprisePath: '/admin/reports',
  },
]

type PanelShortcutConfig = {
  key: string
  Icon: ElementType
  sitePath?: ScopedPath
  enterprisePath?: ScopedPath
}

const PANEL_SHORTCUTS: PanelShortcutConfig[] = [
  {
    key: 'users',
    sitePath: 'users',
    enterprisePath: (slug) => `/admin/sites/${slug}/users`,
    Icon: GroupsIcon,
  },
  {
    key: 'residents',
    sitePath: 'users/residents',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/residents`,
    Icon: GroupsIcon,
  },
  {
    key: 'guards',
    sitePath: 'users/guards',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/guards`,
    Icon: LocalPoliceIcon,
  },
  {
    key: 'admins',
    sitePath: 'users/admins',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/admins`,
    Icon: ManageAccountsIcon,
  },
  {
    key: 'visits',
    sitePath: 'visits',
    enterprisePath: (slug) => `/admin/sites/${slug}/visits`,
    Icon: DoorFrontIcon,
  },
  {
    key: 'vehicles',
    sitePath: 'vehicles',
    enterprisePath: (slug) => `/admin/sites/${slug}/vehicles`,
    Icon: DirectionsCarFilledIcon,
  },
  {
    key: 'visitors',
    sitePath: 'visitors',
    enterprisePath: (slug) => `/admin/sites/${slug}/visitors`,
    Icon: BadgeIcon,
  },
  {
    key: 'residences',
    sitePath: 'residences',
    enterprisePath: (slug) => `/admin/sites/${slug}/residences`,
    Icon: HomeWorkIcon,
  },
  {
    key: 'reports',
    sitePath: 'reports',
    enterprisePath: (slug) => `/admin/sites/${slug}/reports`,
    Icon: BarChartIcon,
  },
]

function resolveScopedTarget({
  slug,
  isSiteMode,
  sitePath,
  enterprisePath,
}: {
  slug: string
  isSiteMode: boolean
  sitePath?: ScopedPath
  enterprisePath?: ScopedPath
}) {
  if (isSiteMode) {
    if (sitePath) {
      return toSitePath(slug, sitePath)
    }
    if (enterprisePath) {
      return toEnterprisePath(slug, enterprisePath)
    }
    return `/site/${slug}`
  }

  if (enterprisePath) {
    return toEnterprisePath(slug, enterprisePath)
  }

  if (sitePath) {
    return toSitePath(slug, sitePath)
  }

  return '/admin/sites'
}

function toSitePath(slug: string, path: ScopedPath) {
  const raw = typeof path === 'function' ? path(slug) : path
  if (!raw) {
    return `/site/${slug}`
  }

  if (raw.startsWith('/')) {
    return raw
  }

  const trimmed = raw.replace(/^\/+/, '')
  return trimmed ? `/site/${slug}/${trimmed}` : `/site/${slug}`
}

function toEnterprisePath(slug: string, path: ScopedPath) {
  const raw = typeof path === 'function' ? path(slug) : path
  if (!raw) {
    return '/admin/sites'
  }

  return raw.startsWith('/') ? raw : `/${raw}`
}

const FINANCIALS = [
  { key: 'monthlyRecurring', accent: 'success.main' },
  { key: 'outstandingInvoices', accent: 'success.main' },
  { key: 'averageDues', accent: 'warning.main' },
]

const TIMELINE = [
  { time: '08:45', key: 'delivery' },
  { time: '09:10', key: 'residentCheckIn' },
  { time: '10:24', key: 'incidentEscalated' },
  { time: '11:40', key: 'visitorPassCreated' },
]

const INCIDENT_CARDS = [{ key: 'pastSevenDays' }, { key: 'critical', severity: true }]

const INCIDENT_BREAKDOWN_KEYS = ['gateAccess', 'noiseDisturbance', 'maintenance', 'other']

const GUARDS = [
  { name: 'Carlos Díaz', shift: '06:00 – 14:00', statusKey: 'onDuty' },
  { name: 'Ana López', shift: '14:00 – 22:00', statusKey: 'onDuty' },
  { name: 'José Medina', shift: '22:00 – 06:00', statusKey: 'scheduled' },
]

const SITE_CONTEXT_ITEMS = [
  { key: 'address', Icon: BusinessIcon },
  { key: 'accessHours', Icon: AccessTimeIcon },
  { key: 'primaryContact', Icon: EmailIcon },
]

export default function SiteDetailsPage() {
  const { slug } = useParams()
  const { data: site, isLoading } = useSiteBySlugQuery(slug)
  const { hydrate, setCurrent, mode, setMode } = useSiteStore()
  const navigate = useNavigate()
  const isSiteMode = mode === 'site'
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const translate = useMemo(
    () => (key: string, options?: Record<string, unknown>) => t(key, { lng: language, ...options }),
    [language, t],
  )

  const heroMetrics = useMemo(
    () =>
      HERO_METRICS.map(({ key, Icon }) => ({
        key,
        Icon,
        label: translate(`siteDetails.hero.metrics.${key}.label`),
        value: translate(`siteDetails.hero.metrics.${key}.value`),
        delta: translate(`siteDetails.hero.metrics.${key}.delta`),
      })),
    [translate],
  )

  const residentMetrics = useMemo(
    () =>
      RESIDENT_METRICS.map(({ key, value, color }) => ({
        key,
        value,
        color,
        label: translate(`siteDetails.residentEngagement.metrics.${key}.label`),
        helper: translate(`siteDetails.residentEngagement.metrics.${key}.helper`),
      })),
    [translate],
  )

  const quickLinksWithCopy = useMemo(
    () =>
      QUICK_LINKS.map((link) => ({
        ...link,
        label: translate(`siteDetails.quickLinks.${link.key}.label`),
        description: translate(`siteDetails.quickLinks.${link.key}.description`),
      })),
    [translate],
  )

  const panelShortcutsWithCopy = useMemo(
    () =>
      PANEL_SHORTCUTS.map((shortcut) => ({
        ...shortcut,
        label: translate(`siteDetails.panelShortcuts.${shortcut.key}.label`),
        description: translate(`siteDetails.panelShortcuts.${shortcut.key}.description`),
      })),
    [translate],
  )

  const incidentCardsWithCopy = useMemo(
    () =>
      INCIDENT_CARDS.map(({ key, severity }) => ({
        key,
        severity,
        title: translate(`siteDetails.incidents.cards.${key}.title`),
        value: translate(`siteDetails.incidents.cards.${key}.value`),
        helper: translate(`siteDetails.incidents.cards.${key}.helper`),
      })),
    [translate],
  )

  const incidentBreakdownSegments = useMemo(
    () =>
      INCIDENT_BREAKDOWN_KEYS.map((key) => ({
        key,
        label: translate(`siteDetails.incidents.breakdown.segments.${key}.label`),
        value: translate(`siteDetails.incidents.breakdown.segments.${key}.value`),
      })),
    [translate],
  )

  const financialSnapshot = useMemo(
    () =>
      FINANCIALS.map(({ key, accent }) => ({
        key,
        accent,
        label: translate(`siteDetails.financials.items.${key}.label`),
        value: translate(`siteDetails.financials.items.${key}.value`),
        delta: translate(`siteDetails.financials.items.${key}.delta`),
      })),
    [translate],
  )

  const guardRoster = useMemo(
    () =>
      GUARDS.map((guard) => ({
        ...guard,
        status: translate(`siteDetails.guardRoster.status.${guard.statusKey}`),
      })),
    [translate],
  )

  const timelineEntries = useMemo(
    () =>
      TIMELINE.map(({ time, key }) => ({
        time,
        title: translate(`siteDetails.timeline.${key}.title`),
        subtitle: translate(`siteDetails.timeline.${key}.subtitle`),
      })),
    [translate],
  )

  const siteContextItems = useMemo(
    () =>
      SITE_CONTEXT_ITEMS.map(({ key, Icon }) => ({
        key,
        Icon,
        label: translate(`siteDetails.context.items.${key}.label`),
        value: translate(`siteDetails.context.items.${key}.value`),
      })),
    [translate],
  )

  const speedDialActions = useMemo(
    () =>
      [
        { key: 'addVisitor', Icon: DoorFrontIcon },
        { key: 'logIncident', Icon: ReportProblemIcon },
        { key: 'sendBroadcast', Icon: AddAlertIcon },
        { key: 'createInvoice', Icon: ReceiptLongIcon },
      ].map(({ key, Icon }) => ({
        key,
        Icon,
        tooltip: translate(`siteDetails.speedDial.actions.${key}`),
      })),
    [translate],
  )

  const siteSlug = site?.slug

  const quickLinkTargets = useMemo(() => {
    if (!siteSlug) {
      return []
    }

    return quickLinksWithCopy.map(({ sitePath, enterprisePath }) =>
      resolveScopedTarget({
        slug: siteSlug,
        isSiteMode,
        sitePath,
        enterprisePath,
      }),
    )
  }, [isSiteMode, quickLinksWithCopy, siteSlug])

  const panelShortcutTargets = useMemo(() => {
    if (!siteSlug) {
      return []
    }

    return panelShortcutsWithCopy.map(({ sitePath, enterprisePath }) =>
      resolveScopedTarget({
        slug: siteSlug,
        isSiteMode,
        sitePath,
        enterprisePath,
      }),
    )
  }, [isSiteMode, panelShortcutsWithCopy, siteSlug])

  useBreadcrumbBackAction({
    label: translate('siteDetails.actions.backToSites'),
    to: buildEntityUrl('sites'),
    variant: 'outlined',
    color: 'inherit',
    key: 'back-to-sites',
    enabled: !isSiteMode,
  })

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (site) {
      setCurrent({ id: site.id, name: site.name, slug: site.slug })
    }
  }, [setCurrent, site])

  if (isLoading) {
    return <LinearProgress sx={{ mt: 2 }} />
  }

  if (!site) {
    return <Typography>{translate('siteDetails.state.notFound')}</Typography>
  }

  const planLabel = site.plan?.toUpperCase() ?? translate('siteDetails.header.planFallback')
  const statusKey = site.status?.toLowerCase() ?? 'unknown'
  const statusLabel = translate(`siteDetails.status.${statusKey}`, {
    defaultValue: site.status ?? statusKey,
  })
  const statusColorMap: Record<string, ChipProps['color']> = {
    active: 'success',
    pending: 'warning',
    suspended: 'error',
    inactive: 'default',
    trial: 'info',
  }
  const statusColor: ChipProps['color'] = statusColorMap[statusKey] ?? 'default'
  const headerSubtitle = translate('siteDetails.header.subtitle', { slug: site.slug })
  const siteSettingsLabel = translate('siteDetails.actions.siteSettings')
  const inviteUserLabel = translate('siteDetails.actions.inviteUser')
  const switchToSiteModeLabel = translate('siteDetails.actions.switchToSiteMode')
  const speedDialLabel = translate('siteDetails.speedDial.ariaLabel')

  return (
    <Box sx={{ position: 'relative', pb: 8 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={600}>
            {site.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={planLabel} size="small" color="primary" />
            <Chip label={statusLabel} size="small" color={statusColor} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {headerSubtitle}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          flexWrap="wrap"
          sx={{ width: '100%', maxWidth: { xs: '100%', md: 'auto' } }}
        >
          {mode === 'enterprise' ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (!site) return
                setMode('site')
                navigate(`/site/${site.slug}`)
              }}
              sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
              fullWidth
            >
              {switchToSiteModeLabel}
            </Button>
          ) : null}
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
            fullWidth
          >
            {siteSettingsLabel}
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
            fullWidth
          >
            {inviteUserLabel}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={3}>
          <Stack spacing={2} position="sticky" top={88}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {translate('siteDetails.context.title')}
              </Typography>
              <Stack spacing={1.2}>
                {siteContextItems.map(({ key, Icon, label, value }) => (
                  <InfoLine
                    key={key}
                    icon={<Icon fontSize="small" />}
                    label={label}
                    value={value}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title={translate('siteDetails.sections.panelShortcuts.title')} />
              <Stack spacing={1.25}>
                {panelShortcutsWithCopy.map(({ key, label, description, Icon }, idx) => (
                  <PanelShortcut
                    key={key}
                    label={label}
                    description={description}
                    to={panelShortcutTargets[idx]}
                    Icon={Icon}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <SectionHeader
                title={translate('siteDetails.sections.timeline.title')}
                actionLabel={translate('siteDetails.sections.timeline.action')}
              />
              <Stack spacing={1.5}>
                {timelineEntries.map((activity) => (
                  <TimelineRow key={activity.time} {...activity} />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader
                title={translate('siteDetails.sections.residentEngagement.title')}
                actionLabel={translate('siteDetails.sections.residentEngagement.action')}
              />
              <Stack spacing={1.5}>
                {residentMetrics.map(({ key, label, value, helper, color }) => (
                  <MetricProgress
                    key={key}
                    label={label}
                    value={value}
                    helper={helper}
                    color={color}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader
                title={translate('siteDetails.sections.incidents.title')}
                actionLabel={translate('siteDetails.sections.incidents.action')}
              />
              <Stack spacing={1.5}>
                <Grid container spacing={2}>
                  {incidentCardsWithCopy.map(({ key, title, value, helper, severity }) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <InsightCard
                        title={title}
                        value={value}
                        helper={helper}
                        severity={severity}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  {incidentBreakdownSegments.map(({ key, label, value }, idx) => (
                    <Stack key={key} direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={(theme) => {
                          const scale = [
                            theme.palette.primary.main,
                            theme.palette.warning.main,
                            theme.palette.info.main,
                            theme.palette.success.main,
                          ]
                          return {
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: scale[idx % scale.length],
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader
                title={translate('siteDetails.sections.financial.title')}
                actionLabel={translate('siteDetails.sections.financial.action')}
              />
              <Stack spacing={1.5}>
                {financialSnapshot.map(({ key, label, value, delta, accent }) => (
                  <FinancialRow
                    key={key}
                    label={label}
                    value={value}
                    delta={delta}
                    accent={accent}
                  />
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {translate('siteDetails.sections.financial.nextBilling')}
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <SectionHeader
                title={translate('siteDetails.sections.guardRoster.title')}
                actionLabel={translate('siteDetails.sections.guardRoster.action')}
              />
              <Stack spacing={1.5}>
                {guardRoster.map((guard) => (
                  <GuardRow key={guard.name} {...guard} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {translate('siteDetails.hero.title')}
              </Typography>
              <Stack spacing={1.5}>
                {heroMetrics.map(({ key, label, value, delta, Icon }) => (
                  <Box
                    key={key}
                    sx={(theme) => ({
                      borderRadius: 2,
                      p: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      background: alpha(theme.palette.primary.main, 0.04),
                    })}
                  >
                    <Avatar sx={{ width: 34, height: 34 }}>
                      <Icon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {delta}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title={translate('siteDetails.sections.quickNavigation.title')} />
              <Stack spacing={1}>
                {quickLinksWithCopy.map(({ key, label, description, Icon }, idx) => (
                  <QuickLink
                    key={key}
                    label={label}
                    description={description}
                    Icon={Icon}
                    to={quickLinkTargets[idx]}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <SpeedDial
        ariaLabel={speedDialLabel}
        icon={<AddHomeWorkIcon />}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        {speedDialActions.map(({ key, Icon, tooltip }) => (
          <SpeedDialAction key={key} icon={<Icon />} tooltipTitle={tooltip} />
        ))}
      </SpeedDial>
    </Box>
  )
}

function SectionHeader({ title, actionLabel }: { title: string; actionLabel?: string }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {actionLabel ? (
        <Button size="small" endIcon={<LaunchIcon fontSize="small" />}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}

function TimelineRow({ time, title, subtitle }: { time: string; title: string; subtitle: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>
        {time}
      </Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  )
}

function MetricProgress({
  label,
  value,
  helper,
  color = 'primary',
}: {
  label: string
  value: number
  helper: string
  color?: 'primary' | 'secondary' | 'success'
}) {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption">{value}%</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 6, borderRadius: 10 }}
      />
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
    </Stack>
  )
}

function InsightCard({
  title,
  value,
  helper,
  severity,
}: {
  title: string
  value: string
  helper: string
  severity?: boolean
}) {
  return (
    <Paper
      sx={{
        p: 1.5,
        height: '100%',
        borderRadius: 2,
        border: (theme) =>
          `1px solid ${severity ? theme.palette.error.light : theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={600}>
        {value}
      </Typography>
      <Typography variant="caption" color={severity ? 'error.main' : 'text.secondary'}>
        {helper}
      </Typography>
    </Paper>
  )
}

function QuickLink({
  label,
  description,
  Icon,
  to,
}: {
  label: string
  description: string
  Icon: ElementType
  to?: string
}) {
  const linkProps = to
    ? {
        component: RouterLink,
        to,
      }
    : {}

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={(theme) => ({
        p: 1.2,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        textDecoration: 'none',
        color: 'inherit',
        cursor: to ? 'pointer' : 'default',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': to
          ? {
              transform: 'translateX(4px)',
              backgroundColor: theme.palette.action.hover,
            }
          : undefined,
      })}
      {...linkProps}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.primary' }}>
        <Icon fontSize="small" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  )
}

function FinancialRow({
  label,
  value,
  delta,
  accent,
}: {
  label: string
  value: string
  delta: string
  accent: string
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color={accent}>
          {delta}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  )
}

function GuardRow({
  name,
  shift,
  status,
  statusKey,
}: {
  name: string
  shift: string
  status: string
  statusKey: string
}) {
  const chipColor: ChipProps['color'] = statusKey === 'onDuty' ? 'success' : 'default'

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ p: 1, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Avatar sx={{ width: 32, height: 32 }}>{name[0]}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {shift}
        </Typography>
      </Box>
      <Chip label={status} size="small" color={chipColor} />
    </Stack>
  )
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.hover', color: 'text.primary' }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  )
}

function PanelShortcut({
  label,
  description,
  to,
  Icon,
}: {
  label: string
  description: string
  to: string
  Icon: ElementType
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        p: 1.2,
        borderRadius: 1.5,
        border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
        transition: (theme: Theme) =>
          theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          transform: 'translateX(4px)',
          backgroundColor: (theme: Theme) => theme.palette.action.hover,
        },
      }}
      component={RouterLink}
      to={to}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
        <Icon fontSize="small" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <LaunchIcon color="disabled" fontSize="small" />
    </Stack>
  )
}
