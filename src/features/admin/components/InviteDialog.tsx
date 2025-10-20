import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { InviteInput, Site } from '../sites.types'

const schema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'subadmin', 'guard', 'resident']),
})

type Props = {
  open: boolean
  site?: Site
  onClose: () => void
  onSubmit: (data: InviteInput) => Promise<void> | void
  isLoading?: boolean
}

export function InviteDialog({ open, site, onClose, onSubmit, isLoading }: Props) {
  const { control, handleSubmit } = useForm<InviteInput>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'admin' },
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Invitar usuario</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Site: <b>{site?.name ?? '—'}</b>
        </Typography>
        <Stack gap={2}>
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
            name="role"
            control={control}
            render={({ field }) => (
              <TextField select label="Rol" {...field}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="subadmin">Sub-Admin</MenuItem>
                <MenuItem value="guard">Guard</MenuItem>
                <MenuItem value="resident">Resident</MenuItem>
              </TextField>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? 'Enviando…' : 'Enviar invitación'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
