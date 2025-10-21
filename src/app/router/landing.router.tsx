import { RouteObject } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('@features/landing/LandingPage'))

export const landingRoutes: RouteObject[] = [
  {
    path: '/',
    index: true,
    element: (
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    ),
  },
]
