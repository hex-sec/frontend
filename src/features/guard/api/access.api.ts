import { http } from '@features/shared/api/http'
import type { AccessEvent } from '@features/shared/types/access.types'

// Mock access events data (inlined for Vite compatibility)
const accessEventsMock: AccessEvent[] = [
  {
    id: 'evt-001',
    code: 'QRC-4812',
    direction: 'in',
    result: 'allowed',
    medium: 'qr',
    at: '2025-10-21T14:30:00Z',
    person: {
      id: 'person-001',
      name: 'Hannah Lee',
      type: 'visitor',
      unit: 'Tower A · 1408',
      avatarUrl: null,
    },
  },
  {
    id: 'evt-002',
    code: 'RFID-1234',
    direction: 'in',
    result: 'allowed',
    medium: 'rfid',
    at: '2025-10-21T14:25:00Z',
    person: {
      id: 'person-002',
      name: 'Carla Jenkins',
      type: 'resident',
      unit: 'Tower A · 1408',
      avatarUrl: null,
    },
  },
  {
    id: 'evt-003',
    code: 'ABC123',
    direction: 'in',
    result: 'denied',
    medium: 'plate',
    at: '2025-10-21T14:20:00Z',
    person: {
      id: 'person-003',
      name: 'Unknown Vehicle',
      type: 'visitor',
      unit: null,
      avatarUrl: null,
    },
    reason: 'Vehicle not registered',
  },
  {
    id: 'evt-004',
    code: 'XYZ789',
    direction: 'out',
    result: 'allowed',
    medium: 'plate',
    at: '2025-10-21T14:15:00Z',
    person: {
      id: 'person-004',
      name: 'Miguel Serrano',
      type: 'guard',
      unit: null,
      avatarUrl: null,
    },
  },
]

// Mock mode for development - always enabled for now
const MOCK_MODE = true

// Mock access codes for testing scanner
// These match the badge codes from VisitsPage.tsx so you can scan QR codes from another device
const MOCK_CODES: Record<
  string,
  { allowed: boolean; person: Partial<AccessEvent['person']>; reason?: string }
> = {
  // Badge codes from visits.json - match VisitsPage (all badge codes from visits.json)
  'QRC-4812': {
    allowed: true,
    person: {
      id: 'person-001',
      name: 'Hannah Lee',
      type: 'visitor',
      unit: 'Tower A · 1408',
    },
  },
  'DRV-2045': {
    allowed: true,
    person: {
      id: 'person-delivery',
      name: 'Paco & Sons Delivery',
      type: 'contractor',
      unit: 'Service Gate',
    },
  },
  'EVT-8801': {
    allowed: true,
    person: {
      id: 'person-event',
      name: 'Michelle Ortega',
      type: 'visitor',
      unit: 'Clubhouse',
    },
  },
  'DEN-1944': {
    allowed: false,
    person: {
      id: 'person-denied',
      name: 'Cesar Ramirez',
      type: 'visitor',
      unit: 'Main Gate',
    },
    reason: 'Access denied: Visit was denied by admin',
  },
  'PEN-3920': {
    allowed: false,
    person: {
      id: 'person-pending',
      name: 'Maria Gutierrez',
      type: 'visitor',
      unit: 'Tower B · 907',
    },
    reason: 'Access pending: Visit not yet approved',
  },

  // Additional test codes
  'RFID-1234': {
    allowed: true,
    person: { id: 'person-002', name: 'Carla Jenkins', type: 'resident', unit: 'Tower A · 1408' },
  },
  'GUARD-001': {
    allowed: true,
    person: { id: 'person-004', name: 'Miguel Serrano', type: 'guard' },
  },
  'RESIDENT-001': {
    allowed: true,
    person: { id: 'person-005', name: 'John Doe', type: 'resident', unit: 'Tower B · 201' },
  },

  // Denied codes for testing
  'BLOCKED-001': {
    allowed: false,
    person: { id: 'person-006', name: 'Unknown Visitor', type: 'visitor' },
    reason: 'Access denied: Visitor pass expired',
  },
  'INVALID-001': {
    allowed: false,
    person: { id: 'person-007', name: 'Unknown', type: 'visitor' },
    reason: 'Code not found in system',
  },

  // Test codes for easy scanning
  'TEST-OK': {
    allowed: true,
    person: { id: 'test-001', name: 'Test User (Allowed)', type: 'visitor', unit: 'Test Unit' },
  },
  'TEST-DENIED': {
    allowed: false,
    person: { id: 'test-002', name: 'Test User (Denied)', type: 'visitor' },
    reason: 'Test denial reason',
  },
}

/**
 * List recent access events
 */
export async function listAccessEvents(limit = 50): Promise<AccessEvent[]> {
  if (MOCK_MODE) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return mock events (limit to requested amount)
    const events = accessEventsMock as AccessEvent[]
    return events.slice(0, limit)
  }

  const response = await http.get<AccessEvent[]>('/access/events', {
    params: { limit },
  })
  return response
}

/**
 * Check access for a code (QR, RFID, plate, etc.)
 */
export async function checkAccess(payload: {
  code: string
  direction: 'in' | 'out'
}): Promise<AccessEvent> {
  const { code, direction } = payload

  if (MOCK_MODE) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Normalize code: replace apostrophe/single quote with hyphen and uppercase
    // Some scanners output ' instead of - (e.g., DRV'2045 instead of DRV-2045)
    const normalizedCode = code.trim().replace(/'/g, '-').toUpperCase()
    const mockCode = MOCK_CODES[normalizedCode]

    if (mockCode) {
      const event: AccessEvent = {
        id: `evt-${Date.now()}`,
        code: normalizedCode,
        direction,
        result: mockCode.allowed ? 'allowed' : 'denied',
        medium: normalizedCode.startsWith('QRC')
          ? 'qr'
          : normalizedCode.startsWith('RFID')
            ? 'rfid'
            : 'plate',
        at: new Date().toISOString(),
        person: {
          id: mockCode.person.id || `person-${Date.now()}`,
          name: mockCode.person.name || 'Unknown',
          type: mockCode.person.type || 'visitor',
          unit: mockCode.person.unit || null,
          avatarUrl: null,
        },
        ...(mockCode.reason && { reason: mockCode.reason }),
      }
      return event
    }

    // Default mock response for unknown codes
    const event: AccessEvent = {
      id: `evt-${Date.now()}`,
      code: normalizedCode,
      direction,
      result: 'denied',
      medium: normalizedCode.length <= 10 ? 'qr' : 'plate',
      at: new Date().toISOString(),
      person: {
        id: `person-unknown-${Date.now()}`,
        name: 'Unknown',
        type: 'visitor',
        unit: null,
        avatarUrl: null,
      },
      reason: 'Code not recognized in system',
    }
    return event
  }

  const response = await http.post<AccessEvent>('/access/check', payload)
  return response
}

/**
 * Get access event by ID
 */
export function getAccessEvent(id: string) {
  return http.get<AccessEvent>(`/access/events/${id}`)
}
