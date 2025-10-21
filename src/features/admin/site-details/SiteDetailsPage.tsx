import { useEffect, type ReactNode, type ElementType } from 'react'
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
import { useSiteBySlugQuery } from '../sites.api'
import { useSiteStore } from '@store/site.store'
import { useTranslate } from '@i18n/useTranslate'

const HERO_METRICS = [
  { label: 'Active residents', value: '342', delta: '+12 this week', Icon: GroupsIcon },
  { label: 'Scheduled visits', value: '18', delta: 'Next 8 hours', Icon: DoorFrontIcon },
  { label: 'Open incidents', value: '3', delta: '2 critical', Icon: ReportProblemIcon },
  { label: 'Guard coverage', value: '92%', delta: 'All shifts staffed', Icon: LocalPoliceIcon },
]

type ScopedPath = string | ((slug: string) => string)

type QuickLinkConfig = {
  label: string
  description: string
  Icon: ElementType
  sitePath?: ScopedPath
  enterprisePath?: ScopedPath
}

const QUICK_LINKS: QuickLinkConfig[] = [
  {
    label: 'Create visitor pass',
    description: 'Generate a same-day QR',
    Icon: DoorFrontIcon,
    sitePath: 'visits',
    enterprisePath: (slug) => `/admin/sites/${slug}/visits`,
  },
  {
    label: 'Register vehicle',
    description: 'Add resident or vendor plate',
    Icon: DirectionsCarFilledIcon,
    sitePath: 'vehicles',
    enterprisePath: (slug) => `/admin/sites/${slug}/vehicles`,
  },
  {
    label: 'Add recurring visitor',
    description: 'Save frequent guest profile',
    Icon: BadgeIcon,
    sitePath: 'visitors',
    enterprisePath: (slug) => `/admin/sites/${slug}/visitors`,
  },
  {
    label: 'Invite resident',
    description: 'Send onboarding email',
    Icon: PersonAddIcon,
    sitePath: 'users/residents',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/residents`,
  },
  {
    label: 'Log incident',
    description: 'Record gate event',
    Icon: ReportProblemIcon,
    sitePath: 'reports',
    enterprisePath: '/admin/reports',
  },
  {
    label: 'Automations',
    description: 'Configure workflows',
    Icon: TrendingUpIcon,
    sitePath: 'reports',
    enterprisePath: '/admin/reports',
  },
]

type PanelShortcutConfig = {
  label: string
  description: string
  Icon: ElementType
  sitePath?: ScopedPath
  enterprisePath?: ScopedPath
}

const PANEL_SHORTCUTS: PanelShortcutConfig[] = [
  {
    label: 'Users',
    sitePath: 'users',
    enterprisePath: (slug) => `/admin/sites/${slug}/users`,
    Icon: GroupsIcon,
    description: 'Manage roles and invites',
  },
  {
    label: 'Residents',
    sitePath: 'users/residents',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/residents`,
    Icon: GroupsIcon,
    description: 'Directory and broadcasts',
  },
  {
    label: 'Guards',
    sitePath: 'users/guards',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/guards`,
    Icon: LocalPoliceIcon,
    description: 'Shift assignments and handoffs',
  },
  {
    label: 'Admins',
    sitePath: 'users/admins',
    enterprisePath: (slug) => `/admin/sites/${slug}/users/admins`,
    Icon: ManageAccountsIcon,
    description: 'Enterprise access and permissions',
  },
  {
    label: 'Visits',
    sitePath: 'visits',
    enterprisePath: (slug) => `/admin/sites/${slug}/visits`,
    Icon: DoorFrontIcon,
    description: 'Gate log and passes',
  },
  {
    label: 'Vehicles',
    sitePath: 'vehicles',
    enterprisePath: (slug) => `/admin/sites/${slug}/vehicles`,
    Icon: DirectionsCarFilledIcon,
    description: 'Registered plates and decals',
  },
  {
    label: 'Visitors',
    sitePath: 'visitors',
    enterprisePath: (slug) => `/admin/sites/${slug}/visitors`,
    Icon: BadgeIcon,
    description: 'Recurring guest directory',
  },
  {
    label: 'Residences',
    sitePath: 'residences',
    enterprisePath: (slug) => `/admin/sites/${slug}/residences`,
    Icon: HomeWorkIcon,
    description: 'Units, villas, and amenities',
  },
  {
    label: 'Reports',
    sitePath: 'reports',
    enterprisePath: (slug) => `/admin/sites/${slug}/reports`,
    Icon: BarChartIcon,
    description: 'Exports and analytics',
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
  { label: 'Monthly recurring', value: '$12,480', delta: '+4.2%', accent: 'success.main' },
  {
    label: 'Outstanding invoices',
    value: '$1,230',
    delta: '-$540 vs last month',
    accent: 'success.main',
  },
  { label: 'Average dues paid', value: '87%', delta: '-3% overdue', accent: 'warning.main' },
]

const TIMELINE = [
  { time: '08:45', title: 'Delivery: Amazon Van', subtitle: 'Gate 2' },
  { time: '09:10', title: 'Resident check-in', subtitle: 'Laura Pérez · Tower B' },
  { time: '10:24', title: 'Incident escalated', subtitle: 'Unauthorized vehicle' },
  { time: '11:40', title: 'Visitor pass created', subtitle: 'Smith family' },
]

const GUARDS = [
  { name: 'Carlos Díaz', shift: '06:00 – 14:00', status: 'On duty' },
  { name: 'Ana López', shift: '14:00 – 22:00', status: 'On duty' },
  { name: 'José Medina', shift: '22:00 – 06:00', status: 'Scheduled' },
]

export default function SiteDetailsPage() {
  const { slug } = useParams()
  const { data: site, isLoading } = useSiteBySlugQuery(slug)
  const { hydrate, setCurrent, mode, setMode } = useSiteStore()
  const navigate = useNavigate()
  const isSiteMode = mode === 'site'
  const { t } = useTranslate()

  useBreadcrumbBackAction({
    label: 'Back to Sites',
    to: '/admin/sites',
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
    return <Typography>Site not found.</Typography>
  }

  // Memoize quick link targets and panel shortcut targets
  const quickLinkTargets = QUICK_LINKS.map((link) =>
    resolveScopedTarget({
      slug: site.slug,
      isSiteMode,
      sitePath: link.sitePath,
      enterprisePath: link.enterprisePath,
    }),
  )

  const panelShortcutTargets = PANEL_SHORTCUTS.map((shortcut) =>
    resolveScopedTarget({
      slug: site.slug,
      isSiteMode,
      sitePath: shortcut.sitePath,
      enterprisePath: shortcut.enterprisePath,
    }),
  )

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
            <Chip label={site.plan?.toUpperCase() ?? 'FREE'} size="small" color="primary" />
            <Chip
              label={site.status}
              size="small"
              color={site.status === 'active' ? 'success' : 'default'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Focused view for {site.slug}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          {mode === 'enterprise' ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (!site) return
                setMode('site')
                navigate(`/site/${site.slug}`)
              }}
            >
              {t('siteDetails.switchToSiteMode')}
            </Button>
          ) : null}
          <Button variant="outlined" startIcon={<SettingsIcon />}>
            Site settings
          </Button>
          <Button variant="contained" startIcon={<PersonAddIcon />}>
            Invite user
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={3}>
          <Stack spacing={2} position="sticky" top={88}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Hero KPIs
              </Typography>
              <Stack spacing={1.5}>
                {HERO_METRICS.map(({ label, value, delta, Icon }) => (
                  <Box
                    key={label}
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Site context
              </Typography>
              <Stack spacing={1.2}>
                <InfoLine
                  icon={<BusinessIcon fontSize="small" />}
                  label="Address"
                  value="Av. Siempre Viva 123"
                />
                <InfoLine
                  icon={<AccessTimeIcon fontSize="small" />}
                  label="Access hours"
                  value="24/7"
                />
                <InfoLine
                  icon={<EmailIcon fontSize="small" />}
                  label="Primary contact"
                  value="admin@vistaazul.mx"
                />
                <Divider flexItem sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Shortcuts
                </Typography>
                <Stack spacing={1}>
                  {QUICK_LINKS.slice(0, 2).map((link, idx) => {
                    const { label, Icon } = link
                    const target = quickLinkTargets[idx]
                    return (
                      <Button
                        key={label}
                        variant="outlined"
                        size="small"
                        startIcon={<Icon fontSize="small" />}
                        component={RouterLink}
                        to={target}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Today at a glance" actionLabel="View timeline" />
              <Stack spacing={1.5}>
                {TIMELINE.map((activity) => (
                  <TimelineRow key={activity.time} {...activity} />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Resident engagement" actionLabel="Open residents" />
              <Stack spacing={1.5}>
                <MetricProgress label="Portal adoption" value={82} helper="+5% vs last month" />
                <MetricProgress
                  label="Amenity bookings"
                  value={64}
                  helper="12 reservations today"
                  color="secondary"
                />
                <MetricProgress
                  label="Broadcast reach"
                  value={91}
                  helper="Last notice: 91% opened"
                  color="success"
                />
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Incident insights" actionLabel="Incident board" />
              <Stack spacing={1.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InsightCard title="Past 7 days" value="14" helper="-3 vs previous week" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InsightCard title="Critical" value="2" helper="Active follow-ups" severity />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  {['Gate access', 'Noise/Disturbance', 'Maintenance', 'Other'].map(
                    (category, idx) => (
                      <Stack key={category} direction="row" alignItems="center" spacing={1}>
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
                          {category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {35 - idx * 7}%
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Quick navigation" />
              <Stack spacing={1}>
                {QUICK_LINKS.map(({ label, description, Icon }, idx) => (
                  <QuickLink
                    key={label}
                    label={label}
                    description={description}
                    Icon={Icon}
                    to={quickLinkTargets[idx]}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title="More in this site" />
              <Stack spacing={1.25}>
                {PANEL_SHORTCUTS.map(({ label, description, Icon }, idx) => (
                  <PanelShortcut
                    key={label}
                    label={label}
                    description={description}
                    to={panelShortcutTargets[idx]}
                    Icon={Icon}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Financial snapshot" actionLabel="Open billing" />
              <Stack spacing={1.5}>
                {FINANCIALS.map(({ label, value, delta, accent }) => (
                  <FinancialRow
                    key={label}
                    label={label}
                    value={value}
                    delta={delta}
                    accent={accent}
                  />
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Next billing cycle: 02 Nov 2025
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <SectionHeader title="Guard roster" actionLabel="Manage shifts" />
              <Stack spacing={1}>
                {GUARDS.map((guard) => (
                  <GuardRow key={guard.name} {...guard} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <SpeedDial
        ariaLabel="Site actions"
        icon={<AddHomeWorkIcon />}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <SpeedDialAction icon={<DoorFrontIcon />} tooltipTitle="Add visitor" />
        <SpeedDialAction icon={<ReportProblemIcon />} tooltipTitle="Log incident" />
        <SpeedDialAction icon={<AddAlertIcon />} tooltipTitle="Send broadcast" />
        <SpeedDialAction icon={<ReceiptLongIcon />} tooltipTitle="Create invoice" />
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

function GuardRow({ name, shift, status }: { name: string; shift: string; status: string }) {
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
      <Chip label={status} size="small" color={status === 'On duty' ? 'success' : 'default'} />
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
