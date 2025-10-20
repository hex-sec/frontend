import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppThemeProvider from '@app/AppThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { adminRoutes } from '@app/router/admin.router'
import { guardRoutes } from '@app/router/guard.router'
import { appRoutes } from '@app/router/app.router'
import { authRoutes } from '@app/router/auth.router'
import { landingRoutes } from '@app/router/landing.router'
import { settingsRoutes } from '@app/router/settings.router'
import { initI18n } from './i18n/i18n'

const router = createBrowserRouter([
  ...landingRoutes,
  ...authRoutes,
  ...settingsRoutes,
  ...adminRoutes,
  ...guardRoutes,
  ...appRoutes,
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* initialize i18n before mounting the app */}
    <AppThemeProvider>
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppThemeProvider>
  </React.StrictMode>,
)

// initialize language (async) - default english
initI18n().catch((err: unknown) => console.error('i18n init failed', err))
