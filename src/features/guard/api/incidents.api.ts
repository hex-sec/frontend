import { http } from '@features/shared/api/http'
import type { IncidentReport } from '@features/shared/types/access.types'
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from '@features/shared/types/common.types'

export interface IncidentListParams extends PaginationParams, FilterParams {
  type?: IncidentReport['type']
  createdBy?: string
  dateFrom?: string // ISO timestamp
  dateTo?: string // ISO timestamp
}

/**
 * List incidents with filters and pagination
 */
export function listIncidents(params?: IncidentListParams) {
  return http.get<PaginatedResponse<IncidentReport>>('/incidents', { params })
}

/**
 * Get incident by ID
 */
export function getIncident(id: string) {
  return http.get<IncidentReport>(`/incidents/${id}`)
}

/**
 * Create new incident report
 */
export function createIncident(payload: {
  type: IncidentReport['type']
  description: string
  mediaUrls?: string[]
}) {
  return http.post<IncidentReport>('/incidents', payload)
}
