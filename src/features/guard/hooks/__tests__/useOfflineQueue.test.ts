import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOfflineQueue } from '../useOfflineQueue'
import { offlineDB } from '@features/shared/offline/db'

/**
 * Test suite for useOfflineQueue hook
 * Tests offline queue replay logic
 */
describe('useOfflineQueue', () => {
  beforeEach(async () => {
    // Clear database before each test
    await offlineDB.outbox.clear()
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
  })

  afterEach(async () => {
    await offlineDB.outbox.clear()
  })

  it('should enqueue items when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useOfflineQueue())

    await result.current.enqueue({
      id: 'test-1',
      endpoint: '/access/check',
      method: 'POST',
      body: { code: 'ABC123', direction: 'in' },
      idempotencyKey: 'key-1',
    })

    const count = await offlineDB.outbox.count()
    expect(count).toBe(1)

    const item = await offlineDB.outbox.get('test-1')
    expect(item).toBeDefined()
    expect(item?.endpoint).toBe('/access/check')
    expect(item?.body).toEqual({ code: 'ABC123', direction: 'in' })
  })

  it('should track pending count', async () => {
    const { result } = renderHook(() => useOfflineQueue())

    // Initially empty
    expect(result.current.pendingCount).toBe(0)

    // Add items
    await result.current.enqueue({
      id: 'test-1',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-1',
    })

    await result.current.enqueue({
      id: 'test-2',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-2',
    })

    // Wait for count update
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(2)
    })
  })

  it('should skip items that have been tried too many times', async () => {
    const { result } = renderHook(() => useOfflineQueue())

    // Add item with max tries
    await offlineDB.outbox.add({
      id: 'failed-1',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-1',
      tries: 5,
      createdAt: Date.now(),
    })

    // Mock httpClient to fail
    vi.mock('@features/shared/api/http', async () => {
      const actual = await vi.importActual('@features/shared/api/http')
      return {
        ...actual,
        httpClient: vi.fn().mockRejectedValue(new Error('Network error')),
      }
    })

    // Replay should skip the failed item
    await result.current.replay()

    // Item should still be in queue (not deleted)
    const item = await offlineDB.outbox.get('failed-1')
    expect(item).toBeDefined()
    expect(item?.tries).toBe(5)
  })

  it('should get queued items', async () => {
    const { result } = renderHook(() => useOfflineQueue())

    await result.current.enqueue({
      id: 'test-1',
      endpoint: '/test',
      method: 'POST',
      body: { data: 'test' },
      idempotencyKey: 'key-1',
    })

    const items = await result.current.getQueuedItems()
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe('test-1')
  })

  it('should clear failed items', async () => {
    const { result } = renderHook(() => useOfflineQueue())

    // Add failed items
    await offlineDB.outbox.add({
      id: 'failed-1',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-1',
      tries: 5,
      createdAt: Date.now(),
    })

    await offlineDB.outbox.add({
      id: 'failed-2',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-2',
      tries: 6,
      createdAt: Date.now(),
    })

    // Add non-failed item
    await offlineDB.outbox.add({
      id: 'pending-1',
      endpoint: '/test',
      method: 'POST',
      body: {},
      idempotencyKey: 'key-3',
      tries: 2,
      createdAt: Date.now(),
    })

    await result.current.clearFailed()

    const remaining = await offlineDB.outbox.count()
    expect(remaining).toBe(1)

    const pending = await offlineDB.outbox.get('pending-1')
    expect(pending).toBeDefined()
  })
})
