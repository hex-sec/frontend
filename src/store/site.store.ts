import { create } from 'zustand'

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

const MOCK_SITES: Site[] = [
  { id: 's1', name: 'Vista Azul', slug: 'vista-azul' },
  { id: 's2', name: 'Los Olivos', slug: 'los-olivos' },
]

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  current: undefined,
  mode: 'enterprise',
  setCurrent: (site) => set({ current: site }),
  setMode: (mode) => set({ mode }),
  hydrate: () => {
    if (get().sites.length === 0) {
      const nextSites = [...MOCK_SITES]
      set({ sites: nextSites, current: nextSites[0] })
    }
  },
}))
