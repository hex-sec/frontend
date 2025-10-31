import { describe, it, expect } from 'vitest'
import { NewVisitorSchema, type NewVisitorInput } from '../NewVisitor.schema'

/**
 * Test suite for NewVisitor Zod schema validation
 */
describe('NewVisitorSchema', () => {
  const validInput: NewVisitorInput = {
    name: 'John Doe',
    hostResidentId: 'resident-123',
    reason: 'Family visit',
    validUntil: '2025-12-31T23:59:59Z',
    photoDataUrl: 'https://example.com/photo.jpg',
  }

  it('should validate correct input', () => {
    const result = NewVisitorSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('should reject name shorter than 2 characters', () => {
    const invalid = { ...validInput, name: 'A' }
    const result = NewVisitorSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('2 caracteres')
    }
  })

  it('should reject empty hostResidentId', () => {
    const invalid = { ...validInput, hostResidentId: '' }
    const result = NewVisitorSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('anfitrión')
    }
  })

  it('should reject reason shorter than 3 characters', () => {
    const invalid = { ...validInput, reason: 'AB' }
    const result = NewVisitorSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('3 caracteres')
    }
  })

  it('should reject invalid datetime format', () => {
    const invalid = { ...validInput, validUntil: 'invalid-date' }
    const result = NewVisitorSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('fecha válida')
    }
  })

  it('should accept empty photoDataUrl', () => {
    const input = { ...validInput, photoDataUrl: '' }
    const result = NewVisitorSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should accept missing photoDataUrl', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photoDataUrl, ...input } = validInput
    const result = NewVisitorSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject invalid URL for photoDataUrl', () => {
    const invalid = { ...validInput, photoDataUrl: 'not-a-url' }
    const result = NewVisitorSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
