import { lazy, Suspense } from 'react'
import { RouteObject } from 'react-router-dom'
import AdminLayout from '@app/layout/AdminLayout'
import { RoleGate } from '@app/auth/RoleGate'

const SiteDetails = lazy(() => import('@features/admin/site-details/SiteDetailsPage'))
const Users = lazy(() => import('@features/admin/UsersPage'))
const UserProfile = lazy(() => import('@features/admin/users/UserProfilePage'))
const Visits = lazy(() => import('@features/admin/VisitsPage'))
const Visitors = lazy(() => import('@features/admin/VisitorsPage'))
const Vehicles = lazy(() => import('@features/admin/VehiclesPage'))
const Reports = lazy(() => import('@features/admin/ReportsPage'))
const Residences = lazy(() => import('@features/admin/ResidencesPage'))

export const siteRoutes: RouteObject[] = [
  {
    path: '/site/:slug',
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
            <SiteDetails />
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
        path: 'users/residents',
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
        path: 'users/admins',
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
        path: 'users/residents/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: 'users/guards/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: 'users/admins/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
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
        path: 'vehicles',
        element: (
          <Suspense fallback={null}>
            <Vehicles />
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
      {
        path: 'reports',
        element: (
          <Suspense fallback={null}>
            <Reports />
          </Suspense>
        ),
      },
    ],
  },
]
