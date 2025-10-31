import { http } from '@features/shared/api/http'
import type { VisitorPass } from '@features/shared/types/access.types'
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from '@features/shared/types/common.types'

export interface VisitorListParams extends PaginationParams, FilterParams {
  name?: string
  hostResidentId?: string
  status?: VisitorPass['status']
}

/**
 * List visitors with filters and pagination
 */
export function listVisitors(params?: VisitorListParams) {
  return http.get<PaginatedResponse<VisitorPass>>('/visitors', { params })
}

/**
 * Get visitor by ID
 */
export function getVisitor(id: string) {
  return http.get<VisitorPass>(`/visitors/${id}`)
}

/**
 * Create new visitor pass
 */
export function createVisitor(payload: {
  name: string
  hostResidentId: string
  reason: string
  validUntil: string // ISO timestamp
  photoDataUrl?: string
}) {
  return http.post<VisitorPass>('/visitors', payload)
}

/**
 * Revoke visitor pass
 */
export function revokeVisitor(id: string) {
  return http.put<VisitorPass>(`/visitors/${id}/revoke`)
}

/**
 * Renew visitor pass
 */
export function renewVisitor(id: string, validUntil: string) {
  return http.put<VisitorPass>(`/visitors/${id}/renew`, { validUntil })
}
