import { create } from 'zustand'
import sitesSeed from '../mocks/sites.json'

export type Site = { id: string; name: string; slug: string }

export type SiteMode = 'enterprise' | 'site'

type SiteState = {
  sites: Site[]
  current?: Site
  mode: SiteMode
  setCurrent: (site: Site) => void
  setMode: (mode: SiteMode) => void
  hydrate: () => void
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  current: undefined,
  mode: 'enterprise',
  setCurrent: (site) => set({ current: site }),
  setMode: (mode) => set({ mode }),
  hydrate: () => {
    if (get().sites.length === 0) {
      const seed = sitesSeed as Array<Record<string, unknown>>
      const nextSites = seed.map((s) => ({
        id: String(s.id),
        name: String(s.name),
        slug: String(s.slug),
      }))
      set({ sites: nextSites, current: nextSites[0] })
    }
  },
}))
