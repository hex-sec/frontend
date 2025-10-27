import { RouteObject } from 'react-router-dom'
import AdminLayout from '@app/layout/AdminLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { Suspense, lazy } from 'react'

const Dashboard = lazy(() => import('@features/admin/DashboardPage'))
const Sites = lazy(() => import('@features/admin/SitesPage'))
const SiteDetails = lazy(() => import('@features/admin/site-details/SiteDetailsPage'))
const Visits = lazy(() => import('@features/admin/VisitsPage'))
const Visitors = lazy(() => import('@features/admin/VisitorsPage'))
const Residents = lazy(() => import('@features/admin/ResidentsPage'))
const Residences = lazy(() => import('@features/admin/ResidencesPage'))
const Vehicles = lazy(() => import('@features/admin/VehiclesPage'))
const Policies = lazy(() => import('@features/admin/PoliciesPage'))
const Reports = lazy(() => import('@features/admin/ReportsPage'))
const Users = lazy(() => import('@features/admin/UsersPage'))
const UserProfile = lazy(() => import('@features/admin/users/UserProfilePage'))

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
        path: 'sites/:slug/users',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/users/residents',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/users/guards',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/users/admins',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/visits',
        element: (
          <Suspense fallback={null}>
            <Visits />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/visitors',
        element: (
          <Suspense fallback={null}>
            <Visitors />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/residences',
        element: (
          <Suspense fallback={null}>
            <Residences />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/vehicles',
        element: (
          <Suspense fallback={null}>
            <Vehicles />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/reports',
        element: (
          <Suspense fallback={null}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'visits',
        element: (
          <Suspense fallback={null}>
            <Visits />
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
      {
        path: 'users/admins',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'users/guards',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'users/residents',
        element: (
          <Suspense fallback={null}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'users/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: 'residences',
        element: (
          <Suspense fallback={null}>
            <Residences />
          </Suspense>
        ),
      },
    ],
  },
]
