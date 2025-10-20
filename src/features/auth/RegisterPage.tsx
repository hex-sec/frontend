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
import { useNavigate, Link } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'guard', 'resident']),
})
type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'resident' },
  })
  const nav = useNavigate()

  const onSubmit = (_data: Form) => {
    // Aquí iría el POST /register real
    console.log(_data) // Fixed typo in variable name
    nav('/auth/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: 480 }}>
        <CardContent>
          <Stack gap={2}>
            <Typography variant="h5">Registro</Typography>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Nombre"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
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
              Crear cuenta
            </Button>
            <Typography variant="body2">
              ¿Ya tienes cuenta? <Link to="/auth/login">Inicia sesión</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
