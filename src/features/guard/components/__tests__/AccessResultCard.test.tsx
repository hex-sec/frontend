import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material'
import { AccessResultCard } from '../AccessResultCard'
import type { AccessEvent } from '@features/shared/types/access.types'

const theme = createTheme()

/**
 * Test suite for AccessResultCard component
 */
describe('AccessResultCard', () => {
  const mockAccessEvent: AccessEvent = {
    id: 'event-1',
    at: new Date().toISOString(),
    direction: 'in',
    result: 'allowed',
    medium: 'qr',
    code: 'QR123456',
    person: {
      id: 'person-1',
      name: 'John Doe',
      unit: 'A-101',
      avatarUrl: undefined,
    },
  }

  it('should render allowed access event correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard data={mockAccessEvent} />
      </ThemeProvider>,
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(/A-101/i)).toBeInTheDocument()
    expect(screen.getByText(/allowed/i)).toBeInTheDocument()
  })

  it('should render denied access event correctly', () => {
    const deniedEvent = {
      ...mockAccessEvent,
      result: 'denied' as const,
    }

    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard data={deniedEvent} />
      </ThemeProvider>,
    )

    expect(screen.getByText(/denied/i)).toBeInTheDocument()
  })

  it('should call onAllow when allow button is clicked', () => {
    const onAllow = vi.fn()
    const onDeny = vi.fn()

    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard
          data={mockAccessEvent}
          showActions={true}
          onAllow={onAllow}
          onDeny={onDeny}
        />
      </ThemeProvider>,
    )

    const allowButton = screen.getByRole('button', { name: /allow|permitir/i })
    allowButton.click()

    expect(onAllow).toHaveBeenCalledTimes(1)
  })

  it('should call onDeny when deny button is clicked', () => {
    const onAllow = vi.fn()
    const onDeny = vi.fn()

    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard
          data={mockAccessEvent}
          showActions={true}
          onAllow={onAllow}
          onDeny={onDeny}
        />
      </ThemeProvider>,
    )

    const denyButton = screen.getByRole('button', { name: /deny|denegar/i })
    denyButton.click()

    expect(onDeny).toHaveBeenCalledTimes(1)
  })

  it('should not show actions when showActions is false', () => {
    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard data={mockAccessEvent} showActions={false} />
      </ThemeProvider>,
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBe(0)
  })

  it('should display entry direction correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard data={mockAccessEvent} />
      </ThemeProvider>,
    )

    // Check for entry indicators (might be icons or text)
    const directionElements = screen.getByText(/in|entrar/i)
    expect(directionElements).toBeInTheDocument()
  })

  it('should display exit direction correctly', () => {
    const exitEvent = {
      ...mockAccessEvent,
      direction: 'out' as const,
    }

    render(
      <ThemeProvider theme={theme}>
        <AccessResultCard data={exitEvent} />
      </ThemeProvider>,
    )

    // Check for exit indicators
    const directionElements = screen.getByText(/out|salir/i)
    expect(directionElements).toBeInTheDocument()
  })
})
