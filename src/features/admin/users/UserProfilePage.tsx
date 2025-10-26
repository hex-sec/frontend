import { useMemo } from 'react'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ShieldIcon from '@mui/icons-material/Shield'
import GroupsIcon from '@mui/icons-material/Groups'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LaunchIcon from '@mui/icons-material/Launch'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { alpha } from '@mui/material/styles'
import {
  ROLE_LABEL,
  ROLE_VIEW_META,
  STATUS_COLOR,
  USERS,
  findUserById,
  parseRoleFilter,
  type RoleFilter,
} from './userData'
import { useLastActiveFormatter } from './useLastActiveFormatter'
import { useSiteStore } from '@store/site.store'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { formatBackLabel } from '@app/layout/backNavigation'

const ROLE_SEGMENT: Record<Exclude<RoleFilter, 'all'>, string> = {
  admin: 'admins',
  guard: 'guards',
  resident: 'residents',
}

type UserRoleTimelineGroup = 'guard' | 'resident' | 'default'

type TimelineEntryConfig = {
  key: string
  time: string
  title: string
  subtitle: string
}

const TIMELINE_CONFIG: Record<UserRoleTimelineGroup, TimelineEntryConfig[]> = {
  guard: [
    {
      key: 'clockedIn',
      time: '06:00',
      title: 'Clocked in',
      subtitle: 'Gatehouse kiosk - Shift start',
    },
    {
      key: 'visitorApproved',
      time: '07:15',
      title: 'Visitor approved',
      subtitle: 'Bautista Family - QR scanned',
    },
    {
      key: 'incidentLogged',
      time: '08:42',
      title: 'Incident note added',
      subtitle: 'Noise complaint logged.',
    },
  ],
  resident: [
    {
      key: 'invitationSent',
      time: 'Yesterday',
      title: 'Portal invitation sent',
      subtitle: 'Awaiting account activation.',
    },
    {
      key: 'amenityBooking',
      time: '2d ago',
      title: 'Amenity booking',
      subtitle: 'Clubhouse reserved for Oct 28.',
    },
    {
      key: 'broadcastOpened',
      time: 'Last week',
      title: 'Broadcast opened',
      subtitle: 'Read hurricane preparedness notice.',
    },
  ],
  default: [
    {
      key: 'scheduleApproved',
      time: 'Today',
      title: 'Approved guard schedule',
      subtitle: 'Validated Nov 1 roster.',
    },
    {
      key: 'incidentReviewed',
      time: 'Yesterday',
      title: 'Reviewed incident follow-up',
      subtitle: 'Marked gate obstruction as resolved.',
    },
    {
      key: 'exportedResidents',
      time: '3d ago',
      title: 'Exported residents CSV',
      subtitle: 'Shared with finance team.',
    },
  ],
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mode, current } = useSiteStore()
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language)
  const formatLastActive = useLastActiveFormatter()
  const translate = useMemo(
    () => (key: string, defaultValue: string, options?: Record<string, unknown>) =>
      t(key, { lng: language, defaultValue, ...options }),
    [language, t],
  )

  const siteScoped = mode === 'site' && !!current

  const resolvedFilter = useMemo<RoleFilter>(
    () => parseRoleFilter(searchParams.get('role')),
    [searchParams],
  )

  const user = useMemo(() => {
    if (!userId) return undefined
    return findUserById(userId)
  }, [userId])

  const returnPath = useMemo(() => {
    const base = buildEntityUrl('users', undefined, {
      mode: siteScoped ? 'site' : 'enterprise',
      currentSlug: current?.slug ?? null,
      routeParamSlug: current?.slug ?? null,
    })
    if (resolvedFilter === 'all') return base
    const segment = ROLE_SEGMENT[resolvedFilter as Exclude<RoleFilter, 'all'>]
    return `${base}/${segment}`
  }, [current, resolvedFilter, siteScoped])

  const meta = ROLE_VIEW_META[resolvedFilter]
  const metaTitleKey = useMemo(() => `usersPage.meta.${resolvedFilter}.title`, [resolvedFilter])
  const translatedMetaTitle = useMemo(
    () => translate(metaTitleKey, meta.title),
    [meta.title, metaTitleKey, translate],
  )

  const backLabel = useMemo(
    () => formatBackLabel({ baseLabel: translatedMetaTitle, t, language }),
    [language, t, translatedMetaTitle],
  )

  useBreadcrumbBackAction({
    label: backLabel,
    to: returnPath,
    key: 'back',
    variant: 'outlined',
    color: 'inherit',
  })

  if (userId && !user) {
    const notFoundTitle = translate('admin.userProfile.notFound.title', 'User not found')
    const notFoundDescription = translate(
      'admin.userProfile.notFound.description',
      'The requested user profile could not be located. Try refreshing or return to the roster to select another member.',
    )
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          {notFoundTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {notFoundDescription}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(returnPath)}
        >
          {backLabel}
        </Button>
      </Paper>
    )
  }

  if (!user) {
    return <LinearProgress sx={{ mt: 2 }} />
  }

  const activeSites = user.sites
  const statusColor = STATUS_COLOR[user.status]
  const statusTagKey =
    user.status === 'active' ? 'active' : user.status === 'pending' ? 'pending' : 'suspended'
  const statusTag = translate(
    `admin.userProfile.statusTag.${statusTagKey}`,
    statusTagKey === 'active'
      ? 'Active access'
      : statusTagKey === 'pending'
        ? 'Pending invite'
        : 'Access suspended',
  )

  const roleLabel = translate(`usersPage.roleLabels.${user.role}`, ROLE_LABEL[user.role])

  const positionText =
    user.position ??
    translate('admin.userProfile.details.positionFallback', 'Role details coming soon.')

  const impersonateLabel = translate('admin.userProfile.actions.impersonate', 'Impersonate')
  const launchKioskLabel = translate('admin.userProfile.actions.launchKiosk', 'Launch kiosk view')
  const manageAccessLabel = translate('admin.userProfile.actions.manageAccess', 'Manage access')
  const reviewRosterLabel = translate('admin.userProfile.actions.reviewRoster', 'Review roster')

  const profileSummaryTitle = translate(
    'admin.userProfile.sections.profileSummary.title',
    'Profile summary',
  )
  const profileSummaryEmpty = translate(
    'admin.userProfile.sections.profileSummary.emptyNotes',
    'No internal notes recorded yet.',
  )
  const profileNotes = user.notes ?? profileSummaryEmpty
  const activityTitle = translate(
    'admin.userProfile.sections.activity.title',
    'Activity highlights',
  )
  const assignmentsTitle = translate(
    'admin.userProfile.sections.assignments.title',
    'Site assignments',
  )
  const relatedTitle = translate('admin.userProfile.sections.related.title', 'Related team')

  const quickTipsTitle = translate(
    'admin.userProfile.sections.quickTips.title',
    `${translatedMetaTitle} quick tips`,
    { role: translatedMetaTitle },
  )
  const quickTipsBody = translate(
    'admin.userProfile.sections.quickTips.body',
    'Keep member data accurate by reviewing assignments and reset credentials after shifts or ownership changes.',
  )

  const assignmentsEmpty = translate(
    'admin.userProfile.sections.assignments.empty',
    'No site assignments yet. Use Manage access to add this member to a property.',
    { action: manageAccessLabel },
  )
  const relatedEmpty = translate(
    'admin.userProfile.sections.related.empty',
    'No other members with the same role yet.',
    { role: roleLabel },
  )

  const timelineGroup: UserRoleTimelineGroup =
    user.role === 'guard' ? 'guard' : user.role === 'resident' ? 'resident' : 'default'

  const timelineEntries = useMemo(
    () =>
      TIMELINE_CONFIG[timelineGroup].map((entry) => ({
        time: translate(
          `admin.userProfile.timeline.${timelineGroup}.${entry.key}.time`,
          entry.time,
        ),
        title: translate(
          `admin.userProfile.timeline.${timelineGroup}.${entry.key}.title`,
          entry.title,
        ),
        subtitle: translate(
          `admin.userProfile.timeline.${timelineGroup}.${entry.key}.subtitle`,
          entry.subtitle,
        ),
      })),
    [timelineGroup, translate],
  )

  const detailItems = useMemo(
    () => [
      {
        key: 'email',
        label: translate('admin.userProfile.details.labels.email', 'Email'),
        value: user.email,
        icon: <EmailIcon fontSize="small" />,
      },
      {
        key: 'phone',
        label: translate('admin.userProfile.details.labels.phone', 'Phone'),
        value:
          user.phone ?? translate('admin.userProfile.details.phoneMissing', 'No phone on file'),
        icon: <PhoneIcon fontSize="small" />,
      },
      {
        key: 'lastActive',
        label: translate('admin.userProfile.details.labels.lastActive', 'Last activity'),
        value: formatLastActive(user.lastActive),
        icon: <AccessTimeIcon fontSize="small" />,
      },
      {
        key: 'joined',
        label: translate('admin.userProfile.details.labels.joined', 'Joined'),
        value:
          user.joinedOn ?? translate('admin.userProfile.details.joinedFallback', 'Not recorded'),
        icon: <CalendarMonthIcon fontSize="small" />,
      },
    ],
    [formatLastActive, translate, user.email, user.joinedOn, user.lastActive, user.phone],
  )

  const relatedUsers = USERS.filter(
    (candidate) => candidate.id !== user.id && candidate.role === user.role,
  ).slice(0, 3)

  return (
    <Box sx={{ width: '100%', py: { xs: 2, md: 3 } }}>
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', xl: 1200 },
          mx: 'auto',
          px: { xs: 1.5, sm: 2, xl: 0 },
        }}
      >
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, width: '100%' }}>
          <Grid
            container
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Avatar sx={{ width: 72, height: 72, fontSize: 28 }}>
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>
            </Grid>
            <Grid size={{ xs: 12, md: 'grow' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
              >
                <Typography variant="h4" fontWeight={600}>
                  {user.name}
                </Typography>
                <Chip size="small" color="primary" label={roleLabel} />
                <Chip
                  size="small"
                  color={statusColor}
                  label={statusTag}
                  variant={user.status === 'active' ? 'filled' : 'outlined'}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {positionText}
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, md: 'auto' }}
              sx={{
                display: 'flex',
                justifyContent: { xs: 'stretch', md: 'flex-end' },
                width: '100%',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent={{ xs: 'stretch', md: 'flex-end' }}
                sx={{ width: '100%', maxWidth: { xs: '100%', md: 360 }, rowGap: 1 }}
              >
                <Tooltip title={impersonateLabel}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ShieldIcon />}
                      disabled={user.status !== 'active'}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      {launchKioskLabel}
                    </Button>
                  </Box>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<ManageAccountsIcon />}
                  component={RouterLink}
                  to={returnPath}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {manageAccessLabel}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  {profileSummaryTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profileNotes}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                  {detailItems.map((item) => (
                    <Stack key={item.key} direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'action.hover',
                          color: 'text.primary',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body2">{item.value}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {activityTitle}
                </Typography>
                <Stack spacing={1.5}>
                  {timelineEntries.map((entry) => (
                    <Stack
                      key={entry.time + entry.title}
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 64 }}>
                        {entry.time}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  {assignmentsTitle}
                </Typography>
                <Stack spacing={1}>
                  {activeSites.map((site) => {
                    const sitePath = siteRoot(site.slug)
                    const isFocused = siteScoped && current?.slug === site.slug
                    return (
                      <Button
                        key={site.slug}
                        component={RouterLink}
                        to={sitePath}
                        variant={isFocused ? 'contained' : 'outlined'}
                        color={isFocused ? 'secondary' : 'inherit'}
                        endIcon={<LaunchIcon fontSize="small" />}
                        sx={{ justifyContent: 'space-between', width: '100%' }}
                      >
                        {site.name}
                      </Button>
                    )
                  })}
                </Stack>
                {activeSites.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {assignmentsEmpty}
                  </Typography>
                ) : null}
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {relatedTitle}
                </Typography>
                <Stack spacing={1.25}>
                  {relatedUsers.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      {relatedEmpty}
                    </Typography>
                  ) : (
                    relatedUsers.map((member) => (
                      <Stack key={member.id} direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {member.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.sites.map((site) => site.name).join(', ')}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          component={RouterLink}
                          to={buildPeerLink(member, {
                            resolvedFilter,
                            siteScoped,
                            currentSlug: current?.slug,
                          })}
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  width: '100%',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <GroupsIcon color="primary" />
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {quickTipsTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quickTipsBody}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={returnPath}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {reviewRosterLabel}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}

function buildPeerLink(
  member: { id: string },
  opts: { resolvedFilter: RoleFilter; siteScoped: boolean; currentSlug?: string },
) {
  const params = new URLSearchParams()
  if (opts.resolvedFilter !== 'all') {
    params.set('role', opts.resolvedFilter)
  }
  const base = buildEntityUrl('users', member.id, {
    mode: opts.siteScoped ? 'site' : 'enterprise',
    currentSlug: opts.currentSlug ?? null,
    routeParamSlug: opts.siteScoped ? (opts.currentSlug ?? null) : null,
  })
  const suffix = params.toString()
  return suffix ? `${base}?${suffix}` : base
}
