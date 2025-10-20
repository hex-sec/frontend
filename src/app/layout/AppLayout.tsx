import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Box, Button, Stack } from '@mui/material'
import { useAuthStore } from '@app/auth/auth.store'

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const nav = useNavigate()
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HEX Portal
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={Link} to="/app">
              Inicio
            </Button>
            <Button
              color="inherit"
              onClick={() => {
                logout()
                nav('/auth/login')
              }}
            >
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Sesión: {user?.email} ({user?.role})
        </Typography>
        <Outlet />
      </Box>
    </Box>
  )
}
