import { create } from 'zustand'
import type { BrandThemeConfig, ThemeKind } from '@app/theme.types'

type ThemeState = {
  kind: ThemeKind
  brandConfig?: BrandThemeConfig
  setKind: (k: ThemeKind) => void
  setBrand: (c: BrandThemeConfig) => void
  hydrate: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  kind: 'light',
  brandConfig: undefined,
  setKind: (k) => {
    localStorage.setItem('ui.theme.kind', k)
    set({ kind: k })
  },
  setBrand: (c) => {
    localStorage.setItem('ui.theme.brand', JSON.stringify(c))
    set({ brandConfig: c, kind: 'brand' })
  },
  hydrate: () => {
    const k = (localStorage.getItem('ui.theme.kind') as ThemeKind) ?? 'light'
    const raw = localStorage.getItem('ui.theme.brand')
    set({ kind: k, brandConfig: raw ? JSON.parse(raw) : undefined })
  },
}))
