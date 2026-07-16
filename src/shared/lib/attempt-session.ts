const ATTEMPT_ID_KEY = 'kt_attempt_id'
const CANDIDATE_ID_KEY = 'kt_candidate_id'

/**
 * The backend has no exam-side JWT — candidates authenticate purely via
 * access code, and every exam endpoint takes attemptId as an explicit
 * request field. These stored ids are a client-side-only routing signal
 * (does ExamAttemptGuard let the candidate stay on /exam/**, can
 * exam-section-runner re-resolve current section via /exam/start), never
 * sent as an Authorization header.
 */
export function getAttemptId(): string | null {
  return localStorage.getItem(ATTEMPT_ID_KEY)
}

export function getCandidateId(): string | null {
  return localStorage.getItem(CANDIDATE_ID_KEY)
}

export function setAttemptSession(candidateId: string, attemptId: string): void {
  localStorage.setItem(CANDIDATE_ID_KEY, candidateId)
  localStorage.setItem(ATTEMPT_ID_KEY, attemptId)
}

export function clearAttemptSession(): void {
  localStorage.removeItem(ATTEMPT_ID_KEY)
  localStorage.removeItem(CANDIDATE_ID_KEY)
}
