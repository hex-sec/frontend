import { create } from 'zustand'
import sitesSeed from '../mocks/sites.json'
import { SettingsService } from '../services/settings.service'

export type Site = { id: string; name: string; slug: string }

export type SiteMode = 'enterprise' | 'site'

type SiteState = {
  sites: Site[]
  current?: Site
  mode: SiteMode
  setCurrent: (site: Site) => void
  setMode: (mode: SiteMode) => void
  hydrate: () => void
  persistMode: () => void
  loadMode: (userId: string) => void
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  current: undefined,
  mode: 'enterprise',
  setCurrent: (site) => set({ current: site }),
  setMode: (mode) => set({ mode }),
  persistMode: () => {
    const store = get()
    if (typeof window === 'undefined') return
    const userId = localStorage.getItem('hex:userId')
    if (!userId) return
    const settings = SettingsService.load(userId)
    if (settings) {
      const updated = { ...settings, workspaceMode: store.mode }
      SettingsService.save(userId, updated)
    }
  },
  loadMode: (userId: string) => {
    if (!userId) return
    const settings = SettingsService.load(userId)
    if (settings?.workspaceMode === 'enterprise' || settings?.workspaceMode === 'site') {
      set({ mode: settings.workspaceMode })
    }
  },
  hydrate: () => {
    if (get().sites.length === 0) {
      const seed = sitesSeed as Array<Record<string, unknown>>
      const nextSites = seed.map((s) => ({
        id: String(s.id),
        name: String(s.name),
        slug: String(s.slug),
      }))
      // Try to prefer a slug from the current URL so hydrate doesn't briefly set a
      // different `current` and cause mode/path flipping when the app first loads
      // (e.g. when navigating directly to /site/:slug).
      let initial = nextSites[0]
      try {
        const m = window.location.pathname.match(/^\/site\/([^/]+)/)
        if (m) {
          const urlSlug = m[1]
          const found = nextSites.find((s) => s.slug === urlSlug)
          if (found) initial = found
        }
      } catch {
        // ignore (server-side rendering or unknown context)
      }

      set({ sites: nextSites, current: initial })
    }
  },
}))
