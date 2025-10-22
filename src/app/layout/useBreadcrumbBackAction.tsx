import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'
import { useBackStore } from '@store/back.store'

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
  const setBack = useBackStore((s) => s.setBack)
  const clearBack = useBackStore((s) => s.clearBack)
  const didSetRef = useRef(false)

  const handler = useMemo(() => {
    if (onClick) {
      return onClick
    }
    if (to) {
      return () => navigate(to)
    }
    return () => navigate(-1)
  }, [navigate, onClick, to])

  const resolvedIcon = useMemo(() => icon ?? <ArrowBackIcon fontSize="small" />, [icon])

  useEffect(() => {
    if (!enabled) {
      if (didSetRef.current) {
        clearBack()
        didSetRef.current = false
      }
      return
    }

    didSetRef.current = true
    setBack({
      label,
      to,
      onClick: handler,
      icon: resolvedIcon,
      variant: variant ?? 'text',
      color: color ?? 'inherit',
      disabled,
      key: key ?? 'breadcrumb-back',
    })

    return () => {
      if (didSetRef.current) {
        clearBack()
        didSetRef.current = false
      }
    }
  }, [clearBack, color, disabled, enabled, handler, key, label, resolvedIcon, setBack, variant, to])
}
