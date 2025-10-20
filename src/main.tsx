import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppThemeProvider from '@app/AppThemeProvider'
import { adminRoutes } from '@app/router/admin.router'
import { guardRoutes } from '@app/router/guard.router'
import { appRoutes } from '@app/router/app.router'
import { authRoutes } from '@app/router/auth.router'
import { landingRoutes } from '@app/router/landing.router'

const router = createBrowserRouter([
  ...landingRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...guardRoutes,
  ...appRoutes,
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  </React.StrictMode>,
)
