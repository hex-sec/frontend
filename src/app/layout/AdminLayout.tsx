import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import { Box, Breadcrumbs, Link } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import TopNav from './TopNav'
import { useAuthStore } from '@app/auth/auth.store'

export default function AdminLayout() {
  useAuthStore()
  const loc = useLocation()
  const parts = loc.pathname.split('/').filter(Boolean)
  const crumbs = parts.map((p, i, arr) => ({ segment: p, to: '/' + arr.slice(0, i + 1).join('/') }))

  function getCrumbMeta(segment: string) {
    const s = segment.toLowerCase()
    switch (s) {
      case 'admin':
        return { label: 'Admin', Icon: DashboardIcon }
      case 'sites':
        return { label: 'Sites', Icon: DomainIcon }
      case 'users':
        return { label: 'Users', Icon: PeopleIcon }
      case 'residents':
        return { label: 'Residents', Icon: PersonIcon }
      case 'vehicles':
        return { label: 'Vehicles', Icon: DirectionsCarIcon }
      case 'policies':
        return { label: 'Policies', Icon: GavelIcon }
      case 'reports':
        return { label: 'Reports', Icon: BarChartIcon }
      default:
        return {
          label: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          Icon: undefined,
        }
    }
  }

  return (
    <Box>
      <TopNav />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            pl: 1,
            mb: 1,
          }}
        >
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link
              component={RouterLink}
              to="/"
              sx={{
                color: 'text.secondary',
                typography: 'caption',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <HomeIcon fontSize="small" />
              <Box component="span">Inicio</Box>
            </Link>
            {crumbs.map((c) => {
              const meta = getCrumbMeta(c.segment)
              const Icon = meta.Icon
              return (
                <Link
                  key={c.to}
                  component={RouterLink}
                  to={c.to}
                  sx={{
                    color: 'text.secondary',
                    typography: 'caption',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {Icon ? <Icon fontSize="small" /> : null}
                  {meta.label}
                </Link>
              )
            })}
          </Breadcrumbs>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
