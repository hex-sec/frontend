import { CircularProgress, Backdrop, Typography } from '@mui/material'

interface BusyOverlayProps {
  open: boolean
  message?: string
  zIndex?: number
}

/**
 * Busy Overlay Component
 * Shows a loading overlay when an operation is in progress
 */
export function BusyOverlay({ open, message, zIndex = 1300 }: BusyOverlayProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress color="inherit" />
      {message && (
        <Typography variant="h6" color="inherit">
          {message}
        </Typography>
      )}
    </Backdrop>
  )
}
