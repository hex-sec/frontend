import { Paper, Typography, Box } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

/**
 * Kiosk Done Page
 * Visual and audio confirmation with auto-redirect to Welcome
 */
export default function Done() {
  const navigate = useNavigate()

  useEffect(() => {
    // Play success sound
    try {
      // Use Web Audio API for beep sound (browser beep)
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (err) {
      console.warn('Audio playback not supported:', err)
    }

    // Visual confirmation pulse effect
    const pulseElement = document.querySelector('[data-pulse]')
    if (pulseElement) {
      pulseElement.classList.add('pulse')
    }

    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/kiosk/welcome')
    }, 5000)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate])

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 4,
      }}
    >
      <Box
        data-pulse
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'success.light',
          mb: 3,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.1)',
              opacity: 0.8,
            },
          },
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
      </Box>

      <Typography variant="h3" fontWeight={700} color="success.main" sx={{ mb: 2 }}>
        Acceso Confirmado
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        ¡Bienvenido!
      </Typography>

      <Box
        sx={{
          bgcolor: 'background.default',
          borderRadius: 2,
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Redirigiendo a la pantalla principal en{' '}
          <Typography component="span" variant="body1" fontWeight={600} color="primary">
            5 segundos
          </Typography>
        </Typography>
      </Box>
    </Paper>
  )
}
