import { RouteObject } from 'react-router-dom'
import LoginPage from '@features/auth/LoginPage'
import RegisterPage from '@features/auth/RegisterPage'

export const authRoutes: RouteObject[] = [
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
]
