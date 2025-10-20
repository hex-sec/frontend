import React, { createContext, useContext, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Site, useAuthStore } from '@app/auth/auth.store'

type CacheEntry = { value: unknown; expiresAt?: number }

type ContextCacheValue = {
  currentSite: Site | null
  // accepts a Site object or null; persisting selected site to the auth store
  setCurrentSite: (site: Site | null) => void
  // generic cache operations
  getCache: <T = unknown>(key: string) => T | undefined
  setCache: <T = unknown>(key: string, value: T, ttlMs?: number) => void
  clearCache: (key?: string) => void
}

const ContextCacheContext = createContext<ContextCacheValue | undefined>(undefined)

export function ContextCacheProvider({ children }: { children: ReactNode }) {
  const currentSite = useAuthStore((s) => s.currentSite)
  const setSiteById = useAuthStore((s) => s.setCurrentSite)

  // internal in-memory map for cached values with optional TTL
  const mapRef = useRef<Map<string, CacheEntry>>(new Map())

  const getCache = useCallback(<T,>(key: string): T | undefined => {
    const entry = mapRef.current.get(key)
    if (!entry) return undefined
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      mapRef.current.delete(key)
      return undefined
    }
    return entry.value as T
  }, [])

  const setCache = useCallback(<T,>(key: string, value: T, ttlMs?: number) => {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined
    mapRef.current.set(key, { value, expiresAt })
  }, [])

  const clearCache = useCallback((key?: string) => {
    if (!key) mapRef.current.clear()
    else mapRef.current.delete(key)
  }, [])

  const setCurrentSite = useCallback(
    (site: Site | null) => {
      // persist selection into auth store by id
      setSiteById(site?.id ?? null)
    },
    [setSiteById],
  )

  const value: ContextCacheValue = {
    currentSite,
    setCurrentSite,
    getCache,
    setCache,
    clearCache,
  }

  return <ContextCacheContext.Provider value={value}>{children}</ContextCacheContext.Provider>
}

export function useContextCache() {
  const ctx = useContext(ContextCacheContext)
  if (!ctx) throw new Error('useContextCache must be used inside a ContextCacheProvider')
  return ctx
}

export default ContextCacheProvider
