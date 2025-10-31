import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, ThemeProvider, CssBaseline } from '@mui/material'
import { kioskTheme } from './theme/kioskTheme'

/**
 * Kiosk Layout - Fullscreen mode with wake lock and blocked interactions
 * Per spec: wake lock, fullscreen, block context menu, optional pinch zoom disable
 */
export default function KioskLayout() {
  useEffect(() => {
    // Request wake lock to prevent screen sleep
    let wakeLock: WakeLockSentinel | null = null
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        // Graceful degradation: log warning but continue
        console.warn('Wake lock not supported or denied:', err)
      }
    }

    requestWakeLock()

    // Block context menu
    const blockContextMenu = (e: Event) => {
      e.preventDefault()
    }
    window.addEventListener('contextmenu', blockContextMenu)

    // Optional: disable pinch zoom (commented out by default)
    // const blockTouch = (e: TouchEvent) => {
    //   if (e.touches.length > 1) e.preventDefault()
    // }
    // window.addEventListener('touchstart', blockTouch, { passive: false })

    return () => {
      window.removeEventListener('contextmenu', blockContextMenu)
      // window.removeEventListener('touchstart', blockTouch)
      if (wakeLock) {
        wakeLock.release().catch(console.warn)
      }
    }
  }, [])

  return (
    <ThemeProvider theme={kioskTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100dvh',
          width: '100vw',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </ThemeProvider>
  )
}
