import { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Stack,
  Button,
  LinearProgress,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkAccess } from '../api/access.api'
import { useKeyboardWedge } from '@features/shared/hooks/useKeyboardWedge'
import { useAccessEvents } from '../hooks/useAccessEvents'
import { useOfflineQueue } from '../hooks/useOfflineQueue'
import { AccessResultCard } from '../components/AccessResultCard'
import { LiveFeed } from '../components/LiveFeed'
import { OfflineQueueIndicator } from '@features/shared/components/OfflineQueueIndicator'
import { useToast } from '@features/shared/components/ToastProvider'
import { ScannerDebugInfo } from '@features/shared/components/ScannerDebugInfo'
import { useGuardUIStore } from '../store/guard.ui.store'

/**
 * Access Control Page
 * Universal input for QR/RFID/plate scanning with keyboard wedge support
 * Includes offline queue, access check mutation, and live feed
 */
export default function Access() {
  const [code, setCode] = useState('')
  const [showDebug, setShowDebug] = useState(false)
  const queryClient = useQueryClient()
  const { enqueue, replay, pendingCount } = useOfflineQueue()
  const { showSuccess, showError } = useToast()
  const { accessDirection, setAccessDirection } = useGuardUIStore()
  const { data: events, isLoading: eventsLoading } = useAccessEvents(50, 4000)

  const mutation = useMutation({
    mutationFn: checkAccess,
    onSuccess: () => {
      // Invalidate and refetch access events
      queryClient.invalidateQueries({ queryKey: ['access', 'events'] })
      setCode('')
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Error al verificar acceso')
    },
  })

  // Handle keyboard wedge scanner input
  useKeyboardWedge((scannedValue) => {
    handleSubmit(scannedValue, accessDirection)
  }, 120)

  async function handleSubmit(value: string, direction: 'in' | 'out') {
    if (!value.trim()) return

    // Normalize scanner input: replace apostrophe/single quote with hyphen
    // Some scanners output ' instead of - (e.g., DRV'2045 instead of DRV-2045)
    const normalizedValue = value.trim().replace(/'/g, '-')
    const trimmedValue = normalizedValue.trim()

    // If offline, enqueue the request
    if (!navigator.onLine) {
      try {
        await enqueue({
          id: crypto.randomUUID(),
          endpoint: '/access/check',
          method: 'POST',
          body: { code: trimmedValue, direction },
          idempotencyKey: `check.${trimmedValue}.${direction}.${Date.now()}`,
        })
        showSuccess('Solicitud guardada. Se enviará cuando se restaure la conexión.')
        setCode('')
      } catch (error) {
        console.error('Failed to enqueue request:', error)
        showError('Error al guardar la solicitud. Por favor, intente nuevamente.')
      }
      return
    }

    // Online: execute mutation
    mutation.mutate({ code: trimmedValue, direction })
    setCode('')
  }

  const handleDirectionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDirection: 'in' | 'out' | null,
  ) => {
    if (newDirection !== null) {
      setAccessDirection(newDirection)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        Control de Acceso
      </Typography>

      {/* Offline Queue Indicator */}
      {(pendingCount > 0 || !navigator.onLine) && <OfflineQueueIndicator onReplay={replay} />}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <ToggleButtonGroup
            value={accessDirection}
            exclusive
            onChange={handleDirectionChange}
            aria-label="dirección de acceso"
            fullWidth
          >
            <ToggleButton value="in" aria-label="entrada">
              Entrar
            </ToggleButton>
            <ToggleButton value="out" aria-label="salida">
              Salir
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            autoFocus
            label="Escanea o escribe código"
            placeholder="QR, RFID, o placa"
            value={code}
            onChange={(e) => {
              // Normalize: replace apostrophe with hyphen and uppercase
              const normalized = e.target.value.replace(/'/g, '-').toUpperCase()
              setCode(normalized)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && code.trim()) {
                handleSubmit(code, accessDirection)
              } else if (e.key === 'Escape') {
                setCode('')
              }
            }}
            aria-label="Código de acceso"
            aria-describedby="code-helper-text"
            fullWidth
            inputProps={{
              style: { fontSize: 24, letterSpacing: 2 },
            }}
            helperText={
              !navigator.onLine
                ? 'Sin conexión. La solicitud se enviará cuando se restaure la conexión.'
                : 'Presiona Enter o escanea con el lector'
            }
            id="code-helper-text"
            error={!navigator.onLine}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => handleSubmit(code, 'in')}
              disabled={!code.trim() || mutation.isPending}
              fullWidth
              size="large"
              aria-label="Entrar con código"
            >
              Entrar
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSubmit(code, 'out')}
              disabled={!code.trim() || mutation.isPending}
              fullWidth
              size="large"
              aria-label="Salir con código"
            >
              Salir
            </Button>
          </Stack>

          {mutation.isPending && <LinearProgress />}
          {mutation.error && (
            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                Error:{' '}
                {mutation.error instanceof Error ? mutation.error.message : 'Error desconocido'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {mutation.data && (
        <AccessResultCard
          data={mutation.data}
          showActions={false} // Adjust based on requirements
        />
      )}

      <LiveFeed items={events ?? []} title="Eventos Recientes" isLoading={eventsLoading} />

      {eventsLoading && <LinearProgress />}

      {/* Test Codes Helper - Development Only */}
      {((import.meta as { env?: { DEV?: boolean } }).env?.DEV ||
        process.env.NODE_ENV === 'development') && (
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Test Codes for Scanner:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="QRC-4812"
              size="small"
              onClick={() => setCode('QRC-4812')}
              clickable
              color="success"
              title="Hannah Lee - Visitor (from VisitsPage)"
            />
            <Chip
              label="DRV-2045"
              size="small"
              onClick={() => setCode('DRV-2045')}
              clickable
              color="info"
              title="Paco & Sons Delivery (from VisitsPage)"
            />
            <Chip
              label="EVT-8801"
              size="small"
              onClick={() => setCode('EVT-8801')}
              clickable
              color="secondary"
              title="Michelle Ortega - Event (from VisitsPage)"
            />
            <Chip
              label="DEN-1944"
              size="small"
              onClick={() => setCode('DEN-1944')}
              clickable
              color="error"
              title="Cesar Ramirez - Denied (from VisitsPage)"
            />
            <Chip
              label="PEN-3920"
              size="small"
              onClick={() => setCode('PEN-3920')}
              clickable
              color="warning"
              title="Maria Gutierrez - Pending (from VisitsPage)"
            />
            <Chip label="RFID-1234" size="small" onClick={() => setCode('RFID-1234')} clickable />
            <Chip
              label="TEST-OK"
              size="small"
              onClick={() => setCode('TEST-OK')}
              clickable
              color="success"
            />
            <Chip
              label="TEST-DENIED"
              size="small"
              onClick={() => setCode('TEST-DENIED')}
              clickable
              color="error"
            />
            <Chip label="GUARD-001" size="small" onClick={() => setCode('GUARD-001')} clickable />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Click a code above or scan with your hand scanner.
            <strong> All badge codes from VisitsPage</strong> are available: QRC-4812, DRV-2045,
            EVT-8801, DEN-1944, PEN-3920
          </Typography>
        </Paper>
      )}

      {/* Scanner Debug Info */}
      <ScannerDebugInfo show={showDebug} onClose={() => setShowDebug(false)} />

      {/* Debug Toggle Button - Development Only */}
      {((import.meta as { env?: { DEV?: boolean } }).env?.DEV ||
        process.env.NODE_ENV === 'development') && (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowDebug(!showDebug)}
          sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 9999 }}
        >
          {showDebug ? 'Hide' : 'Show'} Scanner Debug
        </Button>
      )}
    </Stack>
  )
}
