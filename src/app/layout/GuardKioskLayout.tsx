import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Stack,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
} from '@mui/material'
import { useEffect, useState } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LoginIcon from '@mui/icons-material/Login'
import PeopleIcon from '@mui/icons-material/People'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HistoryIcon from '@mui/icons-material/History'
import MenuIcon from '@mui/icons-material/Menu'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useThemeStore } from '@store/theme.store'
import { useAuthStore } from '@app/auth/auth.store'
import { scrollWindowToTop } from './scrollToTop'
import { OfflineQueueIndicator } from '@features/shared/components/OfflineQueueIndicator'
import { useOfflineQueue } from '@features/guard/hooks/useOfflineQueue'

const DRAWER_WIDTH = 280

const navItems = [
  { label: 'Dashboard', path: '/guard', icon: DashboardIcon },
  { label: 'Control de Acceso', path: '/guard/access', icon: LoginIcon },
  { label: 'Visitantes', path: '/guard/visitors', icon: PeopleIcon },
  { label: 'Paquetes', path: '/guard/parcels', icon: LocalShippingIcon },
  { label: 'Incidentes', path: '/guard/incidents', icon: ReportProblemIcon },
  { label: 'Turno', path: '/guard/shift', icon: AccessTimeIcon },
  { label: 'Registro', path: '/guard/log', icon: HistoryIcon },
]

export default function GuardKioskLayout() {
  const { setKind } = useThemeStore()
  const { logout, user, currentSite } = useAuthStore()
  const nav = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { replay } = useOfflineQueue()

  useEffect(() => {
    setKind('high-contrast')
  }, [setKind])

  useEffect(() => {
    scrollWindowToTop()
  }, [location.pathname, location.search])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box>
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Guardia
        </Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={() => setMobileOpen(false)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon color={isActive ? 'inherit' : 'action'} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentSite?.name || 'Sitio'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 2 }}>
            <Typography variant="body2">{currentTime.toLocaleTimeString()}</Typography>
            <Badge color={isOnline ? 'success' : 'error'} variant="dot">
              <Typography variant="caption" sx={{ ml: 1 }}>
                {isOnline ? 'En línea' : 'Sin conexión'}
              </Typography>
            </Badge>
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => nav('/guard/shift')}
            sx={{ mr: 1 }}
          >
            Cambio de turno
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              logout()
              nav('/auth/login')
            }}
            startIcon={<ExitToAppIcon />}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        role="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 7, md: 8 },
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Sesión: {user?.email} ({user?.role})
        </Typography>
        <OfflineQueueIndicator onReplay={replay} />
        <Outlet />
      </Box>
    </Box>
  )
}
