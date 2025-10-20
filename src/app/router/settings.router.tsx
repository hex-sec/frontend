import React from 'react'
import { lazy } from 'react'

const SettingsPage = lazy(() => import('@features/settings/SettingsPage'))
const ThemeAdminPanel = lazy(() => import('@features/settings/ThemeAdminPanel'))

export const settingsRoutes = [
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/settings/theme',
    element: <ThemeAdminPanel overlay />,
  },
]
