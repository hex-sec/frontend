import { useMemo, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
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
import { useSiteStore } from '@store/site.store'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'

const ROLE_SEGMENT: Record<Exclude<RoleFilter, 'all'>, string> = {
  admin: 'admins',
  guard: 'guards',
  resident: 'residents',
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mode, current } = useSiteStore()

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
    const base = siteScoped && current ? `/site/${current.slug}/users` : '/admin/users'
    if (resolvedFilter === 'all') return base
    const segment = ROLE_SEGMENT[resolvedFilter as Exclude<RoleFilter, 'all'>]
    return `${base}/${segment}`
  }, [current, resolvedFilter, siteScoped])

  const meta = ROLE_VIEW_META[resolvedFilter]
  const backLabel = useMemo(
    () => `Back to ${resolvedFilter === 'all' ? 'Users' : meta.title}`,
    [meta.title, resolvedFilter],
  )

  useBreadcrumbBackAction({
    label: backLabel,
    to: returnPath,
    key: 'back',
  })

  if (userId && !user) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          User not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The requested user profile could not be located. Try refreshing or return to the roster to
          select another member.
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

  const detailItems: Array<{ label: string; value: string; icon: ReactNode }> = [
    { label: 'Email', value: user.email, icon: <EmailIcon fontSize="small" /> },
    {
      label: 'Phone',
      value: user.phone ?? 'No phone on file',
      icon: <PhoneIcon fontSize="small" />,
    },
    { label: 'Last activity', value: user.lastActive, icon: <AccessTimeIcon fontSize="small" /> },
    { label: 'Joined', value: user.joinedOn ?? '—', icon: <CalendarMonthIcon fontSize="small" /> },
  ]

  const statusTag =
    user.status === 'active'
      ? 'Active access'
      : user.status === 'pending'
        ? 'Pending invite'
        : 'Access suspended'

  const relatedUsers = USERS.filter(
    (candidate) => candidate.id !== user.id && candidate.role === user.role,
  ).slice(0, 3)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Avatar sx={{ width: 72, height: 72, fontSize: 28 }}>
            {user.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Typography variant="h4" fontWeight={600}>
                {user.name}
              </Typography>
              <Chip size="small" color="primary" label={ROLE_LABEL[user.role]} />
              <Chip
                size="small"
                color={statusColor}
                label={statusTag}
                variant={user.status === 'active' ? 'filled' : 'outlined'}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user.position ?? 'Role details coming soon.'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Impersonate">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<ShieldIcon />}
                  disabled={user.status !== 'active'}
                >
                  Launch kiosk view
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<ManageAccountsIcon />}
              component={RouterLink}
              to={returnPath}
            >
              Manage access
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Profile summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.notes ?? 'No internal notes recorded yet.'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {detailItems.map((item) => (
                  <Stack key={item.label} direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.primary' }}
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

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Activity highlights
              </Typography>
              <Stack spacing={1.5}>
                {buildActivityTimeline(user).map((entry) => (
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
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Site assignments
              </Typography>
              <Stack spacing={1}>
                {activeSites.map((site) => {
                  const sitePath = `/site/${site.slug}`
                  const isFocused = siteScoped && current?.slug === site.slug
                  return (
                    <Button
                      key={site.slug}
                      component={RouterLink}
                      to={sitePath}
                      variant={isFocused ? 'contained' : 'outlined'}
                      color={isFocused ? 'secondary' : 'inherit'}
                      endIcon={<LaunchIcon fontSize="small" />}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      {site.name}
                    </Button>
                  )
                })}
              </Stack>
              {activeSites.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  No site assignments yet. Use Manage access to add this member to a property.
                </Typography>
              ) : null}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Related team
              </Typography>
              <Stack spacing={1.25}>
                {relatedUsers.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No other members with the same role yet.
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
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <GroupsIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {meta.title} quick tips
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep member data accurate by reviewing assignments and reset credentials after
                    shifts or ownership changes.
                  </Typography>
                </Box>
                <Button variant="contained" component={RouterLink} to={returnPath}>
                  Review roster
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}

function buildActivityTimeline(user: { id: string; role: string; name: string }) {
  if (user.role === 'guard') {
    return [
      { time: '06:00', title: 'Clocked in', subtitle: 'Gatehouse kiosk • Shift start' },
      { time: '07:15', title: 'Visitor approved', subtitle: 'Bautista Family • QR scanned' },
      { time: '08:42', title: 'Incident note added', subtitle: 'Noise complaint logged.' },
    ]
  }

  if (user.role === 'resident') {
    return [
      {
        time: 'Yesterday',
        title: 'Portal invitation sent',
        subtitle: 'Awaiting account activation.',
      },
      { time: '2d ago', title: 'Amenity booking', subtitle: 'Clubhouse reserved for Oct 28.' },
      {
        time: 'Last week',
        title: 'Broadcast opened',
        subtitle: 'Read hurricane preparedness notice.',
      },
    ]
  }

  return [
    { time: 'Today', title: 'Approved guard schedule', subtitle: 'Validated Nov 1 roster.' },
    {
      time: 'Yesterday',
      title: 'Reviewed incident follow-up',
      subtitle: 'Marked gate obstruction as resolved.',
    },
    { time: '3d ago', title: 'Exported residents CSV', subtitle: 'Shared with finance team.' },
  ]
}

function buildPeerLink(
  member: { id: string },
  opts: { resolvedFilter: RoleFilter; siteScoped: boolean; currentSlug?: string },
) {
  const params = new URLSearchParams()
  if (opts.resolvedFilter !== 'all') {
    params.set('role', opts.resolvedFilter)
  }
  const base =
    opts.siteScoped && opts.currentSlug
      ? `/site/${opts.currentSlug}/users/${member.id}`
      : `/admin/users/${member.id}`
  const suffix = params.toString()
  return suffix ? `${base}?${suffix}` : base
}
