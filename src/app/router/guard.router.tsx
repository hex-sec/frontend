import { RouteObject } from 'react-router-dom'
import GuardKioskLayout from '@app/layout/GuardKioskLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { lazy, Suspense } from 'react'

const GateKiosk = lazy(() => import('@features/gate/GateKiosk'))
const PlateSearchPage = lazy(() => import('@features/gate/PlateSearchPage'))

export const guardRoutes: RouteObject[] = [
  {
    path: '/guard',
    element: (
      <RoleGate roles={['guard']}>
        <GuardKioskLayout />
      </RoleGate>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <GateKiosk />
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
    ],
  },
]
