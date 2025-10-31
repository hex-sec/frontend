import { useState, useEffect } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { offlineDB } from '../offline/db'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import SyncIcon from '@mui/icons-material/Sync'

interface OfflineQueueIndicatorProps {
  onReplay?: () => void
}

/**
 * Offline Queue Indicator
 * Shows pending items count and replay status
 */
export function OfflineQueueIndicator({ onReplay }: OfflineQueueIndicatorProps) {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isReplaying, setIsReplaying] = useState(false)

  const updateCount = async () => {
    const count = await offlineDB.outbox.count()
    setPendingCount(count)
  }

  useEffect(() => {
    updateCount()

    // Poll for updates every 2 seconds
    const interval = setInterval(updateCount, 2000)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleReplay = async () => {
    if (!isOnline || isReplaying) return
    setIsReplaying(true)
    try {
      onReplay?.()
      // Wait a bit for replay to process
      await new Promise((resolve) => setTimeout(resolve, 500))
      await updateCount()
    } finally {
      setIsReplaying(false)
    }
  }

  if (!isOnline) {
    return (
      <Alert
        severity="warning"
        icon={<CloudOffIcon />}
        action={
          <Button color="inherit" size="small" disabled>
            Sin conexión
          </Button>
        }
      >
        {pendingCount > 0
          ? `${pendingCount} solicitud(es) en cola. Se enviarán al reconectar.`
          : 'Sin conexión a internet'}
      </Alert>
    )
  }

  if (pendingCount === 0) {
    return null
  }

  return (
    <Alert
      severity="info"
      icon={<SyncIcon />}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleReplay}
          disabled={isReplaying}
          startIcon={<SyncIcon />}
        >
          {isReplaying ? 'Enviando...' : 'Enviar ahora'}
        </Button>
      }
      sx={{ mb: 2 }}
    >
      <Typography variant="body2">{pendingCount} solicitud(es) pendiente(s) de envío</Typography>
    </Alert>
  )
}
