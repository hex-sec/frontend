import { create } from 'zustand'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'

export type BackTarget = {
  label: string
  to?: string
  onClick?: () => void
  icon?: ReactNode
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  disabled?: boolean
  key?: string
} | null

type BackState = {
  back: BackTarget
  setBack: (b: BackTarget) => void
  clearBack: () => void
}

export const useBackStore = create<BackState>((set) => ({
  back: null,
  setBack: (b) => set({ back: b }),
  clearBack: () => set({ back: null }),
}))

export default useBackStore
