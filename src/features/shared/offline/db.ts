import Dexie, { type Table } from 'dexie'

/**
 * Offline queue item for deferred API requests
 */
export interface OutboxItem {
  id: string // uuid
  createdAt: number // timestamp
  endpoint: string // '/api/access/check'
  method: 'POST' | 'PUT' | 'DELETE'
  body: unknown
  idempotencyKey: string // for safe replays
  tries: number
  lastError?: string
}

/**
 * Dexie database for offline queue management
 */
class OfflineDB extends Dexie {
  outbox!: Table<OutboxItem, string>

  constructor() {
    super('hexsec_offline')
    this.version(1).stores({
      outbox: 'id, endpoint, createdAt, idempotencyKey',
    })
  }
}

// Export singleton instance
export const offlineDB = new OfflineDB()
