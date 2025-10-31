import { create } from 'zustand'

/**
 * Guard UI state store
 * Manages local UI state for guard module (not persisted)
 */
type GuardUIState = {
  // Access page state
  lastAccessCode: string | null
  accessDirection: 'in' | 'out'

  // Actions
  setLastAccessCode: (code: string | null) => void
  setAccessDirection: (direction: 'in' | 'out') => void
  reset: () => void
}

const initialState = {
  lastAccessCode: null,
  accessDirection: 'in' as const,
}

export const useGuardUIStore = create<GuardUIState>((set) => ({
  ...initialState,
  setLastAccessCode: (code) => set({ lastAccessCode: code }),
  setAccessDirection: (direction) => set({ accessDirection: direction }),
  reset: () => set(initialState),
}))
