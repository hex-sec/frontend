import { RouteObject } from 'react-router-dom'
import AdminLayout from '@app/layout/AdminLayout'
import { RoleGate } from '@app/auth/RoleGate'
import { Suspense, lazy } from 'react'

const Dashboard = lazy(() => import('@features/admin/DashboardPage'))
const Sites = lazy(() => import('@features/admin/SitesPage'))
const SiteDetails = lazy(() => import('@features/admin/site-details/SiteDetailsPage'))
const Visits = lazy(() => import('@features/admin/VisitsPage'))
const Visitors = lazy(() => import('@features/admin/VisitorsPage'))
const VisitorProfile = lazy(() => import('@features/admin/VisitorProfilePage'))
const Residents = lazy(() => import('@features/admin/ResidentsPage'))
const Residences = lazy(() => import('@features/admin/ResidencesPage'))
const Vehicles = lazy(() => import('@features/admin/VehiclesPage'))
const Policies = lazy(() => import('@features/admin/PoliciesPage'))
const Reports = lazy(() => import('@features/admin/ReportsPage'))
const Analytics = lazy(() => import('@features/admin/AnalyticsPage'))
const Users = lazy(() => import('@features/admin/UsersPage'))
const UserProfile = lazy(() => import('@features/admin/users/UserProfilePage'))
const VisitProfile = lazy(() => import('@features/admin/VisitProfilePage'))
const VehicleDetail = lazy(() => import('@features/admin/VehicleDetailPage'))
const ResidenceDetail = lazy(() => import('@features/admin/ResidenceDetailPage'))
const Incidents = lazy(() => import('@features/admin/IncidentsPage'))

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
        path: 'sites/:slug/users/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
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
        path: 'sites/:slug/visits/:visitId',
        element: (
          <Suspense fallback={null}>
            <VisitProfile />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/vehicles/:vehicleId',
        element: (
          <Suspense fallback={null}>
            <VehicleDetail />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/incidents',
        element: (
          <Suspense fallback={null}>
            <Incidents />
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
        path: 'sites/:slug/visitors/:visitorId',
        element: (
          <Suspense fallback={null}>
            <VisitorProfile />
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
        path: 'sites/:slug/residences/:residenceId',
        element: (
          <Suspense fallback={null}>
            <ResidenceDetail />
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
        path: 'sites/:slug/policies',
        element: (
          <Suspense fallback={null}>
            <Policies />
          </Suspense>
        ),
      },
      {
        path: 'sites/:slug/analytics',
        element: (
          <Suspense fallback={null}>
            <Analytics />
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
        path: 'visitors/:visitorId',
        element: (
          <Suspense fallback={null}>
            <VisitorProfile />
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
        path: 'analytics',
        element: (
          <Suspense fallback={null}>
            <Analytics />
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
        path: 'users/residents/:userId',
        element: (
          <Suspense fallback={null}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: 'visits/:visitId',
        element: (
          <Suspense fallback={null}>
            <VisitProfile />
          </Suspense>
        ),
      },
      {
        path: 'vehicles/:vehicleId',
        element: (
          <Suspense fallback={null}>
            <VehicleDetail />
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
        path: 'residences/:residenceId',
        element: (
          <Suspense fallback={null}>
            <ResidenceDetail />
          </Suspense>
        ),
      },
    ],
  },
]
