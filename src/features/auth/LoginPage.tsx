import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuthStore, type LoginPayload } from '@app/auth/auth.store'
import { useNavigate, Link } from 'react-router-dom'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { useUserSettings } from '@app/hooks/useUserSettings'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(['admin', 'guard', 'resident']),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'resident' },
  })
  const { login } = useAuthStore()
  const user = useAuthStore((state) => state.user)
  const nav = useNavigate()
  const { load: loadUserSettings } = useUserSettings()

  const onSubmit = (data: Form) => {
    const normalizedEmail = data.email.trim().toLowerCase()
    const payload: LoginPayload = {
      email: normalizedEmail,
      role: data.role,
      id: `user:${normalizedEmail}`,
    }
    login(payload)
  }

  useEffect(() => {
    if (!user) return

    if (user.role === 'guard') {
      nav('/guard', { replace: true })
      return
    }

    if (user.role === 'resident') {
      nav('/app', { replace: true })
      return
    }

    const storedSettings = loadUserSettings()
    const preference = storedSettings?.landingPreference
    const rawTarget = preference?.target

    let target = buildEntityUrl('')

    if (rawTarget === 'sitesOverview') {
      target = buildEntityUrl('sites')
    } else if (rawTarget === 'site') {
      const slug = preference?.siteSlug?.trim()
      target = slug && slug.length > 0 ? siteRoot(slug) : buildEntityUrl('sites')
    }

    nav(target, { replace: true })
  }, [user, loadUserSettings, nav])

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Stack gap={2}>
            <Typography variant="h5">Iniciar sesión</Typography>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Email"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  type="password"
                  label="Contraseña"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField select label="Rol" {...field}>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="guard">Guardia (Kiosco)</MenuItem>
                  <MenuItem value="resident">Residente</MenuItem>
                </TextField>
              )}
            />
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>
              Entrar
            </Button>
            <Typography variant="body2">
              ¿No tienes cuenta? <Link to="/auth/register">Regístrate</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
