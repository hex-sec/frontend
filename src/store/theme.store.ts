import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BrandThemeConfig, ThemeKind, HexThemePreset } from '@app/theme.types'

function sortPresets(presets: HexThemePreset[]): HexThemePreset[] {
  return [...presets].sort((a, b) => {
    if (a.palette.mode === b.palette.mode) {
      return a.label.localeCompare(b.label)
    }
    return a.palette.mode === 'light' ? -1 : 1
  })
}

type ThemeState = {
  // legacy fields kept for backwards compatibility
  kind: ThemeKind
  brandConfig?: BrandThemeConfig
  hydrate: () => void
  setKind: (k: ThemeKind) => void
  setBrand: (c: BrandThemeConfig) => void

  // presets/persistence for theme presets
  presets: HexThemePreset[]
  currentId: string
  setPresets: (presets: HexThemePreset[]) => void
  setCurrent: (id: string) => void
  currentPreset: () => HexThemePreset | undefined
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      kind: 'light',
      brandConfig: undefined,
      hydrate: () => {
        const k = (localStorage.getItem('ui.theme.kind') as ThemeKind) ?? 'light'
        const raw = localStorage.getItem('ui.theme.brand')
        set({ kind: k, brandConfig: raw ? JSON.parse(raw) : undefined })
      },
      setKind: (k) => {
        localStorage.setItem('ui.theme.kind', k)
        set({ kind: k })
      },
      setBrand: (c) => {
        localStorage.setItem('ui.theme.brand', JSON.stringify(c))
        set({ brandConfig: c, kind: 'brand' })
      },

      presets: [],
      currentId: 'securityBlue',
      setPresets: (presets) =>
        set((state) => {
          const sorted = sortPresets(presets)
          const hasCurrent = sorted.some((preset) => preset.id === state.currentId)
          return {
            presets: sorted,
            currentId: hasCurrent ? state.currentId : (sorted[0]?.id ?? state.currentId),
          }
        }),
      setCurrent: (id) => set({ currentId: id }),
      currentPreset: () => get().presets.find((p) => p.id === get().currentId),
    }),
    { name: 'hex.theme' },
  ),
)
