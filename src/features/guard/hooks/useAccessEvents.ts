import { useQuery } from '@tanstack/react-query'
import { listAccessEvents } from '../api/access.api'

/**
 * Hook for fetching access events with polling
 * Polls every 3-5 seconds for real-time updates (Phase 1: polling, Phase 2: sockets)
 *
 * @param limit - Maximum number of events to fetch
 * @param pollingInterval - Polling interval in milliseconds (default: 4000)
 */
export function useAccessEvents(limit = 50, pollingInterval = 4000) {
  return useQuery({
    queryKey: ['access', 'events', { limit }],
    queryFn: () => listAccessEvents(limit),
    refetchInterval: pollingInterval, // Phase 1: polling
    staleTime: 2000,
    gcTime: 60000, // Keep in cache for 1 minute
  })
}
