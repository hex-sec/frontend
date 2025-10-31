import { http } from '@features/shared/api/http'
import type { ParcelReceipt } from '@features/shared/types/access.types'
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from '@features/shared/types/common.types'

export interface ParcelListParams extends PaginationParams, FilterParams {
  residentId?: string
  status?: 'pending' | 'delivered'
}

/**
 * List parcels with filters and pagination
 */
export function listParcels(params?: ParcelListParams) {
  return http.get<PaginatedResponse<ParcelReceipt>>('/parcels', { params })
}

/**
 * Receive a parcel
 */
export function receiveParcel(payload: {
  residentId: string
  courier: string
  evidenceReceivedUrl?: string
}) {
  return http.post<ParcelReceipt>('/parcels/receive', payload)
}

/**
 * Deliver a parcel
 */
export function deliverParcel(id: string, payload: { evidenceDeliveredUrl?: string }) {
  return http.put<ParcelReceipt>(`/parcels/${id}/deliver`, payload)
}

/**
 * Notify resident about parcel
 */
export function notifyParcel(id: string) {
  return http.post<{ success: boolean }>(`/parcels/${id}/notify`)
}
