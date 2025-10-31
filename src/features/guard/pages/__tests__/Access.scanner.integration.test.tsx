import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material'
import Access from '../Access'
import * as accessApi from '../../api/access.api'
import type { AccessEvent } from '@features/shared/types/access.types'

const theme = createTheme()

/**
 * Integration test for scanner input flow
 * Tests the complete flow: scan → submit → result display → feed update
 */
describe('Access Page - Scanner Integration', () => {
  let queryClient: QueryClient
  let mockCheckAccess: ReturnType<typeof vi.fn>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Mock the access API
    mockCheckAccess = vi.fn()
    vi.spyOn(accessApi, 'checkAccess').mockImplementation(
      mockCheckAccess as typeof accessApi.checkAccess,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('should handle scanner input flow: scan → submit → display result', async () => {
    const scannedCode = 'QR123456'
    const mockAccessEvent: AccessEvent = {
      id: 'event-1',
      at: new Date().toISOString(),
      direction: 'in',
      result: 'allowed',
      medium: 'qr',
      code: scannedCode,
      person: {
        id: 'person-1',
        name: 'John Doe',
        unit: 'A-101',
      },
    }

    mockCheckAccess.mockResolvedValue(mockAccessEvent)

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Access />
        </QueryClientProvider>
      </ThemeProvider>,
    )

    // Find the code input
    const codeInput = screen.getByLabelText(/código|code/i) as HTMLInputElement

    // Simulate scanner input: rapid keystrokes followed by Enter
    // Scanners typically send characters very quickly
    const keys = scannedCode.split('')
    keys.forEach((key) => {
      codeInput.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      codeInput.value += key
    })

    // Simulate Enter key (scanner completes with Enter)
    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalledWith({
        code: scannedCode,
        direction: 'in',
      })
    })

    // Wait for result to be displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    expect(screen.getByText(/allowed/i)).toBeInTheDocument()
  })

  it('should handle denied access result', async () => {
    const scannedCode = 'INVALID123'
    const mockDeniedEvent: AccessEvent = {
      id: 'event-2',
      at: new Date().toISOString(),
      direction: 'in',
      result: 'denied',
      medium: 'qr',
      code: scannedCode,
      person: {
        id: 'person-2',
        name: 'Jane Smith',
        unit: 'B-202',
      },
    }

    mockCheckAccess.mockResolvedValue(mockDeniedEvent)

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Access />
        </QueryClientProvider>
      </ThemeProvider>,
    )

    const codeInput = screen.getByLabelText(/código|code/i) as HTMLInputElement

    // Simulate scanner input
    const keys = scannedCode.split('')
    keys.forEach((key) => {
      codeInput.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      codeInput.value += key
    })

    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText(/denied/i)).toBeInTheDocument()
    })
  })

  it('should clear input after successful scan', async () => {
    const scannedCode = 'QR789'
    mockCheckAccess.mockResolvedValue({
      id: 'event-3',
      at: new Date().toISOString(),
      direction: 'in',
      result: 'allowed',
      medium: 'qr',
      code: scannedCode,
      person: { id: 'p-1', name: 'Test User' },
    })

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Access />
        </QueryClientProvider>
      </ThemeProvider>,
    )

    const codeInput = screen.getByLabelText(/código|code/i) as HTMLInputElement

    // Simulate scan
    codeInput.value = scannedCode
    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalled()
    })

    // Input should be cleared after submission
    await waitFor(() => {
      expect(codeInput.value).toBe('')
    })
  })

  it('should handle exit direction scans', async () => {
    const scannedCode = 'RFID456'
    mockCheckAccess.mockResolvedValue({
      id: 'event-4',
      at: new Date().toISOString(),
      direction: 'out',
      result: 'allowed',
      medium: 'rfid',
      code: scannedCode,
      person: { id: 'p-2', name: 'Exit User' },
    })

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Access />
        </QueryClientProvider>
      </ThemeProvider>,
    )

    // Change direction to exit
    const exitToggle = screen.getByRole('button', { name: /salir|exit/i })
    exitToggle.click()

    const codeInput = screen.getByLabelText(/código|code/i) as HTMLInputElement
    codeInput.value = scannedCode
    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalledWith({
        code: scannedCode,
        direction: 'out',
      })
    })
  })

  it('should handle rapid sequential scans', async () => {
    const scan1 = 'QR001'
    const scan2 = 'QR002'

    mockCheckAccess
      .mockResolvedValueOnce({
        id: 'event-5',
        at: new Date().toISOString(),
        direction: 'in',
        result: 'allowed',
        medium: 'qr',
        code: scan1,
        person: { id: 'p-3', name: 'User 1' },
      })
      .mockResolvedValueOnce({
        id: 'event-6',
        at: new Date().toISOString(),
        direction: 'in',
        result: 'allowed',
        medium: 'qr',
        code: scan2,
        person: { id: 'p-4', name: 'User 2' },
      })

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Access />
        </QueryClientProvider>
      </ThemeProvider>,
    )

    const codeInput = screen.getByLabelText(/código|code/i) as HTMLInputElement

    // First scan
    codeInput.value = scan1
    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalledTimes(1)
    })

    // Second scan (rapidly after first)
    codeInput.value = scan2
    codeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await waitFor(() => {
      expect(mockCheckAccess).toHaveBeenCalledTimes(2)
    })
  })
})
