import { useEffect, useCallback, useState } from 'react'
import { offlineDB, type OutboxItem } from '@features/shared/offline/db'
import { httpClient } from '@features/shared/api/http'

/**
 * Hook for managing offline queue with Dexie
 * Handles enqueue, replay on network recovery, and retry logic
 */
export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isReplaying, setIsReplaying] = useState(false)

  const updateCount = useCallback(async () => {
    const count = await offlineDB.outbox.count()
    setPendingCount(count)
  }, [])

  useEffect(() => {
    updateCount()
    // Poll for count updates
    const interval = setInterval(updateCount, 2000)
    return () => clearInterval(interval)
  }, [updateCount])

  /**
   * Add an item to the offline queue
   */
  const enqueue = useCallback(
    async (item: Omit<OutboxItem, 'tries' | 'createdAt' | 'lastError'>) => {
      await offlineDB.outbox.add({
        ...item,
        tries: 0,
        createdAt: Date.now(),
      })
      await updateCount()
    },
    [updateCount],
  )

  /**
   * Replay all queued items
   */
  const replay = useCallback(async () => {
    if (!navigator.onLine || isReplaying) return

    setIsReplaying(true)
    try {
      const items = await offlineDB.outbox.orderBy('createdAt').toArray()

      for (const it of items) {
        // Skip items that have been tried too many times
        if (it.tries >= 5) {
          console.warn(`Skipping item ${it.id} after ${it.tries} failed attempts`)
          continue
        }

        try {
          // Construct full URL if endpoint is relative
          const url = it.endpoint.startsWith('http')
            ? it.endpoint
            : `${httpClient.defaults.baseURL || ''}${it.endpoint}`

          const response = await httpClient({
            url,
            method: it.method,
            headers: {
              'Content-Type': 'application/json',
              'X-Idempotency-Key': it.idempotencyKey,
            },
            data: it.body,
          })

          // Success: remove from queue
          if (response.status >= 200 && response.status < 300) {
            await offlineDB.outbox.delete(it.id)
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          await offlineDB.outbox.update(it.id, {
            tries: it.tries + 1,
            lastError: errorMessage,
          })
          console.error(`Failed to replay item ${it.id}:`, errorMessage)
        }
      }

      await updateCount()
    } finally {
      setIsReplaying(false)
    }
  }, [isReplaying, updateCount])

  /**
   * Get queued items for inspection
   */
  const getQueuedItems = useCallback(async () => {
    return await offlineDB.outbox.orderBy('createdAt').toArray()
  }, [])

  /**
   * Clear failed items (tries >= 5)
   */
  const clearFailed = useCallback(async () => {
    const failed = await offlineDB.outbox.where('tries').aboveOrEqual(5).toArray()
    await offlineDB.outbox.bulkDelete(failed.map((it) => it.id))
    await updateCount()
  }, [updateCount])

  // Auto-replay on network recovery
  useEffect(() => {
    const handleOnline = () => {
      // Small delay to ensure network is stable
      setTimeout(() => {
        replay().catch(console.error)
      }, 1000)
    }

    window.addEventListener('online', handleOnline)

    // Also try to replay if already online when hook mounts (with delay)
    if (navigator.onLine) {
      setTimeout(() => {
        replay().catch(console.error)
      }, 2000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [replay])

  return {
    enqueue,
    replay,
    pendingCount,
    isReplaying,
    getQueuedItems,
    clearFailed,
  }
}
