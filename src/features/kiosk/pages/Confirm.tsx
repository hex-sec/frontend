import { useState } from 'react'
import {
  Paper,
  Typography,
  Button,
  Stack,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { checkAccess } from '@features/guard/api/access.api'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

/**
 * Kiosk Confirm Page
 * Shows summary of destination/visit info with terms acceptance
 */
export default function Confirm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const mutation = useMutation({
    mutationFn: () => checkAccess({ code: code || '', direction: 'in' }),
    onSuccess: () => {
      navigate('/kiosk/done')
    },
  })

  const handleContinue = () => {
    if (!acceptedTerms) {
      alert('Debe aceptar los términos para continuar')
      return
    }
    if (!code) {
      alert('Código no válido')
      return
    }
    mutation.mutate()
  }

  const handleCancel = () => {
    navigate('/kiosk/welcome')
  }

  // Mock visitor data (in real app, fetch from API using code)
  const visitorData = {
    name: 'Juan Pérez',
    host: 'Residente A',
    unit: 'UNIT-101',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 4 }}>
        Confirmar Acceso
      </Typography>

      {code && (
        <Card sx={{ mb: 3, textAlign: 'left' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{visitorData.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visitante
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HomeIcon color="action" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Anfitrión: {visitorData.host}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {visitorData.unit}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Válido hasta:
                </Typography>
                <Typography variant="body2">
                  {new Date(visitorData.validUntil).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          Términos y Condiciones:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Debe respetar las reglas de la propiedad • El acceso es válido solo durante el período
          indicado • Debe registrarse al salir • El anfitrión es responsable de sus visitantes
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              size="large"
            />
          }
          label={<Typography variant="body1">Acepto los términos y condiciones</Typography>}
        />
      </Box>

      {mutation.error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {mutation.error instanceof Error ? mutation.error.message : 'Error al confirmar acceso'}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button
          size="large"
          variant="contained"
          onClick={handleContinue}
          disabled={!acceptedTerms || !code || mutation.isPending}
          startIcon={<CheckCircleIcon />}
          sx={{ py: 2, fontSize: '1.2rem' }}
          fullWidth
        >
          {mutation.isPending ? 'Confirmando...' : 'Continuar'}
        </Button>
        <Button
          size="large"
          variant="outlined"
          onClick={handleCancel}
          disabled={mutation.isPending}
          sx={{ py: 2, fontSize: '1.2rem' }}
          fullWidth
        >
          Cancelar
        </Button>
      </Stack>
    </Paper>
  )
}
