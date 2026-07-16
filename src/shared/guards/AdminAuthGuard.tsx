import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAdminToken } from '@/shared/lib/token-storage'

/**
 * Only checks token presence — shared can't depend on entities/account, so it
 * can't inspect role/account data. Role-based restrictions within admin
 * pages are enforced where the account entity is actually consumable.
 */
export function AdminAuthGuard() {
  const location = useLocation()

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
