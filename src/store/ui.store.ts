import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UIState = {
  openSettings: boolean
  setOpenSettings: (v: boolean) => void
  activeSettingsCategory: string
  setActiveSettingsCategory: (v: string) => void
  patternEnabled: boolean
  setPatternEnabled: (v: boolean) => void
  patternKind: string
  setPatternKind: (v: string) => void
  patternOpacity: number
  setPatternOpacity: (v: number) => void
  patternBackgroundSource: 'primary' | 'secondary' | 'custom'
  setPatternBackgroundSource: (v: 'primary' | 'secondary' | 'custom') => void
  patternCustomColor: string
  setPatternCustomColor: (v: string) => void
  patternScale: number
  setPatternScale: (v: number) => void
  patternDraftEnabled: boolean
  setPatternDraftEnabled: (v: boolean) => void
  patternDraftKind: string
  setPatternDraftKind: (v: string) => void
  patternDraftOpacity: number
  setPatternDraftOpacity: (v: number) => void
  patternDraftBackgroundSource: 'primary' | 'secondary' | 'custom'
  setPatternDraftBackgroundSource: (v: 'primary' | 'secondary' | 'custom') => void
  patternDraftCustomColor: string
  setPatternDraftCustomColor: (v: string) => void
  patternDraftScale: number
  setPatternDraftScale: (v: number) => void
  commitPatternDraft: () => void
  resetPatternDraft: () => void
  topbarBlur: number
  setTopbarBlur: (v: number) => void
  topbarBadges: boolean
  setTopbarBadges: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      openSettings: false,
      setOpenSettings: (v: boolean) => set({ openSettings: v }),
      activeSettingsCategory: 'account',
      setActiveSettingsCategory: (v: string) => set({ activeSettingsCategory: v }),
      patternEnabled: true,
      setPatternEnabled: (v: boolean) => set({ patternEnabled: v }),
      patternKind: 'subtle-diagonal',
      setPatternKind: (v: string) => set({ patternKind: v }),
      patternOpacity: 0.08,
      setPatternOpacity: (v: number) => set({ patternOpacity: v }),
      patternBackgroundSource: 'primary',
      setPatternBackgroundSource: (v: 'primary' | 'secondary' | 'custom') =>
        set({ patternBackgroundSource: v }),
      patternCustomColor: '#1976d2',
      setPatternCustomColor: (v: string) => set({ patternCustomColor: v }),
      patternScale: 28,
      setPatternScale: (v: number) => set({ patternScale: v }),
      patternDraftEnabled: true,
      setPatternDraftEnabled: (v: boolean) => set({ patternDraftEnabled: v }),
      patternDraftKind: 'subtle-diagonal',
      setPatternDraftKind: (v: string) => set({ patternDraftKind: v }),
      patternDraftOpacity: 0.08,
      setPatternDraftOpacity: (v: number) => set({ patternDraftOpacity: v }),
      patternDraftBackgroundSource: 'primary',
      setPatternDraftBackgroundSource: (v: 'primary' | 'secondary' | 'custom') =>
        set({ patternDraftBackgroundSource: v }),
      patternDraftCustomColor: '#1976d2',
      setPatternDraftCustomColor: (v: string) => set({ patternDraftCustomColor: v }),
      patternDraftScale: 28,
      setPatternDraftScale: (v: number) => set({ patternDraftScale: v }),
      topbarBlur: 14,
      setTopbarBlur: (v: number) => set({ topbarBlur: v }),
      topbarBadges: true,
      setTopbarBadges: (v: boolean) => set({ topbarBadges: v }),
      commitPatternDraft: () =>
        set((state) => ({
          patternEnabled: state.patternDraftEnabled,
          patternKind: state.patternDraftKind,
          patternOpacity: state.patternDraftOpacity,
          patternBackgroundSource: state.patternDraftBackgroundSource,
          patternCustomColor: state.patternDraftCustomColor,
          patternScale: state.patternDraftScale,
        })),
      resetPatternDraft: () => {
        const state = get()
        set({
          patternDraftEnabled: state.patternEnabled,
          patternDraftKind: state.patternKind,
          patternDraftOpacity: state.patternOpacity,
          patternDraftBackgroundSource: state.patternBackgroundSource,
          patternDraftCustomColor: state.patternCustomColor,
          patternDraftScale: state.patternScale,
        })
      },
    }),
    {
      name: 'ui-store',
      onRehydrateStorage: () => (state) => {
        state?.resetPatternDraft()
      },
    },
  ),
)
