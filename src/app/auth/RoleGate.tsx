import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@app/auth/auth.store'

export function RoleGate({
  roles,
  children,
}: {
  roles: ('admin' | 'guard' | 'resident')[]
  children: React.ReactNode
}) {
  const { user, currentSite } = useAuthStore()
  if (!user) return <Navigate to="/auth/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/auth/login" replace />

  // Guards must have an active site selected to access kiosk routes
  if (user.role === 'guard' && !currentSite) return <Navigate to="/auth/login" replace />

  return <>{children}</>
}
