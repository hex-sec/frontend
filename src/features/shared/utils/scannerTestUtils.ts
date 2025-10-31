/**
 * Scanner Test Utilities
 * Helpers for testing keyboard wedge scanner input
 */

/**
 * Simulate a scanner input by dispatching keyboard events
 * This can be used for automated testing or manual verification
 */
export function simulateScannerInput(code: string, delay = 10): void {
  const chars = code.split('')
  let index = 0

  const typeChar = () => {
    if (index < chars.length) {
      const char = chars[index]
      const event = new KeyboardEvent('keydown', {
        key: char,
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(event)
      index++
      setTimeout(typeChar, delay)
    } else {
      // Send Enter after all characters
      setTimeout(() => {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
        window.dispatchEvent(enterEvent)
      }, delay)
    }
  }

  typeChar()
}

/**
 * Create a test code generator for scanner testing
 */
export function generateTestCode(prefix = 'TEST', length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    '',
  )
  return `${prefix}${random}`
}
