const ATTEMPT_ID_KEY = 'kt_attempt_id'

/**
 * The backend has no exam-side JWT — candidates authenticate purely via
 * access code, and every exam endpoint takes attemptId as an explicit
 * request field. This stored id is a client-side-only routing signal (does
 * ExamAttemptGuard let the candidate stay on /exam/**), never sent as an
 * Authorization header.
 */
export function getAttemptId(): string | null {
  return localStorage.getItem(ATTEMPT_ID_KEY)
}

export function setAttemptId(attemptId: string): void {
  localStorage.setItem(ATTEMPT_ID_KEY, attemptId)
}

export function clearAttemptId(): void {
  localStorage.removeItem(ATTEMPT_ID_KEY)
}
