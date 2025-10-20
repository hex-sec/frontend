import { RouteObject } from 'react-router-dom'
import AppLayout from '@app/layout/AppLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('@features/resident/HomePage'))

export const appRoutes: RouteObject[] = [
  {
    path: '/app',
    element: (
      <RoleGate roles={['resident', 'admin']}>
        <AppLayout />
      </RoleGate>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <HomePage />
          </Suspense>
        ),
      },
      // más rutas del portal residente
    ],
  },
]
