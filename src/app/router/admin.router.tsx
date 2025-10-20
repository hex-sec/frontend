import { RouteObject } from 'react-router-dom'
import AdminLayout from '@app/layout/AdminLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('@features/admin/DashboardPage'))

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <RoleGate roles={['admin']}>
        <AdminLayout />
      </RoleGate>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      // más rutas admin aquí
    ],
  },
]
