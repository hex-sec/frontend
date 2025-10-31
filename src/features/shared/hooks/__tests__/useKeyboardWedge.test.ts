import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardWedge } from '../useKeyboardWedge'

describe('useKeyboardWedge', () => {
  let onScanCallback: (value: string) => void

  beforeEach(() => {
    onScanCallback = vi.fn()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should detect a complete scan when Enter is pressed after characters', () => {
    renderHook(() => useKeyboardWedge(onScanCallback, 120))

    // Simulate rapid character inputs (as scanner would send)
    act(() => {
      const chars = 'ABC123'
      chars.split('').forEach((char) => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
          }),
        )
        vi.advanceTimersByTime(10) // Simulate 10ms between keystrokes
      })
    })

    // Send Enter
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
    })

    expect(onScanCallback).toHaveBeenCalledTimes(1)
    expect(onScanCallback).toHaveBeenCalledWith('ABC123')
  })

  it('should reset buffer if too much time passes between keystrokes', () => {
    renderHook(() => useKeyboardWedge(onScanCallback, 120))

    // Type first character
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'A',
          bubbles: true,
        }),
      )
      vi.advanceTimersByTime(150) // Wait longer than timeout
    })

    // Type second character after timeout
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'B',
          bubbles: true,
        }),
      )
      vi.advanceTimersByTime(10)
    })

    // Send Enter - should only contain 'B'
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
    })

    expect(onScanCallback).toHaveBeenCalledWith('B')
    expect(onScanCallback).not.toHaveBeenCalledWith('AB')
  })

  it('should ignore modifier keys', () => {
    renderHook(() => useKeyboardWedge(onScanCallback, 120))

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'A',
          ctrlKey: true,
          bubbles: true,
        }),
      )
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'B',
          bubbles: true,
        }),
      )
      vi.advanceTimersByTime(10)
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
    })

    // Should only have 'B' since Ctrl+A should be ignored
    expect(onScanCallback).toHaveBeenCalledWith('B')
  })

  it('should not call onScan if buffer is empty', () => {
    renderHook(() => useKeyboardWedge(onScanCallback, 120))

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
    })

    expect(onScanCallback).not.toHaveBeenCalled()
  })

  it('should handle multiple rapid scans', () => {
    renderHook(() => useKeyboardWedge(onScanCallback, 120))

    // First scan
    act(() => {
      'ABC'.split('').forEach((char) => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
          }),
        )
        vi.advanceTimersByTime(10)
      })
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
      vi.advanceTimersByTime(200) // Wait between scans
    })

    // Second scan
    act(() => {
      'XYZ'.split('').forEach((char) => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
          }),
        )
        vi.advanceTimersByTime(10)
      })
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      )
    })

    expect(onScanCallback).toHaveBeenCalledTimes(2)
    expect(onScanCallback).toHaveBeenNthCalledWith(1, 'ABC')
    expect(onScanCallback).toHaveBeenNthCalledWith(2, 'XYZ')
  })
})
