import { Navigate, Outlet } from 'react-router-dom'
import { getAttemptId } from '@/shared/lib/attempt-session'

/**
 * The backend has no exam-side JWT (access-code flow only), so there's no
 * token to validate or expire here — this only checks that the candidate
 * has an attempt id from /exam/start. Independent of AdminAuthGuard.
 */
export function ExamAttemptGuard() {
  if (!getAttemptId()) {
    return <Navigate to="/exam/login" replace />
  }

  return <Outlet />
}
