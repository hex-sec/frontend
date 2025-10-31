import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface KioskCameraProps {
  onDetect: (code: string) => void
  scanning?: boolean
}

/**
 * Kiosk Camera Component
 * Uses ZXing BrowserMultiFormatReader for QR code scanning
 */
export function KioskCamera({ onDetect, scanning = true }: KioskCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!scanning) {
      // Stop scanning if disabled
      if (readerRef.current && videoRef.current) {
        readerRef.current.reset()
      }
      return
    }

    let active = true
    const reader = new BrowserMultiFormatReader()

    readerRef.current = reader

    const initializeCamera = async () => {
      try {
        setError(null)

        // List available video devices
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()

        if (devices.length === 0) {
          throw new Error('No se encontraron cámaras disponibles')
        }

        // Use first available device (or prefer back camera if available)
        const deviceId =
          devices.find((d) => d.label.toLowerCase().includes('back'))?.deviceId ||
          devices[0]?.deviceId

        if (!videoRef.current || !active) return

        // Start decoding from video device
        await reader.decodeFromVideoDevice(deviceId || null, videoRef.current, (result, err) => {
          if (!active) return

          if (err) {
            // Ignore NotFoundException (expected when no code is visible)
            if (err.name !== 'NotFoundException') {
              console.warn('ZXing decode error:', err)
            }
            return
          }

          if (result && active) {
            const text = result.getText()
            if (text) {
              onDetect(text)
            }
          }
        })

        if (active) {
          setIsInitialized(true)
        }
      } catch (err) {
        if (active) {
          let errorMessage = 'Error al inicializar la cámara'

          if (err instanceof Error) {
            // Handle common camera permission errors
            if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
              errorMessage =
                'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.'
            } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
              errorMessage = 'No se encontró ninguna cámara conectada.'
            } else if (err.name === 'NotReadableError' || err.message.includes('busy')) {
              errorMessage = 'La cámara está siendo usada por otra aplicación.'
            } else {
              errorMessage = err.message
            }
          }

          setError(errorMessage)
          console.error('Camera initialization error:', err)
        }
      }
    }

    initializeCamera()

    return () => {
      active = false
      if (readerRef.current) {
        readerRef.current.reset().catch(console.warn)
        readerRef.current = null
      }
    }
  }, [scanning, onDetect])

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }} role="alert" aria-live="polite">
        <Typography variant="body1" fontWeight={600} gutterBottom component="h2">
          Error de cámara
        </Typography>
        <Typography variant="body2" component="p">
          {error}
        </Typography>
        <Typography variant="caption" component="p" sx={{ mt: 1 }}>
          Puedes usar el buscador manual en su lugar.
        </Typography>
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        sx={{
          width: '100%',
          height: 'auto',
          display: 'block',
          transform: 'scaleX(-1)', // Mirror effect for better UX
        }}
      />
      {isInitialized && scanning && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      {!scanning && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <Typography variant="h6" color="white">
            Escaneo pausado
          </Typography>
        </Box>
      )}
    </Box>
  )
}
