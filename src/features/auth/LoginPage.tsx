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
import { useAuthStore } from '@app/auth/auth.store'
import { useNavigate, Link } from 'react-router-dom'

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
  const nav = useNavigate()

  const onSubmit = (data: Form) => {
    login({ email: data.email, role: data.role })
    if (data.role === 'admin') nav('/admin')
    else if (data.role === 'guard') nav('/guard')
    else nav('/app')
  }

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
