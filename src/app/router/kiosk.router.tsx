import { RouteObject } from 'react-router-dom'
import { RoleGate } from '@app/auth/RoleGate'
import { ErrorBoundary } from '@features/shared/components/ErrorBoundary'
import { lazy, Suspense } from 'react'

const KioskLayout = lazy(() => import('@features/kiosk/KioskLayout'))
const Welcome = lazy(() => import('@features/kiosk/pages/Welcome'))
const Scan = lazy(() => import('@features/kiosk/pages/Scan'))
const Lookup = lazy(() => import('@features/kiosk/pages/Lookup'))
const Confirm = lazy(() => import('@features/kiosk/pages/Confirm'))
const Done = lazy(() => import('@features/kiosk/pages/Done'))

export const kioskRoutes: RouteObject[] = [
  {
    path: '/kiosk',
    element: (
      <ErrorBoundary>
        <RoleGate roles={['guard', 'admin']}>
          <Suspense fallback={null}>
            <KioskLayout />
          </Suspense>
        </RoleGate>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        ),
      },
      {
        path: 'welcome',
        element: (
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        ),
      },
      {
        path: 'scan',
        element: (
          <Suspense fallback={null}>
            <Scan />
          </Suspense>
        ),
      },
      {
        path: 'lookup',
        element: (
          <Suspense fallback={null}>
            <Lookup />
          </Suspense>
        ),
      },
      {
        path: 'confirm',
        element: (
          <Suspense fallback={null}>
            <Confirm />
          </Suspense>
        ),
      },
      {
        path: 'done',
        element: (
          <Suspense fallback={null}>
            <Done />
          </Suspense>
        ),
      },
    ],
  },
]
