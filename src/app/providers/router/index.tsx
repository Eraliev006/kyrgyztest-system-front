import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router/routes'

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
