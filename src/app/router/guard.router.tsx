import { RouteObject } from 'react-router-dom'
import GuardKioskLayout from '@app/layout/GuardKioskLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { ErrorBoundary } from '@features/shared/components/ErrorBoundary'
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@features/guard/pages/Dashboard'))
const Access = lazy(() => import('@features/guard/pages/Access'))
const Visitors = lazy(() => import('@features/guard/pages/Visitors'))
const NewVisitor = lazy(() => import('@features/guard/pages/NewVisitor'))
const Parcels = lazy(() => import('@features/guard/pages/Parcels'))
const Incidents = lazy(() => import('@features/guard/pages/Incidents'))
const Shift = lazy(() => import('@features/guard/pages/Shift'))
const Log = lazy(() => import('@features/guard/pages/Log'))
const PlateSearchPage = lazy(() => import('@features/guard/pages/PlateSearchPage'))
const ScannerTestPage = lazy(() => import('@features/guard/pages/__tests__/ScannerTestPage'))

export const guardRoutes: RouteObject[] = [
  {
    path: '/guard',
    element: (
      <ErrorBoundary>
        <RoleGate roles={['guard']}>
          <GuardKioskLayout />
        </RoleGate>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'access',
        element: (
          <Suspense fallback={null}>
            <Access />
          </Suspense>
        ),
      },
      {
        path: 'visitors',
        element: (
          <Suspense fallback={null}>
            <Visitors />
          </Suspense>
        ),
      },
      {
        path: 'visitors/new',
        element: (
          <Suspense fallback={null}>
            <NewVisitor />
          </Suspense>
        ),
      },
      {
        path: 'parcels',
        element: (
          <Suspense fallback={null}>
            <Parcels />
          </Suspense>
        ),
      },
      {
        path: 'incidents',
        element: (
          <Suspense fallback={null}>
            <Incidents />
          </Suspense>
        ),
      },
      {
        path: 'shift',
        element: (
          <Suspense fallback={null}>
            <Shift />
          </Suspense>
        ),
      },
      {
        path: 'log',
        element: (
          <Suspense fallback={null}>
            <Log />
          </Suspense>
        ),
      },
      {
        path: 'plates',
        element: (
          <Suspense fallback={null}>
            <PlateSearchPage />
          </Suspense>
        ),
      },
      {
        path: 'scanner-test',
        element: (
          <Suspense fallback={null}>
            <ScannerTestPage />
          </Suspense>
        ),
      },
    ],
  },
]
