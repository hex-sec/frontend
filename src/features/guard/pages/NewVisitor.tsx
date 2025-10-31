import { useState } from 'react'
import { Paper, Typography, Stack, TextField, Button, Box, Alert } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import QRCode from 'qrcode'
import { useMutation } from '@tanstack/react-query'
import { createVisitor } from '../api/visitors.api'
import { NewVisitorSchema, type NewVisitorInput } from './NewVisitor.schema'

/**
 * New Visitor Page
 * Form with Zod validation, QR code generation, and print option
 */
export default function NewVisitor() {
  const navigate = useNavigate()
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [photoDataUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewVisitorInput>({
    resolver: zodResolver(NewVisitorSchema),
    defaultValues: {
      name: '',
      hostResidentId: '',
      reason: '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
      photoDataUrl: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: (data) => {
      // Generate QR code from the returned visitor code
      QRCode.toDataURL(data.code)
        .then((url) => setQrCodeUrl(url))
        .catch(console.error)
    },
  })

  const onSubmit = async (data: NewVisitorInput) => {
    const payload = {
      name: data.name,
      hostResidentId: data.hostResidentId,
      reason: data.reason,
      validUntil: data.validUntil,
      photoDataUrl: photoDataUrl || undefined,
    }
    mutation.mutate(payload)
  }

  const handlePhotoCapture = () => {
    // TODO: Implement camera capture
    // For now, stub
    alert('Funcionalidad de cámara próximamente')
  }

  const handlePrint = () => {
    if (qrCodeUrl) {
      window.print()
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        Nuevo Visitante
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nombre del visitante"
                  fullWidth
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="ID Anfitrión"
                  fullWidth
                  {...register('hostResidentId')}
                  error={!!errors.hostResidentId}
                  helperText={errors.hostResidentId?.message}
                  helperText={errors.hostResidentId?.message || 'ID del residente anfitrión'}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Motivo de la visita"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('reason')}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Válido hasta"
                  type="datetime-local"
                  fullWidth
                  {...register('validUntil')}
                  error={!!errors.validUntil}
                  helperText={errors.validUntil?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handlePhotoCapture}
                  sx={{ height: '100%' }}
                >
                  Capturar Foto (opcional)
                </Button>
              </Grid>
            </Grid>

            {photoDataUrl && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}
                >
                  Foto capturada:
                </Typography>
                <Box
                  component="img"
                  src={photoDataUrl}
                  alt="Visitante"
                  sx={{
                    maxWidth: 200,
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}

            {mutation.error && (
              <Alert severity="error">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Error al crear visitante'}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={mutation.isPending} fullWidth>
                {mutation.isPending ? 'Creando...' : 'Crear Visitante'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/guard/visitors')} fullWidth>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {mutation.data && qrCodeUrl && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Pase de Visitante Generado
          </Typography>
          <Box
            component="img"
            src={qrCodeUrl}
            alt="QR Code"
            sx={{
              maxWidth: 300,
              maxHeight: 300,
              mx: 'auto',
              my: 2,
              display: 'block',
            }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Código: {mutation.data.code}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Válido hasta: {new Date(mutation.data.validUntil).toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handlePrint}>
              Imprimir
            </Button>
            <Button variant="outlined" onClick={() => navigate('/guard/visitors')}>
              Volver a Visitantes
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
