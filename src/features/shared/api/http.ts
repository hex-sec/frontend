import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@app/auth/auth.store'

/**
 * HTTP Client for Service Layer
 *
 * Uses axios for request/response handling with:
 * - Automatic auth token injection (Bearer token)
 * - Tenant ID header from current site context
 * - 401 auto-logout and redirect
 * - Type-safe convenience methods
 *
 * Usage:
 *   import { http } from '@/features/shared/api/http'
 *   const data = await http.get<MyType>('/endpoint')
 *   await http.post('/endpoint', payload)
 *
 * Token storage:
 * - First checks auth store for token field (if added)
 * - Falls back to localStorage.getItem('auth_token')
 * - Set token in auth store or localStorage after login
 */

// Get base URL from environment or default to /api
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || '/api'

/**
 * Create an axios instance with interceptors for auth headers and tenant context
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000, // 30 seconds
  })

  // Request interceptor: Add auth token and tenant ID
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authState = useAuthStore.getState()

      // Add auth token if available
      // Check auth store token first, then localStorage as fallback
      const token =
        (authState as unknown as { token?: string })?.token ??
        (authState.user?.id ? localStorage.getItem('auth_token') : null)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add tenant ID from current site context
      if (authState.currentSite?.id) {
        config.headers['x-tenant-id'] = authState.currentSite.id
      }

      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor: Handle errors globally
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle 401 Unauthorized (token expired, invalid, etc.)
      if (error.response?.status === 401) {
        const authStore = useAuthStore.getState()
        authStore.logout()
        // Optionally redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }

      // Re-throw the error so callers can handle it
      return Promise.reject(error)
    },
  )

  return instance
}

// Export singleton instance for reuse across service layer
export const httpClient = createHttpClient()

/**
 * Convenience wrapper functions for common HTTP methods
 */
export const http = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<T>(url, config).then((res: AxiosResponse<T>) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data),
}

// Export the raw axios instance for advanced use cases
// (Already exported above as const, no need for separate export statement)

/**
 * Export types for use in API modules
 */
export type { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
