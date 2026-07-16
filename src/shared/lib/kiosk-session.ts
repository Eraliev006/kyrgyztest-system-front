const KIOSK_UNLOCKED_KEY = 'kt_kiosk_unlocked'

/**
 * ExamSettings:AccessPassword gates the physical exam station, not any one
 * candidate — a proctor unlocks it once, then candidates log in one after
 * another with their own access codes. sessionStorage (not localStorage) so
 * it resets on actual browser/tab close, matching "unlock for today's
 * session" rather than "unlock forever".
 */
export function isKioskUnlocked(): boolean {
  return sessionStorage.getItem(KIOSK_UNLOCKED_KEY) === 'true'
}

export function setKioskUnlocked(): void {
  sessionStorage.setItem(KIOSK_UNLOCKED_KEY, 'true')
}
