import { RouteObject } from 'react-router-dom'
import AdminLayout from '@app/layout/AdminLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { Suspense, lazy } from 'react'

const Dashboard = lazy(() => import('@features/admin/DashboardPage'))
const Sites = lazy(() => import('@features/admin/SitesPage'))
const SiteDetails = lazy(() => import('@features/admin/site-details/SiteDetailsPage'))
const Residents = lazy(() => import('@features/admin/ResidentsPage'))
const Vehicles = lazy(() => import('@features/admin/VehiclesPage'))
const Policies = lazy(() => import('@features/admin/PoliciesPage'))
const Reports = lazy(() => import('@features/admin/ReportsPage'))
const Users = lazy(() => import('@features/admin/UsersPage'))

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
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'sites',
        element: (
          <Suspense fallback={null}>
            <Sites />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug',
        element: (
          <Suspense fallback={null}>
            <SiteDetails />
          </Suspense>
        ),
      },
      {
        path: 'residents',
        element: (
          <Suspense fallback={null}>
            <Residents />
          </Suspense>
        ),
      },
      {
        path: 'vehicles',
        element: (
          <Suspense fallback={null}>
            <Vehicles />
          </Suspense>
        ),
      },
      {
        path: 'policies',
        element: (
          <Suspense fallback={null}>
            <Policies />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={null}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
    ],
  },
]
