/**
 * Access control types for Guard/Kiosk modules
 */

export type AccessDirection = 'in' | 'out'
export type AccessMedium = 'qr' | 'rfid' | 'plate' | 'manual'
export type AccessResult = 'allowed' | 'denied'

export interface PersonRef {
  id: string
  type: 'resident' | 'visitor' | 'contractor' | 'guard'
  name: string
  unit?: string | null
  avatarUrl?: string | null
}

export interface AccessEvent {
  id: string
  code?: string // QR/RFID/plate code that was scanned
  at: string // ISO timestamp
  direction: AccessDirection
  medium: AccessMedium
  result: AccessResult
  person: PersonRef
  byGuardId?: string
  reason?: string
  evidenceUrl?: string // photo
}

export interface VisitorPass {
  id: string
  hostResidentId: string
  code: string // QR code
  validFrom: string // ISO timestamp
  validUntil: string // ISO timestamp
  status: 'active' | 'used' | 'revoked' | 'expired'
}

export interface ParcelReceipt {
  id: string
  residentId: string
  courier: string
  receivedAt: string // ISO timestamp
  deliveredAt?: string // ISO timestamp
  evidenceReceivedUrl?: string
  evidenceDeliveredUrl?: string
}

export interface IncidentReport {
  id: string
  createdAt: string // ISO timestamp
  type: 'security' | 'medical' | 'damage' | 'other'
  description: string
  mediaUrls?: string[]
  createdBy: string // guard id
}
