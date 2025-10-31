import { useState, useEffect } from 'react'
import { Paper, Typography, Stack, Chip, Box, IconButton, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'

interface ScannerDebugInfoProps {
  onClose?: () => void
  show?: boolean
}

/**
 * Scanner Debug Info Component
 * Shows real-time scanner input debug information
 */
export function ScannerDebugInfo({ onClose, show = false }: ScannerDebugInfoProps) {
  const [recentScans, setRecentScans] = useState<Array<{ code: string; timestamp: number }>>([])
  const [keyBuffer, setKeyBuffer] = useState('')

  useEffect(() => {
    if (!show) return

    let buffer = ''
    let lastKeyTime = 0
    const scans: Array<{ code: string; timestamp: number }> = []

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()

      // Reset buffer if too much time passed (scanner typically sends codes very fast)
      if (lastKeyTime && now - lastKeyTime > 120) {
        buffer = ''
      }

      lastKeyTime = now

      if (e.key === 'Enter') {
        if (buffer.trim()) {
          scans.push({ code: buffer.trim(), timestamp: now })
          setRecentScans((prev) => [{ code: buffer.trim(), timestamp: now }, ...prev].slice(0, 10))
          buffer = ''
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        buffer += e.key
      }

      setKeyBuffer(buffer)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show])

  if (!show) return null

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: 'info.light',
        position: 'fixed',
        bottom: 16,
        right: 16,
        maxWidth: 400,
        zIndex: 9999,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Scanner Debug Info
            </Typography>
          </Stack>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Current Buffer:
          </Typography>
          <Chip
            label={keyBuffer || '(empty)'}
            size="small"
            color={keyBuffer ? 'primary' : 'default'}
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Recent Scans ({recentScans.length}):
          </Typography>
          <Stack spacing={1}>
            {recentScans.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No scans detected yet
              </Typography>
            ) : (
              recentScans.map((scan, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={scan.code}
                    size="small"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </Typography>
                </Stack>
              ))
            )}
          </Stack>
        </Box>

        <Tooltip title="Scanner should send rapid keystrokes followed by Enter">
          <Typography variant="caption" color="text.secondary">
            💡 Scan a code with your hand scanner to see it here
          </Typography>
        </Tooltip>
      </Stack>
    </Paper>
  )
}
