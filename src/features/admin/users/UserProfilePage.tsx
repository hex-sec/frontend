import { useMemo, useEffect, useState } from 'react'
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Skeleton,
  Fade,
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
import PageHeader from '../components/PageHeader'
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
  timeOfDay?: string
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
      timeOfDay: '14:00',
      title: 'Portal invitation sent',
      subtitle: 'Awaiting account activation.',
    },
    {
      key: 'amenityBooking',
      time: '2d ago',
      timeOfDay: '09:30',
      title: 'Amenity booking',
      subtitle: 'Clubhouse reserved for Oct 28.',
    },
    {
      key: 'broadcastOpened',
      time: 'Last week',
      timeOfDay: '11:45',
      title: 'Broadcast opened',
      subtitle: 'Read hurricane preparedness notice.',
    },
  ],
  default: [
    {
      key: 'scheduleApproved',
      time: 'Today',
      timeOfDay: '10:00',
      title: 'Approved guard schedule',
      subtitle: 'Validated Nov 1 roster.',
    },
    {
      key: 'incidentReviewed',
      time: 'Yesterday',
      timeOfDay: '16:00',
      title: 'Reviewed incident follow-up',
      subtitle: 'Marked gate obstruction as resolved.',
    },
    {
      key: 'exportedResidents',
      time: '3d ago',
      timeOfDay: '13:00',
      title: 'Exported residents CSV',
      subtitle: 'Shared with finance team.',
    },
  ],
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [location.pathname])

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
      TIMELINE_CONFIG[timelineGroup].map((entry) => {
        const timeLabel = translate(
          `admin.userProfile.timeline.${timelineGroup}.${entry.key}.time`,
          entry.time,
        )
        // Use explicit timeOfDay when provided, otherwise compute when raw time is HH:MM
        let timeOfDay: string | null = null
        if (entry.timeOfDay) {
          const mExp = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(entry.timeOfDay)
          if (mExp) {
            const hours = Math.max(0, Math.min(23, Number(mExp[1])))
            const minutes = Math.max(0, Math.min(59, Number(mExp[2])))
            const d = new Date()
            d.setHours(hours, minutes, 0, 0)
            timeOfDay = new Intl.DateTimeFormat(language, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(d)
          } else {
            timeOfDay = entry.timeOfDay
          }
        } else {
          const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(entry.time)
          if (m) {
            const hours = Math.max(0, Math.min(23, Number(m[1])))
            const minutes = Math.max(0, Math.min(59, Number(m[2])))
            const d = new Date()
            d.setHours(hours, minutes, 0, 0)
            timeOfDay = new Intl.DateTimeFormat(language, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(d)
          }
        }
        return {
          time: timeLabel,
          title: translate(
            `admin.userProfile.timeline.${timelineGroup}.${entry.key}.title`,
            entry.title,
          ),
          subtitle: translate(
            `admin.userProfile.timeline.${timelineGroup}.${entry.key}.subtitle`,
            entry.subtitle,
          ),
          timeOfDay,
        }
      }),
    [timelineGroup, translate, language],
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

  // PageHeader configuration
  const badges = [
    { label: roleLabel, color: 'primary' as const },
    {
      label: statusTag,
      color: statusColor,
      variant: (user.status === 'active' ? 'filled' : 'outlined') as 'filled' | 'outlined',
    },
  ]

  const headerAvatar = (
    <Avatar
      src={user.avatar}
      sx={{
        width: 56,
        height: 56,
        fontSize: '1.25rem',
        bgcolor: 'primary.main',
      }}
    >
      {user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </Avatar>
  )

  const mobileBackButton = (
    <IconButton size="small" onClick={() => navigate(-1)}>
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  )

  const rightActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip title={launchKioskLabel} arrow>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ShieldIcon />}
          disabled={user.status !== 'active'}
          sx={{
            borderRadius: 2,
          }}
        >
          {launchKioskLabel}
        </Button>
      </Tooltip>

      <Tooltip title={manageAccessLabel} arrow>
        <IconButton
          component={RouterLink}
          to={returnPath}
          aria-label={manageAccessLabel}
          sx={{
            borderRadius: 2,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <ManageAccountsIcon sx={{ fontSize: '1rem', color: 'white' }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )

  const mobileActions = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title={impersonateLabel} arrow>
        <IconButton
          size="small"
          color="primary"
          disabled={user.status !== 'active'}
          aria-label={impersonateLabel}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ShieldIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={manageAccessLabel} arrow>
        <IconButton
          size="small"
          color="primary"
          component={RouterLink}
          to={returnPath}
          aria-label={manageAccessLabel}
          sx={{
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <ManageAccountsIcon sx={{ fontSize: 'small', color: 'white' }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )

  return (
    <Box sx={{ position: 'relative', minHeight: 200 }}>
      <Fade in={isLoading} timeout={{ enter: 0, exit: 300 }} unmountOnExit>
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, bgcolor: 'background.default' }}>
          <Stack
            spacing={3}
            sx={{
              px: { xs: 1.5, sm: 2, xl: 0 },
              py: { xs: 2, md: 3 },
              maxWidth: { xs: '100%', xl: 1200 },
              mx: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={64} height={64} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height={32} />
                <Skeleton variant="text" width="30%" height={24} sx={{ mt: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
            </Box>
            <Grid container spacing={3} alignItems="stretch">
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="30%" height={16} />
                            <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={120}
                      sx={{ borderRadius: 2, mt: 1 }}
                    />
                  </Paper>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={3}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={120}
                      sx={{ borderRadius: 2, mt: 1 }}
                    />
                  </Paper>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={160}
                      sx={{ borderRadius: 2, mt: 1 }}
                    />
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Fade>

      <Fade in={!isLoading} timeout={{ enter: 400, exit: 0 }} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: isLoading ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            opacity: isLoading ? 0 : 1,
          }}
        >
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
              <PageHeader
                title={user.name}
                subtitle={positionText || undefined}
                badges={badges}
                rightActions={rightActions}
                mobileBackButton={mobileBackButton}
                mobileActions={mobileActions}
                avatar={headerAvatar}
              />

              <Grid container spacing={3} alignItems="stretch">
                <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
                  <Stack spacing={3} sx={{ width: '100%' }}>
                    <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                        {profileSummaryTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profileNotes}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={1.5}>
                        {detailItems.map((item) => (
                          <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
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
                          </Grid>
                        ))}
                      </Grid>
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ minWidth: 64 }}
                            >
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
                            {entry.timeOfDay ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                {entry.timeOfDay}
                              </Typography>
                            ) : null}
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
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
                            <Stack
                              key={member.id}
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
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
                          alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.12 : 0.06,
                          ),
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        width: '100%',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ flexWrap: 'wrap' }}
                      >
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
                          sx={{
                            whiteSpace: 'nowrap',
                            backgroundColor: (theme) => theme.palette.primary.main,
                            color: (theme) => theme.palette.primary.contrastText,
                            '&:link, &:visited': {
                              color: (theme) => theme.palette.primary.contrastText,
                            },
                            '&:hover': {
                              backgroundColor: (theme) => theme.palette.primary.dark,
                              color: (theme) => theme.palette.primary.contrastText,
                            },
                            '&:focus-visible': {
                              backgroundColor: (theme) => theme.palette.primary.dark,
                              color: (theme) => theme.palette.primary.contrastText,
                            },
                          }}
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
        </Box>
      </Fade>
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
