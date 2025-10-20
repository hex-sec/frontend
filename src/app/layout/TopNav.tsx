import { useState, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Badge from '@mui/material/Badge'
import { useAuthStore } from '@app/auth/auth.store'
import { useUIStore } from '@store/ui.store'
import SettingsPage from '@features/settings/SettingsPage'
import { useTranslate } from '../../i18n/useTranslate'
import { alpha, useTheme } from '@mui/material/styles'

type NavItem = { label: string; to: string }

const ROLE_NAV: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Sites', to: '/admin/sites' },
    { label: 'Users', to: '/admin/users' },
  ],
  guard: [{ label: 'Kiosk', to: '/guard' }],
  resident: [{ label: 'Home', to: '/app' }],
}

export default function TopNav() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslate()
  const patternEnabled = useUIStore((s) => s.patternEnabled)
  const patternKind = useUIStore((s) => s.patternKind)
  const patternOpacity = useUIStore((s) => s.patternOpacity)
  const patternBackgroundSource = useUIStore((s) => s.patternBackgroundSource)
  const patternCustomColor = useUIStore((s) => s.patternCustomColor)
  const patternScale = useUIStore((s) => s.patternScale)
  // previously used for a Menu anchor; now replaced by a Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const openSettings = useUIStore((s) => s.openSettings)
  const setOpenSettings = useUIStore((s) => s.setOpenSettings)
  const theme = useTheme()

  const items = useMemo<NavItem[]>(() => {
    if (!user) return []
    const key = user.role as keyof typeof ROLE_NAV
    return ROLE_NAV[key] ?? []
  }, [user])

  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null)

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

  return (
    <AppBar
      position="static"
      sx={(theme) => {
        const bg = appBarBackground
        let bgImage = undefined
        let bgSize = undefined
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
          // subtle bottom lip to separate the topbar from content (use theme-aware contrast)
          boxShadow: `0 2px 6px ${alpha(theme.palette.getContrastText(bg), theme.palette.mode === 'dark' ? 0.45 : 0.08)}`,
          // ensure the lip is visible even when background is flat
          borderBottom: `1px solid ${alpha(theme.palette.getContrastText(bg), theme.palette.mode === 'dark' ? 0.02 : 0.04)}`,
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
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box
            sx={(t) => ({
              width: 300,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              // use theme palette for consistent dark/light backgrounds
              background: `linear-gradient(180deg, ${alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 1 : 1)}, ${alpha(t.palette.background.default, 1)})`,
            })}
          >
            <Box>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: (t) => t.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: (t) => t.palette.getContrastText(t.palette.primary.main),
                  }}
                >
                  <AccountCircleIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {user?.name ?? user?.email ?? 'Cuenta'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role ?? 'Guest'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ px: 1, pb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', px: 1 }}>
                  Navigation
                </Typography>
              </Box>

              <List>
                {items.map((it) => {
                  // pick an icon based on the route
                  const icon = it.to.startsWith('/admin') ? (
                    <DashboardIcon />
                  ) : it.to.startsWith('/guard') ? (
                    <SecurityIcon />
                  ) : it.to === '/app' ? (
                    <HomeIcon />
                  ) : it.to === '/admin/users' ? (
                    <PeopleIcon />
                  ) : (
                    <HomeIcon />
                  )
                  return (
                    <ListItemButton
                      key={it.to}
                      component={RouterLink}
                      to={it.to}
                      onClick={() => setDrawerOpen(false)}
                      sx={{ '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>{icon}</ListItemIcon>
                      <ListItemText primary={it.label} />
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>

            <Box sx={{ p: 2 }}>
              <Divider sx={{ mb: 1 }} />
              <Box>
                <ListItemButton
                  onClick={() => {
                    setOpenSettings(true)
                    setDrawerOpen(false)
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ color: 'text.secondary' }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  v1.0.0
                </Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('topnav.title')}</Typography>
          {/* Breadcrumbs moved to the Theme editor page */}
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
              background: (t) => alpha(t.palette.getContrastText(t.palette.background.paper), 0.08),
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
          <Box sx={{ ml: 1 }} />
          <Badge badgeContent={3} color="error">
            <NotificationsNoneIcon sx={{ color: 'inherit' }} />
          </Badge>
          <Button color="inherit" onClick={(e) => setUserAnchor(e.currentTarget)}>
            {user?.name ?? user?.email ?? 'Cuenta'}
          </Button>
          <Menu anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)}>
            <MenuItem component={RouterLink} to="/profile" onClick={() => setUserAnchor(null)}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem component={RouterLink} to="/billing" onClick={() => setUserAnchor(null)}>
              <ListItemIcon>
                <CreditCardIcon fontSize="small" />
              </ListItemIcon>
              Billing
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
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <SettingsPage openProp={openSettings} onCloseProp={() => setOpenSettings(false)} />
    </AppBar>
  )
}
