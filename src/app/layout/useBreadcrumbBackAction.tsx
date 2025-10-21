import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'
import { useLayoutHeaderActions } from './LayoutHeaderActionsContext'

export type BreadcrumbBackActionOptions = {
  label: string
  to?: string
  onClick?: () => void
  icon?: ReactNode
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  disabled?: boolean
  key?: string
  enabled?: boolean
}

export function useBreadcrumbBackAction({
  label,
  to,
  onClick,
  icon,
  variant,
  color,
  disabled,
  key,
  enabled = true,
}: BreadcrumbBackActionOptions) {
  const navigate = useNavigate()
  const { registerActions, clearActions } = useLayoutHeaderActions()
  const registeredRef = useRef(false)

  const handler = useMemo(() => {
    if (onClick) {
      return onClick
    }
    if (to) {
      return () => navigate(to)
    }
    return () => navigate(-1)
  }, [navigate, onClick, to])

  const actionIcon = useMemo(() => icon ?? <ArrowBackIcon fontSize="small" />, [icon])

  useEffect(() => {
    if (!enabled) {
      if (registeredRef.current) {
        clearActions()
        registeredRef.current = false
      }
      return
    }

    registerActions([
      {
        key: key ?? 'breadcrumb-back',
        label,
        icon: actionIcon,
        onClick: handler,
        variant: variant ?? 'text',
        color: color ?? 'inherit',
        disabled,
      },
    ])
    registeredRef.current = true

    return () => {
      if (registeredRef.current) {
        clearActions()
        registeredRef.current = false
      }
    }
  }, [
    actionIcon,
    clearActions,
    color,
    disabled,
    enabled,
    handler,
    key,
    label,
    registerActions,
    variant,
  ])
}
