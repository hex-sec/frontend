import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateSiteInput } from '../sites.types'
import type { SitePlan } from '../sites.types'
import { PLAN_OPTIONS } from '../sites.constants'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z
    .string()
    .min(2, 'Slug requerido')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
})

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateSiteInput) => Promise<void> | void
  isLoading?: boolean
}

export function SiteFormDialog({ open, onClose, onSubmit, isLoading }: Props) {
  const { control, handleSubmit } = useForm<CreateSiteInput>({
    resolver: zodResolver(schema),
    defaultValues: { plan: 'free' },
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Site</DialogTitle>
      <DialogContent dividers>
        <Stack gap={2} sx={{ mt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Nombre del Site"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Slug (subdominio)"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <TextField select label="Plan" {...field}>
                {PLAN_OPTIONS.map((p: SitePlan) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? 'Creando…' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
