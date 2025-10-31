import { useEffect, useRef } from 'react'

/**
 * Hook for handling keyboard wedge scanner input
 * Detects rapid sequential keystrokes followed by Enter as a scanned code
 * Shared by Guard and Kiosk modules
 *
 * @param onScan - Callback when a complete code is scanned (after Enter)
 * @param timeout - Maximum time between keystrokes to consider as same scan (ms)
 */
export function useKeyboardWedge(onScan: (value: string) => void, timeout = 120): void {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()

      // Reset buffer if too much time passed since last key
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > timeout) {
        bufferRef.current = ''
      }

      lastKeyTimeRef.current = now

      if (e.key === 'Enter') {
        const value = bufferRef.current.trim()
        bufferRef.current = ''
        if (value) {
          console.log('[Scanner] Detected code:', value)
          onScan(value)
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only accumulate printable characters (ignore modifiers)
        bufferRef.current += e.key
        console.log('[Scanner] Buffer:', bufferRef.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onScan, timeout])
}
