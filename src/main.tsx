import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppThemeProvider from '@app/AppThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@features/shared/components/ToastProvider'
import { adminRoutes } from '@app/router/admin.router'
import { guardRoutes } from '@app/router/guard.router'
import { kioskRoutes } from '@app/router/kiosk.router'
import { appRoutes } from '@app/router/app.router'
import { authRoutes } from '@app/router/auth.router'
import { landingRoutes } from '@app/router/landing.router'
import { settingsRoutes } from '@app/router/settings.router'
import { siteRoutes } from '@app/router/site.router'
import { initI18n } from './i18n/i18n'
import { useI18nStore } from '@store/i18n.store'

const router = createBrowserRouter([
  ...landingRoutes,
  ...authRoutes,
  ...settingsRoutes,
  ...adminRoutes,
  ...siteRoutes,
  ...guardRoutes,
  ...kioskRoutes,
  ...appRoutes,
])

const queryClient = new QueryClient()

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QueryClientProvider>
      </AppThemeProvider>
    </React.StrictMode>,
  )
}

initI18n()
  .then((language) => {
    useI18nStore.getState().hydrateLanguage(language)
    renderApp()
  })
  .catch((err: unknown) => {
    console.error('i18n init failed', err)
    renderApp()
  })
