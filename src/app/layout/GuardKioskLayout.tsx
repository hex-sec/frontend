import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useThemeStore } from '@store/theme.store'
import { useAuthStore } from '@app/auth/auth.store'

export default function GuardKioskLayout() {
  const { setKind } = useThemeStore()
  const { logout, user } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => {
    setKind('high-contrast')
  }, [setKind])

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          HEX Guardia (Kiosco)
        </Typography>
        <Button variant="outlined" size="large" component={Link} to="/guard">
          Inicio
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/guard/plates">
          Buscar Placas
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            logout()
            nav('/auth/login')
          }}
        >
          Salir
        </Button>
      </Stack>
      <Typography variant="caption">
        Sesión: {user?.email} ({user?.role})
      </Typography>
      <Outlet />
    </Box>
  )
}
