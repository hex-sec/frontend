import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'

export type LayoutHeaderAction = {
  key?: string
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  disabled?: boolean
}

type LayoutHeaderActionsContextValue = {
  registerActions: (actions: LayoutHeaderAction[]) => void
  clearActions: () => void
}

const LayoutHeaderActionsContext = createContext<LayoutHeaderActionsContextValue | undefined>(
  undefined,
)

export function useLayoutHeaderActions() {
  const ctx = useContext(LayoutHeaderActionsContext)
  if (!ctx) {
    throw new Error(
      'useLayoutHeaderActions must be used within a LayoutHeaderActionsContext provider',
    )
  }
  return ctx
}

export function LayoutHeaderActionsProvider({
  value,
  children,
}: {
  value: LayoutHeaderActionsContextValue
  children: ReactNode
}) {
  return (
    <LayoutHeaderActionsContext.Provider value={value}>
      {children}
    </LayoutHeaderActionsContext.Provider>
  )
}

export { LayoutHeaderActionsContext }
