import { useState } from 'react'
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Card,
  CardContent,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuthStore } from '@app/auth/auth.store'

/**
 * Shift Page
 * Checklist for shift open/close, digital signature/PIN, and shift summary
 */
export default function Shift() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [checklist, setChecklist] = useState({
    gateSecured: false,
    camerasChecked: false,
    visitorLogsComplete: false,
    incidentsReported: false,
    keysReturned: false,
  })
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allChecked = Object.values(checklist).every((v) => v)

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    if (!allChecked) {
      alert('Por favor complete todos los items del checklist')
      return
    }

    if (!signature.trim()) {
      alert('Por favor ingrese su firma o PIN')
      return
    }

    setIsSubmitting(true)
    // TODO: Submit shift data to API
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Turno registrado exitosamente')
      navigate('/guard/dashboard')
    }, 1000)
  }

  const checklistItems = [
    { key: 'gateSecured' as const, label: 'Puerta principal asegurada' },
    { key: 'camerasChecked' as const, label: 'Cámaras verificadas' },
    { key: 'visitorLogsComplete' as const, label: 'Registros de visitantes completos' },
    { key: 'incidentsReported' as const, label: 'Incidentes reportados' },
    { key: 'keysReturned' as const, label: 'Llaves devueltas' },
  ]

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        Gestión de Turno
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Checklist de Cierre/Apertura
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {checklistItems.map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Checkbox
                      checked={checklist[item.key]}
                      onChange={() => handleChecklistChange(item.key)}
                    />
                  }
                  label={item.label}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Firma Digital / PIN
            </Typography>
            <TextField
              label="Ingrese su firma o PIN"
              type="password"
              fullWidth
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!allChecked || !signature.trim() || isSubmitting}
            startIcon={<CheckCircleIcon />}
            fullWidth
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Turno'}
          </Button>
        </Stack>
      </Paper>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <AccessTimeIcon color="primary" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Resumen del Turno
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Guardia: {user?.name || user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
