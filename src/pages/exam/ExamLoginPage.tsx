import { useState } from 'react'
import { isKioskUnlocked } from '@/shared/lib/kiosk-session'
import { KioskUnlockForm } from '@/features/exam-access-login/KioskUnlockForm'
import { AccessCodeLoginForm } from '@/features/exam-access-login/AccessCodeLoginForm'

export default function ExamLoginPage() {
  const [unlocked, setUnlocked] = useState(isKioskUnlocked)

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">Kyrgyztest</h1>
        {unlocked ? (
          <AccessCodeLoginForm />
        ) : (
          <KioskUnlockForm onUnlocked={() => setUnlocked(true)} />
        )}
      </div>
    </div>
  )
}
