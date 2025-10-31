import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useI18nStore } from '@store/i18n.store'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

/**
 * Kiosk Welcome Page
 * Entry point with language selector and large buttons for accessibility
 */
export default function Welcome() {
  const navigate = useNavigate()
  const { language, setLanguage } = useI18nStore()
  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ]

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        maxWidth: 800,
        mx: 'auto',
        borderRadius: 4,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Idioma / Language</InputLabel>
          <Select
            value={language}
            label="Idioma / Language"
            onChange={(e) => setLanguage(e.target.value)}
            sx={{ fontSize: '1.2rem' }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h2" fontWeight={700} sx={{ mb: 4 }}>
        Bienvenido
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Seleccione una opción
      </Typography>

      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 500, mx: 'auto' }}>
        <Button
          size="large"
          variant="contained"
          onClick={() => navigate('/kiosk/scan')}
          sx={{
            minWidth: 300,
            py: 3,
            fontSize: '1.5rem',
            fontWeight: 600,
            borderRadius: 3,
          }}
          fullWidth
        >
          Tengo QR
        </Button>
        <Button
          size="large"
          variant="outlined"
          onClick={() => navigate('/kiosk/lookup')}
          sx={{
            minWidth: 300,
            py: 3,
            fontSize: '1.5rem',
            fontWeight: 600,
            borderRadius: 3,
          }}
          fullWidth
        >
          No tengo QR
        </Button>
        <Button
          size="large"
          variant="text"
          startIcon={<LocalShippingIcon />}
          onClick={() => {
            // TODO: Navigate to parcel delivery page if implemented
            alert('Funcionalidad de entrega de paquetes próximamente')
          }}
          sx={{
            minWidth: 300,
            py: 2,
            fontSize: '1.2rem',
            mt: 2,
          }}
          fullWidth
        >
          Entrega de Paquete
        </Button>
      </Stack>
    </Paper>
  )
}
