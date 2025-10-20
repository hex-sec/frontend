import { create } from 'zustand'

export type Site = { id: string; name: string; slug: string }

type SiteState = {
  sites: Site[]
  current?: Site
  setCurrent: (site: Site) => void
  hydrate: () => void
}

const MOCK_SITES: Site[] = [
  { id: 's1', name: 'Vista Azul', slug: 'vista-azul' },
  { id: 's2', name: 'Los Olivos', slug: 'los-olivos' },
]

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  current: undefined,
  setCurrent: (site) => set({ current: site }),
  hydrate: () => {
    if (get().sites.length === 0) {
      set({ sites: MOCK_SITES, current: MOCK_SITES[0] })
    }
  },
}))
