/**
 * Example API module using the shared http client
 * This demonstrates the pattern for guard/kiosk API modules
 */

import { http } from '@features/shared/api/http'
import type { AccessEvent } from '@features/shared/types/access.types'

/**
 * List recent access events
 */
export function listAccessEvents(limit = 50) {
  return http.get<AccessEvent[]>('/access/events', {
    params: { limit },
  })
}

/**
 * Check access for a code (QR, RFID, plate, etc.)
 */
export function checkAccess(payload: { code: string; direction: 'in' | 'out' }) {
  return http.post<AccessEvent>('/access/check', payload)
}

/**
 * Get access event by ID
 */
export function getAccessEvent(id: string) {
  return http.get<AccessEvent>(`/access/events/${id}`)
}
