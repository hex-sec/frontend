import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'guard' | 'resident'

export type Site = { id: string; name?: string; slug?: string; address?: string }

export type SiteMembership = { siteId: string; role: Role; siteName?: string }

export type User = { id: string; email: string; role: Role; sites?: SiteMembership[] }

type AuthState = {
  user: User | null
  // currently selected tenant/site context
  currentSite: Site | null
  // actions
  login: (user: User) => void
  logout: () => void
  setCurrentSite: (siteId: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentSite: null,
      login: (user) => {
        // default to first site membership if available
        const first = user.sites && user.sites.length > 0 ? user.sites[0] : undefined
        const currentSite = first ? { id: first.siteId, name: first.siteName } : null
        set({ user, currentSite })
      },
      logout: () => set({ user: null, currentSite: null }),
      setCurrentSite: (siteId) => {
        const { user } = get()
        if (!siteId || !user?.sites) {
          set({ currentSite: null })
          return
        }
        const m = user.sites.find((s) => s.siteId === siteId)
        if (m) set({ currentSite: { id: m.siteId, name: m.siteName } })
        else set({ currentSite: null })
      },
    }),
    { name: 'auth' },
  ),
)
