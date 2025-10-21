import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Avatar,
  Chip,
  ListSubheader,
  MenuList,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import GroupsIcon from '@mui/icons-material/Groups'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import DomainIcon from '@mui/icons-material/Domain'
import BarChartIcon from '@mui/icons-material/BarChart'
import DoorFrontIcon from '@mui/icons-material/DoorFront'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import BadgeOutlinedIcon from '@mui/icons-material/Badge'
import Badge from '@mui/material/Badge'
import type { ButtonProps } from '@mui/material/Button'
import { useAuthStore } from '@app/auth/auth.store'
import { useUIStore } from '@store/ui.store'
import { useI18nStore } from '@store/i18n.store'
import SettingsPage from '@features/settings/SettingsPage'
import { useTranslate } from '../../i18n/useTranslate'
import { alpha, useTheme } from '@mui/material/styles'
import { useSiteStore, type SiteMode, type Site } from '@store/site.store'

type NavItem = {
  label: string
  to: string
  Icon: ElementType
  description?: string
}

type NotificationType = 'incident' | 'visitor' | 'announcement'

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  siteSlug?: string
}

type NotificationAction = {
  label: string
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  onClick: () => void
}

// Removed ROLE_NAV constant for translation-driven navigation
// Keeping type definitions intact

function getUserInitials(source?: string): string {
  if (!source) return 'HX'
  const trimmed = source.trim()
  if (!trimmed) return 'HX'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export default function TopNav() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const patternEnabled = useUIStore((s) => s.patternEnabled)
  const patternKind = useUIStore((s) => s.patternKind)
  const patternOpacity = useUIStore((s) => s.patternOpacity)
  const patternBackgroundSource = useUIStore((s) => s.patternBackgroundSource)
  const patternCustomColor = useUIStore((s) => s.patternCustomColor)
  const patternScale = useUIStore((s) => s.patternScale)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const openSettings = useUIStore((s) => s.openSettings)
  const setOpenSettings = useUIStore((s) => s.setOpenSettings)
  const theme = useTheme()
  const { sites, current, mode, hydrate, setCurrent, setMode } = useSiteStore()
  const location = useLocation()

  const items = useMemo<NavItem[]>(() => {
    if (!user) return []

    if (mode === 'site' && current) {
      const base = `/site/${current.slug}`
      return [
        {
          label: t('topnav.siteNav.dashboard.label', { siteName: current.name }),
          to: base,
          Icon: DomainIcon,
          description: t('topnav.siteNav.dashboard.description'),
        },
        {
          label: t('topnav.siteNav.allUsers.label'),
          to: `${base}/users`,
          Icon: PeopleIcon,
          description: t('topnav.siteNav.allUsers.description', { siteName: current.name }),
        },
        {
          label: t('topnav.siteNav.residents.label'),
          to: `${base}/users/residents`,
          Icon: GroupsIcon,
          description: t('topnav.siteNav.residents.description'),
        },
        {
          label: t('topnav.siteNav.guards.label'),
          to: `${base}/users/guards`,
          Icon: LocalPoliceIcon,
          description: t('topnav.siteNav.guards.description'),
        },
        {
          label: t('topnav.siteNav.admins.label'),
          to: `${base}/users/admins`,
          Icon: ManageAccountsIcon,
          description: t('topnav.siteNav.admins.description'),
        },
        {
          label: t('topnav.siteNav.visits.label'),
          to: `${base}/visits`,
          Icon: DoorFrontIcon,
          description: t('topnav.siteNav.visits.description'),
        },
        {
          label: t('topnav.siteNav.residences.label'),
          to: `${base}/residences`,
          Icon: HomeWorkIcon,
          description: t('topnav.siteNav.residences.description'),
        },
        {
          label: t('topnav.siteNav.vehicles.label'),
          to: `${base}/vehicles`,
          Icon: DirectionsCarFilledIcon,
          description: t('topnav.siteNav.vehicles.description'),
        },
        {
          label: t('topnav.siteNav.visitors.label'),
          to: `${base}/visitors`,
          Icon: BadgeOutlinedIcon,
          description: t('topnav.siteNav.visitors.description'),
        },
        {
          label: t('topnav.siteNav.reports.label'),
          to: `${base}/reports`,
          Icon: BarChartIcon,
          description: t('topnav.siteNav.reports.description', { siteName: current.name }),
        },
      ]
    }

    switch (user.role) {
      case 'admin':
        return [
          {
            label: t('topnav.roleNav.admin.dashboard.label'),
            to: '/admin',
            Icon: DashboardIcon,
            description: t('topnav.roleNav.admin.dashboard.description'),
          },
          {
            label: t('topnav.roleNav.admin.sites.label'),
            to: '/admin/sites',
            Icon: DomainIcon,
            description: t('topnav.roleNav.admin.sites.description'),
          },
          {
            label: t('topnav.roleNav.admin.visits.label'),
            to: '/admin/visits',
            Icon: DoorFrontIcon,
            description: t('topnav.roleNav.admin.visits.description'),
          },
          {
            label: t('topnav.roleNav.admin.vehicles.label'),
            to: '/admin/vehicles',
            Icon: DirectionsCarFilledIcon,
            description: t('topnav.roleNav.admin.vehicles.description'),
          },
          {
            label: t('topnav.roleNav.admin.visitors.label'),
            to: '/admin/visitors',
            Icon: BadgeOutlinedIcon,
            description: t('topnav.roleNav.admin.visitors.description'),
          },
          {
            label: t('topnav.roleNav.admin.users.label'),
            to: '/admin/users',
            Icon: PeopleIcon,
            description: t('topnav.roleNav.admin.users.description'),
          },
          {
            label: t('topnav.roleNav.admin.reports.label'),
            to: '/admin/reports',
            Icon: BarChartIcon,
            description: t('topnav.roleNav.admin.reports.description'),
          },
        ]
      case 'guard':
        return [
          {
            label: t('topnav.roleNav.guard.kiosk.label'),
            to: '/guard',
            Icon: SecurityIcon,
            description: t('topnav.roleNav.guard.kiosk.description'),
          },
        ]
      case 'resident':
        return [
          {
            label: t('topnav.roleNav.resident.home.label'),
            to: '/app',
            Icon: HomeIcon,
            description: t('topnav.roleNav.resident.home.description'),
          },
        ]
      default:
        return []
    }
  }, [user, mode, current, t, language])

  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null)
  const [modeDialogOpen, setModeDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<SiteMode>(mode)
  const [selectedSiteSlug, setSelectedSiteSlug] = useState(current?.slug ?? '')
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)

  const baseNotifications = useMemo<Notification[]>(() => {
    if (!user) return []

    const siteName = current?.name ?? t('topnav.notifications.fallbackSiteName')
    const siteSlug = current?.slug

    if (mode === 'site' && siteSlug) {
      return [
        {
          id: 'incident-site-1',
          type: 'incident',
          title: t('topnav.notifications.site.incident.title', { siteName }),
          message: t('topnav.notifications.site.incident.message', { siteName }),
          timestamp: t('topnav.notifications.timestamps.justNow'),
          siteSlug,
        },
        {
          id: 'visitor-site-1',
          type: 'visitor',
          title: t('topnav.notifications.site.visitor.title'),
          message: t('topnav.notifications.site.visitor.message'),
          timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 2 }),
          siteSlug,
        },
        {
          id: 'announcement-site-1',
          type: 'announcement',
          title: t('topnav.notifications.site.announcement.title'),
          message: t('topnav.notifications.site.announcement.message'),
          timestamp: t('topnav.notifications.timestamps.hoursAgo', { count: 1 }),
          siteSlug,
        },
      ]
    }

    return [
      {
        id: 'incident-enterprise-1',
        type: 'incident',
        title: t('topnav.notifications.enterprise.incident.title'),
        message: t('topnav.notifications.enterprise.incident.message'),
        timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 5 }),
      },
      {
        id: 'visitor-enterprise-1',
        type: 'visitor',
        title: t('topnav.notifications.enterprise.visitor.title'),
        message: t('topnav.notifications.enterprise.visitor.message'),
        timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 18 }),
      },
      {
        id: 'announcement-enterprise-1',
        type: 'announcement',
        title: t('topnav.notifications.enterprise.announcement.title'),
        message: t('topnav.notifications.enterprise.announcement.message'),
        timestamp: t('topnav.notifications.timestamps.today'),
      },
    ]
  }, [current, mode, t, user, language])

  const [notifications, setNotifications] = useState<Notification[]>(baseNotifications)

  useEffect(() => {
    setNotifications(baseNotifications)
  }, [baseNotifications])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const closeNotificationsMenu = useCallback(() => {
    setNotificationsAnchor(null)
  }, [])

  const getActionsForNotification = useCallback(
    (notification: Notification): NotificationAction[] => {
      const siteBase = notification.siteSlug ? `/site/${notification.siteSlug}` : '/admin'

      const goTo = (path: string) => {
        closeNotificationsMenu()
        navigate(path)
      }

      switch (notification.type) {
        case 'incident':
          return [
            {
              label: t('topnav.notifications.actions.reviewIncidentLog'),
              variant: 'contained',
              color: 'error',
              onClick: () => goTo(`${siteBase}/reports`),
            },
            {
              label: t('topnav.notifications.actions.markResolved'),
              color: 'inherit',
              onClick: () => {
                dismissNotification(notification.id)
                closeNotificationsMenu()
              },
            },
          ]
        case 'visitor':
          return [
            {
              label: t('topnav.notifications.actions.approveVisitor'),
              variant: 'contained',
              color: 'primary',
              onClick: () => {
                dismissNotification(notification.id)
                goTo(`${siteBase}/visits`)
              },
            },
            {
              label: t('topnav.notifications.actions.declineVisitor'),
              variant: 'outlined',
              color: 'warning',
              onClick: () => {
                dismissNotification(notification.id)
                closeNotificationsMenu()
              },
            },
          ]
        case 'announcement':
        default:
          return [
            {
              label: t('topnav.notifications.actions.readUpdate'),
              color: 'secondary',
              onClick: () => {
                dismissNotification(notification.id)
                closeNotificationsMenu()
                setOpenSettings(true)
              },
            },
          ]
      }
    },
    [closeNotificationsMenu, dismissNotification, navigate, setOpenSettings, t],
  )

  const unreadCount = notifications.length
  const hasCritical = notifications.some((notification) => notification.type === 'incident')

  const userInitials = useMemo(() => getUserInitials(user?.name ?? user?.email), [user])
  const accountDisplayName = user?.name ?? user?.email ?? t('topnav.accountMenu.defaultName')
  const accountRoleLabel = user?.role ? t(`roles.${user.role}`) : t('roles.guest')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!modeDialogOpen) {
      setSelectedMode(mode)
      setSelectedSiteSlug(current?.slug ?? sites[0]?.slug ?? '')
    }
  }, [modeDialogOpen, mode, current, sites])

  useEffect(() => {
    if (selectedMode === 'site' && !selectedSiteSlug && sites[0]) {
      setSelectedSiteSlug(sites[0].slug)
    }
  }, [selectedMode, selectedSiteSlug, sites])

  const appBarBackground = useMemo(() => {
    if (patternBackgroundSource === 'secondary') return theme.palette.secondary.main
    if (patternBackgroundSource === 'custom' && patternCustomColor) return patternCustomColor
    return theme.palette.primary.main
  }, [
    patternBackgroundSource,
    patternCustomColor,
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ])

  const clampedScale = useMemo(
    () => Math.max(8, Math.min(64, Math.round(patternScale || 28))),
    [patternScale],
  )
  const dotScale = useMemo(() => Math.max(6, Math.round(clampedScale / 4)), [clampedScale])

  const handleApplyMode = () => {
    if (selectedMode === 'enterprise') {
      setMode('enterprise')
      setModeDialogOpen(false)
      setDrawerOpen(false)
      navigate('/admin')
      return
    }

    const targetSite = sites.find((site) => site.slug === selectedSiteSlug) ?? sites[0]
    if (!targetSite) {
      return
    }

    setCurrent(targetSite)
    setMode('site')
    setModeDialogOpen(false)
    setDrawerOpen(false)
    navigate(`/site/${targetSite.slug}`)
  }

  const disableConfirm =
    selectedMode === 'site' &&
    (!selectedSiteSlug || !sites.some((site) => site.slug === selectedSiteSlug))

  return (
    <>
      <AppBar
        position="static"
        sx={(theme) => {
          const bg = appBarBackground
          let bgImage: string | undefined = undefined
          let bgSize: string | undefined = undefined
          if (patternEnabled && patternKind !== 'none') {
            const alphaVal = Math.max(0, Math.min(1, patternOpacity))
            if (patternKind === 'subtle-diagonal') {
              bgImage = `linear-gradient(135deg, ${alpha(theme.palette.getContrastText(bg), alphaVal)} 25%, transparent 25%, transparent 50%, ${alpha(theme.palette.getContrastText(bg), alphaVal)} 50%, ${alpha(theme.palette.getContrastText(bg), alphaVal)} 75%, transparent 75%, transparent)`
              bgSize = `${clampedScale}px ${clampedScale}px`
            } else if (patternKind === 'subtle-dots') {
              bgImage = `radial-gradient(${alpha(theme.palette.getContrastText(bg), alphaVal)} 1px, transparent 1px)`
              bgSize = `${dotScale}px ${dotScale}px`
            } else if (patternKind === 'geometry') {
              bgImage = `linear-gradient(45deg, ${alpha(theme.palette.getContrastText(bg), alphaVal)} 25%, transparent 25%), linear-gradient(-45deg, ${alpha(theme.palette.getContrastText(bg), alphaVal)} 25%, transparent 25%)`
              bgSize = `${clampedScale}px ${clampedScale}px`
            }
          }
          return {
            pl: 1,
            pt: 0.5,
            pb: 0.5,
            backgroundColor: bg,
            backgroundImage: bgImage,
            backgroundSize: bgSize,
            boxShadow: `0 2px 6px ${alpha(
              theme.palette.getContrastText(bg),
              theme.palette.mode === 'dark' ? 0.45 : 0.08,
            )}`,
            borderBottom: `1px solid ${alpha(
              theme.palette.getContrastText(bg),
              theme.palette.mode === 'dark' ? 0.02 : 0.04,
            )}`,
          }
        }}
      >
        <Toolbar
          sx={(theme) => ({
            alignItems: 'center',
            gap: 1,
            minHeight: 48,
            px: { xs: 1, sm: 2 },
            color: theme.palette.getContrastText(appBarBackground),
          })}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('topnav.drawer.openMenu')}
          >
            <MenuIcon />
          </IconButton>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box
              sx={(t) => ({
                width: 320,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: t.palette.background.paper,
              })}
            >
              <Box
                sx={{
                  px: 3,
                  pt: 3,
                  pb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.6)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: (t) => t.palette.primary.main,
                      color: (t) => t.palette.getContrastText(t.palette.primary.main),
                      fontWeight: 600,
                    }}
                  >
                    {userInitials}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {accountDisplayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {accountRoleLabel}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {t('topnav.workspace.focus')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                      label={
                        mode === 'enterprise'
                          ? t('topnav.workspace.mode.enterprise')
                          : t('topnav.workspace.mode.site')
                      }
                      size="small"
                      color={mode === 'enterprise' ? 'primary' : 'secondary'}
                    />
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<SwapHorizIcon fontSize="small" />}
                      onClick={() => setModeDialogOpen(true)}
                    >
                      {t('topnav.workspace.changeMode')}
                    </Button>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.75 }}
                  >
                    {mode === 'enterprise'
                      ? t('topnav.workspace.hints.enterprise')
                      : current
                        ? t('topnav.workspace.hints.site', { siteName: current.name })
                        : t('topnav.workspace.hints.empty')}
                  </Typography>
                </Box>
              </Box>

              <List
                component="nav"
                subheader={
                  <ListSubheader
                    component="div"
                    disableSticky
                    sx={{
                      px: 3,
                      py: 1.5,
                      typography: 'overline',
                      color: 'text.secondary',
                      letterSpacing: 0.8,
                    }}
                  >
                    {t('topnav.drawer.navigation')}
                  </ListSubheader>
                }
                sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}
              >
                {items.map((item) => {
                  const Icon = item.Icon
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(`${item.to}/`))
                  return (
                    <ListItemButton
                      key={item.to}
                      component={RouterLink}
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      selected={isActive}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        alignItems: 'flex-start',
                        px: 2,
                        py: 1.25,
                        transition: (t) =>
                          t.transitions.create(['background-color', 'transform'], {
                            duration: t.transitions.duration.shorter,
                          }),
                        ...(isActive
                          ? {
                              backgroundColor: (t) =>
                                alpha(
                                  t.palette.primary.main,
                                  t.palette.mode === 'dark' ? 0.25 : 0.12,
                                ),
                              color: 'primary.main',
                              '& .MuiListItemIcon-root': { color: 'primary.main' },
                            }
                          : {
                              color: 'text.primary',
                              '& .MuiListItemIcon-root': { color: 'text.secondary' },
                              '&:hover': {
                                backgroundColor: (t) => alpha(t.palette.primary.main, 0.08),
                              },
                            }),
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                    </ListItemButton>
                  )
                })}
              </List>

              <Box sx={{ px: 3, pb: 3, pt: 2, backgroundColor: 'background.default' }}>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setOpenSettings(true)
                      setDrawerOpen(false)
                    }}
                    sx={{ borderRadius: 1.5, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('topnav.drawer.workspaceSettings')}
                      primaryTypographyProps={{ fontSize: 13 }}
                    />
                  </ListItemButton>
                  <ListItemButton
                    component={RouterLink}
                    to="/billing"
                    onClick={() => setDrawerOpen(false)}
                    sx={{ borderRadius: 1.5, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                      <CreditCardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('topnav.drawer.billing')}
                      primaryTypographyProps={{ fontSize: 13 }}
                    />
                  </ListItemButton>
                </List>
                <Typography variant="caption" color="text.secondary">
                  {t('topnav.drawer.version', { version: 'v1.0.0', minutes: 4 })}
                </Typography>
              </Box>
            </Box>
          </Drawer>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{t('topnav.title')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (t) =>
                  alpha(t.palette.getContrastText(t.palette.background.paper), 0.08),
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: (t) => t.palette.getContrastText(t.palette.background.paper) }}
              >
                HX
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2">{t('topnav.title')}</Typography>
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: alpha(theme.palette.getContrastText(appBarBackground), 0.9),
                })}
              >
                {t('topnav.welcome')}
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              aria-label={t('topnav.notifications.aria')}
              onClick={(event) => setNotificationsAnchor(event.currentTarget)}
            >
              <Badge
                badgeContent={unreadCount}
                color={hasCritical ? 'error' : 'secondary'}
                invisible={unreadCount === 0}
              >
                <NotificationsNoneIcon sx={{ color: 'inherit' }} />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={(e) => setUserAnchor(e.currentTarget)}>
              {accountDisplayName}
            </Button>
            <Menu anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)}>
              <MenuItem component={RouterLink} to="/profile" onClick={() => setUserAnchor(null)}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                {t('topnav.accountMenu.profile')}
              </MenuItem>
              <MenuItem component={RouterLink} to="/billing" onClick={() => setUserAnchor(null)}>
                <ListItemIcon>
                  <CreditCardIcon fontSize="small" />
                </ListItemIcon>
                {t('topnav.accountMenu.billing')}
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserAnchor(null)
                  logout()
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('topnav.accountMenu.logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={closeNotificationsMenu}
          MenuListProps={{ disablePadding: true }}
          PaperProps={{
            sx: {
              width: 360,
              mt: 1,
              borderRadius: 2.5,
              boxShadow: (theme) => theme.shadows[8],
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="subtitle2">{t('topnav.notifications.menuTitle')}</Typography>
            {unreadCount > 0 ? (
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setNotifications([])
                  closeNotificationsMenu()
                }}
              >
                {t('topnav.notifications.markAllRead')}
              </Button>
            ) : null}
          </Box>
          <Divider />
          {unreadCount === 0 ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('topnav.notifications.empty')}
              </Typography>
            </Box>
          ) : (
            <MenuList disablePadding component="div">
              {notifications.map((notification, index) => {
                const actions = getActionsForNotification(notification)
                const lastItem = index === notifications.length - 1
                const chipColor =
                  notification.type === 'incident'
                    ? 'error'
                    : notification.type === 'visitor'
                      ? 'primary'
                      : 'secondary'
                const chipLabelKey =
                  notification.type === 'incident'
                    ? 'incident'
                    : notification.type === 'visitor'
                      ? 'visitor'
                      : 'announcement'

                return (
                  <Box key={notification.id} sx={{ px: 2.5, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        color={chipColor}
                        label={t(`topnav.notifications.chip.${chipLabelKey}`)}
                      />
                      <Typography variant="subtitle2" sx={{ flex: 1 }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1.25 }} color="text.secondary">
                      {notification.message}
                    </Typography>
                    {actions.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                        {actions.map((action) => (
                          <Button
                            key={action.label}
                            size="small"
                            variant={action.variant ?? 'text'}
                            color={action.color ?? 'primary'}
                            onClick={action.onClick}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    ) : null}
                    {lastItem ? null : <Divider sx={{ mt: 2, mb: -0.5 }} />}
                  </Box>
                )
              })}
            </MenuList>
          )}
        </Menu>
        <SettingsPage openProp={openSettings} onCloseProp={() => setOpenSettings(false)} />
      </AppBar>
      <ModeSwitchDialog
        open={modeDialogOpen}
        onClose={() => setModeDialogOpen(false)}
        selectedMode={selectedMode}
        onModeChange={(nextMode) => setSelectedMode(nextMode)}
        selectedSiteSlug={selectedSiteSlug}
        onSiteChange={(slug) => setSelectedSiteSlug(slug)}
        onConfirm={handleApplyMode}
        canSelectSite={sites.length > 0}
        disableConfirm={disableConfirm}
        sites={sites}
      />
    </>
  )
}

function ModeSwitchDialog({
  open,
  onClose,
  selectedMode,
  onModeChange,
  selectedSiteSlug,
  onSiteChange,
  onConfirm,
  canSelectSite,
  disableConfirm,
  sites,
}: {
  open: boolean
  onClose: () => void
  selectedMode: SiteMode
  onModeChange: (mode: SiteMode) => void
  selectedSiteSlug: string
  onSiteChange: (slug: string) => void
  onConfirm: () => void
  canSelectSite: boolean
  disableConfirm: boolean
  sites: Site[]
}) {
  const showSiteSelect = selectedMode === 'site'
  const { t } = useTranslate()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('topnav.modeDialog.title')}</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as SiteMode)}
        >
          <FormControlLabel
            value="enterprise"
            control={<Radio />}
            label={t('topnav.modeDialog.enterpriseOption')}
          />
          <FormControlLabel
            value="site"
            control={<Radio />}
            label={t('topnav.modeDialog.siteOption')}
            disabled={!canSelectSite}
          />
        </RadioGroup>
        {showSiteSelect ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label={t('topnav.modeDialog.selectSite')}
              value={selectedSiteSlug}
              onChange={(event) => onSiteChange(event.target.value)}
              fullWidth
              helperText={!canSelectSite ? t('topnav.modeDialog.noSites') : undefined}
            >
              {canSelectSite ? (
                sites.map((site) => (
                  <MenuItem key={site.slug} value={site.slug}>
                    {site.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  {t('topnav.modeDialog.noSites')}
                </MenuItem>
              )}
            </TextField>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={onConfirm} disabled={disableConfirm}>
          {t('common.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
