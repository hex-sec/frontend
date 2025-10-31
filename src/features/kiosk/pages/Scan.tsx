import { useState, useCallback } from 'react'
import { Paper, Typography, Stack, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { KioskCamera } from '../components/KioskCamera'
import { useKeyboardWedge } from '@features/shared/hooks/useKeyboardWedge'

/**
 * Kiosk Scan Page
 * QR code scanning with camera and keyboard wedge fallback
 * Auto-navigates to Confirm on code detection
 */
export default function Scan() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)

  const handleDetect = useCallback(
    (code: string) => {
      if (!code.trim()) return

      setScanning(false)
      // Navigate to confirm with code in query string
      navigate(`/kiosk/confirm?code=${encodeURIComponent(code.trim())}`)
    },
    [navigate],
  )

  // Handle keyboard wedge scanner (HID fallback)
  useKeyboardWedge(handleDetect, 120)

  const handleManualInput = () => {
    navigate('/kiosk/lookup')
  }

  const handleBack = () => {
    navigate('/kiosk/welcome')
  }

  return (
    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
        Escanea tu código
      </Typography>

      <Box sx={{ mb: 4 }}>
        <KioskCamera onDetect={handleDetect} scanning={scanning} />
      </Box>

      <Stack spacing={2} alignItems="center">
        <Button
          size="large"
          variant="outlined"
          onClick={handleManualInput}
          sx={{ minWidth: 250, py: 2, fontSize: '1.2rem' }}
        >
          No tengo código
        </Button>
        <Button size="large" variant="text" onClick={handleBack} sx={{ minWidth: 250, py: 1.5 }}>
          Volver
        </Button>
      </Stack>

      {!scanning && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Código detectado. Redirigiendo...
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
