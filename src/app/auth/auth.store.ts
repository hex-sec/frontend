import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'guard' | 'resident'

export type Site = { id: string; name?: string; slug?: string; address?: string }

export type SiteMembership = { siteId: string; role: Role; siteName?: string }

export type User = {
  id: string
  email: string
  name?: string
  role: Role
  sites?: SiteMembership[]
}

// payload used for login action (doesn't require full User object)
export type LoginPayload = {
  email: string
  name?: string
  role: Role
  sites?: SiteMembership[]
  id?: string
}

type AuthState = {
  user: User | null
  // currently selected tenant/site context
  currentSite: Site | null
  // actions
  login: (payload: LoginPayload) => void
  logout: () => void
  setCurrentSite: (siteId: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentSite: null,
      login: (payload) => {
        // normalize to a User object; generate id when missing (dev/stub behavior)
        const user: User = {
          id: payload.id ?? `u_${Date.now()}`,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          sites: payload.sites,
        }
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
